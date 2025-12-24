// Controllers/billerController.js
import Bill from "../Models/Bill.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Prescription from "../models/Prescription.js";
import Report from "../models/Report.js";
import ScanReport from "../Models/ScanReport.js";
import mongoose from "mongoose";  
import Biller from "../models/Biller.js";
import { generatePDF } from "../Helpers/pdfGenerator.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";
import FormData from "form-data";

// -------------------------------------------------
// 1️⃣ BILLER LOGIN
// -------------------------------------------------
export const loginBiller = async (req, res) => {
  try {
    const { email, password } = req.body;

    const biller = await Biller.findOne({ email });
    if (!biller) return res.status(404).json({ message: "Biller not found" });

    const isMatch = await bcrypt.compare(password, biller.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: biller._id, role: biller.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      biller: {
        id: biller._id,
        name: biller.name,
        email: biller.email,
        role: biller.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------------------------------------
// 2️⃣ CREATE BILL (NO PDF YET)
// -------------------------------------------------
export const createBill = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      treatment,
      billItems = [],
      prescriptionId,
      reportId,
      scanReportId
    } = req.body;

    if (!patientId || !doctorId || !treatment || billItems.length === 0) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // ✅ AUTO CALCULATE TOTAL
    const amount = billItems.reduce(
      (sum, item) => sum + item.charge * item.qty,
      0
    );

    const bill = await Bill.create({
      patient: patientId,
      doctor: doctorId,
      treatment,
      billItems,
      amount,
      prescription: prescriptionId || null,
      report: reportId || null,
      scanReport: scanReportId || null
    });

    res.status(201).json({
      success: true,
      message: "Bill created successfully",
      bill
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// -------------------------------------------------
// 3️⃣ GENERATE BILL PDF USING BILL ID
// -------------------------------------------------
export const generateBillPDF = async (req, res) => {
  try {
    const { billId } = req.body;

   const bill = await Bill.findById(billId)
  .populate("patient")
  .populate("doctor")
  .populate("prescription")
  .populate("report")
  .populate("scanReport");


    if (!bill) return res.status(404).json({ message: "Bill not found" });

    // ------------------------------
    // FULL PATIENT OBJECT FOR PDF
    // ------------------------------
    const pdfData = {
      billId: bill._id.toString(),
      date: new Date().toLocaleDateString("en-IN"),

      // FULL PATIENT DETAILS
      patient: {
        id: bill.patient._id.toString(),
        name: bill.patient.name,
        age: bill.patient.age,
        gender: bill.patient.gender,
        phone: bill.patient.phone,
        email: bill.patient.email || "-",

        patientType: bill.patient.patientType || "-",
        bloodGroup: bill.patient.bloodGroup || "-",
        mrn: bill.patient.mrn || "-",

        address: {
          line1: bill.patient.address?.line1 || "-",
          line2: bill.patient.address?.line2 || "-",
          city: bill.patient.address?.city || "-",
          state: bill.patient.address?.state || "-",
          pincode: bill.patient.address?.pincode || "-",
        },

        emergencyContact: {
          name: bill.patient.emergencyContact?.name || "-",
          relation: bill.patient.emergencyContact?.relation || "-",
          phone: bill.patient.emergencyContact?.phone || "-",
        },

        allergies: bill.patient.allergies || [],
        existingConditions: bill.patient.existingConditions || [],
        currentMedications: bill.patient.currentMedications || [],

        opdDetails: bill.patient.opdDetails || {},
        ipdDetails: bill.patient.ipdDetails || {},

        assignedDoctorName: bill.doctor?.name || "-"
      },

// ------------------------------
// DOCTOR (FULL DETAILS)
// ------------------------------
doctor: {
  id: bill?.doctor?._id?.toString() || "-",
  name: bill?.doctor?.name || "-",
  specialization: bill?.doctor?.specialization || "-",
  phone: bill?.doctor?.phone || "-",
  email: bill?.doctor?.email || "-",

  gender: bill?.doctor?.gender || "-",
  age: bill?.doctor?.age || "-",
  experience: bill?.doctor?.experience || 0,
  qualification: bill?.doctor?.qualification || "-",
  registrationNumber: bill?.doctor?.registrationNumber || "-",

  clinicAddress: bill?.doctor?.clinicAddress || "-",
  consultationFee: bill?.doctor?.consultationFee || 0,

  // Availability
  availability: {
    days: bill?.doctor?.availability?.days || [],
    from: bill?.doctor?.availability?.from || "-",
    to: bill?.doctor?.availability?.to || "-"
  },

  profileImage: bill?.doctor?.profileImage || "-",
  bio: bill?.doctor?.bio || "-",

  isActive: bill?.doctor?.isActive ?? true,

  rating: {
    average: bill?.doctor?.rating?.average || 0,
    count: bill?.doctor?.rating?.count || 0
  }
},

// ------------------------------
// BILL ITEMS
// ------------------------------
    treatment: bill.treatment,
    amount: bill.amount,
    billItems: bill.billItems || [],

// ------------------------------
// PRESCRIPTION
// ------------------------------
prescription: bill.prescription || null,

// ------------------------------
// FULL DOCTOR REPORT DATA
// ------------------------------
report: bill.report
  ? {
      id: bill.report._id?.toString() || "-",
      reportTitle: bill.report.reportTitle || "-",
      reportDetails: bill.report.reportDetails || "-",
      date: bill.report.date || null,

      // Patient Condition
      symptoms: bill.report.symptoms || [],
      physicalExamination: bill.report.physicalExamination || "-",
      clinicalFindings: bill.report.clinicalFindings || "-",
      diagnosis: bill.report.diagnosis || "-",

      // Vitals
      vitals: {
        temperature: bill.report.vitals?.temperature || "-",
        bloodPressure: bill.report.vitals?.bloodPressure || "-",
        pulseRate: bill.report.vitals?.pulseRate || "-",
        respiratoryRate: bill.report.vitals?.respiratoryRate || "-",
        oxygenLevel: bill.report.vitals?.oxygenLevel || "-",
        weight: bill.report.vitals?.weight || "-"
      },

      // Tests & Advice
      advisedInvestigations: bill.report.advisedInvestigations || [],
      treatmentAdvice: bill.report.treatmentAdvice || "-",
      lifestyleAdvice: bill.report.lifestyleAdvice || "-",

      followUpDate: bill.report.followUpDate || null,
      additionalNotes: bill.report.additionalNotes || "-",

      // Signature
      doctorSignature: bill.report.doctorSignature || null,
    }
  : null,

// ------------------------------
// SCAN REPORT (FULL DATA)
// ------------------------------
scanReport: bill.scanReport
  ? {
      id: bill.scanReport._id?.toString() || "-",

      // Basic details
      type: bill.scanReport.type || "-",
      scanName: bill.scanReport.scanName || "-",
      description: bill.scanReport.description || "-",
      indication: bill.scanReport.indication || "-",

      // Results
      findings: bill.scanReport.findings || "-",
      impression: bill.scanReport.impression || "-",
      resultStatus: bill.scanReport.resultStatus || "Pending",

      // Lab details
      labName: bill.scanReport.labName || "-",
      technicianName: bill.scanReport.technicianName || "-",

      // Dates
      scanDate: bill.scanReport.scanDate || null,
      reportGeneratedDate: bill.scanReport.reportGeneratedDate || null,

      // Files
      pdfFile: bill.scanReport.pdfFile || null,
      images: bill.scanReport.images || [],

      // Verification
      isVerified: bill.scanReport.isVerified || false,
      verifiedBy: bill.scanReport.verifiedBy?._id?.toString() || null
    }
  : null
  };
    // ------------------------------
    // GENERATE PDF
    // ------------------------------
    const fileName = `bill_${bill._id}_${Date.now()}.pdf`;
    const { buffer, path: pdfFullPath } = await generatePDF(pdfData, fileName);

    bill.pdfFile = pdfFullPath;
    await bill.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.send(buffer);

  } catch (error) {
    console.error("❌ PDF Generation Error:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};


// -------------------------------------------------
// 4️⃣ SEND BILL PDF TO WHATSAPP
// -------------------------------------------------
export const sendBillToPatient = async (req, res) => {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: "patientId is required" });
    }

    // Convert to ObjectId safely
    const patientObjectId = new mongoose.Types.ObjectId(patientId);

    // Find latest bill for this patient
    let bill = await Bill.findOne({ patient: patientObjectId })
      .sort({ createdAt: -1 })
      .populate("patient")
      .populate("doctor")
      .populate("prescription")
      .populate("report")
      .populate("scanReport");

    // If no bill found
    if (!bill) {
      return res.status(404).json({ message: "Bill not found for this patient" });
    }

    // Patient must have phone number
    if (!bill.patient?.phone) {
      return res.status(400).json({ message: "Patient phone number missing" });
    }

    // ---------- REGENERATE PDF IF MISSING ----------
    if (!bill.pdfFile || !fs.existsSync(bill.pdfFile)) {
      const pdfData = {
        billId: bill._id.toString(),
        date: new Date().toLocaleDateString("en-IN"),

        patient: {
          id: bill.patient._id.toString(),
          name: bill.patient.name,
          age: bill.patient.age,
          gender: bill.patient.gender,
          phone: bill.patient.phone,
        },

        doctor: {
          name: bill.doctor?.name || "N/A",
          specialization: bill.doctor?.specialization || "N/A",
        },

        treatment: bill.treatment,
        amount: bill.amount,
        billItems: bill.billItems || [],
        prescription: bill.prescription || null,
        report: bill.report || null,
        scanReports: bill.doctorReports || [],
      };

      const fileName = `bill_${bill._id}_${Date.now()}.pdf`;
      const result = await generatePDF(pdfData, fileName);

      bill.pdfFile = result.path;
      await bill.save();
    }

    // -----------------------------
    // WHATSAPP API SEND LOGIC
    // -----------------------------
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneNumberId) {
      return res.status(500).json({ message: "WhatsApp API credentials missing" });
    }

    // Clean phone number to 10 digits
    const phone = `91${bill.patient.phone.replace(/\D/g, "").slice(-10)}`;

    // Upload PDF to WhatsApp servers
    const formData = new FormData();
    formData.append("file", fs.createReadStream(bill.pdfFile));
    formData.append("type", "application/pdf");

    const uploadRes = await axios.post(
      `https://graph.facebook.com/v17.0/${phoneNumberId}/media`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders(),
        },
      }
    );

    const mediaId = uploadRes.data.id;

    // Send PDF Message
    const sendRes = await axios.post(
      `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "document",
        document: {
          id: mediaId,
          caption: "Your Hospital Bill 🏥💊",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Bill sent to WhatsApp successfully ✔",
      response: sendRes.data,
    });

  } catch (error) {
    console.error("❌ WhatsApp PDF Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// -------------------------------------------------
// 5️⃣ GET ALL BILLS
// -------------------------------------------------
export const getBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate("patient", "name age gender phone")
      .populate("doctor", "name specialization")
      .populate("prescription")
      .populate("report")
      .populate("scanReport");

    res.status(200).json({ success: true, bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// -------------------------------------------------
// 7️⃣ UPDATE BILL
// -------------------------------------------------
export const updateBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const updateData = req.body;

    // Recalculate total if billItems updated
    if (updateData.billItems) {
      updateData.amount = updateData.billItems.reduce(
        (sum, item) => sum + item.charge * item.qty,
        0
      );
    }

    const updatedBill = await Bill.findByIdAndUpdate(
      billId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.status(200).json({
      success: true,
      message: "Bill updated successfully",
      bill: updatedBill
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// -------------------------------------------------
// 8️⃣ DELETE BILL
// -------------------------------------------------
export const deleteBill = async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await Bill.findByIdAndDelete(billId);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Delete stored PDF if exists
    if (bill.pdfFile && fs.existsSync(bill.pdfFile)) {
      fs.unlinkSync(bill.pdfFile);
    }

    res.status(200).json({
      success: true,
      message: "Bill deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
