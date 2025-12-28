import express from "express";
import { protect } from "../Middleware/auth.js";
import { authorizeRoles } from "../Middleware/role.js";
import {
  loginBiller,
  createBill,
  generateBillPDF,
  getBills,
  sendBillToPatient,
  updateBill,
  deleteBill,
  getBillerPatients,
  getBillerDoctors,
  getLatestPrescription,
  getUnbilledScanReports,
  viewBillPDF
} from "../Controllers/billerController.js";


const router = express.Router();

router.post("/login", loginBiller);

router.post(
  "/create-bill",
  protect,
  authorizeRoles("biller"),
  createBill
);

router.post(
  "/generate-pdf",
  protect,
  authorizeRoles("biller"),
  generateBillPDF
);

router.get(
  "/all-bills",
  protect,
  authorizeRoles("biller"),
  getBills
);

// -------------------------------------------------
// UPDATE BILL
// -------------------------------------------------
router.put(
  "/bill/:billId",
  protect,
  authorizeRoles("biller"),
  updateBill
);

// -------------------------------------------------
// DELETE BILL
// -------------------------------------------------
router.delete(
  "/bill/:billId",
  protect,
  authorizeRoles("biller"),
  deleteBill
);

router.post(
  "/send-whatsapp",
  protect,
  authorizeRoles("biller"),
  sendBillToPatient
);

// Helper Routes for Dropdowns
router.get(
  "/patients",
  protect,
  authorizeRoles("biller"),
  getBillerPatients
);

router.get(
  "/doctors",
  protect,
  authorizeRoles("biller"),
  getBillerDoctors
);

router.get(
  "/prescription/:patientId",
  protect,
  authorizeRoles("biller"),
  getLatestPrescription
);

router.get(
  "/unbilled-scan-reports/:patientId",
  protect,
  authorizeRoles("biller"),
  getUnbilledScanReports
);

// -------------------------------------------------
// PUBLIC PDF VIEW LINK (No Authentication)
// -------------------------------------------------
router.get(
  "/view-pdf/:billId",
  viewBillPDF
);

export default router;
