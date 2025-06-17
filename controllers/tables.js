const db = require('../config/connectDB');

const fetchTableName = (callback) => {
    const sql = "SHOW TABLES";
    db.query(sql, (err, result) => {
        if (err) {
            return callback(err, null);
        }
        const tableKey = Object.keys(result[0])[0];
        const tables = result.map(row => row[tableKey]);
        callback(null, tables);
    });
};

const getAllTables = (req, res) => {
    try {
        fetchTableName((err, tables) => {
            if (err) {
                console.error("Error fetching tables:", err);
                return res.status(400).json({ error: "Failed to fetch tables" });
            }
            res.status(200).json({ total: tables.length, tables });
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

const getOnlyTableNames = (req, res) => {
    fetchTableName((err, tables) => {
        if (err) {
            console.error("Error:", err);
            return res.status(400).json({ error: "Failed to get table names" });
        }
        res.status(200).json({ tables });
    });
};

const getTableData = (req, res) => {
    const tableName = req.query.name; // Get the table name from the query parameters

    if (!tableName) {
        return res.status(400).json({ error: "Table name is required" });
    }

    const sql = `SELECT * FROM ??`; // Use '??' for safe table name insertion

    db.query(sql, [tableName], (err, result) => {
        if (err) {
            console.error(`Error fetching data from table "${tableName}":`, err);
            return res.status(500).json({ error: `Failed to fetch data from table "${tableName}"` });
        }

        res.status(200).json({ rows: result });
    });
};

module.exports = {
    getAllTables,
    getOnlyTableNames,
    fetchTableName,
    getTableData // Export the new function
};