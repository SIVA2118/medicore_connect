import Admin from "../models/Admin.js";
import Receptionist from "../models/Receptionist.js";
import Doctor from "../models/Doctor.js";
import Scanner from "../models/ScanReport.js";
import Biller from "../models/Biller.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// -------------------- ADMIN REGISTER --------------------
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: "Admin already exists" });

    // ❌ Don’t hash manually — model handles it
    const admin = new Admin({
      name,
      email,
      password,
      role: role || "admin",
    });

    await admin.save();
    res.status(201).json({ message: "Super Admin created successfully", admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- ADMIN LOGIN --------------------
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email, password);

    const admin = await Admin.findOne({ email });
    console.log("Found admin:", admin);

    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

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

// -------------------- CREATE RECEPTIONIST --------------------
export const createReceptionist = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Receptionist.findOne({ email });
    if (existing) return res.status(400).json({ message: "Receptionist already exists" });

    const receptionist = new Receptionist({ name, email, password });
    await receptionist.save();

    res.status(201).json({ message: "Receptionist created successfully", receptionist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- CREATE DOCTOR --------------------
export const createDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;
    const existing = await Doctor.findOne({ email });
    if (existing) return res.status(400).json({ message: "Doctor already exists" });

    const doctor = new Doctor({ name, email, password, specialization });
    await doctor.save();

    res.status(201).json({ message: "Doctor created successfully", doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- CREATE SCANNER TECHNICIAN --------------------
export const createScanner = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;
    const existing = await Scanner.findOne({ email });
    if (existing) return res.status(400).json({ message: "Scanner already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const scanner = new Scanner({ name, email, password: hashedPassword, department });
    await scanner.save();

    res.status(201).json({ message: "Scanner created successfully", scanner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- CREATE BILLER (ADMIN ONLY) --------------------
export const createBiller = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if biller exists
    const existing = await Biller.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Biller already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const biller = new Biller({
      name,
      email,
      password: hashedPassword,
      role: "biller"
    });

    await biller.save();

    res.status(201).json({
      message: "Biller created successfully",
      biller
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// -------------------- GET ALL USERS --------------------
export const getAllUsers = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    const doctors = await Doctor.find().select("-password");
    const receptionists = await Receptionist.find().select("-password");
    const scanners = await Scanner.find().select("-password");
    const billers = await Biller.find().select("-password");

    res.status(200).json({ admins, doctors, receptionists, scanners, billers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
