const mongoose = require('mongoose');
const Product = require('../models/product.models');

// Get all products
exports.get_all_products = (req, res, next) => {
    Product.find().select('_id name price productImage').exec().then(docs => {
        res.status(200).json({
            count: docs.length,
            products: docs.map(doc => {
                return {
                    _id: doc._id,
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
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
}

// Create a product
exports.create_product = (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product.save().then((result) => {
        // console.log(result);
        res.status(201).json({
            message: "Product creation successful...",
            createdProduct: {
                _id: result._id,
                name: result.name,
                price: result.price,
                productImage: result.productImage,
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
}

// Get a product
exports.get_product = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id).select('_id name price productImage').exec().then(doc => {
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
}

// Update a product
exports.update_product = (req, res, next) => {
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
}

// Delete a product
exports.delete_product = (req, res, next) => {
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
}