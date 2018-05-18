const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products.routes');
const orderRoutes = require('./api/routes/orders.routes');

// Connect with MongoDB Atlas DaaS
// mongoose.connect('mongodb+srv://node-shop:' + process.env.DB_PSW + '@node-shop-msfkg.mongodb.net/node-shop?retryWrites=true');

// Connect with mLab DaaS
mongoose.connect('mongodb://node-shop:' + process.env.DB_PSW + '@ds041486.mlab.com:41486/node-shop');

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handling CORS errors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
});

// Routes to handle requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// Handling Not Found errors
app.use((req, res, next) => {
    const error = new Error('Not Found...!');
    error.status = 404;
    next(error);
});

// Handling all general errors
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;
