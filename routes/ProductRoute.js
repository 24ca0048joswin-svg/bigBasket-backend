const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerMiddleware.js");

const { prodUsingIds, displayProductsOnCategory, displayProducts, addProduct, removeProduct, displayOneProduct, editProduct } = require("../controllers/ProductController.js");

router.post("/prodUsingIds", prodUsingIds);
router.post("/displayProductsOnCategory", displayProductsOnCategory );
router.get("/displayProducts", displayProducts );

router.post("/addProduct", upload.single('productImage'), addProduct);
router.post("/removeProduct", removeProduct);
router.post("/displayOneProduct", displayOneProduct);
router.post("/editProduct", upload.single('productImage'), editProduct);

module.exports = router;