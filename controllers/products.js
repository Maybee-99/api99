
const db = require('../config/connectDB');
const logger = require('../log/logger');

exports.getAllProducts = (req, res) => {
    try {
        const sql = `
            SELECT
                p.product_id,
                p.product_name,
                p.price,
                p.sale_price,
                p.stock,
                c.category_name,
                u.unit_name,
                p.image_url,
                CASE
                    WHEN p.create_at=p.update_at THEN 'ສິນຄ້າເພີ່ມໃໝ່'
                    ELSE 'ສິນຄ້າຖືກອັບເດດ'
                END as status
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            JOIN units u ON p.unit_id = u.unit_id
            order by p.product_id asc
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

exports.getProductByCategory = (req, res) => {
    const name = req.params.name;
    try {
        const sql = `
            SELECT
                p.product_id,
                p.product_name,
                p.price,
                p.sale_price,
                p.stock,
                c.category_name,
                u.unit_name,
                p.image_url
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            JOIN units u ON p.unit_id = u.unit_id
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

exports.search = (req, res) => {
    const name = req.params.name.trim().toLowerCase();
    try {
        const sql = `
            SELECT p.product_name, p.price, p.sale_price, u.unit_name, p.image_url
            FROM products p
            JOIN units u ON p.unit_id = u.unit_id
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

exports.createProduct = (req, res) => {
    const { product_name, price, sale_price, stock, category_id, unit_id, image_url, username,hostname } = req.body;
    try {
        const checkSql = "SELECT * FROM products WHERE product_name = ?";
        db.query(checkSql, [product_name], (err, results) => {
            if (err) return res.status(400).send({ message: err.message });

            if (results.length > 0) {
                return res.status(403).send({ message: "ສິນຄ້ານີ້ມີແລ້ວ" });
            }

            const insertSql = "INSERT INTO products (product_name, price, sale_price, stock, category_id, unit_id, image_url, create_at, update_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            db.query(insertSql, [product_name, price, sale_price, stock, category_id, unit_id, image_url], (err, result) => {
                if (err) return res.status(400).send({ message: err.message });
                const ip = req.socket.remoteAddress?.replace('::ffff:', '') || 'unknown IP';
                logger.info(
                    `ເພີ່ມສິນຄ້າ ➝ ຈາກ IP: ${ip}\n` +
                    `ຊື່ເຄື່ອງ:${hostname ||'N/A'}\n`+
                    `ຊື່ຜູ້ໃຊ້: ${username}\n` +
                    `#ລາຍລະອຽດ:\n` +
                    `• ລະຫັດສິນຄ້າ: ${result.insertId}\n` +
                    `• ຊື່ສິນຄ້າ: ${product_name}\n` +
                    `• ລາຄາຊື້: ${price}\n` +
                    `• ລາຄາຂາຍ: ${sale_price}\n` +
                    `• ຈໍານວນ: ${stock}\n` +
                    `• ລະຫັດຫມວດໝູ່: ${category_id}\n` +
                    `• ລະຫັດຫົວໜ່ວຍ: ${unit_id}\n` +
                    `• ຮູບ: ${image_url}\n`+
                    `• ຕາຕະລາງ: ສິນຄ້າ`
                );


                return res.status(201).send({ message: 'Product added', id: result.insertId });
            });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProduct = (req, res) => {
    const id = req.params.id;
    const { product_name, price, sale_price, stock, category_id, unit_id, username ,hostname} = req.body;

    try {
        const getSql = "SELECT * FROM products WHERE product_id = ?";
        db.query(getSql, [id], (err, currentResults) => {
            if (err) return res.status(500).send({ message: err.message });
            if (currentResults.length === 0) return res.status(404).send({ message: "Product not found" });

            const current = currentResults[0];

            const updateSql = `
                UPDATE products
                SET product_name = ?, price = ?, sale_price = ?, stock = ?, category_id = ?, unit_id = ?, update_at = NOW() 
                WHERE product_id = ?
            `;
            db.query(updateSql, [product_name, price, sale_price, stock, category_id, unit_id, id], (err, result) => {
                if (err) return res.status(400).send({ message: err.message });

                const changes = [];
                if (current.product_name !== product_name) changes.push(`ຊື່ສິນຄ້າ: '${current.product_name}' ➝ '${product_name}'`);
                if (current.price !== price) changes.push(`ລາຄາຊື້: ${current.price} ➝ ${price}`);
                if (current.sale_price !== sale_price) changes.push(`ລາຄາຂາຍ: ${current.sale_price} ➝ ${sale_price}`);
                if (current.stock !== stock) changes.push(`ຈຳນວນ: ${current.stock} ➝ ${stock}`);
                if (current.category_id !== category_id) changes.push(`ລະຫັດປະເພດ: ${current.category_id} ➝ ${category_id}`);
                if (current.unit_id !== unit_id) changes.push(`ລະຫັດຫົວໜ່ວຍ: ${current.unit_id} ➝ ${unit_id}`);

                const formattedChanges = changes.length
                    ? '\n' + changes.map(c => `• ${c}`).join('\n')
                    : '\nNo changes detected.';

                const ip = req.socket.remoteAddress?.replace('::ffff:', '') || 'unknown IP';

                logger.info(
                    `ແກ້ໄຂ ➝ ຈາກ IP: ${ip}\n` +
                    `ຊື່ເຄື່ອງ:${hostname}\n`
                    `ຊື່ຜູ້ໃຊ້: ${username}\n` +
                    `#ລາຍລະອຽດ:\n` +
                    `• ລະຫັດສິນຄ້າ: ${id}` +
                    `${formattedChanges}`+
                    `• ຕາຕະລາງ: ສິນຄ້າ`
                );

                return res.status(200).send({ message: 'Product updated', id });
            });
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.deleteProduct = (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM products WHERE product_id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Database error deleting product:", err);
            return res.status(500).json({ message: err.message });
        }

        const ip = req.socket.remoteAddress?.replace('::ffff:', '') || 'unknown IP';
 
        logger.info(`ລຶບ ➝ ຈາກ IP:  ${ip}\n`+
            `ລະຫັດສິນຄ້າ: ${id}\n`+
            `ຈາກຕາຕະລາງ: ສິນຄ້າ`
        );

        return res.status(200).json({ message: "Product deleted", product_id: id });

    });
};

exports.getCountProducts=(req,res)=>{
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
}






