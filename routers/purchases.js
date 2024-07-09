// Rotas para movimentos de estoque
const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

// Rotas para compras necessárias
router.get('/', purchaseController.getPurchases);

module.exports = router;