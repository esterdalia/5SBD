const mongoose = require('mongoose');


const purchaseSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantityToBuy: {
        type: Number,
        required: true,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
});

exports.Purchase = mongoose.model('Purchase', purchaseSchema);

