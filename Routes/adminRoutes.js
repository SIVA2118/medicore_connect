import express from "express";
import {
  registerAdmin,
  loginAdmin,
  createReceptionist,
  createDoctor,
  createScanner,
  createBiller,
  getAllUsers,
} from "../Controllers/adminController.js";

import { protect } from "../middleware/auth.js";
const router = express.Router();

// Admin Auth
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Create Users (Protected Routes)
router.post("/create-receptionist", protect, createReceptionist);
router.post("/create-doctor", protect, createDoctor);
router.post("/create-scanner", protect, createScanner);
router.post("/create-biller", protect, createBiller);

// View All
router.get("/all-users", protect, getAllUsers);

export default router;
