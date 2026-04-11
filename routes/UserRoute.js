const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerMiddleware.js");

const { register, login, displayProductsOnCategory, displayProducts } = require("../controllers/UserController.js");

router.post("/login", login);
router.post("/register", register);
router.post("/displayProductsOnCategory", displayProductsOnCategory );
router.post("/displayProducts", displayProducts );

module.exports = router;