import Receptionist from "../models/Receptionist.js";
import Patient from "../Models/Patient.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// ---------------- Receptionist Login ----------------
export const loginReceptionist = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Receptionist.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = user.password === password; // Replace with bcrypt.compare if hashed
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ receptionist: user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Create Patient ----------------
export const createPatient = async (req, res) => {
  try {
    const { name, age, gender, phone, assignedDoctor } = req.body;
    const photo = req.file ? req.file.path : null;

    const patient = new Patient({ name, age, gender, phone, assignedDoctor, photo });
    await patient.save();

    res.status(201).json({ patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Get All Patients ----------------
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate("assignedDoctor", "name email");
    res.status(200).json({ patients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
