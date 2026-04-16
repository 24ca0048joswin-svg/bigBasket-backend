const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerMiddleware.js");

const { register, login } = require("../controllers/UserController.js");

router.post("/login", login);
router.post("/register", register);

module.exports = router;