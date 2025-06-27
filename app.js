require("dotenv").config(); // ✅ Load environment variables first

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const app = express();
app.use(express.json());

// Swagger
const swaggerDocument = YAML.load(
  path.join(__dirname, "swagger", "swagger.yaml")
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.get("/test", (req, res) => res.send("Hello world"));

app.use("/users", require("./routes/userRoutes"));
app.use("/products", require("./routes/productRoutes"));
app.use("/cart", require("./routes/cartRoutes"));
app.use("/orders", require("./routes/orderRoutes"));

module.exports = app;
