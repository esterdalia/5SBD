//ROUTERS: Define as rotas da aplicação para produtos
const { Product } = require('../models/product');
const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

const { Category } = require('../models/category');

const { default: mongoose } = require('mongoose');
console.log(ProductController);

//listar produtos
router.get('/', ProductController.getProducts);

//encontrar produto especifico
router.get('/:id', ProductController.getProductById);

//adicionar produtos
router.post('/', ProductController.addProduct);

//alterar Produto
router.put('/:id', ProductController.updateProduct);

//deletar produto
router.delete('/:id', ProductController.deleteProduct);

//quantidade de produtos totais
router.get('/get/count', ProductController.getProductCount);

module.exports = router; 