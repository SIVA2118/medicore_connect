import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Scanner from "../Models/Scanner.js";
import ScanReport from "../Models/ScanReport.js";
import Patient from "../Models/Patient.js";
import Doctor from "../Models/Doctor.js";

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
      doctor: req.user.role === "doctor" ? req.user.id : (req.body.doctor || null),
      assignedTo: req.body.assignedTo || null,

      type: req.body.type,
      scanName: req.body.scanName,
      description: req.body.description,
      indication: req.body.indication,

      findings: req.body.findings,
      impression: req.body.impression,

      labName: req.body.labName,
      technicianName: req.body.technicianName,
      resultStatus: req.body.resultStatus,
      pdfFile: req.body.pdfFile,

      scanDate: req.body.scanDate,
      reportGeneratedDate: req.body.reportGeneratedDate,
      cost: req.body.cost,

      isVerified: req.body.isVerified || false,
      verifiedBy: req.body.verifiedBy || null,

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
      .populate("patient", "name age gender profileImage")
      .populate("doctor", "name specialization profileImage")
      .populate("verifiedBy", "name profileImage")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET SINGLE REPORT ================= */
export const getScanReportById = async (req, res) => {
  try {
    const report = await ScanReport.findById(req.params.id)
      .populate("patient", "name age gender mrn profileImage")
      .populate("doctor", "name specialization profileImage")
      .populate("verifiedBy", "name profileImage");

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

/* ================= DASHBOARD STATS ================= */
/* ================= DASHBOARD STATS ================= */
export const getDashboardStats = async (req, res) => {
  try {
    const scannerId = req.user.id;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Run independent queries in parallel for maximum speed
    const [
      totalScans,
      completedScans,
      myTotalScans,
      statsBreakdown,
      todayScans,
      myPendingScans,
      recentScans
    ] = await Promise.all([
      ScanReport.countDocuments().lean(),
      ScanReport.countDocuments({ isVerified: true }).lean(),
      ScanReport.countDocuments({ createdBy: scannerId }).lean(),
      ScanReport.aggregate([
        { $group: { _id: "$resultStatus", count: { $sum: 1 } } }
      ]), // Aggregate doesn't need lean
      ScanReport.countDocuments({ createdAt: { $gte: startOfToday } }).lean(),
      ScanReport.find({
        assignedTo: scannerId,
        isVerified: false
      }).populate("patient", "name age gender mrn profileImage")
        .populate("doctor", "name profileImage")
        .sort({ createdAt: 1 })
        .lean(),
      ScanReport.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("patient", "name")
        .populate("doctor", "name")
        .lean()
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalScans,
        completedScans,
        todayScans,
        myTotalScans,
        breakdown: statsBreakdown
      },
      myPendingScans,
      recentScans
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



/* ================= GET ALL PATIENTS (For Scanner Selection) ================= */
export const getAllPatientsForScanner = async (req, res) => {
  try {
    const patients = await Patient.find()
      .select("name age gender mrn phone patientType")
      .lean();
    res.status(200).json({ success: true, patients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET ALL DOCTORS (For Scanner Selection) ================= */
export const getAllDoctorsForScanner = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select("name specialization")
      .lean();
    res.status(200).json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET ALL SCANNERS (For Doctor Selection) ================= */
export const getAllScanners = async (req, res) => {
  try {
    const scanners = await Scanner.find()
      .select("name email phone")
      .lean();
    res.status(200).json({ success: true, scanners });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
