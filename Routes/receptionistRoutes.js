import express from "express";
import { loginReceptionist, createPatient, getAllPatients } from "../controllers/receptionistController.js";
import { loginDoctor } from "../controllers/doctorController.js"; // Only login if needed

import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import { upload } from "../middleware/upload.js"; // Multer for patient photos

const router = express.Router();

// ---------------- Receptionist Auth ----------------
router.post("/login", loginReceptionist);

// ---------------- Create Patient with Photo ----------------
router.post(
  "/create-patient",
  protect,
  authorizeRoles("admin", "receptionist"),
  upload.single("photo"),
  createPatient
);

// ---------------- Get All Patients ----------------
router.get("/patients", protect, authorizeRoles("admin", "receptionist"), getAllPatients);

export default router;
