import express from "express";
import { protect } from "../Middleware/auth.js";
import { authorizeRoles } from "../Middleware/role.js";

import {
  loginDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  updateDoctorAvailability,
  updateDoctorPassword,
  getDoctorPatients,
  createReport,
  createPrescription,
  reassignPatient,
  getAllDoctors,

  // CRUD (NEW)
  getPatientById,
  getReportById,
  updateReport,
  deleteReport,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  getDashboardStats,
  getScanReportById
} from "../Controllers/doctorController.js";

const router = express.Router();

/* ================= AUTH ================= */
router.post("/login", loginDoctor);

/* ================= PROFILE ================= */
router.get("/profile", protect, authorizeRoles("doctor"), getDoctorProfile);
router.put("/profile", protect, authorizeRoles("doctor"), updateDoctorProfile);
router.put("/availability", protect, authorizeRoles("doctor"), updateDoctorAvailability);
router.put("/password", protect, authorizeRoles("doctor"), updateDoctorPassword);
router.get("/dashboard-stats", protect, authorizeRoles("doctor"), getDashboardStats);

/* ================= PATIENT ================= */
router.get("/patients", protect, authorizeRoles("doctor"), getDoctorPatients);
router.get("/patient/:patientId", protect, authorizeRoles("doctor", "admin"), getPatientById);
router.get("/doctors", protect, authorizeRoles("doctor", "admin"), getAllDoctors);
router.post("/reassign", protect, authorizeRoles("doctor", "admin"), reassignPatient);

/* ================= REPORT CRUD ================= */
router.post("/report", protect, authorizeRoles("doctor"), createReport);
router.get("/report/:reportId", protect, authorizeRoles("doctor", "admin"), getReportById);
router.put("/report/:reportId", protect, authorizeRoles("doctor"), updateReport);
router.delete("/report/:reportId", protect, authorizeRoles("doctor"), deleteReport);
router.get("/scan-report/:reportId", protect, authorizeRoles("doctor", "admin"), getScanReportById);

/* ================= PRESCRIPTION CRUD ================= */
router.post("/prescription", protect, authorizeRoles("doctor"), createPrescription);
router.get("/prescription/:prescriptionId", protect, authorizeRoles("doctor", "admin"), getPrescriptionById);
router.put("/prescription/:prescriptionId", protect, authorizeRoles("doctor"), updatePrescription);
router.delete("/prescription/:prescriptionId", protect, authorizeRoles("doctor"), deletePrescription);

export default router;
