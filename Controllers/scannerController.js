import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Scanner from "../models/Scanner.js";
import ScanReport from "../Models/ScanReport.js";

/* ================= LOGIN SCANNER ================= */
export const loginScanner = async (req, res) => {
  try {
    const { email, password } = req.body;

    const scanner = await Scanner.findOne({ email }).select("+password");
    if (!scanner)
      return res.status(404).json({ message: "Scanner not found" });

    const match = await bcrypt.compare(password, scanner.password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: scanner._id, role: scanner.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      scanner: {
        id: scanner._id,
        name: scanner.name,
        email: scanner.email,
        department: scanner.department,
        role: scanner.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= CREATE SCAN REPORT ================= */
export const createScanReport = async (req, res) => {
  try {
    const report = await ScanReport.create({
      patient: req.body.patient || null,
      doctor: req.user.role === "doctor" ? req.user.id : null,

      type: req.body.type,
      scanName: req.body.scanName,
      description: req.body.description,
      indication: req.body.indication,

      findings: req.body.findings,
      impression: req.body.impression,

      labName: req.body.labName,
      technicianName: req.body.technicianName,

      scanDate: req.body.scanDate,
      cost: req.body.cost,
      paymentStatus: req.body.paymentStatus,

      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Scan report created successfully",
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ================= GET ALL REPORTS ================= */
export const getScanReports = async (req, res) => {
  try {
    const reports = await ScanReport.find()
      .populate("patient", "name age gender")
      .populate("doctor", "name specialization")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET SINGLE REPORT ================= */
export const getScanReportById = async (req, res) => {
  try {
    const report = await ScanReport.findById(req.params.id)
      .populate("patient")
      .populate("doctor");

    if (!report)
      return res.status(404).json({ message: "Scan report not found" });

    res.status(200).json({ success: true, report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE REPORT ================= */
export const updateScanReport = async (req, res) => {
  try {
    const report = await ScanReport.findById(req.params.id);
    if (!report)
      return res.status(404).json({ message: "Scan report not found" });

    Object.assign(report, req.body);
    await report.save();

    res.status(200).json({
      success: true,
      message: "Scan report updated",
      report
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= VERIFY REPORT (DOCTOR) ================= */
export const verifyScanReport = async (req, res) => {
  try {
    const report = await ScanReport.findById(req.params.id);
    if (!report)
      return res.status(404).json({ message: "Scan report not found" });

    report.isVerified = true;
    report.verifiedBy = req.user.id;
    report.resultStatus = req.body.resultStatus || report.resultStatus;
    report.reportGeneratedDate = new Date();

    await report.save();

    res.status(200).json({
      success: true,
      message: "Scan report verified",
      report
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE REPORT ================= */
export const deleteScanReport = async (req, res) => {
  try {
    const report = await ScanReport.findByIdAndDelete(req.params.id);
    if (!report)
      return res.status(404).json({ message: "Scan report not found" });

    res.status(200).json({
      success: true,
      message: "Scan report deleted"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
