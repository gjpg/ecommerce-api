const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const cartController = require("../controllers/cartController");
const authenticate = require("../middleware/authMiddleware");
const handleValidationErrors = require("../middleware/handleValidationErrors"); // import here

const validateAddToCart = [
  body("productId")
    .isInt({ gt: 0 })
    .withMessage("productId must be a positive integer"),
  body("quantity")
    .isInt({ gt: 0 })
    .withMessage("quantity must be a positive integer"),
  body("action")
    .optional()
    .isIn(["add", "set"])
    .withMessage("action must be either 'add' or 'set'"),
];

const validateItemIdParam = [
  param("itemId")
    .isInt({ gt: 0 })
    .withMessage("itemId must be a positive integer"),
];

router.post(
  "/",
  authenticate,
  validateAddToCart,
  handleValidationErrors,
  cartController.addToCart
);
router.get("/", authenticate, cartController.getCart);
router.delete(
  "/:itemId",
  authenticate,
  validateItemIdParam,
  handleValidationErrors,
  cartController.removeFromCart
);

module.exports = router;
