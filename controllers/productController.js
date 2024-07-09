const { Product } = require('../models/product');
const { Category } = require('../models/category');
const { default: mongoose } = require('mongoose');

//listar produtos
exports.getProducts = async (req, res) => {
    try {
        const productList = await Product.find().populate('category');
        if (!productList) {
            return res.status(500).json({ success: false });
        }
        res.send(productList);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
// Encontrar produto específico
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            return res.status(500).json({ message: "Produto não encontrado" });
        }
        res.send(product);
    } catch (err) {
        res.status(500).json({ message: "Erro ao buscar produto", error: err });
    }
};

// Adicionar produtos
exports.addProduct = async (req, res) => {
    try {
        const category = await Category.findById(req.body.category);
        if (!category) return res.status(400).send("Categoria não encontrada");

        let product = new Product({
            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
        });
        product = await product.save();
        if (!product) return res.status(500).send('Não foi possível criar produto');

        res.send(product);
    } catch (err) {
        res.status(500).json({ message: "Erro ao adicionar produto", error: err });
    }
};

// Alterar produto
exports.updateProduct = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Produto não encontrado');
    }

    try {
        const category = await Category.findById(req.body.category);
        if (!category) return res.status(400).send("Categoria não encontrada");

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                price: req.body.price,
                category: req.body.category,
                countInStock: req.body.countInStock,
            },
            { new: true }
        );
        if (!product) return res.status(404).send('Não foi possível alterar produto');

        res.send(product);
    } catch (err) {
        res.status(500).json({ message: "Erro ao atualizar produto", error: err });
    }
};

// Deletar produto
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (product) {
            return res.status(200).json({ success: true, message: "Produto deletado com sucesso!" });
        } else {
            return res.status(404).json({ success: false, message: "Produto não encontrado!" });
        }
    } catch (err) {
        return res.status(400).json({ success: false, error: err });
    }
};

// Quantidade de produtos totais
exports.getProductCount = async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        res.send({
            productCount: productCount
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err });
    }
};