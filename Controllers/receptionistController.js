import Receptionist from "../models/Receptionist.js";
import Patient from "../Models/Patient.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


// --------------------------------------------------
// 1️⃣ RECEPTIONIST LOGIN
// --------------------------------------------------
export const loginReceptionist = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Receptionist.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // ❗ Replace with bcrypt.compare() if passwords will be hashed
    const isMatch = user.password === password;
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      receptionist: user,
      token,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// --------------------------------------------------
// 2️⃣ CREATE PATIENT — FULL DETAILS (NO AVATAR)
// --------------------------------------------------
export const createPatient = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      dob,
      phone,
      email,
      address,
      bloodGroup,
      allergies,
      existingConditions,
      currentMedications,
      emergencyContact,
      patientType,
      ipdDetails,
      opdDetails,
      assignedDoctor
    } = req.body;

    const patient = new Patient({
      name,
      age,
      gender,
      dob,
      phone,
      email,

      // Address object
      address: {
        line1: address?.line1,
        line2: address?.line2,
        city: address?.city,
        state: address?.state,
        pincode: address?.pincode
      },

      bloodGroup,
      allergies,
      existingConditions,
      currentMedications,

      // Emergency Contact
      emergencyContact: {
        name: emergencyContact?.name,
        relation: emergencyContact?.relation,
        phone: emergencyContact?.phone
      },

      patientType,          // OPD / IPD
      ipdDetails,           // Only for IPD
      opdDetails,           // Only for OPD

      assignedDoctor,
      mrn: "MRN" + Date.now()
    });

    await patient.save();

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      patient,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// 4️⃣ GET SINGLE PATIENT BY ID
// --------------------------------------------------
export const getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId)
      .populate("assignedDoctor", "name email specialization");

    if (!patient)
      return res.status(404).json({ message: "Patient not found" });

    res.status(200).json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// --------------------------------------------------
// 3️⃣ GET ALL PATIENTS (FULL POPULATED DETAILS)
// --------------------------------------------------
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate("assignedDoctor", "name email specialization");

    res.status(200).json({ success: true, patients });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// 5️⃣ UPDATE PATIENT
// --------------------------------------------------
export const updatePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const updateData = req.body;

    const patient = await Patient.findByIdAndUpdate(
      patientId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!patient)
      return res.status(404).json({ message: "Patient not found" });

    res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      patient
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// 6️⃣ DELETE PATIENT
// --------------------------------------------------
export const deletePatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findByIdAndDelete(patientId);

    if (!patient)
      return res.status(404).json({ message: "Patient not found" });

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
