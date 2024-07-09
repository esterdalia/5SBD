//schemas
const mongoose = require('mongoose'); //ferramenta de mapeamento objeto-documento (ODM)


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },

    zip: {
        type: String,
        required: true
    },

    phone: {
        type: Number,
        required: true
    }
})

exports.User = mongoose.model('User', userSchema)
