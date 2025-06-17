const express = require('express');
const router = express.Router();
const ipController = require('../controllers/ipController');

router.get('/active-ips', ipController.getActiveIps);

module.exports = router;
