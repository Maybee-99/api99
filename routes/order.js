
const express = require('express');
const router = express.Router();
const {
    creatOrder,
    getAllOrders,
    approveOrder,
     cancelOrder
} = require('../controllers/order');

router.post('/orders', creatOrder);

// router.post('/order_details', creatOrderDetail);

router.get('/producer/orders', getAllOrders);
router.put('/orders/:orderId/approve', approveOrder);
router.delete('/orders/:orderId', cancelOrder);

module.exports = router;