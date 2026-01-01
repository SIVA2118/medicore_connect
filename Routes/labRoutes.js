import express from "express";
import { protect } from "../Middleware/auth.js";
import { authorizeRoles } from "../Middleware/role.js";

import {
    loginLab,
    getLabProfile,
    updateLabProfile,
    updateLabPassword,
    createLabReport,
    getLabReports,
    getLabReportById,
    updateLabReport,
    deleteLabReport,
    verifyLabReport,
    getDashboardStats,
    getAllPatientsForLab,
    getAllDoctorsForLab,
    getAllLabs
} from "../Controllers/labController.js";

const router = express.Router();

/* ================= AUTH ================= */
router.post("/login", loginLab);

/* ================= PROFILE ================= */
router.get("/profile", protect, authorizeRoles("lab"), getLabProfile);
router.put("/profile", protect, authorizeRoles("lab"), updateLabProfile);
router.put("/password", protect, authorizeRoles("lab"), updateLabPassword);

/* ================= REPORT CRUD ================= */
router.post("/report", protect, authorizeRoles("lab", "doctor"), createLabReport);
router.get("/reports", protect, authorizeRoles("lab", "doctor", "admin"), getLabReports);
router.get("/report/:id", protect, authorizeRoles("lab", "doctor", "admin"), getLabReportById);
router.put("/report/:id", protect, authorizeRoles("lab"), updateLabReport);
router.put("/report/verify/:id", protect, authorizeRoles("doctor"), verifyLabReport);
router.delete("/report/:id", protect, authorizeRoles("lab", "admin"), deleteLabReport);

/* ================= HELPERS & STATS ================= */
router.get("/dashboard-stats", protect, authorizeRoles("lab"), getDashboardStats);
router.get("/all-patients", protect, authorizeRoles("lab"), getAllPatientsForLab);
router.get("/all-doctors", protect, authorizeRoles("lab"), getAllDoctorsForLab);
router.get("/all-labs", protect, authorizeRoles("doctor", "admin"), getAllLabs);

export default router;
