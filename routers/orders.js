const express = require('express');
const router = express.Router();

const OrderController = require('../controllers/orderController');

router.get('/', OrderController.getOrders);
router.get('/:id', OrderController.getOrderById);
router.post('/', OrderController.addOrder);
router.put('/:id', OrderController.updateOrder);
router.delete('/:id', OrderController.deleteOrder);

module.exports = router;