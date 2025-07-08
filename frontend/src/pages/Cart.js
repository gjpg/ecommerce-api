import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { fetchCart } from "../services/api";

const Cart = () => {
  const { token } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && token) {
      fetchCart(token)
        .then((res) => {
          // Log response for debugging
          console.log("Cart API response:", res.data);

          // Adjust based on possible response shape
          if (Array.isArray(res.data)) {
            setCartItems(res.data);
          } else if (res.data.cartItems && Array.isArray(res.data.cartItems)) {
            setCartItems(res.data.cartItems);
          } else {
            setCartItems([]); // fallback empty
          }
        })
        .catch(() => setError("Failed to load cart items"));
    }
  }, [isOpen, token]);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        Cart ({cartItems.length})
      </button>

      {isOpen && (
        <div>
          <h2>Your Cart</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {cartItems.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <div>
              {cartItems.map(({ id, name, quantity, price }) => (
                <div key={id}>
                  <p>{name}</p>
                  <p>Quantity: {quantity}</p>
                  <p>
                    Price per unit:{" "}
                    {price !== undefined &&
                    price !== null &&
                    !isNaN(Number(price))
                      ? `$${Number(price).toFixed(2)}`
                      : "N/A"}
                  </p>
                  <p>
                    Subtotal:{" "}
                    {price !== undefined &&
                    price !== null &&
                    !isNaN(Number(price))
                      ? `$${(quantity * Number(price)).toFixed(2)}`
                      : "N/A"}
                  </p>
                </div>
              ))}
              <h3>Total: ${totalPrice.toFixed(2)}</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;
