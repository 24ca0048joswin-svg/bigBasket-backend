const ProductModel = require("../models/ProductModel.js");

const { unlinkSync } = require("node:fs");
// const path = require("path");
const { uploadToCloudinary, deleteImageFromCloudinary } = require("../middleware/cloudinary.js");

async function discountCalculate(originalPrice, sellingPrice) {
    let discountAmount = originalPrice - sellingPrice;
    let discountPercentage = (discountAmount / originalPrice) * 100;
    discountPercentage = discountPercentage.toFixed(0);
    return discountPercentage;
}

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
        console.log(`prodUsingIds error occured : ${err}`)
    }
}

async function displayProductsOnCategory(req, res) {
    try {
        const { category } = req.body;
        const products = await ProductModel.find({ 'category': category });
        if (products) {
            res.json({
                status: 'Sucess',
                length: products.length,
                products,
            });
        }
    } catch (err) {
        console.log(`DisplayProductsOnCategory error occured : ${err}`)
    }
}

async function displayProducts(req, res) {
    try {
        const products = await ProductModel.find();
        if (products) {
            res.json({
                status: 'Sucess',
                length: products.length,
                products,
            });
        }
    } catch (err) {
        console.log(`displayProducts error occured : ${err}`)
    }
}

async function addProduct(req, res) {
    console.log("add product called");

    try {
        const result = await uploadToCloudinary(req.file.buffer);
        console.log(result);
        const { title, originalPrice, sellingPrice, isHarDinSasta, discountPercentage, category } = req.body;
        let isHDS = false;
        if (isHarDinSasta === 'True') {
            isHDS = true;
        }

        const product = await ProductModel.create({
            productUrl: result.url,
            productImageId: result.public_id,
            title: title,
            originalPrice: originalPrice,
            sellingPrice: sellingPrice,
            discountPercentage: discountPercentage,
            isHarDinSasta: isHDS,
            category: category,
        });
        if (!product) {
            res.json({
                "status": "error",
                "msg": "Unable to add the product"
            })
        } else {
            res.json({
                "status": "success",
                "msg": "Product added successfully"
            })
        }
    } catch (err) {
        console.log(`AddProducts product error occured : ${err}`)
    }
}

async function displayProducts(req, res) {
    try {
        const products = await ProductModel.find();
        if (products) {
            res.json({
                status: 'Sucess',
                length: products.length,
                products,
            });
        }
    } catch (err) {
        console.log(`displayProducts error occured : ${err}`)
    }
}

async function displayOneProduct(req, res) {
    try {
        const { id } = req.body;
        if (id == null) {
            res.status(404).json({
                status: 'Error',
                msg: 'Id is required',
            })
        }
        const product = await ProductModel.findOne({ _id: id });
        if (product) {
            res.json({
                status: 'Sucess',
                product,
            });
        }
    } catch (err) {
        console.log(`isplayOneProduct error occured : ${err}`)
    }
}

async function editProduct(req, res) {
    try {
        const { id, title, originalPrice, sellingPrice, isHarDinSasta, category } = req.body;

        const product = await ProductModel.findById(id);
        console.log(`id:${id}`);
        console.log(product);
        if (!product) {
            console.log("Product not found");
            res.json({
                status: 'Error',
                msg: 'Product not found to edit the page'
            });
        } else if (req.file) {
            const oldProductImageId = product.productImageId;

            if (oldProductImageId) {
                await deleteImageFromCloudinary(oldProductImageId);
            }
        }

        console.log("edit product");
        const discountPercentage = await discountCalculate(originalPrice, sellingPrice);
        if (req.file) {
            const result = uploadToCloudinary(req.file.buffer);
            const updatedProduct = await ProductModel.findOneAndUpdate({
                '_id': id
            },
                {
                    $set: {
                        title: title,
                        originalPrice: originalPrice,
                        sellingPrice: sellingPrice,
                        discountPercentage: discountPercentage,
                        isHarDinSasta: isHarDinSasta,
                        category: category,
                        productUrl: result.url,
                        proudctImageId: result.publicId,
                    }
                }, {
                new: false,
            }
            )
        } else {
            const updatedProduct = await ProductModel.findOneAndUpdate({
                '_id': id
            },
                {
                    $set: {
                        title: title,
                        originalPrice: originalPrice,
                        sellingPrice: sellingPrice,
                        discountPercentage: discountPercentage,
                        isHarDinSasta: isHarDinSasta,
                        category: category,
                    }
                }, {
                returnDocument: 'before',
            }
            )
        }

        res.json({
            status: 'success',
            msg: 'Updated product successfully'
        })

    } catch (err) {
        console.log(`EditProduct error occured : ${err}`)
    }
}


async function removeProduct(req, res) {
    try {
        const { id } = req.body;
        if (id == null) {
            res.json({
                status: 'Error',
                msg: 'Please provide the product id',
            })
        }

        const product = await ProductModel.findById(id);
        if (!product) {
            console.log("Product not found");
            res.json({
                status: 'Error',
                msg: 'Product not found to edit the page'
            });
        } else {
            const oldProductImageId = product.productImageId;

            if (oldProductImageId) {
                await deleteImageFromCloudinary(oldProductImageId);
            }
        }
        console.log(id);
        const isRemovedProduct = await ProductModel.deleteOne({ _id: id });
        if (isRemovedProduct) {
            res.json({
                status: 'Success',
                msg: 'Product deleted successfully',
            })
        }
    } catch (err) {
        console.log(`Remove product error occured:${err}`);
    }
}

module.exports = { prodUsingIds, displayProductsOnCategory, displayProducts, displayProducts, displayOneProduct, editProduct, addProduct, removeProduct }