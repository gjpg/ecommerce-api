const pool = require("../db");
const { validationResult } = require("express-validator");

// Get cart with product details
exports.getCart = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Add or update cart item with validation and flexible quantity handling
exports.addToCart = async (req, res, next) => {
  // Validate inputs from express-validator middleware
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.id;
  const { productId, quantity, action = "add" } = req.body;

  try {
    // Check product existence
    const productCheck = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [productId]
    );
    if (productCheck.rows.length === 0) {
      return res.status(400).json({ error: "Product does not exist" });
    }

    if (action === "add") {
      // Add to existing quantity or insert new
      const result = await pool.query(
        `INSERT INTO cart_items (user_id, product_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, product_id)
         DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
         RETURNING *`,
        [userId, productId, quantity]
      );
      res.status(201).json(result.rows[0]);
    } else if (action === "set") {
      // Set quantity explicitly (update if exists, insert if not)
      const existing = await pool.query(
        "SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2",
        [userId, productId]
      );

      let result;
      if (existing.rows.length === 0) {
        result = await pool.query(
          "INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
          [userId, productId, quantity]
        );
      } else {
        result = await pool.query(
          "UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *",
          [quantity, userId, productId]
        );
      }

      res.status(200).json(result.rows[0]);
    }
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  const itemId = req.params.itemId;
  const userId = req.user.id;

  try {
    const checkOwnership = await pool.query(
      "SELECT * FROM cart_items WHERE id = $1 AND user_id = $2",
      [itemId, userId]
    );

    if (checkOwnership.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this item" });
    }

    await pool.query("DELETE FROM cart_items WHERE id = $1", [itemId]);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
