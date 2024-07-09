// Rotas para movimentos de estoque
const express = require('express');
const router = express.Router();
const movementController = require('../controllers/movementController');

router.get('/', movementController.getMovements);
router.post('/', movementController.addMovementEntry);

module.exports = router;