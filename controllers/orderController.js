const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item');
const { Product } = require('../models/product');
const { Purchase } = require('../models/purchase');
const { Movement } = require('../models/movement');

// Listar todos os pedidos
exports.getOrders = async (req, res) => {
    try {
        const orderList = await Order.find().sort('dateOrdered');
        res.status(200).json(orderList);
    } catch (err) {
        res.status(500).json({ message: "Erro ao buscar pedidos", error: err });
    }
};

// Encontrar pedido específico por ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name')
            .populate({
                path: 'orderItems', populate: {
                    path: 'product', populate: 'category'
                }
            });

        if (!order) {
            res.status(404).json({ message: "Pedido não encontrado" });
        } else {
            res.status(200).json(order);
        }
    } catch (err) {
        res.status(500).json({ message: "Erro ao buscar pedido", error: err });
    }
};

// Adicionar pedido

exports.addOrder = async (req, res) => {
    try {
        const orderItems = req.body.orderItems;
        const orderItemsIds = [];
        const movements = []; // Para armazenar movimentos de estoque
        const purchases = []; // Para armazenar compras necessárias

        // Verificar se há produtos suficientes em estoque e calcular o preço total
        const totalPrices = await Promise.all(orderItems.map(async (orderItem) => {
            const product = await Product.findById(orderItem.product);
            if (!product) {
                throw new Error(`Produto com ID ${orderItem.product} não encontrado`);
            }

            let totalPrice = product.price * orderItem.quantity;

            // Verificar se há produtos suficientes em estoque
            if (orderItem.quantity > product.countInStock) {//estoque insuficiente
                // Calcular a quantidade que precisa ser comprada
                const quantityToBuy = orderItem.quantity - product.countInStock;
                // Adicionar à tabela de compras
                purchases.push({
                    product: product._id,
                    quantityToBuy: quantityToBuy
                });
                // Atualizar o preço total para refletir apenas o que está disponível em estoque
                totalPrice = product.price * product.countInStock;
            }

            //se ha estoque suficiente:
            orderItemsIds.push({
                product: product._id,
                quantity: orderItem.quantity
            });
            return totalPrice;
        }));

        const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

        // Criação do pedido com status condicional
        let status = 'pendente';
        if (purchases.length === 0) {
            status = 'Finalizado';
        }

        let order = new Order({
            orderItems: orderItemsIds.map(item => item.product),
            shippingAddress: req.body.shippingAddress,
            status: status,
            totalPrice: totalPrice,
            user: req.body.user,
        });

        order = await order.save();
        if (!order) {
            return res.status(500).send('Não foi possível adicionar o pedido');
        }

        // Registrar movimentos de saída para produtos no estoque
        if (status === 'Finalizado') {
            await Promise.all(orderItems.map(async (orderItem) => {
                const movement = new Movement({
                    product: orderItem.product,
                    quantity: orderItem.quantity,
                    type: 'saída', // Tipo de movimento: saída
                    orderId: order._id // Associa o pedido ao movimento
                });
                await movement.save();

                // Atualizar countInStock do produto com a quantidade que saiu
                const productToUpdate = await Product.findById(orderItem.product);
                if (productToUpdate) {
                    // Verificar se a quantidade em estoque é suficiente
                    if (productToUpdate.countInStock >= orderItem.quantity) {
                        productToUpdate.countInStock -= orderItem.quantity;
                    } else {
                        productToUpdate.countInStock = 0;
                    }
                    await productToUpdate.save();
                }
            }));
        }
        // Adicionar à tabela de compras
        await Promise.all(purchases.map(async (purchase) => {
            const existingPurchase = await Purchase.findOne({ product: purchase.product });

            if (existingPurchase) {
                // Se já existe uma necessidade de compra para este produto, atualize a quantidade necessária
                existingPurchase.quantityToBuy += purchase.quantityToBuy;
                await existingPurchase.save();
            } else {
                // Caso contrário, crie uma nova entrada na tabela de compras
                const newPurchase = new Purchase({
                    product: purchase.product,
                    quantityToBuy: purchase.quantityToBuy
                });
                await newPurchase.save();
            }
        }));


        res.status(201).send(order);
    } catch (error) {
        res.status(500).send('Erro ao criar o pedido: ' + error.message);
    }
};



/* exports.addOrder = async (req, res) => {
    try {
    const orderItemsIds = await Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }));

    const totalPrices = await Promise.all(orderItemsIds.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }));

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({
        orderItems: orderItemsIds,
        shippingAddress: req.body.shippingAddress,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    });

    order = await order.save();
    res.status(201).json(order);
} catch (error) {
    res.status(500).json({ message: "Erro ao criar pedido", error: error.message });
}
}; */

// Atualizar status do pedido
exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        if (!order) {
            res.status(404).json({ message: "Pedido não encontrado" });
        } else {
            res.status(200).json(order);
        }
    } catch (err) {
        res.status(500).json({ message: "Erro ao atualizar pedido", error: err });
    }
};

// Deletar pedido
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            res.status(404).json({ message: "Pedido não encontrado" });
        } else {
            await Promise.all(order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndDelete(orderItem);
            }));
            res.status(200).json({ success: true, message: "Pedido deletado com sucesso!" });
        }
    } catch (err) {
        res.status(500).json({ message: "Erro ao deletar pedido", error: err });
    }
};
