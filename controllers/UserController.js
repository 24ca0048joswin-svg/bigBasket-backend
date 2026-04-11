const UserModel = require("../models/UserModel.js");
const ProductModel = require("../models/ProductModel.js");
const { setUser } = require("../middleware/auth.js");

async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        if (username == '' || email == '' || password == '') {
            res.json({ msg: "Post email, username and password" });
        }

        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            res.json({
                "status": "error",
                "msg": "User already exists"
            })
        }

        const user = await UserModel.create({ username, email, password });
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
        const user = await UserModel.findOne({ email });
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

async function displayProductsOnCategory(req, res) {
    try {
        const { category } = req.body;
        const products = await ProductModel.find({'category':category});
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

module.exports = { register, login, displayProductsOnCategory, displayProducts};
