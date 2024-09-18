const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    pname: String,
    pdesc: String,
    price: String,
    category: String,
    pimage: String,
    pimage2: String,
    addedBy: mongoose.Schema.Types.ObjectId,
    pLoc: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number]
        }
    }
});

schema.index({ pLoc: '2dsphere' });

const Product = mongoose.models.Product || mongoose.model('Product', Schema); // Ensure singular 'Product'

// Search product functionality
const search = (req, res) => {
    console.log(req.query);

    let latitude = req.query.loc.split(',')[0];
    let longitude = req.query.loc.split(',')[1];

    let search = req.query.search;
    Product.find({
        $or: [
            { pname: { $regex: search, $options: 'i' } }, // Add 'i' for case-insensitive
            { pdesc: { $regex: search, $options: 'i' } },
            { price: { $regex: search, $options: 'i' } },
        ],
        pLoc: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(latitude), parseFloat(longitude)]
                },
                $maxDistance: 500 * 1000, // 500km
            }
        }
    })
    .then((results) => {
        res.send({ message: 'success', products: results });
    })
    .catch((err) => {
        res.send({ message: 'server error', error: err });
    });
};

// Add a new product functionality
const addProduct = (req, res) => {
    console.log(req.files);
    console.log(req.body);

    const plat = req.body.plat;
    const plong = req.body.plong;
    const pname = req.body.pname;
    const pdesc = req.body.pdesc;
    const price = req.body.price;
    const category = req.body.category;
    const pimage = req.files.pimage[0].path;
    const pimage2 = req.files.pimage2[0].path;
    const addedBy = req.body.userId;

    const product = new Product({
        pname, pdesc, price, category, pimage, pimage2, addedBy, 
        pLoc: { type: 'Point', coordinates: [plat, plong] }
    });

    product.save()
    .then(() => {
        res.send({ message: 'Product saved successfully.' });
    })
    .catch((err) => {
        res.send({ message: 'server error', error: err });
    });
};

// Get all products or products by category functionality
const getProducts = (req, res) => {
    const catName = req.query.catName;
    let filter = {};

    if (catName) {
        filter = { category: catName };
    }

    Product.find(filter)
    .then((result) => {
        res.send({ message: 'success', products: result });
    })
    .catch((err) => {
        res.send({ message: 'server error', error: err });
    });
};

// Get a product by ID functionality
const getProductsById = (req, res) => {
    console.log(req.params);

    Product.findOne({ _id: req.params.pId })
    .then((result) => {
        res.send({ message: 'success', product: result });
    })
    .catch((err) => {
        res.send({ message: 'server error', error: err });
    });
};

// Get products added by a specific user functionality
const myProducts = (req, res) => {
    const userId = req.body.userId;

    Product.find({ addedBy: userId })
    .then((result) => {
        res.send({ message: 'success', products: result });
    })
    .catch((err) => {
        res.send({ message: 'server error', error: err });
    });
};
// Correct export syntax
module.exports = {
    addProduct,
    search,
    getProducts,
    getProductsById,
    myProducts,
};
