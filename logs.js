const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/logs', (req, res) => {
    const logPath = path.join(__dirname, 'log', 'product-actions.log');
    fs.readFile(logPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading log file:', err);
            return res.status(500).send('Unable to read log file.');
        }
        res.send(data);
    });
});

module.exports = router;

