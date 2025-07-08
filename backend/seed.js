require("dotenv").config();
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const url = require("url");

// Parse DATABASE_URL to extract password
const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth ? params.auth.split(":") : [];
const dbPassword = auth[1] || "password123"; // fallback password

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  try {
    console.log("Seeding database...");

    await pool.query("DELETE FROM order_items");
    await pool.query("DELETE FROM orders");
    await pool.query("DELETE FROM cart_items");
    await pool.query("DELETE FROM users");
    await pool.query("DELETE FROM products");

    // Hash password from DATABASE_URL
    const hashedPassword = await bcrypt.hash(dbPassword, 10);

    const users = await Promise.all([
      pool.query(
        `INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *`,
        ["admin", hashedPassword, "admin"]
      ),
      pool.query(
        `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *`,
        ["user1", hashedPassword]
      ),
      pool.query(
        `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *`,
        ["user2", hashedPassword]
      ),
    ]);

    const admin = users[0].rows[0];
    const user1 = users[1].rows[0];
    const user2 = users[2].rows[0];

    const productResults = await Promise.all([
      pool.query(
        `INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *`,
        ["Widget", "A useful widget", 9.99]
      ),
      pool.query(
        `INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *`,
        ["Gadget", "A fancy gadget", 19.99]
      ),
      pool.query(
        `INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *`,
        ["Doodad", "A nifty doodad", 4.99]
      ),
    ]);

    const products = productResults.map((r) => r.rows[0]);

    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, 2), ($1, $3, 1), ($4, $2, 3)`,
      [user1.id, products[0].id, products[1].id, user2.id]
    );

    const orderResult = await pool.query(
      `INSERT INTO orders (user_id) VALUES ($1) RETURNING *`,
      [user2.id]
    );
    const order = orderResult.rows[0];

    await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES
       ($1, $2, 1, $3), ($1, $4, 2, $5)`,
      [
        order.id,
        products[0].id,
        products[0].price,
        products[2].id,
        products[2].price,
      ]
    );

    console.log("✅ Seeding complete!");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await pool.end();
  }
}

seed();
