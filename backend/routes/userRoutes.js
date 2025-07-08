const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const handleValidationErrors = require("../middleware/handleValidationErrors"); // import shared middleware

const validateRegister = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const validateLogin = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post(
  "/",
  validateRegister,
  handleValidationErrors,
  userController.register
);
router.post(
  "/login",
  validateLogin,
  handleValidationErrors,
  userController.login
);

module.exports = router;
