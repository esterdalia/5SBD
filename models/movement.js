const mongoose = require('mongoose');

const movementSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['entrada', 'saída'],
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

exports.Movement = mongoose.model('Movement', movementSchema);

