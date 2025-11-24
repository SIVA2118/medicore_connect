import express from "express";
import {
  createScanner,
  loginScanner,
  createScanReport,
  getScanReports,
} from "../Controllers/scannerController.js";

import { protect } from "../Middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";

const router = express.Router();

// Only admin can create scanner user
router.post("/create", protect, authorizeRoles("admin"), createScanner);

// scanner login
router.post("/login", loginScanner);

// create a scan report (scanner or doctor can create)
router.post("/report", protect, authorizeRoles("scanner", "doctor"), createScanReport);

// scanner can view reports
router.get("/reports", protect, authorizeRoles("scanner", "admin", "biller"), getScanReports);

export default router;
