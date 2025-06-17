const db = require('../config/connectDB');
const logger = require('../log/logger');

exports.creatOrderDetail = (req, res) => {
    try {
        const { order_id, product_id, qty, price } = req.body;

        const sql = "insert into order_detail (order_id,product_id,qty,price) values (?,?,?,?)";
        db.query(sql, [order_id, product_id, qty, price], (err, result) => {
            if (err) {
                logger.error(`Error creating order: ${err.message}`);
                return res.status(400).send({ message: err.message });
            }
            const ip = req.socket.remoteAddress?.replace('::ffff:', '') || 'unknown IP';
            logger.info(`ສັ່ງຊື້ລຳເລັດແລ້ວ ຈາກໝາຍເລກ IP: ${ip}\nOrder Detail:\n${JSON.stringify({ order_id, product_id, qty, price }, null, 2)}`);

            return res.status(200).send({
                message: "Order detail created successfully",
                orderDetail: {
                    ລະຫັດສັ່ງ: result.insertId,
                    order_id,
                    product_id,
                    qty,
                    price,
                }
            });
            console.log("Sent success response");
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}