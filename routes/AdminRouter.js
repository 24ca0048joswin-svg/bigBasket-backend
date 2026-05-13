const express = require('express');
const router = express.Router();
const upload = require("../middleware/multerMiddleware.js");
const {displayUsers, displayOneUser, updateNameAndMail, removeUser, changePassword, getAnalyticsData} = require('../controllers/AdminController.js');

router.get("/getUsers", displayUsers);
router.post("/getOneUser", displayOneUser);
router.post("/updateNameAndMail", updateNameAndMail);
router.post("/deleteUser", removeUser);
router.post("/changePassword", changePassword);
router.get("/getAnalyticsData", getAnalyticsData);

module.exports = router;