const express = require("express");
const router = express.Router();

const { makeOrder, checkoutSession, getAllOrders, getOneOrder, changeOrderStatus, changePaymentStatus } = require("../controllers/OrderController.js");

router.post("/makeOrder", makeOrder);
router.post("/checkout", checkoutSession);
router.post("/getAllOrders", getAllOrders);
router.post("/getOneOrder", getOneOrder);
router.put("/updateOrderStatus", changeOrderStatus);
router.put("/updatePaymentStatus", changePaymentStatus);

module.exports = router;