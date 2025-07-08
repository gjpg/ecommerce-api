// authorizeAdmin.js
const authorizeAdmin = (req, res, next) => {
  // req.user is populated by authenticate middleware
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Admin access required" });
  }
};

module.exports = authorizeAdmin;
