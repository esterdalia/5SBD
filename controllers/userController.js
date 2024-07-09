const { User } = require('../models/user');



// Listar todos os usuários
exports.getUsers = async (req, res) => {
    try {
        const userList = await User.find();
        res.status(200).json(userList);
    } catch (err) {
        res.status(500).json({ message: "Erro ao buscar usuários", error: err });
    }
};

// Encontrar usuário específico por ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: "Usuário não encontrado" });
        } else {
            res.status(200).json(user);
        }
    } catch (err) {
        res.status(500).json({ message: "Erro ao buscar usuário", error: err });
    }
};

// Adicionar usuário
exports.addUser = async (req, res) => {
    try {
        let user = new User({
            name: req.body.name,
            email: req.body.email,
            address: req.body.address,
            zip: req.body.zip,
            phone: req.body.phone
        });
        user = await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: "Erro ao adicionar usuário", error: err });
    }
};

// Alterar usuário
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                email: req.body.email,
                address: req.body.address,
                zip: req.body.zip,
                phone: req.body.phone
            },
            { new: true }
        );
        if (!user) {
            res.status(404).json({ message: "Usuário não encontrado" });
        } else {
            res.status(200).json(user);
        }
    } catch (err) {
        res.status(500).json({ message: "Erro ao atualizar usuário", error: err });
    }
};

// Deletar usuário
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).json({ message: "Usuário não encontrado" });
        } else {
            res.status(200).json({ success: true, message: "Usuário deletado com sucesso!" });
        }
    } catch (err) {
        res.status(500).json({ message: "Erro ao deletar usuário", error: err });
    }
};

