//schemas
const mongoose = require('mongoose'); //ferramenta de mapeamento objeto-documento (ODM)


const orderSchema = mongoose.Schema({
    orderItems: [{ //itens do pedido dentro de um array pois pode haver mais de um item relacionado a um pedido
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem', //relaciona esse id ao schema itens do pedido
        required: true
    }],
    shippingAddress: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'Pendente',//status inicial
    },
    totalPrice: {
        type: Number,//será calculado
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',//relaciona esse id ao usuario
    },
    dateOrdered: {
        type: Date,
        default: Date.now //data de quando a requisição da compra for enviada
    },

})

exports.Order = mongoose.model('Order', orderSchema)
