require("dotenv").config(); // ✅ Load environment variables first

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const app = express();
app.use(cors());
app.use(express.json());

const errorHandler = require("./middleware/errorHandler");

// Swagger setup with error catch
let swaggerDocument;
try {
  swaggerDocument = YAML.load(path.join(__dirname, "swagger", "swagger.yaml"));
} catch (err) {
  console.error("⚠️ Failed to load Swagger YAML:", err.message);
  swaggerDocument = {}; // Prevent crash, still start app
}

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Test route
app.get("/test", (req, res) => res.send("Hello world"));

// App routes
app.use("/users", require("./routes/userRoutes"));
app.use("/products", require("./routes/productRoutes"));
app.use("/cart", require("./routes/cartRoutes"));
app.use("/orders", require("./routes/orderRoutes"));

// Fallback 404 handler (must come before errorHandler)
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
