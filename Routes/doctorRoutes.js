import express from "express";
import {
  loginDoctor,
  getDoctorPatients,
  createReport,
  createPrescription,
  reassignPatient,
} from "../controllers/doctorController.js";

import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";

const router = express.Router();

// ---------------- Doctor Auth ----------------
router.post("/login", loginDoctor); // login only

// ---------------- Doctor Operations ----------------
router.get("/patients", protect, authorizeRoles("doctor"), getDoctorPatients);
router.post("/report", protect, authorizeRoles("doctor"), createReport);
router.post("/prescription", protect, authorizeRoles("doctor"), createPrescription);
router.post("/reassign-patient", protect, authorizeRoles("doctor"), reassignPatient);

export default router;
