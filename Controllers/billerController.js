import Bill from "../models/Bill.js";
import Patient from "../models/Patient.js";
import { sendWhatsAppPDF } from "../Helpers/whatsapp.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs"; // ✅ ES module
import FormData from "form-data";
import Biller from "../models/Biller.js";
import { generatePDF } from "../Helpers/pdfGenerator.js"; // Generates full PDF buffer

// -------------------------------------------
// 1️⃣ BILLER LOGIN
// -------------------------------------------
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

// -------------------------------------------
// 2️⃣ CREATE BILL (NO PDF)
// -------------------------------------------
export const createBill = async (req, res) => {
  try {
    const { patientId, doctorName, treatment, amount } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const newBill = new Bill({
      patient: patientId,
      doctorName,
      treatment,
      amount,
      pdfFile: null,
    });

    await newBill.save();

    res.status(201).json({
      success: true,
      message: "Bill saved successfully (PDF not generated)",
      bill: newBill,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------------------------------
// GENERATE PDF FOR BILL AND SEND FILE
// -------------------------------------------
export const generateBillPDF = async (req, res) => {
  try {
    const { patientId, doctorId, treatment, amount } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const pdfData = {
      patientName: patient.name,
      doctorName: doctor.name,
      treatment,
      amount,
    };

    const pdfFileName = `bill_${Date.now()}.pdf`;
    const { buffer, path: pdfFullPath } = await generatePDF(pdfData, pdfFileName);

    const bill = new Bill({
      patient: patientId,
      doctorReports: [],
      totalAmount: amount,
      pdfFile: pdfFullPath,
      paid: false,
    });

    await bill.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${pdfFileName}"`);
    res.send(buffer);

  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};



export const sendBillToPatient = async (req, res) => {
  try {
    const { patientId } = req.body;

    const bill = await Bill.findOne({ patient: patientId })
      .sort({ createdAt: -1 })
      .populate('patient');

    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (!bill.patient.phone) return res.status(400).json({ message: "Patient phone number missing" });
    if (!bill.pdfFile) return res.status(400).json({ message: "PDF not generated yet" });

    const token = process.env.WHATSAPP_TOKEN; // WhatsApp Cloud API token
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID; // WhatsApp phone number ID

    // 1️⃣ Upload the PDF
    const formData = new FormData();
    formData.append("file", fs.createReadStream(bill.pdfFile));
    formData.append("type", "application/pdf");

    const uploadRes = await axios.post(
      `https://graph.facebook.com/v17.0/${phoneNumberId}/media`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}`, ...formData.getHeaders() }
      }
    );

    const mediaId = uploadRes.data.id;

    // 2️⃣ Send the PDF as a WhatsApp document
    const sendRes = await axios.post(
      `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: bill.patient.phone.replace(/^\+?91/, '91'),
        type: "document",
        document: {
          id: mediaId,
          caption: "Your hospital bill is ready",
        },
      },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );

    res.status(200).json({
      success: true,
      message: "PDF sent directly to WhatsApp",
      response: sendRes.data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// -------------------------------------------
// GET ALL BILLS
// -------------------------------------------
export const getBills = async (req, res) => {
  try {
    const bills = await Bill.find().populate("patient", "name age gender");
    res.status(200).json({ success: true, bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
