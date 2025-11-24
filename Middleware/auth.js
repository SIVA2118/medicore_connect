import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";
import Receptionist from "../models/Receptionist.js";
import Doctor from "../models/Doctor.js";
import Scanner from "../models/Scanner.js";
import Biller from "../models/Biller.js";   // ✅ ADD THIS

dotenv.config();

// -------------------- VERIFY TOKEN --------------------
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided, access denied" });
    }

    const token = authHeader.split(" ")[1];

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID for ALL roles
    const user =
      (await Admin.findById(decoded.id)) ||
      (await Doctor.findById(decoded.id)) ||
      (await Receptionist.findById(decoded.id)) ||
      (await Scanner.findById(decoded.id)) ||
      (await Biller.findById(decoded.id));  // ✅ NOW BILLER CAN LOGIN & ACCESS ROUTES

    if (!user) {
      return res.status(401).json({ message: "User not found or unauthorized" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// -------------------- ADMIN ONLY --------------------
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Admin access only" });
  }
};
