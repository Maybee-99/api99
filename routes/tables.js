const express = require('express');
const router = express.Router();

const {
    getAllTables,
    getOnlyTableNames,
    getTableData // Import the getTableData function
} = require("../controllers/tables.js");

router.get('/tables', getAllTables);
router.get('/tablesName', getOnlyTableNames);
router.get('/tableData', getTableData); // Define the new route for fetching table data

module.exports = router;