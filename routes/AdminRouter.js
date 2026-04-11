const express = require('express');
const router = express.Router();
const upload = require("../middleware/multerMiddleware.js");
const {register, login, addProduct, removeProduct, displayProducts, displayOneProduct, editProduct, displayUsers, displayOneUser, updateNameAndMail, removeUser, changePassword} = require('../controllers/AdminController.js');

router.post("/login", login);
router.post("/register", register);
router.post("/addProduct", upload.single('productImage'), addProduct);
router.post("/removeProduct", removeProduct);
router.get("/displayProducts", displayProducts);
router.post("/displayOneProduct", displayOneProduct);
router.post("/editProduct", upload.single('productImage'), editProduct);
router.get("/getUsers", displayUsers);
router.post("/getOneUser", displayOneUser);
router.post("/updateNameAndMail", updateNameAndMail);
router.post("/deleteUser", removeUser);
router.post("/changePassword", changePassword);

module.exports = router;