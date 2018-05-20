const mongoose = require('mongoose');
const Order = require('../models/order.models');
const Product = require('../models/product.models');

// Get all orders
exports.get_all_orders = (req, res, next) => {
    Order.find().select('_id product quantity')
        .populate('product', 'name price')
        .exec().then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: process.env.PROTOCOL + process.env.HOST + ':' + process.env.PORT + '/orders/' + doc._id
                        }
                    }
                })
            });
        }).catch(err => {
            res.status(500).json({ error: err });
        });
}

// Create an order
exports.create_order = (req, res, next) => {
    Product.findById(req.body.productId).then(product => {
        if (!product) {
            return res.status(404).json({
                message: "Product not found !"
            })
        }
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            product: req.body.productId,
            quantity: req.body.quantity
        });
        return order.save();
    }).then(result => {
        res.status(201).json({
            message: "Order creation successful...",
            createdOrder: {
                _id: result._id,
                product: result.product,
                quantity: result.quantity,
                request: {
                    type: "GET",
                    url: process.env.PROTOCOL + process.env.HOST + ':' + process.env.PORT + '/orders/' + result._id
                }
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(201).json({ error: err });
    });
}

// Get a particular order
exports.get_order = (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id).select('_id product quantity')
        .populate('product', 'name price')
        .exec().then(doc => {
            if (doc) {
                res.status(200).json({
                    order: doc,
                    request: {
                        type: "GET",
                        url: process.env.PROTOCOL + process.env.HOST + ':' + process.env.PORT + '/orders/'
                    }
                });
            }
            else {
                res.status(404).json({ message: "Order not found with id:" + id })
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}

// Update an order
exports.update_order = (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id).then(order => {
        if (!order) {
            return res.status(404).json({
                message: "Order NOT found !"
            })
        }
    }).then().catch();
    const updateOps = {};
    var productId = "";
    for (const ops of req.body) {
        if (ops.propName === "product") {
            productId = ops.value;
        }
        updateOps[ops.propName] = ops.value;
    }
    if (productId !== "") {
        Product.findById(productId).then(product => {
            if (!product) {
                return res.status(404).json({
                    message: "Order NOT updated (Product not found !)"
                });
            }
            else {
                updateOrder(id, updateOps, res);
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
    }
    else {
        updateOrder(id, updateOps, res);
    }
}
function updateOrder(id, updateOps, res) {
    Order.update({ _id: id }, { $set: updateOps }).exec().then(result => {
        res.status(200).json({
            message: "Order updated",
            request: {
                type: "GET",
                url: process.env.PROTOCOL + process.env.HOST + ':' + process.env.PORT + '/orders/' + id
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
}

// Delete an order
exports.delete_order = (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id).then(order => {
        if (!order) {
            return res.status(404).json({
                message: "Order NOT found !"
            })
        }
        else {
            return Order.remove({ _id: id });
        }
    }).then(result => {
        res.status(200).json({
            message: "Order deleted",
            request: {
                type: "GET",
                url: process.env.PROTOCOL + process.env.HOST + ':' + process.env.PORT + '/orders/'
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
}