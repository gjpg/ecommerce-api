const pool = require("../db");

exports.getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT * FROM orders WHERE user_id = $1", [
      userId,
    ]);
    res.json(result.rows);
  } catch (err) {
    next(err); // Forward error to centralized handler
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = parseInt(req.params.id, 10);

    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Fetch order items
    const orderItemsResult = await pool.query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [orderId]
    );

    const order = orderResult.rows[0];
    order.items = orderItemsResult.rows;

    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.placeOrder = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;

    await client.query("BEGIN");

    // Fetch cart items for user
    const cartResult = await client.query(
      "SELECT * FROM cart_items WHERE user_id = $1",
      [userId]
    );
    const cart = cartResult.rows;

    if (cart.length === 0) {
      await client.query("ROLLBACK");
      const error = new Error("Cart is empty");
      error.status = 400;
      throw error;
    }

    // Validate quantities and collect product IDs
    const productIds = [];
    for (const item of cart) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        await client.query("ROLLBACK");
        const error = new Error("Invalid quantity in cart");
        error.status = 400;
        throw error;
      }
      productIds.push(item.product_id);
    }

    // Fetch product data (price, stock) for all products in cart
    const productsResult = await client.query(
      "SELECT id, price, stock FROM products WHERE id = ANY($1)",
      [productIds]
    );
    const productsMap = new Map();
    for (const product of productsResult.rows) {
      productsMap.set(product.id, product);
    }

    // Check if all cart products exist and have enough stock
    for (const item of cart) {
      const product = productsMap.get(item.product_id);
      if (!product) {
        await client.query("ROLLBACK");
        const error = new Error(`Product ID ${item.product_id} does not exist`);
        error.status = 400;
        throw error;
      }
      if (product.stock < item.quantity) {
        await client.query("ROLLBACK");
        const error = new Error(
          `Insufficient stock for product ID ${item.product_id}. Available: ${product.stock}, requested: ${item.quantity}`
        );
        error.status = 400;
        throw error;
      }
    }

    // Calculate total price for response only
    let totalPrice = 0;
    for (const item of cart) {
      const product = productsMap.get(item.product_id);
      totalPrice += product.price * item.quantity;
    }

    // Insert order WITHOUT total_price column
    const orderResult = await client.query(
      "INSERT INTO orders (user_id) VALUES ($1) RETURNING *",
      [userId]
    );
    const order = orderResult.rows[0];

    // Insert order items & update stock
    for (const item of cart) {
      const product = productsMap.get(item.product_id);

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, product.price]
      );

      // Update stock
      await client.query(
        "UPDATE products SET stock = stock - $1 WHERE id = $2",
        [item.quantity, item.product_id]
      );
    }

    // Clear user's cart
    await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Order placed successfully",
      orderId: order.id,
      totalPrice, // send total price as info but not stored in DB
    });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};
