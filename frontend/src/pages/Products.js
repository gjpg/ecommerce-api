import React, { useEffect, useState, useContext } from "react";
import { fetchProducts, addToCart } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Products = () => {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(""); // <-- New state for feedback
  const [loading, setLoading] = useState(false); // optional loading state

  useEffect(() => {
    fetchProducts()
      .then((res) => setProducts(res.data))
      .catch(() => setError("Failed to fetch products"));
  }, []);

  const handleAddToCart = async (productId) => {
    if (!token) {
      setError("Please login to add items to cart");
      return;
    }
    try {
      setLoading(true);
      await addToCart(token, productId, 1);
      setStatus("Added to cart!");
      setError("");
    } catch {
      setError("Failed to add to cart");
      setStatus("");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 3000); // Clear message after 3 seconds
    }
  };

  return (
    <div>
      <h2>Products</h2>

      {/* Show error or status messages */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {status && <p style={{ color: "green" }}>{status}</p>}

      {products.map(({ id, name, description, price }) => (
        <div
          key={id}
          style={{ border: "1px solid black", margin: "10px", padding: "10px" }}
        >
          <h3>{name}</h3>
          <p>{description}</p>
          <p>
            $
            {price !== undefined && price !== null
              ? Number(price).toFixed(2)
              : "N/A"}
          </p>
          <button onClick={() => handleAddToCart(id)} disabled={loading}>
            {loading ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Products;
