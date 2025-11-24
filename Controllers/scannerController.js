import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Scanner from "../models/Scanner.js";
import ScanReport from "../Models/ScanReport.js";
import Patient from "../Models/Patient.js";
import { generatePDF } from "../utils/generatePDF.js";

// -------------------- CREATE SCANNER (ADMIN ONLY) --------------------
export const createScanner = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    const existing = await Scanner.findOne({ email });
    if (existing) return res.status(400).json({ message: "Scanner already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const scanner = new Scanner({
      name,
      email,
      password: hashedPassword,
      department,
      role: "scanner"
    });

    await scanner.save();

    res.status(201).json({ message: "Scanner created successfully", scanner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- LOGIN SCANNER --------------------
export const loginScanner = async (req, res) => {
  try {
    const { email, password } = req.body;

    const scanner = await Scanner.findOne({ email });
    if (!scanner) return res.status(404).json({ message: "Scanner not found" });

    const isMatch = await bcrypt.compare(password, scanner.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: scanner._id, role: scanner.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      scanner: {
        id: scanner._id,
        name: scanner.name,
        email: scanner.email,
        department: scanner.department,
        role: scanner.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- CREATE SCAN REPORT --------------------
export const createScanReport = async (req, res) => {
  try {
    const { patientId, type, description } = req.body;

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient)
      return res.status(404).json({ message: "Patient not found" });

    // Create scan report without PDF
    const scanReport = new ScanReport({
      patient: patientId,
      doctor: req.user.role === "doctor" ? req.user.id : null,
      type,
      description,
      pdfFile: null, // no pdf, so set null or remove this field
    });

    await scanReport.save();

    // Add report to patient
    if (patient.reports) {
      patient.reports.push(scanReport._id);
      await patient.save();
    }

    res.status(201).json({
      message: "Scan report saved successfully (without PDF)",
      scanReport,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating scan report",
      error: err.message,
    });
  }
};

// -------------------- GET ALL SCAN REPORTS --------------------
export const getScanReports = async (req, res) => {
  try {
    const reports = await ScanReport.find()
      .populate("patient", "name age gender")
      .populate("doctor", "name email specialization");

    res.status(200).json({ message: "Scan reports fetched successfully", reports });
  } catch (err) {
    res.status(500).json({ message: "Error fetching scan reports", error: err.message });
  }
};
