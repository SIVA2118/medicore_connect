import express from "express";
import {
  registerAdmin,
  loginAdmin,
  createReceptionist,
  createDoctor,
  createScanner,
  createBiller,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../Controllers/adminController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

/* ================= AUTH ================= */
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

/* ================= CREATE ================= */
router.post("/create-receptionist", protect, createReceptionist);
router.post("/create-doctor", protect, createDoctor);
router.post("/create-scanner", protect, createScanner);
router.post("/create-biller", protect, createBiller);

/* ================= READ ================= */
router.get("/all-users", protect, getAllUsers);
router.get("/:role/:id", protect, getUserById);

/* ================= UPDATE ================= */
router.put("/:role/:id", protect, updateUser);

/* ================= DELETE ================= */
router.delete("/:role/:id", protect, deleteUser);

export default router;
