const db = require('../config/connectDB');
const logger = require('../log/logger');

exports.creatOrder=(req,res)=>{
    try {
        const {user_id}=req.body;

        const sql="insert into orders (user_id) values (?)";
        db.query(sql,[user_id],(err,result)=>{
            if(err){
                logger.error(`Error creating order: ${err.message}`);
                return res.status(400).send({ message: err.message });
            }
            const ip = req.socket.remoteAddress?.replace('::ffff:', '') || 'unknown IP';
            logger.info(`ສັ່ງຊື້ລຳເລັດແລ້ວ ຈາກໝາຍເລກ IP: ${ip}`);
            return res.status(200).send({ message: "ສັ່ງຊື້ລຳເລັດແລ້ວ ", orderId: result.insertId });
        })
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}