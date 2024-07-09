const { Movement } = require('../models/movement');
const { Product } = require('../models/product');
const { Purchase } = require('../models/purchase');

// Obter todos as movimentações de entrada e saída
exports.getMovements = async (req, res) => {
    try {
        const movements = await Movement.find();
        if (!movements) {
            return res.status(404).json({ success: false, message: "Movimentação não encontrada" });
        }
        res.status(200).json(movements);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

//adicionar movimentação de entrada
exports.addMovementEntry = async (req, res) => {

    try {
        const product = await Product.findById(req.body.product);
        if (!product) return res.status(400).send("produto não encontrado");

        // Criar nova movimentação de entrada
        let movement = new Movement({
            product: req.body.product,
            quantity: req.body.quantity,
            type: 'entrada',
            orderId: null
        });

        await movement.save();

        // Atualizar countInStock do produto com a quantidade que chegou
        product.countInStock += movement.quantity;
        await product.save();

        const existingPurchase = await Purchase.findOne({ product: req.body.product });

        if (existingPurchase) {
            // Se existe uma necessidade de compra para este produto que chegou, atualize a quantidade pra comprar necessária
            existingPurchase.quantityToBuy -= movement.quantity;
            await existingPurchase.save();
        }

        res.status(201).json({ message: 'Movimentação de entrada adicionada com sucesso', movement });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao adicionar movimentação de entrada', error: error.message });
    }
}
