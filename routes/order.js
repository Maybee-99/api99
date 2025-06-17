const express = require('express');
const router = express.Router();
const { creatOrder } = require('../controllers/order');
router.post('/orders', creatOrder);
module.exports = router;