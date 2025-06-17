const db = require('../config/connectDB')

exports.register = (req, res) => {
    const { username, password, email} = req.body;
    try {
        const checkSql = "SELECT * FROM user WHERE email = ?";
        db.query(checkSql, [email], (err, results) => {
            if (err) {
                return res.status(400).send({ message: err.message });
            }
            if (results.length > 0) {
                return res.status(400).send({ message: "ອີເມລນີ້ມີແລ້ວ" });
            }
            const insertSql = "INSERT INTO user (username, password, email) VALUES (?,?,?)";
            db.query(insertSql, [username, password, email], (err, result) => {
                if (err) {
                    return res.status(400).send({ message: err.message });
                }
                return res.status(200).send({message:"ລົງທະບຽນສຳເລັດແລ້ວ"});
            });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    try {
        const sql = "SELECT * FROM user WHERE email = ?";
        db.query(sql, [email], (err, results) => {
            if (err) return res.status(500).json({ message: err.message });

            if (results.length === 0) {
                return res.status(401).json({ message: "ບໍ່ພົບອີເມວນີ້" });
            }

            const user = results[0];
            if (user.password !== password) {
                return res.status(401).json({ message: "ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ" });
            }

            res.status(200).json({
                message: "ເຂົ້າລະບົບສຳເລັດ",
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
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

