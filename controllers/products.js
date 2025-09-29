const db = require('../config/connectDB');
const logger = require('../log/logger');

// ດຶງສິນຄ້າທັງໝົດ (ລວມຂໍ້ມູນຜູ້ຂາຍ)
exports.getAllProducts = (req, res) => {
    try {
        const sql = `
            SELECT
                p.product_id,
                p.product_name,
                p.image_url,
                c.category_name,
                u.unit_name,
                sp.seller_product_id,
                sp.username as seller_username,
                sp.price,
                sp.sale_price,
                sp.stock,
                sp.create_at,
                sp.update_at,
                CASE
                    WHEN sp.create_at = sp.update_at THEN 'ສິນຄ້າເພີ່ມໃໝ່'
                    ELSE 'ສິນຄ້າຖືກອັບເດດ'
                END as status
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            JOIN units u ON p.unit_id = u.unit_id
            LEFT JOIN seller_products sp ON p.product_id = sp.product_id
            ORDER BY p.product_id ASC
        `;
        db.query(sql, (err, result) => {
            if (err) {
                return res.status(400).send({ message: err.message });
            }
            return res.status(200).send(result);
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ດຶງສິນຄ້າຕາມໝວດໝູ່
exports.getProductByCategory = (req, res) => {
    const name = req.params.name;
    try {
        const sql = `
            SELECT
                p.product_id,
                p.product_name,
                p.image_url,
                c.category_name,
                u.unit_name,
                sp.seller_product_id,
                sp.username as seller_username,
                sp.price,
                sp.sale_price,
                sp.stock
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            JOIN units u ON p.unit_id = u.unit_id
            LEFT JOIN seller_products sp ON p.product_id = sp.product_id
            WHERE c.category_name = ?
        `;
        db.query(sql, [name], (err, result) => {
            if (err) {
                return res.status(400).send({ message: err.message });
            }
            return res.status(200).send(result);
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ຄົ້ນຫາສິນຄ້າ
exports.search = (req, res) => {
    const name = req.params.name.trim().toLowerCase();
    try {
        const sql = `
            SELECT 
                p.product_name, 
                p.image_url,
                u.unit_name,
                sp.username as seller_username,
                sp.price, 
                sp.sale_price,
                sp.stock
            FROM products p
            JOIN units u ON p.unit_id = u.unit_id
            LEFT JOIN seller_products sp ON p.product_id = sp.product_id
            WHERE LOWER(p.product_name) LIKE ?
        `;
        db.query(sql, [`%${name}%`], (err, result) => {
            if (err) {
                return res.status(400).send({ message: err.message });
            }
            return res.status(200).send(result);
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ສ້າງສິນຄ້າໃໝ່
exports.createProduct = (req, res) => {
    const { product_name, price, stock, category_id, unit_id, image_url, username, hostname } = req.body;
    
    try {
        // ກວດສອບວ່າສິນຄ້ານີ້ມີແລ້ວຫຼືບໍ່
        const checkProductSql = "SELECT * FROM products WHERE product_name = ?";
        db.query(checkProductSql, [product_name], (err, productResults) => {
            if (err) return res.status(400).send({ message: err.message });

            let productId;
            
            // ຖ້າສິນຄ້ານີ້ມີແລ້ວ
            if (productResults.length > 0) {
                productId = productResults[0].product_id;
                
                // ກວດສອບວ່າຜູ້ຂາຍນີ້ໄດ້ເພີ່ມສິນຄ້ານີ້ແລ້ວຫຼືບໍ່
                const checkSellerProductSql = "SELECT * FROM seller_products WHERE username = ? AND product_id = ?";
                db.query(checkSellerProductSql, [username, productId], (err, sellerResults) => {
                    if (err) return res.status(400).send({ message: err.message });
                    
                    if (sellerResults.length > 0) {
                        return res.status(403).send({ message: "ທ່ານໄດ້ເພີ່ມສິນຄ້ານີ້ແລ້ວ" });
                    }
                    
                    // ເພີ່ມສິນຄ້າໃສ່ seller_products
                    insertSellerProduct(productId, username, price, stock, req, res, hostname, product_name);
                });
            } else {
                // ສ້າງສິນຄ້າໃໝ່ໃນຕາຕະລາງ products
                const insertProductSql = "INSERT INTO products (product_name, category_id, unit_id, image_url) VALUES (?, ?, ?, ?)";
                db.query(insertProductSql, [product_name, category_id, unit_id, image_url], (err, result) => {
                    if (err) return res.status(400).send({ message: err.message });
                    
                    productId = result.insertId;
                    
                    // ເພີ່ມສິນຄ້າໃສ່ seller_products
                    insertSellerProduct(productId, username, price, stock);
                });
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Helper function ສຳລັບເພີ່ມສິນຄ້າໃສ່ seller_products
function insertSellerProduct(productId, username, price, stock) {
    const insertSellerProductSql = "INSERT INTO seller_products (username, product_id, price, stock) VALUES (?, ?, ?, ?, ?)";
    db.query(insertSellerProductSql, [username, productId, price, sale_price, stock], (err, result) => {
        if (err) return res.status(400).send({ message: err.message });
        
        // const ip = req.socket.remoteAddress?.replace('::ffff:', '') || 'unknown IP';
        // logger.info(
        //     `ເພີ່ມສິນຄ້າ ➝ ຈາກ IP: ${ip}\n` +
        //     `ຊື່ເຄື່ອງ: ${hostname || 'N/A'}\n` +
        //     `ຊື່ຜູ້ໃຊ້: ${username}\n` +
        //     `#ລາຍລະອຽດ:\n` +
        //     `• ລະຫັດສິນຄ້າ: ${productId}\n` +
        //     `• ລະຫັດຜູ້ຂາຍ-ສິນຄ້າ: ${result.insertId}\n` +
        //     `• ຊື່ສິນຄ້າ: ${product_name}\n` +
        //     `• ລາຄາຊື້: ${price}\n` +
        //     `• ລາຄາຂາຍ: ${sale_price}\n` +
        //     `• ຈໍານວນ: ${stock}\n` +
        //     `• ຕາຕະລາງ: ສິນຄ້າ-ຜູ້ຂາຍ`
        // );

        return res.status(201).send({ 
            message: 'Product added successfully', 
            seller_product_id: result.insertId,
            product_id: productId
        });
    });
}

// ແກ້ໄຂສິນຄ້າ
exports.updateProduct = (req, res) => {
    const id = req.params.id; // seller_product_id
    const { product_name, price, sale_price, stock, category_id, unit_id, username, hostname } = req.body;

    try {
        // ດຶງຂໍ້ມູນປັດຈຸບັນ
        const getSql = `
            SELECT 
                sp.*, 
                p.product_name, 
                p.category_id, 
                p.unit_id, 
                p.image_url 
            FROM seller_products sp
            JOIN products p ON sp.product_id = p.product_id
            WHERE sp.seller_product_id = ? AND sp.username = ?
        `;
        db.query(getSql, [id, username], (err, currentResults) => {
            if (err) return res.status(500).send({ message: err.message });
            if (currentResults.length === 0) return res.status(404).send({ message: "Product not found or unauthorized" });

            const current = currentResults[0];

            // ອັບເດດຂໍ້ມູນສິນຄ້າທົ່ວໄປ (ຖ້າມີການປ່ຽນແປງ)
            if (product_name !== current.product_name || category_id !== current.category_id || unit_id !== current.unit_id) {
                const updateProductSql = "UPDATE products SET product_name = ?, category_id = ?, unit_id = ? WHERE product_id = ?";
                db.query(updateProductSql, [product_name, category_id, unit_id, current.product_id], (err) => {
                    if (err) return res.status(400).send({ message: err.message });
                });
            }

            // ອັບເດດຂໍ້ມູນຂອງຜູ້ຂາຍ
            const updateSellerProductSql = "UPDATE seller_products SET price = ?, sale_price = ?, stock = ? WHERE seller_product_id = ?";
            db.query(updateSellerProductSql, [price, sale_price, stock, id], (err, result) => {
                if (err) return res.status(400).send({ message: err.message });

                // ບັນທຶກການປ່ຽນແປງ
                const changes = [];
                if (current.product_name !== product_name) changes.push(`ຊື່ສິນຄ້າ: '${current.product_name}' ➝ '${product_name}'`);
                if (current.price !== price) changes.push(`ລາຄາຊື້: ${current.price} ➝ ${price}`);
                if (current.sale_price !== sale_price) changes.push(`ລາຄາຂາຍ: ${current.sale_price} ➝ ${sale_price}`);
                if (current.stock !== stock) changes.push(`ຈຳນວນ: ${current.stock} ➝ ${stock}`);
                if (current.category_id !== category_id) changes.push(`ລະຫັດປະເພດ: ${current.category_id} ➝ ${category_id}`);
                if (current.unit_id !== unit_id) changes.push(`ລະຫັດຫົວໜ່ວຍ: ${current.unit_id} ➝ ${unit_id}`);

                const formattedChanges = changes.length
                    ? '\n' + changes.map(c => `• ${c}`).join('\n')
                    : '\nບໍ່ມີການປ່ຽນແປງ';

                const ip = req.socket.remoteAddress?.replace('::ffff:', '') || 'unknown IP';

                logger.info(
                    `ແກ້ໄຂ ➝ ຈາກ IP: ${ip}\n` +
                    `ຊື່ເຄື່ອງ: ${hostname}\n` +
                    `ຊື່ຜູ້ໃຊ້: ${username}\n` +
                    `#ລາຍລະອຽດ:\n` +
                    `• ລະຫັດຜູ້ຂາຍ-ສິນຄ້າ: ${id}` +
                    `${formattedChanges}\n` +
                    `• ຕາຕະລາງ: ສິນຄ້າ-ຜູ້ຂາຍ`
                );

                return res.status(200).send({ message: 'Product updated', seller_product_id: id });
            });
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// ລຶບສິນຄ້າ (ລຶບແຕ່ entry ຂອງຜູ້ຂາຍ)
exports.deleteProduct = (req, res) => {
    const id = req.params.id; // seller_product_id
    const { username, hostname } = req.body;
    
    // ລຶບແຕ່ສິນຄ້າຂອງຜູ້ຂາຍ ບໍ່ລຶບສິນຄ້າທົ່ວໄປ
    const sql = "DELETE FROM seller_products WHERE seller_product_id = ? AND username = ?";
    db.query(sql, [id, username], (err, result) => {
        if (err) {
            console.error("Database error deleting seller product:", err);
            return res.status(500).json({ message: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found or unauthorized" });
        }

        const ip = req.socket.remoteAddress?.replace('::ffff:', '') || 'unknown IP';

        logger.info(
            `ລຶບ ➝ ຈາກ IP: ${ip}\n` +
            `ຊື່ເຄື່ອງ: ${hostname || 'N/A'}\n` +
            `ຊື່ຜູ້ໃຊ້: ${username || 'N/A'}\n` +
            `ລະຫັດຜູ້ຂາຍ-ສິນຄ້າ: ${id}\n` +
            `ຈາກຕາຕະລາງ: ສິນຄ້າ-ຜູ້ຂາຍ`
        );

        return res.status(200).json({ message: "ລຶບສຳເລັດແລ້ວ", seller_product_id: id });
    });
};

// ນັບຈຳນວນສິນຄ້າທັງໝົດ
exports.getCountProducts = (req, res) => {
    try {
        const sql = "SELECT COUNT(*) as count FROM products";
        db.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            return res.status(200).json({ count: result[0].count });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ດຶງສິນຄ້າຂອງຜູ້ຂາຍສະເພາະ
exports.getProductsBySeller = (req, res) => {
    const username = req.params.username;
    try {
        const sql = `
            SELECT
                p.product_id,
                p.product_name,
                p.image_url,
                c.category_name,
                u.unit_name,
                sp.seller_product_id,
                sp.price,
                sp.sale_price,
                sp.stock,
                sp.create_at,
                sp.update_at,
                CASE
                    WHEN sp.create_at = sp.update_at THEN 'ສິນຄ້າເພີ່ມໃໝ່'
                    ELSE 'ສິນຄ້າຖືກອັບເດດ'
                END as status
            FROM seller_products sp
            JOIN products p ON sp.product_id = p.product_id
            JOIN categories c ON p.category_id = c.category_id
            JOIN units u ON p.unit_id = u.unit_id
            WHERE sp.username = ?
            ORDER BY sp.create_at DESC
        `;
        db.query(sql, [username], (err, result) => {
            if (err) {
                return res.status(400).send({ message: err.message });
            }
            return res.status(200).send(result);
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ນັບຈຳນວນສິນຄ້າຂອງຜູ້ຂາຍ
exports.getCountProductsBySeller = (req, res) => {
    const username = req.params.username;
    try {
        const sql = "SELECT COUNT(*) as count FROM seller_products WHERE username = ?";
        db.query(sql, [username], (err, result) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            return res.status(200).json({ count: result[0].count });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};