import axios from "axios";

const API_BASE = "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE,
});

// Helper for Authorization header
const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Authentication
export const login = (username, password) =>
  api.post("/users/login", { username, password });

// Products
export const fetchProducts = () => api.get("/products");

// Cart
export const fetchCart = (token) => api.get("/cart", authHeader(token));

export const addToCart = (token, productId, quantity) =>
  api.post("/cart", { productId, quantity }, authHeader(token));

// Orders
export const placeOrder = (token) =>
  api.post("/orders", null, authHeader(token));

export const fetchOrders = (token) => api.get("/orders", authHeader(token));

export const fetchOrderById = (token, id) =>
  api.get(`/orders/${id}`, authHeader(token));
