// const db = require('../config/connectDB')

// exports.getCategories = (req, res) => {
//     try {
//         const sql = 'SELECT * FROM categories ORDER BY category_id asc'
//         db.query(sql, (err, result) => {
//             if (err) {
//                 return res.status(400).send({ message: err.message })
//             }
//             return res.status(200).send(result)
//         })
//     } catch (err) {
//         return res.status(500).send({ message: err.message })

//     }
// }
// exports.getCategoryById = (req, res) => {
//     try {
//         const sql = 'SELECT * FROM categories WHERE category_id=?'
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
// exports.createCategory = (req, res) => {
//     try {
//         const sqlCheck = 'SELECT * FROM categories WHERE category_name=?'
//         db.query(sqlCheck, [req.body.category_name], (err, result) => {
//             if (err) {
//                 return res.status(400).send({ message: err.message })
//             }
//             if (result.length > 0) {
//                 return res.status(400).send({ message: 'ປະເພດນີ້ມີແລ້ວ' })
//             }
//             const sql = 'INSERT INTO categories (category_name) VALUES (?)'
//             db.query(sql, [req.body.category_name], (err, result) => {
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
// exports.updateCategory = (req, res) => {
//     try {
//         const sql = 'UPDATE categories SET category_name=? WHERE category_id=?'
//         db.query(sql, [req.body.category_name, req.params.id], (err, result) => {
//             if (err) {
//                 return res.status(400).send({ message: err.message })
//             }
//             return res.status(200).send(result)
//         })
//     } catch (err) {
//         return res.status(500).send({ message: err.message })

//     }
// }
// exports.deleteCategory = (req, res) => {
//     try {
//         const sql = 'DELETE FROM categories WHERE category_id=?'
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

exports.getCategories = (req, res) => {
  try {
    const sql = 'SELECT * FROM categories ORDER BY category_id asc';
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

exports.getCategoryById = (req, res) => {
  try {
    const sql = 'SELECT * FROM categories WHERE category_id=?';
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

exports.createCategory = (req, res) => {
  const { category_name, username } = req.body;

  try {
    const checkSql = 'SELECT * FROM categories WHERE category_name = ?';
    db.query(checkSql, [category_name], (err, results) => {
      if (err) return res.status(400).send({ message: err.message });

      if (results.length > 0) {
        return res.status(403).send({ message: 'ປະເພດນີ້ມີແລ້ວ' });
      }

      const insertSql = 'INSERT INTO categories (category_name) VALUES (?)';
      db.query(insertSql, [category_name], (err, result) => {
        if (err) return res.status(400).send({ message: err.message });

        const ip = req.socket.remoteAddress?.replace('::ffff:', '') || 'unknown IP';
        logger.info(`ເພີ່ມ ➝ ຈາກ IP: ${ip}\n` + `#ລາຍລະອຽດ:\n` + `• ລະັຫດປະເພດ: ${result.insertId}\n` + `• ປະເພດ: ${category_name}\n`+`• ຕາຕະລາງ: ປະເພດ`,);

        return res.status(201).send({ message: 'Category created', id: result.insertId });
      });
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

exports.updateCategory = (req, res) => {
  const id = req.params.id;
  const { category_name, username } = req.body;

  try {
    const getSql = "SELECT * FROM categories WHERE category_id = ?";
    db.query(getSql, [id], (err, results) => {
      if (err) return res.status(500).send({ message: err.message });
      if (results.length === 0) return res.status(404).send({ message: "Category not found" });

      const current = results[0];

      const updateSql = `UPDATE categories SET category_name = ? WHERE category_id = ?`;
      db.query(updateSql, [category_name, id], (err, result) => {
        if (err) return res.status(400).send({ message: err.message });

        if (current.category_name !== category_name) {
          const ip = req.socket.remoteAddress?.replace('::ffff:', '') || 'unknown IP';
          logger.info(
            `ແກ້ໄຂ ➝ ຈາກ IP: ${ip}\n` +
            `#ລາຍລະອຽດ:\n` +
            `• ລະຫັດປະເພດ: ${id}\n` +
            `• ຊື້ປະເພດ: '${current.category_name}' ➝ '${category_name}'\n`+
            `• ຕາຕະລາງ: ປະເພດ`
          );
        }

        return res.status(200).send({
          message: 'Category updated',
          category: { category_id: id, category_name }
        });
      });
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};


exports.deleteCategory = (req, res) => {
  const id = req.params.id;
  const sqlDelete = 'DELETE FROM categories WHERE category_id = ?';

  db.query(sqlDelete, [id], (err, result) => {
    if (err) {
      console.error("Database error deleting category:", err);
      return res.status(500).json({ message: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const ip = req.socket.remoteAddress?.replace('::ffff:', '') || 'unknown IP';
    logger.info(`ລຶບ ➝ ຈາກ IP: ${ip}\n` +
                `#ລາຍລະອຽດ:\n`+
                `ລະຫັດປະເພດ: ${id}\n`+
                `ຈາກຕາຕະລາງ: ປະເພດ`);

    return res.status(200).json({ message: "Category deleted", category_id: id });
  });
};

exports.getCategoryCount=(req,res)=>{
  try {
    const sql = 'SELECT COUNT(*) AS count FROM categories';
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



// exports.createCategory = (req, res) => {
//     try {
//         const sqlCheck = 'SELECT * FROM categories WHERE category_name=?';
//         db.query(sqlCheck, [req.body.category_name], (err, result) => {
//             if (err) {
//                 return res.status(400).send({ message: err.message });
//             }
//             if (result.length > 0) {
//                 return res.status(400).send({ message: 'ປະເພດນີ້ມີແລ້ວ' });
//             }
//             const sqlInsert = 'INSERT INTO categories (category_name) VALUES (?)';
//             db.query(sqlInsert, [req.body.category_name], (err, result) => {
//                 if (err) {
//                     return res.status(400).send({ message: err.message });
//                 }
//                 // Store the result (which might contain insertId) and the request body
//                 res.locals.body = { insertId: result.insertId, ...req.body };
//                 return res.status(201).send(res.locals.body); // Send back the stored body
//             });
//         });
//     } catch (err) {
//         return res.status(500).send({ message: err.message });
//     }
// };

// exports.updateCategory = (req, res) => {
//     try {
//         const sqlUpdate = 'UPDATE categories SET category_name=? WHERE category_id=?';
//         db.query(sqlUpdate, [req.body.category_name, req.params.id], (err, result) => {
//             if (err) {
//                 return res.status(400).send({ message: err.message });
//             }
//             // Store a success message and the updated data
//             res.locals.body = { message: 'Category updated', ...req.body, category_id: req.params.id };
//             return res.status(200).send(res.locals.body); // Send back the stored body
//         });
//     } catch (err) {
//         return res.status(500).send({ message: err.message });
//     }
// };

// exports.deleteCategory = (req, res) => {
//     try {
//         const sqlDelete = 'DELETE FROM categories WHERE category_id=?';
//         db.query(sqlDelete, [req.params.id], (err, result) => {
//             if (err) {
//                 return res.status(400).send({ message: err.message });
//             }
//             // Store a success message and the deleted ID
//             res.locals.body = { message: 'Category deleted', category_id: req.params.id };
//             return res.status(200).send(res.locals.body); // Send back the stored body
//         });
//     } catch (err) {
//         return res.status(500).send({ message: err.message });
//     }
// };