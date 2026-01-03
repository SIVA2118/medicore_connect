import express from "express";
import {
  registerAdmin,
  loginAdmin,
  createReceptionist,
  createDoctor,
  createScanner,
  createBiller,
  createLab,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
  getAllClinicalReports,
  getPatientDetails,
  getAdminProfile,
  updateAdminProfile,
} from "../Controllers/adminController.js";

import { getAllPatients } from "../Controllers/receptionistController.js";

import { protect } from "../Middleware/auth.js";

const router = express.Router();

/* ================= AUTH ================= */
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

/* ================= CREATE ================= */
router.post("/create-receptionist", protect, createReceptionist);
router.post("/create-doctor", protect, createDoctor);
router.post("/create-scanner", protect, createScanner);
router.post("/create-biller", protect, createBiller);
router.post("/create-lab", protect, createLab);

/* ================= READ ================= */
router.get("/all-users", protect, getAllUsers);
router.get("/dashboard-stats", protect, getDashboardStats);
router.get("/clinical-reports", protect, getAllClinicalReports);
router.get("/patient/:patientId", protect, getPatientDetails);
router.get("/patients", protect, getAllPatients);
router.get("/profile", protect, getAdminProfile);
router.put("/profile", protect, updateAdminProfile);
router.get("/:role/:id", protect, getUserById);

/* ================= UPDATE ================= */
router.put("/:role/:id", protect, updateUser);

/* ================= DELETE ================= */
router.delete("/:role/:id", protect, deleteUser);

export default router;
