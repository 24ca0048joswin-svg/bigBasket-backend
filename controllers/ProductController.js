const ProductModel = require("../models/ProductModel.js");

async function prodUsingIds(req, res) {
    try {
        const { ids } = req.body;
        const products = await ProductModel.find({ _id: { $in: ids } });
        if (products) {
            res.json({
                status: 'Success',
                length: products.length,
                products,
            });
        }
    } catch (err) {
        console.log(`An error occured : ${err}`)
    }
}

module.exports = { prodUsingIds }