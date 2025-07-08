import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Cart from "./pages/Cart"; // import your Cart component
import { AuthContext } from "./context/AuthContext";

function App() {
  const { token, logout } = useContext(AuthContext);

  return (
    <Router>
      <nav
        style={{
          display: "flex",
          gap: "15px",
          padding: "10px",
          borderBottom: "1px solid #ccc",
        }}
      >
        <Link to="/">Products</Link>
        {token && <Link to="/cart">Cart</Link>}
        {token ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>

      <Routes>
        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to="/" />}
        />
        <Route path="/" element={<Products />} />
        <Route
          path="/cart"
          element={token ? <Cart /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
