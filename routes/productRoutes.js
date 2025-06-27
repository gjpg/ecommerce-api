const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");

const productController = require("../controllers/productController");
const authenticate = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");
const handleValidationErrors = require("../middleware/handleValidationErrors"); // <== import shared

// Validation middlewares
const validateProductId = [
  param("id").isInt().withMessage("Product ID must be an integer"),
];

const validateProductBody = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("description").trim().optional(),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),
];

// Public routes
router.get("/", productController.getAll);
router.get(
  "/:id",
  validateProductId,
  handleValidationErrors,
  productController.getById
);

// Admin only routes
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  validateProductBody,
  handleValidationErrors,
  productController.create
);
router.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  validateProductId,
  validateProductBody,
  handleValidationErrors,
  productController.update
);
router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  validateProductId,
  handleValidationErrors,
  productController.delete
);

module.exports = router;
