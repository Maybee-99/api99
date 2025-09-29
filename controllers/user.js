const db = require('../config/connectDB')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config();

exports.register = (req, res) => {
    const { username, password, phone, role,profile } = req.body;
    try {
        const checkSql = "SELECT * FROM user WHERE phone = ?";
        db.query(checkSql, [phone], async (err, results) => {
            if (err) {
                return res.status(400).send({ message: err.message });
            }
            if (results.length > 0) {
                return res.status(400).send({ message: "ເບີໂທລະສັບຊ້ຳກັນແລ້ວ" });
            }
            try {
                const hashPassword = await bcrypt.hash(password, 10)
                const insertSql = "INSERT INTO user (username, password, phone,role,profile_image) VALUES (?,?,?,?,?)";
                db.query(insertSql, [username, hashPassword, phone, role,profile], (err, result) => {
                    if (err) {
                        return res.status(400).send({ message: err.message });
                    }
                    return res.status(200).send({ message: "ລົງທະບຽນສຳເລັດແລ້ວ" });
                });
            } catch (HashErr) {
                res.status(500).json({ message: HashErr.message });
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = (req, res) => {
    const { phone, password } = req.body;

    try {
        const sql = "SELECT * FROM user WHERE phone = ?";
        db.query(sql, [phone], async (err, results) => {
            if (err) return res.status(500).json({ message: err.message });

            if (results.length === 0) {
                return res.status(401).json({ message: "ບໍ່ພົບເບີໂທລະສັບນີ້ນີ້" });
            }

            const user = results[0];

            const passwordValid = await bcrypt.compare(password, user.password)

            if (!passwordValid) {
                return res.status(401).json({ message: "ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ" });
            }
  res.status(200).json({
                message: "ເຂົ້າສູ່ລະບົບສຳເລັດ",
                user: {
                    username: user.username,
                    //password: user.password,
                    phone: user.phone,
                    role: user.role
                },
            });
            console.log("Received login data:", phone, password);

        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllUsers = (req, res) => {
    try {
        const sql = "SELECT * FROM user";
        db.query(sql, (err, result) => {
            if (err) {
                return res.status(400).send({ message: err.message })
            }
            return res.status(200).send(result)
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

