const express = require('express'); //tipo import 
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose'); //ferramenta de mapeamento objeto-documento (ODM)

require('dotenv/config');


//middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));

//routes
const usersRouter = require('./routers/users');
const categoriesRouter = require('./routers/categories');
const productsRouter = require('./routers/products');
const ordersRouter = require('./routers/orders');
const movementsRouter = require('./routers/movements');
const purchasesRouter = require('./routers/purchases');

const api = process.env.API_URL;


app.use(`${api}/users`, usersRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/products`, productsRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/movements`, movementsRouter);
app.use(`${api}/purchases`, purchasesRouter);

//conexao com o banco de dados
mongoose.connect(process.env.CONNECTION_STRING, {
    dbName: 'marketplace-SBD'
})
    .then(() => {
        console.log("conectado ao banco de dados com sucesso")
    })
    .catch((err) => {
        console.log("erro ao conectar ao banco de dados")
    });

app.listen(3000, () => {

    console.log('Servidor iniciado http://localhost: 3000');
})
