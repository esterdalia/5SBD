const { Category } = require('../models/category');

// Listar todas as categorias
exports.getCategories = async (req, res) => {
    try {
        const categoryList = await Category.find();
        res.status(200).json(categoryList);
    } catch (err) {
        res.status(500).json({ message: "Erro ao buscar categorias", error: err });
    }
};

// Encontrar categoria específica por ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            res.status(404).json({ message: "Categoria não encontrada" });
        } else {
            res.status(200).json(category);
        }
    } catch (err) {
        res.status(500).json({ message: "Erro ao buscar categoria", error: err });
    }
};

// Adicionar categoria
exports.addCategory = async (req, res) => {
    try {
        let category = new Category({
            name: req.body.name,
        });
        category = await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: "Erro ao adicionar categoria", error: err });
    }
};

// Alterar categoria
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name },
            { new: true }
        );
        if (!category) {
            res.status(404).json({ message: "Categoria não encontrada" });
        } else {
            res.status(200).json(category);
        }
    } catch (err) {
        res.status(500).json({ message: "Erro ao atualizar categoria", error: err });
    }
};

// Deletar categoria
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            res.status(404).json({ message: "Categoria não encontrada" });
        } else {
            res.status(200).json({ success: true, message: "Categoria deletada com sucesso!" });
        }
    } catch (err) {
        res.status(500).json({ message: "Erro ao deletar categoria", error: err });
    }
};
