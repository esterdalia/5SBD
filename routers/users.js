//ROUTERS: Define as rotas da aplicação para usuários

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

router.get('/', UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.addUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

module.exports = router;
