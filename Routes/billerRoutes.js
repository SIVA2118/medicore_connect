import express from "express";
import { protect } from "../Middleware/auth.js";
import { authorizeRoles } from "../Middleware/role.js";
import {
  loginBiller,
  createBill,
  generateBillPDF,
  getBills,      // ← THIS
  sendBillToPatient,
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

router.post(
  "/send-whatsapp",
  protect,
  authorizeRoles("biller"),
  sendBillToPatient
);

export default router;
