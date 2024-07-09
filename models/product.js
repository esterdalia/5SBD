//definindo o modelo de produto
const mongoose = require('mongoose'); //ferramenta de mapeamento objeto-documento (ODM)
const { Category } = require('./category');


const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', //relaciona esse id ao schema categoria
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 500
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    }
})

exports.Product = mongoose.model('Product', productSchema)
