//models: Define os esquemas de dados e interação com o banco
const mongoose = require('mongoose'); //ferramenta de mapeamento objeto-documento (ODM)


const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
})

exports.Category = mongoose.model('Category', categorySchema)
