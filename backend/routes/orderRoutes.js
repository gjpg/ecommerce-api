const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authenticate = require("../middleware/authMiddleware");

router.get("/", authenticate, orderController.getOrders);
router.post("/", authenticate, orderController.placeOrder);
router.get("/:id", authenticate, orderController.getOrderById);

module.exports = router;
