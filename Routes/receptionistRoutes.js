import express from "express";
import { protect } from "../Middleware/auth.js";
import { authorizeRoles } from "../Middleware/role.js";

import {
  loginReceptionist,
  createPatient,
  getAllPatients,

  // CRUD (NEW)
  getPatientById,
  updatePatient,
  deletePatient,
  getAllDoctors,
  getDashboardStats,
} from "../Controllers/receptionistController.js";

const router = express.Router();

/* ================= AUTH ================= */
router.post("/login", loginReceptionist);

/* ================= PATIENT CRUD ================= */

// CREATE
router.post(
  "/create-patient",
  protect,
  authorizeRoles("receptionist"),
  createPatient
);

// READ ALL
router.get(
  "/all-patients",
  protect,
  authorizeRoles("receptionist"),
  getAllPatients
);

// READ ONE
router.get(
  "/patient/:patientId",
  protect,
  authorizeRoles("receptionist"),
  getPatientById
);

// UPDATE
router.put(
  "/patient/:patientId",
  protect,
  authorizeRoles("receptionist"),
  updatePatient
);

// DELETE
router.delete(
  "/patient/:patientId",
  protect,
  authorizeRoles("receptionist"),
  deletePatient
);

// DOCTORS LIST
router.get(
  "/all-doctors",
  protect,
  authorizeRoles("receptionist"),
  getAllDoctors
);

// DASHBOARD STATS
router.get(
  "/dashboard-stats",
  protect,
  authorizeRoles("receptionist"),
  getDashboardStats
);

export default router;
