const { Purchase } = require('../models/purchase');

// Obter todas as compras necessárias
exports.getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find();
        if (!purchases) {
            return res.status(404).json({ success: false, message: "Pedido de Compras não encontrado" });
        }
        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
