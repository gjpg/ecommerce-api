const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authenticate = require("../middleware/authMiddleware");

router.get("/", authenticate, orderController.getOrders);
router.post("/", authenticate, orderController.placeOrder);

module.exports = router;
