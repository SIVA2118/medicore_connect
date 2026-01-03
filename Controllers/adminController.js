import Admin from "../Models/Admin.js";
import Receptionist from "../Models/Receptionist.js";
import Doctor from "../Models/Doctor.js";
import Scanner from "../Models/Scanner.js";
import Biller from "../Models/Biller.js";
import Patient from "../Models/Patient.js";
import Bill from "../Models/Bill.js";
import ScanReport from "../Models/ScanReport.js";
import Report from "../Models/Report.js";
import Prescription from "../Models/Prescription.js";
import Lab from "../Models/Lab.js";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

/* =====================================================
   HELPER: GET MODEL BY ROLE
===================================================== */
const getModelByRole = (role) => {
  switch (role) {
    case "admin":
      return Admin;
    case "doctor":
      return Doctor;
    case "receptionist":
      return Receptionist;
    case "scanner":
      return Scanner;
    case "biller":
      return Biller;
    case "lab":
      return Lab;
    default:
      return null;
  }
};

/* =====================================================
   ADMIN REGISTER
===================================================== */
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Admin already exists" });

    const admin = new Admin({
      name,
      email,
      password, // model will hash
      role: role || "admin",
    });

    await admin.save();

    res.status(201).json({
      message: "Admin registered successfully",
      admin,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   ADMIN LOGIN
===================================================== */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ admin, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   CREATE RECEPTIONIST
===================================================== */
export const createReceptionist = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Receptionist.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Receptionist already exists" });

    const receptionist = new Receptionist({
      name,
      email,
      password,
      role: "receptionist",
      phone: req.body.phone || "",
      address: req.body.address || "",
      degree: req.body.degree || "",
      employeeId: req.body.employeeId || "",
      bloodGroup: req.body.bloodGroup || "",
      emergencyContactName: req.body.emergencyContactName || "",
      emergencyContactPhone: req.body.emergencyContactPhone || "",
    });

    await receptionist.save();

    res.status(201).json({
      message: "Receptionist created successfully",
      receptionist,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   CREATE DOCTOR
===================================================== */
export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      specialization,
      phone,
      gender,
      age,
      experience,
      qualification,
      registrationNumber,
      clinicAddress,
      consultationFee,
      availability,
      bio,
      rating,
    } = req.body;

    const existing = await Doctor.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Doctor already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = new Doctor({
      name,
      email,
      password: hashedPassword,
      specialization,
      phone,
      gender,
      age,
      experience,
      qualification,
      registrationNumber,
      clinicAddress,
      consultationFee,
      availability: {
        days: availability?.days || [],
        from: availability?.from || "",
        to: availability?.to || "",
      },
      bio,
      rating: {
        average: rating?.average || 0,
        count: rating?.count || 0,
      },
      role: "doctor",
      employeeId: req.body.employeeId || "",
      bloodGroup: req.body.bloodGroup || "",
      emergencyContactName: req.body.emergencyContactName || "",
      emergencyContactPhone: req.body.emergencyContactPhone || "",
    });

    await doctor.save();

    res.status(201).json({
      message: "Doctor created successfully",
      doctor,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   CREATE SCANNER
===================================================== */
export const createScanner = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    const existing = await Scanner.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Scanner already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const scanner = new Scanner({
      name,
      email,
      password: hashedPassword,
      department,
      role: "scanner",
      employeeId: req.body.employeeId || "",
      bloodGroup: req.body.bloodGroup || "",
      emergencyContactName: req.body.emergencyContactName || "",
      emergencyContactPhone: req.body.emergencyContactPhone || "",
    });

    await scanner.save();

    res.status(201).json({
      message: "Scanner created successfully",
      scanner,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   CREATE BILLER
===================================================== */
export const createBiller = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Biller.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Biller already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const biller = new Biller({
      name,
      email,
      password: hashedPassword,
      role: "biller",
      employeeId: req.body.employeeId || "",
      bloodGroup: req.body.bloodGroup || "",
      emergencyContactName: req.body.emergencyContactName || "",
      emergencyContactPhone: req.body.emergencyContactPhone || "",
    });

    await biller.save();

    res.status(201).json({
      message: "Biller created successfully",
      biller,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   CREATE LAB
===================================================== */
export const createLab = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    const existing = await Lab.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Lab user already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const lab = new Lab({
      name,
      email,
      password: hashedPassword,
      department,
      role: "lab",
      employeeId: req.body.employeeId || "",
      bloodGroup: req.body.bloodGroup || "",
      emergencyContactName: req.body.emergencyContactName || "",
      emergencyContactPhone: req.body.emergencyContactPhone || "",
    });

    await lab.save();

    res.status(201).json({
      message: "Lab user created successfully",
      lab,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   GET ALL USERS
===================================================== */
export const getAllUsers = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    const doctors = await Doctor.find().select("-password");
    const receptionists = await Receptionist.find().select("-password");
    const scanners = await Scanner.find().select("-password");
    const billers = await Biller.find().select("-password");
    const labs = await Lab.find().select("-password");

    res.status(200).json({
      admins,
      doctors,
      receptionists,
      scanners,
      billers,
      labs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   GET USER BY ROLE + ID
===================================================== */
export const getUserById = async (req, res) => {
  try {
    const { role, id } = req.params;

    const Model = getModelByRole(role);
    if (!Model)
      return res.status(400).json({ message: "Invalid role" });

    const user = await Model.findById(id).select("-password");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   UPDATE USER
===================================================== */
export const updateUser = async (req, res) => {
  try {
    const { role, id } = req.params;
    const updateData = { ...req.body };

    // Remove immutable fields
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const Model = getModelByRole(role);
    if (!Model)
      return res.status(400).json({ message: "Invalid role" });

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await Model.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   DELETE USER
===================================================== */
export const deleteUser = async (req, res) => {
  try {
    const { role, id } = req.params;

    const Model = getModelByRole(role);
    if (!Model)
      return res.status(400).json({ message: "Invalid role" });

    const deletedUser = await Model.findByIdAndDelete(id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   GET ADMIN DASHBOARD STATS
===================================================== */
export const getDashboardStats = async (req, res) => {
  try {
    // Run everything in parallel for max performance
    const [
      adminCount,
      doctorCount,
      receptionistCount,
      scannerCount,
      billerCount,
      labCount,
      totalPatients,
      totalBills,
      totalScanReports,
      totalDoctorReports,
      totalPrescriptions,
      revenueStats
    ] = await Promise.all([
      Admin.countDocuments(),
      Doctor.countDocuments(),
      Receptionist.countDocuments(),
      Scanner.countDocuments(),
      Biller.countDocuments(),
      Lab.countDocuments(),
      Patient.countDocuments(),
      Bill.countDocuments(),
      ScanReport.countDocuments(),
      Report.countDocuments(),
      Prescription.countDocuments(),
      // Calculate revenue from paid bills
      Bill.aggregate([
        { $match: { paid: true } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    // Calculate unpaid/pending amount
    const pendingStats = await Bill.aggregate([
      { $match: { paid: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Get recent activity (newest 5 patients)
    const recentPatients = await Patient.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name mrn patientType createdAt")
      .lean();

    res.status(200).json({
      success: true,
      stats: {
        staff: {
          admins: adminCount,
          doctors: doctorCount,
          receptionists: receptionistCount,
          scanners: scannerCount,
          billers: billerCount,
          labs: labCount,
        },
        clinical: {
          patients: totalPatients,
          scanReports: totalScanReports,
          doctorReports: totalDoctorReports,
          prescriptions: totalPrescriptions,
        },
        financial: {
          totalBills,
          totalRevenue: revenueStats[0]?.total || 0,
          pendingRevenue: pendingStats[0]?.total || 0
        }
      },
      recentPatients
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   GET ALL CLINICAL REPORTS (Admin View)
===================================================== */
export const getAllClinicalReports = async (req, res) => {
  try {
    const [scanReports, doctorReports] = await Promise.all([
      ScanReport.find()
        .populate("patient", "name mrn phone")
        .populate("doctor", "name specialization")
        .populate("assignedTo", "name")
        .sort({ createdAt: -1 })
        .lean(),
      Report.find()
        .populate("patient", "name mrn phone")
        .populate("doctor", "name specialization")
        .sort({ date: -1 })
        .lean()
    ]);

    // Format them for a unified list if needed, or send separately
    // I'll format them into a "Unified Clinical Timeline"
    const unifiedReports = [
      ...scanReports.map(sr => ({
        ...sr,
        reportType: "Scan",
        title: sr.scanName || "Scan Report",
        date: sr.createdAt
      })),
      ...doctorReports.map(dr => ({
        ...dr,
        reportType: "Clinical",
        title: dr.reportTitle || "Clinical Report",
        date: dr.date
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      reports: unifiedReports
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   GET SINGLE PATIENT DETAILS (Admin View)
===================================================== */
export const getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;

    const [patient, reports, prescriptions, scanReports] = await Promise.all([
      Patient.findById(patientId)
        .populate("assignedDoctor", "name specialization")
        .lean(),
      Report.find({ patient: patientId })
        .populate("doctor", "name")
        .sort({ date: -1 })
        .lean(),
      Prescription.find({ patient: patientId })
        .populate("doctor", "name")
        .sort({ createdAt: -1 })
        .lean(),
      ScanReport.find({ patient: patientId })
        .populate("doctor", "name")
        .populate("assignedTo", "name")
        .sort({ createdAt: -1 })
        .lean()
    ]);

    if (!patient)
      return res.status(404).json({ success: false, message: "Patient not found" });

    res.json({ success: true, ...patient, reports, prescriptions, scanReports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching patient details", error: error.message });
  }
};

/* =====================================================
   ADMIN PROFILE
===================================================== */
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(req.user.id, req.body, { new: true }).select("-password");
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
