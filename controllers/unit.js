// const db = require('../config/connectDB')

// exports.getUnit = (req, res) => {
//     try {
//         const sql = 'SELECT * FROM units order by unit_id asc'
//         db.query(sql, (err, result) => {
//             if (err) {
//                 return res.status(400).send({ message: err.message })
//             }
//             return res.status(200).send( result )
//         })
//     } catch (err) {
//         return res.status(500).send({ message: err.message })
//     }
// }
// exports.getUnitById = (req, res) => {
//     try {
//         const sql = 'SELECT * FROM units WHERE unit_id=?'
//         db.query(sql, [req.params.id], (err, result) => {
//             if (err) {
//                 return res.status(400).send({ message: err.message })
//             }
//             return res.status(200).send(result)
//         })
//     } catch (err) {
//         return res.status(500).send({ message: err.message })
//     }
// }
// exports.createUnit = (req, res) => {
//     try {
//         const sqlCheck = 'SELECT * FROM units WHERE unit_name=?'
//         db.query(sqlCheck, [req.body.unit_name], (err, result) => {
//             if (err) {
//                 return res.status(400).send({ message: err.message })
//             }
//             if (result.length > 0) {
//                 return res.status(400).send({ message: 'ຫົວໜ່ວຍນີ້ມີແລ້ວ' })
//             }
//             const sql = 'INSERT INTO units (unit_name) VALUES (?)'
//             db.query(sql, [req.body.unit_name], (err, result) => {
//                 if (err) {
//                     return res.status(400).send({ message: err.message })
//                 }
//                 return res.status(200).send(result)
//             })
//         })
//     } catch (err) {
//         return res.status(500).send({ message: err.message })
//     }
// }
// exports.updateUnit = (req, res) => {
//     try {
//         const sql = 'UPDATE units SET unit_name=? WHERE unit_id=?'
//         db.query(sql, [req.body.unit_name, req.params.id], (err, result) => {
//             if (err) {
//                 return res.status(400).send({ message: err.message })
//             }
//             return res.status(200).send(result)
//         })
//     } catch (err) {
//         return res.status(500).send({ message: err.message })
//     }
// }
// exports.deleteUnit = (req, res) => {
//     try {
//         const sql = 'DELETE FROM units WHERE unit_id=?'
//         db.query(sql, [req.params.id], (err, result) => {
//             if (err) {
//                 return res.status(400).send({ message: err.message })
//             }
//             return res.status(200).send(result)
//         })
//     } catch (err) {
//         return res.status(500).send({ message: err.message })
//     }
// }

const db = require('../config/connectDB');
const logger = require('../log/logger');

exports.getUnit = (req, res) => {
  try {
    const sql = 'SELECT * FROM units order by unit_id asc';
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(400).send({ message: err.message });
      }
      return res.status(200).send(result);
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

exports.getUnitById = (req, res) => {
  try {
    const sql = 'SELECT * FROM units WHERE unit_id=?';
    db.query(sql, [req.params.id], (err, result) => {
      if (err) {
        return res.status(400).send({ message: err.message });
      }
      return res.status(200).send(result);
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

exports.createUnit = (req, res) => {
  const { unit_name, username } = req.body;

  try {
    const checkSql = 'SELECT * FROM units WHERE unit_name = ?';
    db.query(checkSql, [unit_name], (err, results) => {
      if (err) return res.status(400).send({ message: err.message });

      if (results.length > 0) {
        return res.status(403).send({ message: 'ຫົວໜ່ວຍນີ້ມີແລ້ວ' });
      }

      const insertSql = 'INSERT INTO units (unit_name) VALUES (?)';
      db.query(insertSql, [unit_name], (err, result) => {
        if (err) return res.status(400).send({ message: err.message });

        const ip = req.socket.remoteAddress?.replace('::ffff:', '') || 'unknown IP';
        logger.info(`ເພີ່ມໃໝ່ ➝ ຈາກ IP: ${ip}\n` +
          `#ລາຍລະອຽດ:\n` +
          `• ລະຫັດຫົວໜ່ວຍ: ${result.insertId}\n` +
          `• ຫົວໜ່ວຍ: ${unit_name}\n` +
          `• ຕາຕະລາງ: ຫົວໜ່ວຍ`);

        return res.status(201).send({ message: 'Unit created', id: result.insertId });
      });
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};


exports.updateUnit = (req, res) => {
  const id = req.params.id;
  const { unit_name, username } = req.body;

  try {
    const getSql = "SELECT * FROM units WHERE unit_id = ?";
    db.query(getSql, [id], (err, results) => {
      if (err) return res.status(500).send({ message: err.message });
      if (results.length === 0) return res.status(404).send({ message: "Unit not found" });

      const current = results[0];

      const updateSql = "UPDATE units SET unit_name = ? WHERE unit_id = ?";
      db.query(updateSql, [unit_name, id], (err, result) => {
        if (err) return res.status(400).send({ message: err.message });

        if (current.unit_name !== unit_name) {
          const ip = req.socket.remoteAddress?.replace('::ffff:', '') || 'unknown IP';
          logger.info(
            `ແກ້ໄຂ ➝ ຈາກ IP: ${ip}\n` +
            `#ລາຍລະອຽດ:\n` +
            `• ລະຫັດຫົວໜ່ວຍ: ${id}\n` +
            `• ຊື່ຫົວໜ່ວຍ: '${current.unit_name}' ➝ '${unit_name}'\n` +
            `• ຕາຕະລາງ: ຫົວໜ່ວຍ`
          );
        }

        return res.status(200).send({
          message: 'Unit updated',
          unit: { unit_id: id, unit_name }
        });
      });
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

exports.deleteUnit = (req, res) => {
  const id = req.params.id;
  const sqlDelete = 'DELETE FROM units WHERE unit_id = ?';

  db.query(sqlDelete, [id], (err, result) => {
    if (err) {
      console.error("Database error deleting unit:", err);
      return res.status(500).json({ message: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const ip = req.socket.remoteAddress?.replace('::ffff:', '') || 'unknown IP';
    logger.info(`ລຶບ  ➝ ຈາກ IP: ${ip}\n`+
                `ລະຫັດຫົວໜ່ວຍ: ${id}\n`+
                `ຈາກຕາຕະລາງ:ຫົວໜ່ວຍ`);
    return res.status(200).json({ message: "Unit deleted", unit_id: id });
  });
};

exports.getUnitCount=(req,res)=>{
  try {
    const sql = 'SELECT COUNT(*) AS count FROM units';
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(400).send({ message: err.message });
      }
      return res.status(200).send({ count: result[0].count });
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}
