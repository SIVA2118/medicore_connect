import Admin from "../models/Admin.js";
import Receptionist from "../models/Receptionist.js";
import Doctor from "../models/Doctor.js";
import Scanner from "../models/Scanner.js";
import Biller from "../models/Biller.js";

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
   GET ALL USERS
===================================================== */
export const getAllUsers = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    const doctors = await Doctor.find().select("-password");
    const receptionists = await Receptionist.find().select("-password");
    const scanners = await Scanner.find().select("-password");
    const billers = await Biller.find().select("-password");

    res.status(200).json({
      admins,
      doctors,
      receptionists,
      scanners,
      billers,
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
    const updateData = req.body;

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
