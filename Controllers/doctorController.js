import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Doctor from "../models/Doctor.js";
import Patient from "../Models/Patient.js";
import Report from "../Models/Report.js";
import Prescription from "../Models/Prescription.js";

// -----------------------------
// Login doctor
// -----------------------------
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find doctor by email
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: doctor._id, role: doctor.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        role: doctor.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

// -----------------------------
// Get all patients assigned to doctor
// -----------------------------
export const getDoctorPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const patients = await Patient.find({ assignedDoctor: doctorId });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patients", error });
  }
};

// -----------------------------
// Create a report for a patient
// -----------------------------
export const createReport = async (req, res) => {
  try {
    const { patientId, reportDetails } = req.body;
    const doctorId = req.user.id;

    const report = await Report.create({
      patient: patientId,
      doctor: doctorId,
      reportDetails,
      date: new Date(),
    });

    res.status(201).json({ message: "Report created successfully", report });
  } catch (error) {
    res.status(500).json({ message: "Error creating report", error });
  }
};

// -----------------------------
// Create prescription for a patient
// -----------------------------
export const createPrescription = async (req, res) => {
  try {
    const { patientId, medicines, notes } = req.body;
    const doctorId = req.user.id;

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: doctorId,
      medicines,
      notes,
      date: new Date(),
    });

    res.status(201).json({ message: "Prescription added successfully", prescription });
  } catch (error) {
    res.status(500).json({ message: "Error creating prescription", error });
  }
};

// -----------------------------
// Reassign patient to another doctor
// -----------------------------
export const reassignPatient = async (req, res) => {
  try {
    const { patientId, newDoctorId } = req.body;
    const patient = await Patient.findById(patientId);

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    patient.assignedDoctor = newDoctorId;
    await patient.save();

    res.json({ message: "Patient reassigned successfully", patient });
  } catch (error) {
    res.status(500).json({ message: "Error reassigning patient", error });
  }
};
