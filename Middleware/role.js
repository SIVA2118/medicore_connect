// middleware/role.js
export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  } catch (err) {
    console.error("authorizeRoles error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
