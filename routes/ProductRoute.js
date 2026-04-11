const express = require("express");
const router = express.Router();

const { prodUsingIds } = require("../controllers/ProductController.js");

router.post("/prodUsingIds", prodUsingIds);

module.exports = router;