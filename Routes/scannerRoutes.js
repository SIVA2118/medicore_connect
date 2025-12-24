import express from "express";
import { protect } from "../Middleware/auth.js";
import { authorizeRoles } from "../Middleware/role.js";

import {
  loginScanner,
  createScanReport,
  getScanReports,
  getScanReportById,
  updateScanReport,
  deleteScanReport,
  verifyScanReport
} from "../Controllers/scannerController.js";

const router = express.Router();

/* ================= AUTH ================= */
router.post("/login", loginScanner);

/* ================= SCAN REPORT CRUD ================= */

// CREATE scan report (Scanner)
router.post(
  "/scan-report",
  protect,
  authorizeRoles("scanner"),
  createScanReport
);

// READ all scan reports
router.get(
  "/scan-reports",
  protect,
  authorizeRoles("scanner", "doctor", "admin"),
  getScanReports
);

// READ single scan report
router.get(
  "/scan-report/:id",
  protect,
  authorizeRoles("scanner", "doctor", "admin"),
  getScanReportById
);

// UPDATE scan report (Scanner)
router.put(
  "/scan-report/:id",
  protect,
  authorizeRoles("scanner"),
  updateScanReport
);

// VERIFY scan report (Doctor only)
router.put(
  "/scan-report/verify/:id",
  protect,
  authorizeRoles("doctor"),
  verifyScanReport
);

// DELETE scan report (Scanner / Admin)
router.delete(
  "/scan-report/:id",
  protect,
  authorizeRoles("scanner", "admin"),
  deleteScanReport
);

export default router;
