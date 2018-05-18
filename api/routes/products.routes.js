const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/products.models');

router.get('/', (req, res, next) => {
    Product.find().select('_id name price').exec().then(docs => {
        res.status(200).json({
            count: docs.length,
            products: docs.map(doc => {
                return {
                    _id: doc._id,
                    name: doc.name,
                    price: doc.price,
                    request: {
                        type: 'GET',
                        url: process.env.PROTOCOL + process.env.HOST + ':' + process.env.PORT + '/products/' + doc._id
                    }
                }
            })
        });
        // console.log(docs);
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
});

router.post('/', (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save().then((result) => {
        // console.log(result);
        res.status(201).json({
            message: "Product creation successful...",
            createdProduct: {
                _id: result._id,
                name: result.name,
                price: result.price,
                request: {
                    type: "GET",
                    url: process.env.PROTOCOL + process.env.HOST + ':' + process.env.PORT + '/products/' + result._id
                }
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id).select('_id name price').exec().then(doc => {
        if (doc) {
            res.status(200).json({
                product: doc,
                request: {
                    type: "GET",
                    url: process.env.PROTOCOL + process.env.HOST + ':' + process.env.PORT + '/products/'
                }
            });
        }
        else {
            res.status(404).json({ message: "Product doesn't exist with id:" + id })
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id).then(product => {
        if (!product) {
            return res.status(404).json({
                message: "Product NOT found !"
            })
        }
        else {
            const updateOps = {};
            for (const ops of req.body) {
                updateOps[ops.propName] = ops.value;
            }
            return Product.update({ _id: id }, { $set: updateOps });
        }
    }).then(result => {
        res.status(200).json({
            message: "Product updated",
            request: {
                type: "GET",
                url: process.env.PROTOCOL + process.env.HOST + ':' + process.env.PORT + '/products/' + id
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });

});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id).then(product => {
        if (!product) {
            return res.status(404).json({
                message: "Product NOT found !"
            })
        }
        else {
            return Product.remove({ _id: id });
        }
    }).then(result => {
        res.status(200).json({
            message: "Product deleted",
            request: {
                type: "GET",
                url: process.env.PROTOCOL + process.env.HOST + ':' + process.env.PORT + '/products/'
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });

});


module.exports = router;