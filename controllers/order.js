const db = require('../config/connectDB');
const logger = require('../log/logger');

exports.creatOrder = (req, res) => {
    const { username, products } = req.body; // 'products' is now an array of objects

    if (!username || !products || !Array.isArray(products) || products.length === 0) {
        logger.warn(`Invalid request body for order creation. Username: ${username}, Products: ${JSON.stringify(products)}`);
        return res.status(400).send({ message: "Invalid request data. Username and products array are required." });
    }

    // Begin a transaction directly on the 'db' object (assuming it's a single connection)
    db.beginTransaction(async (transactionErr) => {
        if (transactionErr) {
            logger.error(`Error beginning transaction: ${transactionErr.message}`);
            return res.status(500).send({ message: "Failed to start transaction." });
        }

        try {
            // 1. Insert into orders table
            const insertOrderSql = "INSERT INTO orders (username) VALUES (?)";
            const orderResult = await new Promise((resolve, reject) => {
                db.query(insertOrderSql, [username], (orderErr, result) => {
                    if (orderErr) {
                        return reject(orderErr);
                    }
                    resolve(result);
                });
            });

            const orderId = orderResult.insertId;

            // Process each product in the order
            for (const product of products) {
                const { product_id, qty, price } = product;

                if (!product_id || !qty || !price || qty <= 0 || price <= 0) {
                    throw new Error(`Invalid product data for product_id: ${product_id}. Quantity and price must be positive.`);
                }

                // 2. Check stock for each product
                const checkStockSql = "SELECT stock FROM products WHERE product_id = ?";
                const stockResults = await new Promise((resolve, reject) => {
                    db.query(checkStockSql, [product_id], (stockErr, results) => {
                        if (stockErr) {
                            return reject(stockErr);
                        }
                        if (results.length === 0) {
                            return reject(new Error(`Product with ID ${product_id} not found.`));
                        }
                        resolve(results);
                    });
                });

                const currentStock = stockResults[0].stock;
                if (currentStock < qty) {
                    throw new Error(`Insufficient stock for product ID ${product_id}. Available: ${currentStock}, Requested: ${qty}.`);
                }

                // 3. Insert into order_detail
                const insertDetailSql = `
                    INSERT INTO order_detail (order_id, product_id, qty, price)
                    VALUES (?, ?, ?, ?)
                `;
                await new Promise((resolve, reject) => {
                    db.query(insertDetailSql, [orderId, product_id, qty, price], (detailErr, result) => {
                        if (detailErr) {
                            return reject(detailErr);
                        }
                        resolve(result);
                    });
                });

                // 4. Update product stock
                const updateStockSql = `
                    UPDATE products
                    SET stock = stock - ?
                    WHERE product_id = ? AND stock >= ?
                `;
                const updateResult = await new Promise((resolve, reject) => {
                    db.query(updateStockSql, [qty, product_id, qty], (updateErr, result) => {
                        if (updateErr) {
                            return reject(updateErr);
                        }
                        if (result.affectedRows === 0) {
                            // This can happen if stock was updated by another transaction
                            return reject(new Error(`Failed to update stock for product ID ${product_id}. Stock might be insufficient or product not found.`));
                        }
                        resolve(result);
                    });
                });
            }

            // 5. Commit transaction
            db.commit((commitErr) => {
                if (commitErr) {
                    logger.error(`Transaction commit failed for order ID ${orderId}: ${commitErr.message}`);
                    return res.status(500).send({ message: "Transaction commit failed." });
                }

                const ip = req.socket.remoteAddress?.replace('::ffff:', '') || 'unknown IP';
                logger.info(`Order success from IP: ${ip}, Order ID: ${orderId}`);

                return res.status(200).send({
                    message: "Order placed successfully.",
                    order: {
                        order_id: orderId,
                        username: username,
                        products: products, // Return the ordered products
                    },
                });
            });

        } catch (error) {
            // Rollback transaction on any error
            db.rollback(() => {
                logger.error(`Transaction rolled back for order creation: ${error.message}`);
                let errorMessage = "Create order failed.";
                if (error.message.includes("Insufficient stock")) {
                    errorMessage = error.message;
                } else if (error.message.includes("Product with ID")) {
                    errorMessage = error.message;
                } else if (error.message.includes("Invalid product data")) {
                    errorMessage = error.message;
                }
                return res.status(400).send({ message: errorMessage });
            });
        }
    });
};

exports.getAllOrders = (req, res) => {
    const sql = `
        SELECT
    o.order_id,
    o.username,
    u.phone,
    o.order_date,
    o.status,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'product_id', od.product_id,
            'product_name', p.product_name,
            'qty', od.qty,
            'price', od.price,
            'subtotal', od.subtotal
        )
    ) AS products
FROM
    orders AS o
JOIN
    order_detail AS od ON o.order_id = od.order_id
JOIN
    user AS u ON o.username = u.username
JOIN
    products AS p ON od.product_id = p.product_id -- Join to get product name
GROUP BY
    o.order_id, o.username, u.phone, o.order_date, o.status
ORDER BY
    o.order_date DESC;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            logger.error(`Error fetching all orders: ${err.message}`);
            return res.status(500).send({ message: "Failed to fetch orders." });
        }
        logger.info(`Successfully fetched ${results.length} orders.`);
        return res.status(200).send({
            message: "Orders fetched successfully.",
            orders: results,
        });
    });
};

exports.approveOrder = (req, res) => {
    const orderId = req.params.orderId;

    const updateSql = "UPDATE orders SET status = 'ອະນຸມັດແລ້ວ' WHERE order_id = ? AND status = 'ລໍຖ້າອະນຸມັດ'";

    db.query(updateSql, [orderId], (err, result) => {
        if (err) {
            logger.error(`Error approving order ${orderId}: ${err.message}`);
            return res.status(500).send({ message: "Failed to approve order." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "Order not found or already approved." });
        }
        logger.info(`Order ${orderId} approved successfully.`);
        return res.status(200).send({ message: "Order approved successfully." });
    });
};

exports.cancelOrder = (req, res) => {
    const orderId = req.params.orderId;

    db.beginTransaction(async (transactionErr) => {
        if (transactionErr) {
            logger.error(`Error beginning transaction for order cancellation: ${transactionErr.message}`);
            return res.status(500).send({ message: "Failed to start transaction for cancellation." });
        }

        try {
            const deleteDetailSql = "DELETE FROM order_detail WHERE order_id = ?";
            await new Promise((resolve, reject) => {
                db.query(deleteDetailSql, [orderId], (detailErr, result) => {
                    if (detailErr) {
                        return reject(detailErr);
                    }
                    resolve(result);
                });
            });

            const deleteOrderSql = "DELETE FROM orders WHERE order_id = ?";
            const orderResult = await new Promise((resolve, reject) => {
                db.query(deleteOrderSql, [orderId], (orderErr, result) => {
                    if (orderErr) {
                        return reject(orderErr);
                    }
                    if (result.affectedRows === 0) {
                        return reject(new Error("Order not found or could not be deleted."));
                    }
                    resolve(result);
                });
            });

            db.commit((commitErr) => {
                if (commitErr) {
                    logger.error(`Transaction commit failed for order cancellation ${orderId}: ${commitErr.message}`);
                    return res.status(500).send({ message: "Transaction commit failed for cancellation." });
                }
                logger.info(`Order ${orderId} and its details cancelled and deleted successfully.`);
                return res.status(200).send({ message: "Order cancelled and deleted successfully." });
            });

        } catch (error) {
            // Rollback transaction on any error
            db.rollback(() => {
                logger.error(`Transaction rolled back for order cancellation ${orderId}: ${error.message}`);
                return res.status(400).send({ message: error.message || "Failed to cancel order." });
            });
        }
    });
};