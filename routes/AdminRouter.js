const express = require('express');
const router = express.Router();
const upload = require("../middleware/multerMiddleware.js");
const {register, login,displayUsers, displayOneUser, updateNameAndMail, removeUser, changePassword} = require('../controllers/AdminController.js');

router.post("/login", login);
router.post("/register", register);
router.get("/getUsers", displayUsers);
router.post("/getOneUser", displayOneUser);
router.post("/updateNameAndMail", updateNameAndMail);
router.post("/deleteUser", removeUser);
router.post("/changePassword", changePassword);

module.exports = router;