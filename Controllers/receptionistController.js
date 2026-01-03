import Receptionist from "../Models/Receptionist.js";
import Patient from "../Models/Patient.js";
import Doctor from "../Models/Doctor.js";
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
// 1.5️⃣ GET & UPDATE PROFILE
// --------------------------------------------------
export const getProfile = async (req, res) => {
  try {
    const receptionist = await Receptionist.findById(req.user.id);
    if (!receptionist) return res.status(404).json({ message: "Receptionist not found" });
    res.status(200).json(receptionist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.email;
    delete updateData.role;
    delete updateData.password;
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const receptionist = await Receptionist.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!receptionist) return res.status(404).json({ message: "Receptionist not found" });
    res.status(200).json(receptionist);
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
      profileImage,
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
      profileImage,

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
      mrn: "MRN-" + Math.floor(100000 + Math.random() * 900000)
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

// --------------------------------------------------
// 7️⃣ GET ALL DOCTORS (For Assignment)
// --------------------------------------------------
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select("name email specialization phone availability profileImage");
    res.status(200).json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------------------
// 8️⃣ GET DASHBOARD STATS
// --------------------------------------------------
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Patients
    const totalPatients = await Patient.countDocuments();

    // 2. Today's Patients
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayPatients = await Patient.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // 3. Available Doctors
    const availableDoctors = await Doctor.countDocuments();

    // 4. Recent Patients (Last 5)
    const recentPatients = await Patient.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name age gender patientType createdAt");

    res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        todayPatients,
        availableDoctors
      },
      recentPatients
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
