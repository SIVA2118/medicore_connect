import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Doctor from "../Models/Doctor.js";
import Patient from "../Models/Patient.js";
import Report from "../Models/Report.js";
import Bill from "../Models/Bill.js";
import Prescription from "../Models/Prescription.js";
import ScanReport from "../Models/ScanReport.js";

// -------------------------------------------------------
// Doctor Login
// -------------------------------------------------------
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Create JWT
    const token = jwt.sign(
      { id: doctor._id, role: doctor.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Doctor login successful",
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        experience: doctor.experience,
        rating: doctor.rating,
        role: doctor.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

// -------------------------------------------------------
// Get Doctor Profile
// -------------------------------------------------------
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

// -------------------------------------------------------
// Update Doctor Profile (name, phone, specialization, etc.)
// -------------------------------------------------------
export const updateDoctorProfile = async (req, res) => {
  try {
    const updateData = req.body;

    // Block changing protected fields
    delete updateData.email;
    delete updateData.role;
    delete updateData.password;

    const doctor = await Doctor.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    );

    res.json({ message: "Profile updated", doctor });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};

// -------------------------------------------------------
// Update Doctor Availability
// -------------------------------------------------------
export const updateDoctorAvailability = async (req, res) => {
  try {
    const { days, from, to } = req.body;

    if (!days || !from || !to)
      return res.status(400).json({ message: "Complete availability required" });

    const doctor = await Doctor.findByIdAndUpdate(
      req.user.id,
      { availability: { days, from, to } },
      { new: true }
    );

    res.json({ message: "Availability updated", doctor });
  } catch (error) {
    res.status(500).json({ message: "Error updating availability", error });
  }
};

// -------------------------------------------------------
// Update Doctor Password
// -------------------------------------------------------
export const updateDoctorPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const isMatch = await bcrypt.compare(oldPassword, doctor.password);
    if (!isMatch)
      return res.status(400).json({ message: "Old password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    doctor.password = hashed;
    await doctor.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password", error });
  }
};

// -------------------------------------------------------
// Get Patients Assigned to Doctor
// -------------------------------------------------------
export const getDoctorPatients = async (req, res) => {
  try {
    const patients = await Patient.find({
      assignedDoctor: req.user.id,
    })
      .populate("assignedDoctor", "name specialization")
      .populate("lastReport")
      .populate("reports")
      .lean();

    return res.status(200).json(patients);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching patients",
      error: error.message,
    });
  }
};
// -------------------------------------------------------
// Get Single Patient (Doctor Scope)
// -------------------------------------------------------
// -------------------------------------------------------
// Get Single Patient (Doctor Scope) - With History
// -------------------------------------------------------
export const getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log("Fetching patient with Scan History:", patientId); // Debug Log & Force Restart

    // Fetch Patient and Full History Independently in Parallel
    const [patient, reports, prescriptions, scanReports] = await Promise.all([
      Patient.findById(patientId)
        .populate("lastReport")
        .populate("assignedDoctor", "name specialization")
        .select("-reports")
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
      return res.status(404).json({ message: "Patient not found" });

    res.json({ ...patient, reports, prescriptions, scanReports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching patient", error });
  }
};


// -------------------------------------------------------
// Create Patient Report
// -------------------------------------------------------
export const createReport = async (req, res) => {
  try {
    const {
      patientId,
      reportTitle,
      reportDetails,
      symptoms,
      physicalExamination,
      clinicalFindings,
      diagnosis,
      vitals,
      advisedInvestigations,
      treatmentAdvice,
      lifestyleAdvice,
      followUpDate,
      additionalNotes,
      doctorSignature
    } = req.body;

    // -------------------------------
    // VALIDATION
    // -------------------------------
    if (!patientId || !reportDetails) {
      return res.status(400).json({ message: "patientId & reportDetails required" });
    }

    // -------------------------------
    // CREATE NEW DOCUMENT
    // -------------------------------
    const report = await Report.create({
      patient: patientId,
      doctor: req.user.id,

      reportTitle: reportTitle || "Doctor Examination Report",
      reportDetails,

      // Medical fields
      symptoms: symptoms || [],
      physicalExamination: physicalExamination || "",
      clinicalFindings: clinicalFindings || "",
      diagnosis: diagnosis || "",

      vitals: {
        temperature: vitals?.temperature || "",
        bloodPressure: vitals?.bloodPressure || "",
        pulseRate: vitals?.pulseRate || "",
        respiratoryRate: vitals?.respiratoryRate || "",
        oxygenLevel: vitals?.oxygenLevel || "",
        weight: vitals?.weight || ""
      },

      advisedInvestigations: advisedInvestigations || [],
      treatmentAdvice: treatmentAdvice || "",
      lifestyleAdvice: lifestyleAdvice || "",
      followUpDate: followUpDate || null,
      additionalNotes: additionalNotes || "",
      doctorSignature: doctorSignature || "",

      date: new Date(),
    });

    // -------------------------------
    // SAVE LAST REPORT IN PATIENT
    // -------------------------------
    await Patient.findByIdAndUpdate(patientId, {
      lastReport: report._id,
    });

    return res.status(201).json({
      success: true,
      message: "Doctor report created successfully",
      report,
    });

  } catch (error) {
    console.error("❌ Report Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating doctor report",
      error: error.message,
    });
  }
};

// -------------------------------------------------------
// Get Report By ID
// -------------------------------------------------------
export const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId)
      .populate("patient", "name age gender")
      .populate("doctor", "name specialization");

    if (!report)
      return res.status(404).json({ message: "Report not found" });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Error fetching report", error });
  }
};

// -------------------------------------------------------
// Update Report
// -------------------------------------------------------
export const updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findOneAndUpdate(
      { _id: reportId, doctor: req.user.id },
      req.body,
      { new: true }
    );

    if (!report)
      return res.status(404).json({ message: "Report not found or access denied" });

    res.json({ message: "Report updated successfully", report });
  } catch (error) {
    res.status(500).json({ message: "Error updating report", error });
  }
};

// -------------------------------------------------------
// Delete Report
// -------------------------------------------------------
export const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findOneAndDelete({
      _id: reportId,
      doctor: req.user.id
    });

    if (!report)
      return res.status(404).json({ message: "Report not found or access denied" });

    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting report", error });
  }
};


// -------------------------------------------------------
// Get Scan Report By ID (For Doctor View)
// -------------------------------------------------------
export const getScanReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await ScanReport.findById(reportId)
      .populate("patient", "name age gender mrn profileImage")
      .populate("doctor", "name specialization profileImage")
      .populate("verifiedBy", "name profileImage")
      .populate("assignedTo", "name department email")
      .lean();

    if (!report)
      return res.status(404).json({ success: false, message: "Scan Report not found" });

    res.json({ success: true, report });
  } catch (error) {
    console.error("Error fetching scan report:", error);
    res.status(500).json({ success: false, message: "Error fetching scan report", error });
  }
};


// -------------------------------------------------------
// Create Prescription (Auto linked with Bill)
// -------------------------------------------------------
export const createPrescription = async (req, res) => {
  try {
    const { patientId, medicines, notes, symptoms, diagnosis, department, followUpDate } = req.body;

    if (!patientId)
      return res.status(400).json({ message: "Patient ID is required" });

    if (!medicines || medicines.length === 0)
      return res.status(400).json({ message: "At least one medicine is required" });

    medicines.forEach((m, i) => {
      if (!m.name || !m.dosage || !m.frequency || !m.duration)
        throw new Error(`Medicine ${i + 1} missing required fields`);
      m.partOfDay = m.partOfDay || "";
      m.mealInstruction = m.mealInstruction || "";
    });

    let bill = await Bill.findOne({ patient: patientId, paid: false });

    if (!bill) {
      bill = await Bill.create({
        patient: patientId,
        doctor: req.user.id,
        treatment: "General Consultation",
        amount: 0,
        prescription: null,
        report: null,
        billItems: [], // Initialize empty items
        paid: false,
      });
    }

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: req.user.id,
      medicines,
      notes,
      symptoms,
      diagnosis,
      department,
      followUpDate,
      bill: bill._id,
    });

    bill.prescription = prescription._id;
    await bill.save();

    res.status(201).json({
      success: true,
      message: "Prescription created & linked to bill",
      billId: bill._id,
      prescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error creating prescription: ${error.message}`,
      error: error.message,
    });
  }
};

// -------------------------------------------------------
// Get Prescription By ID
// -------------------------------------------------------
export const getPrescriptionById = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findById(prescriptionId)
      .populate("patient", "name age")
      .populate("doctor", "name specialization");

    if (!prescription)
      return res.status(404).json({ message: "Prescription not found" });

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: "Error fetching prescription", error });
  }
};

// -------------------------------------------------------
// Update Prescription
// -------------------------------------------------------
export const updatePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findOneAndUpdate(
      { _id: prescriptionId, doctor: req.user.id },
      req.body,
      { new: true }
    );

    if (!prescription)
      return res.status(404).json({ message: "Prescription not found or access denied" });

    res.json({ message: "Prescription updated", prescription });
  } catch (error) {
    res.status(500).json({ message: "Error updating prescription", error });
  }
};

// -------------------------------------------------------
// Delete Prescription
// -------------------------------------------------------
export const deletePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findOneAndDelete({
      _id: prescriptionId,
      doctor: req.user.id
    });

    if (!prescription)
      return res.status(404).json({ message: "Prescription not found or access denied" });

    res.json({ message: "Prescription deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting prescription", error });
  }
};


// -------------------------------------------------------
// Reassign Patient
// -------------------------------------------------------
export const reassignPatient = async (req, res) => {
  try {
    const { patientId, newDoctorId } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    patient.assignedDoctor = newDoctorId;
    await patient.save();

    res.json({ message: "Patient successfully reassigned", patient });
  } catch (error) {
    res.status(500).json({ message: "Error reassigning patient", error });
  }
};

// -------------------------------------------------------
// Get All Doctors (For Reassignment)
// -------------------------------------------------------
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ _id: { $ne: req.user.id } }) // Exclude self
      .select("name specialization availability");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error });
  }
};

// -------------------------------------------------------
// Get Dashboard Stats
// -------------------------------------------------------
export const getDashboardStats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Run independent queries in parallel
    const [
      totalPatients,
      totalReports,
      totalPrescriptions,
      todayVisits
    ] = await Promise.all([
      Patient.countDocuments({ assignedDoctor: doctorId }).lean(),
      Report.countDocuments({ doctor: doctorId }).lean(),
      Prescription.countDocuments({ doctor: doctorId }).lean(),
      Patient.find({
        assignedDoctor: doctorId,
        "opdDetails.lastVisitDate": { $gte: startOfDay, $lte: endOfDay }
      }).select("name opdDetails.lastVisitDate").lean()
    ]);

    res.json({
      totalPatients,
      totalReports,
      totalPrescriptions,
      todayVisits
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Error fetching dashboard stats", error });
  }
};
