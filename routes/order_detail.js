
const express = require('express');
const router = express.Router();
const { creatOrderDetail } = require('../controllers/order_detail');
router.post('/orderDetail', creatOrderDetail);
module.exports = router;