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
/* 
1.Percorre os itens do pedido
2.Verifica se há estoque suficiente para cada item
3.Calcula o preço total do pedido
4.Cria um novo pedido com os itens, endereço, status, preço total e usuário
5.Se o pedido estiver finalizado, registra os movimentos de saída no estoque
6.Adiciona informações na tabela de compras para os produtos que precisem ser comprados e a qtd necessaria */

exports.addOrder = async (req, res) => {
    try {
        const orderItems = req.body.orderItems;
        const orderItemsIds = [];
        const purchases = []; // Para armazenar compras necessárias : array com o id do produto e a qtd a comprar

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
            }
            //aramzena os itens do pedido num array com seus respectivos IDs de produto e quantidades 
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
        if (status === 'Finalizado') {//Se o pedido estiver finalizado, registra os movimentos de saída no estoque
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
                        productToUpdate.countInStock = 0;//soluçao pro estoque nao ficar negativo
                    }
                    await productToUpdate.save();
                }
            }));
        }
        // Adicionar à tabela de compras
        await Promise.all(purchases.map(async (purchase) => {//percorre as compras
            const existingPurchase = await Purchase.findOne({ product: purchase.product });

            if (existingPurchase) {
                // Se já existe uma necessidade de compra para este produto especifico, atualiza a quantidade necessária
                existingPurchase.quantityToBuy += purchase.quantityToBuy;
                await existingPurchase.save();
            } else {
                // Caso contrário, cria uma nova entrada na tabela de compras
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

//atualizar status do pedido
exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true } // retorna o documento atualizado em vez do documento original
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
