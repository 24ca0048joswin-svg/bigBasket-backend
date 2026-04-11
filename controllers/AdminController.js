const AdminModel = require("../models/AdminModel.js");
const ProductModel = require("../models/ProductModel.js");
const UserModel = require("../models/UserModel.js");
const { setUser } = require("../middleware/auth.js");
const { unlinkSync } = require("node:fs");
const path = require("path");
const bcrypt = require('bcrypt');

async function discountCalculate(originalPrice, sellingPrice) {
    let discountAmount = originalPrice - sellingPrice;
    let discountPercentage = (discountAmount / originalPrice) * 100;
    discountPercentage = discountPercentage.toFixed(0);
    return discountPercentage;
}

async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        if (username == '' || email == '' || password == '') {
            res.json({ msg: "Post email, username and password" });
        }

        const userExists = await AdminModel.findOne({ email });
        if (userExists) {
            res.json({
                "status": "error",
                "msg": "User already exists"
            })
        }

        const user = await AdminModel.create({ username, email, password });
        if (!user) {
            res.json({
                "status": "error",
                "msg": "Unable to create the user"
            })
        } else {
            res.json({
                "status": "success",
                "msg": "Registered user successfully"
            })
        }
    } catch (err) {
        console.log(`An error occured : ${err}`)
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body
        const user = await AdminModel.findOne({ email });
        if (!user) {
            res.json({
                "status": "error",
                "msg": "Incorrect email or password"
            })
        } else {
            const isMatchPassword = await user.comparePassword(password);
            if (isMatchPassword) {
                const token = setUser(user);
                res.json({
                    "status": "success",
                    "msg": "Login successful",
                    token,
                })
            } else {
                res.json({
                    "status": "error",
                    "msg": "Incorrect email or password"
                })
            }
        }
    } catch (err) {
        console.log(`An error occured : ${err}`)
    }
}

async function addProduct(req, res) {
    console.log("add product called");
    try {
        const file = req.file;
        const { title, originalPrice, sellingPrice, isHarDinSasta, discountPercentage, category } = req.body;
        let isHDS = false;
        if (isHarDinSasta === 'True') {
            isHDS = true;
        }

        const product = await ProductModel.create({
            productUrl: file.filename,
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
        console.log(`An error occured : ${err}`)
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
        console.log(`An error occured : ${err}`)
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
        console.log(`An error occured : ${err}`)
    }
}

async function editProduct(req, res) {
    try {
        const { id, title, originalPrice, sellingPrice, isHarDinSasta, category } = req.body;
        console.log(req.body);

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
            const oldProductUrl = product.productUrl;

            if (oldProductUrl) {
                const filePath = path.join(__dirname, '..', 'uploads', oldProductUrl);
                unlinkSync(filePath);
                console.log(`Deleted image ${oldProductUrl}`);
            }
        }

        console.log("edit product");
        const discountPercentage = await discountCalculate(originalPrice, sellingPrice);
        if (req.file) {
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
                        productUrl: req.file.filename,
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
                new: false,
            }
            )

        }

        res.json({
            status: 'success',
            msg: 'Updated product successfully'
        })

    } catch (err) {
        console.log(`An error occured : ${err}`)
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
            const oldProductUrl = product.productUrl;

            if (oldProductUrl) {
                const filePath = path.join(__dirname, '..', 'uploads', oldProductUrl);
                unlinkSync(filePath);
                console.log(`Deleted image ${oldProductUrl}`);
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
        console.log(`An error occured:${err}`);
    }
}

async function displayUsers(req, res) {
    try {
        const users = await UserModel.find();
        if (users) {
            res.json({
                status: 'Sucess',
                length: users.length,
                users,
            });
        }
    } catch (err) {
        console.log(`An error occured : ${err}`)
    }
}

async function displayOneUser(req, res) {
    try {
        const { id } = req.body;
        if (id == null) {
            res.status(404).json({
                status: 'Error',
                msg: 'Id is required',
            })
        }
        let user = await UserModel.findOne({ _id: id });
        if (user) {
            user.password = undefined;
            user.__v = undefined;
            res.json({
                status: 'Sucess',
                user,
            });
        }
    } catch (err) {
        console.log(`An error occured : ${err}`)
    }
}

async function updateNameAndMail(req, res) {
    try {
        const { id, email, username } = req.body;
        if (id == null) {
            res.status(404).json({
                status: 'Error',
                msg: 'Id is required',
            })
        }
        const user = await UserModel.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    email: email,
                    username: username,
                }
            },
            {
                new: false,
            }
        );
        if (user) {
            res.json({
                status: 'success',
                msg: 'Updated name and email'
            });
        }
    } catch (err) {
        console.log(`An error occured : ${err}`)
    }
}

async function removeUser(req, res) {
    try {
        const { id } = req.body;
        if (id == null) {
            res.json({
                status: 'Error',
                msg: 'Please provide the product id',
            })
        }

        const user = await UserModel.findById(id);
        if (!user) {
            res.json({
                status: 'Error',
                msg: 'User not found!'
            });
        }

        const isUserRemoved = await UserModel.deleteOne({ _id: id }); if (isUserRemoved) {
            res.json({
                status: 'success',
                msg: 'User deleted successfully',
            })
        }
    } catch (err) {
        console.log(`An error occured:${err}`);
    }
}

async function changePassword(req, res) {
    try {
        const { id, password } = req.body;
        if (id == null) {
            res.status(404).json({
                status: 'Error',
                msg: 'Id is required',
            })
        }

        const salt = await bcrypt.genSalt(10);
        const pass = await bcrypt.hash(password, salt);
        const user = await UserModel.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    password: pass,
                }
            },
            {
                new: false,
            }
        );
        if (user) {
            res.json({
                status: 'success',
                msg: 'Updated password successfully'
            });
        }
    } catch (err) {
        console.log(`An error occured : ${err}`)
    }
}

module.exports = { register, login, addProduct, removeProduct, displayProducts, displayOneProduct, editProduct, displayUsers, displayOneUser, updateNameAndMail, removeUser, changePassword }