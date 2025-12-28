import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generatePDF = (data, fileName) => {
  return new Promise((resolve, reject) => {
    try {
      const pdfDir = path.join(process.cwd(), "pdfs");
      if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

      const pdfPath = path.join(pdfDir, fileName);
      const stream = fs.createWriteStream(pdfPath);

      const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true }); // Buffered pages for numbering
      doc.pipe(stream);

      // ---------------------------------------------------------
      // 🎨 DESIGN CONSTANTS
      // ---------------------------------------------------------
      const COLORS = {
        primary: "#008080", // Teal
        secondary: "#2c3e50", // Dark Blue-Grey
        accent: "#e74c3c", // Red
        text: "#333333",
        lightBg: "#f4f6f7",
        border: "#bdc3c7",
      };

      // ---------------------------------------------------------
      // 🧩 REUSABLE COMPONENTS
      // ---------------------------------------------------------

      const drawHeader = () => {
        // Hospital Branding
        doc.font("Helvetica-Bold").fontSize(22).fillColor(COLORS.primary)
          .text("NS multispeciality hospital", 50, 40, { align: "center" });

        doc.font("Helvetica").fontSize(10).fillColor(COLORS.secondary)
          .text("123, Main Road, Coimbatore - 641001", 50, 65, { align: "center" })
          .text("Phone: +91 99421 29724 | Email: help@nshospital.com", 50, 80, { align: "center" });

        doc.moveTo(50, 100).lineTo(545, 100).strokeColor(COLORS.primary).lineWidth(2).stroke();
      };

      const drawFooter = (pageNo) => {
        const bottomY = 750;
        doc.moveTo(50, bottomY).lineTo(545, bottomY).strokeColor(COLORS.border).lineWidth(1).stroke();

        doc.fontSize(9).fillColor("#777")
          .text(`Page ${pageNo} | NS Multispeciality System`, 50, bottomY + 10, { align: "center" });
      };

      const drawSectionTitle = (title, y) => {
        doc.rect(50, y, 495, 25).fill(COLORS.lightBg);
        doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.primary)
          .text(title, 60, y + 7);
        return y + 35; // Return next Y position
      };

      // ---------------------------------------------------------
      // 📄 PAGE 1: INVOICE
      // ---------------------------------------------------------

      drawHeader();

      // -- Patient & Bill Info Grid --
      let y = 120;
      doc.font("Helvetica-Bold").fontSize(16).fillColor(COLORS.secondary).text("Medical Invoice", 50, y, { align: "right" });
      y += 30;

      const leftX = 50, rightX = 350;

      // Patient Box
      doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.primary).text("Billed To:", leftX, y);
      y += 20;
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#000").text(data.patient?.name || "Unknown", leftX, y);
      doc.font("Helvetica").text(data.patient?.phone || "-", leftX, y + 15);
      doc.text(
        `${data.patient?.address?.city || ""}, ${data.patient?.address?.state || ""}`,
        leftX, y + 30, { width: 250 }
      );

      // Invoice Box
      y = 150; // Align Top
      doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.primary).text("Invoice Details:", rightX, y);
      y += 20;

      const detailsRow = (label, val) => {
        doc.font("Helvetica-Bold").fillColor("#000").text(label, rightX, y);
        doc.font("Helvetica").text(val, rightX + 80, y);
        y += 15;
      };

      detailsRow("Bill No:", `#${data.billId.slice(-6).toUpperCase()}`);
      detailsRow("Date:", data.date || new Date().toLocaleDateString());
      detailsRow("Doctor:", data.doctor?.name || "-");
      detailsRow("Type:", data.patient?.patientType || "OPD");

      // -- Bill Items Table --
      y = 250;

      // Header
      doc.rect(50, y, 495, 25).fill(COLORS.primary);
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#fff");
      doc.text("#", 60, y + 7);
      doc.text("Description", 100, y + 7);
      doc.text("Rate", 350, y + 7, { align: "right", width: 50 });
      doc.text("Qty", 410, y + 7, { align: "center", width: 30 });
      doc.text("Amount", 460, y + 7, { align: "right", width: 70 });

      y += 35;

      // Items
      let items = data.billItems || [];
      if (typeof items === "string") { try { items = JSON.parse(items); } catch { items = []; } }
      if (!Array.isArray(items)) items = [];

      let total = 0;
      doc.font("Helvetica").fontSize(10).fillColor(COLORS.text);

      items.forEach((item, i) => {
        const amt = (item.charge || 0) * (item.qty || 0);
        total += amt;

        if (i % 2 !== 0) doc.rect(50, y - 5, 495, 20).fill("#f9f9f9"); // Zebra striping
        doc.fillColor(COLORS.text);

        doc.text(i + 1, 60, y);
        doc.text(item.name || "-", 100, y, { width: 240 });
        doc.text(Number(item.charge).toFixed(2), 350, y, { align: "right", width: 50 });
        doc.text(item.qty, 410, y, { align: "center", width: 30 });
        doc.text(amt.toFixed(2), 460, y, { align: "right", width: 70 });
        y += 20;
      });

      doc.moveTo(50, y).lineTo(545, y).strokeColor(COLORS.border).stroke();
      y += 10;

      // Totals
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#000");
      doc.text("Total:", 350, y, { align: "right", width: 100 });
      doc.text(`Rs. ${total.toFixed(2)}`, 460, y, { align: "right", width: 70 });
      y += 25;

      doc.rect(350, y - 5, 195, 30).fill(COLORS.lightBg);
      doc.fillColor(COLORS.primary).text("Grand Total:", 360, y + 5);
      doc.text(`Rs. ${total.toFixed(2)}`, 460, y + 5, { align: "right", width: 70 });

      // Footer Signatures
      y = 650;
      doc.font("Helvetica").fontSize(10).fillColor("#000");
      doc.text("Payment Mode: " + (data.paymentMode || "Cash"), 50, y);

      doc.moveTo(400, y).lineTo(545, y).strokeColor("#000").dash(1, 0).stroke();
      doc.text("Authorized Signatory", 400, y + 10, { align: "center", width: 145 });

      drawFooter(1);


      // ---------------------------------------------------------
      // 📄 PAGE 2: FULL PATIENT PROFILE (Requested "Full Field" View)
      // ---------------------------------------------------------
      doc.addPage();
      drawHeader();
      y = 130;
      doc.font("Helvetica-Bold").fontSize(16).fillColor(COLORS.secondary).text("Patient Information Form", 50, y);
      y += 30;

      const drawFieldBlock = (title, fields) => {
        // Section Header
        doc.rect(50, y, 495, 25).fill(COLORS.lightBg);
        doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.primary).text(title, 60, y + 7);
        y += 35;

        // Fields
        fields.forEach(row => {
          let startX = 60;
          row.forEach(field => {
            if (!field) return;
            doc.font("Helvetica-Bold").fontSize(10).fillColor("#000").text(field.label + ":", startX, y);
            doc.font("Helvetica").text(field.value || "-", startX + (field.label.length * 6) + 10, y);
            startX += 250; // Column width
          });
          y += 20;
        });
        y += 10;
      };

      // 1. Basic Details
      drawFieldBlock("Personal Details", [
        [
          { label: "Patient Name", value: data.patient?.name },
          { label: "Patient ID", value: data.patient?.id || data.patient?._id }
        ],
        [
          { label: "Age", value: String(data.patient?.age) },
          { label: "Gender", value: data.patient?.gender }
        ],
        [
          { label: "Phone", value: data.patient?.phone },
          { label: "Email", value: data.patient?.email }
        ],
        [
          { label: "Blood Group", value: data.patient?.bloodGroup },
          { label: "Patient Type", value: data.patient?.patientType }
        ]
      ]);

      // 2. Address
      const addr = data.patient?.address || {};
      drawFieldBlock("Address Details", [
        [{ label: "Line 1", value: addr.line1 }],
        [{ label: "Line 2", value: addr.line2 }],
        [
          { label: "City", value: addr.city },
          { label: "State", value: addr.state }
        ],
        [{ label: "Pincode", value: addr.pincode }]
      ]);

      // 3. Emergency Contact
      const em = data.patient?.emergencyContact || {};
      drawFieldBlock("Emergency Contact", [
        [
          { label: "Name", value: em.name },
          { label: "Relation", value: em.relation }
        ],
        [{ label: "Phone", value: em.phone }]
      ]);

      // 4. Medical History
      drawFieldBlock("Medical Details", [
        [{ label: "Allergies", value: Array.isArray(data.patient?.allergies) ? data.patient.allergies.join(", ") : "-" }],
        [{ label: "Existing Conditions", value: Array.isArray(data.patient?.existingConditions) ? data.patient.existingConditions.join(", ") : "-" }],
        [{ label: "Current Medications", value: Array.isArray(data.patient?.currentMedications) ? data.patient.currentMedications.join(", ") : "-" }]
      ]);

      // 5. OPD/IPD Details
      if (data.patient?.patientType === "OPD") {
        const opd = data.patient?.opdDetails || {};
        drawFieldBlock("OPD Visit Details", [
          [
            { label: "Visit Count", value: String(opd.visitCount || 1) },
            { label: "Last Visit", value: opd.lastVisitDate ? new Date(opd.lastVisitDate).toLocaleDateString() : "-" }
          ]
        ]);
      } else if (data.patient?.patientType === "IPD") {
        const ipd = data.patient?.ipdDetails || {};
        drawFieldBlock("Inpatient (IPD) Details", [
          [
            { label: "Ward", value: ipd.ward },
            { label: "Room No", value: ipd.roomNo }
          ],
          [
            { label: "Bed No", value: ipd.bedNo },
            { label: "Admission Date", value: ipd.admissionDate ? new Date(ipd.admissionDate).toLocaleDateString() : "-" }
          ]
        ]);
      }

      drawFooter(2);

      // ---------------------------------------------------------
      // 📄 PAGE 3: DOCTOR DETAILS (Requested "Full Field" View)
      // ---------------------------------------------------------
      doc.addPage();
      drawHeader();
      y = 130;
      doc.font("Helvetica-Bold").fontSize(16).fillColor(COLORS.secondary).text("Doctor Information Form", 50, y);
      y += 30;

      // 1. Professional Details
      const docObj = data.doctor || {};
      drawFieldBlock("Professional Details", [
        [
          { label: "Doctor Name", value: docObj.name },
          { label: "Specialization", value: docObj.specialization }
        ],
        [
          { label: "Experience", value: docObj.experience ? docObj.experience + " years" : "-" },
          { label: "Qualification", value: docObj.qualification }
        ],
        [
          { label: "Registration No", value: docObj.registrationNumber },
          { label: "Consultation Fee", value: docObj.consultationFee ? "Rs " + docObj.consultationFee : "-" }
        ]
      ]);

      // 2. Contact Details
      drawFieldBlock("Contact Information", [
        [
          { label: "Phone", value: docObj.phone },
          { label: "Email", value: docObj.email }
        ]
      ]);

      // 3. Availability
      drawFieldBlock("Availability", [
        [{ label: "Days", value: Array.isArray(docObj.availability?.days) ? docObj.availability.days.join(", ") : "-" }],
        [{ label: "Time", value: (docObj.availability?.from || "-") + " to " + (docObj.availability?.to || "-") }]
      ]);

      // 4. Bio
      y = drawSectionTitle("Doctor Bio", y);
      doc.font("Helvetica").fontSize(10).fillColor("#000").text(docObj.bio || "No bio available.", 60, y, { width: 480 });
      y += doc.heightOfString(docObj.bio || "", { width: 480 }) + 20;

      // 5. Rating
      drawFieldBlock("Rating & Reviews", [
        [
          { label: "Average Rating", value: docObj.rating?.average ? docObj.rating.average + " / 5" : "-" },
          { label: "Total Reviews", value: String(docObj.rating?.count || 0) }
        ]
      ]);

      drawFooter(3);





      // ---------------------------------------------------------
      // 📄 PAGE 4: GENERAL CHECKUP REPORT
      // ---------------------------------------------------------
      if (data.report) {
        doc.addPage();
        drawHeader();
        y = 130;
        doc.font("Helvetica-Bold").fontSize(16).fillColor(COLORS.secondary).text("General Checkup Report", 50, y);

        // Date
        doc.fontSize(10).fillColor("#000").text(`Date: ${data.date || new Date().toLocaleString()}`, 50, y + 5, { align: "right" });
        y += 30;

        // Patient Details Block
        y = drawSectionTitle("Patient Details", y);
        doc.font("Helvetica-Bold").fontSize(10).fillColor("#000").text("Name:", 60, y);
        doc.font("Helvetica").text(data.patient?.name || "-", 100, y);

        doc.font("Helvetica-Bold").text("Age/Gender:", 300, y);
        doc.font("Helvetica").text(`${data.patient?.age || "-"} / ${data.patient?.gender || "-"}`, 380, y);
        y += 30;

        const rep = data.report || {};

        // 1. Vitals
        if (rep.vitals) {
          y = drawSectionTitle("Vitals & Measurements", y);
          const v = rep.vitals;

          doc.font("Helvetica").fontSize(10).fillColor("#000");
          const drawVital = (lbl, val, x, ly) => {
            doc.font("Helvetica-Bold").text(lbl, x, ly);
            doc.font("Helvetica").text(val, x, ly + 15);
          };

          // Layout based on user request visual
          drawVital("BP", v.bloodPressure, 60, y);
          drawVital("Pulse", v.pulseRate, 160, y);
          drawVital("Temp", v.temperature, 260, y);
          drawVital("O2 Level", v.oxygenLevel, 360, y);
          drawVital("Weight", v.weight, 460, y);
          y += 40;
        }

        // 2. Clinical Observations
        if (rep.symptoms?.length || rep.physicalExamination || rep.clinicalFindings) {
          y = drawSectionTitle("Clinical Observations", y);

          if (rep.symptoms?.length) {
            doc.font("Helvetica-Bold").text("Symptoms:", 60, y);
            doc.font("Helvetica").text(rep.symptoms.join(", "), 60, y + 15, { width: 480 });
            y += doc.heightOfString(rep.symptoms.join(", "), { width: 480 }) + 25;
          }

          if (rep.physicalExamination) {
            doc.font("Helvetica-Bold").text("Physical Examination:", 60, y);
            doc.font("Helvetica").text(rep.physicalExamination, 60, y + 15, { width: 480 });
            y += doc.heightOfString(rep.physicalExamination, { width: 480 }) + 25;
          }

          if (rep.clinicalFindings) {
            doc.font("Helvetica-Bold").text("Clinical Findings:", 60, y);
            doc.font("Helvetica").text(rep.clinicalFindings, 60, y + 15, { width: 480 });
            y += doc.heightOfString(rep.clinicalFindings, { width: 480 }) + 25;
          }
        }

        // 3. Diagnosis
        if (rep.diagnosis || rep.reportDetails) {
          y = drawSectionTitle("Diagnosis & Details", y);

          if (rep.diagnosis) {
            doc.font("Helvetica-Bold").text("Final Diagnosis:", 60, y);
            doc.font("Helvetica").text(rep.diagnosis, 160, y, { width: 380 });
            y += 20;
          }

          if (rep.reportDetails) {
            doc.font("Helvetica-Bold").text("Report Details:", 60, y);
            doc.font("Helvetica").text(rep.reportDetails, 60, y + 15, { width: 480 });
            y += doc.heightOfString(rep.reportDetails, { width: 480 }) + 25;
          }
        }

        // 4. Plan & Advice
        if (rep.treatmentAdvice || rep.lifestyleAdvice || rep.advisedInvestigations?.length > 0) {
          y = drawSectionTitle("Plan & Advice", y);

          if (rep.treatmentAdvice) {
            doc.font("Helvetica-Bold").text("Treatment Advice:", 60, y);
            doc.font("Helvetica").text(rep.treatmentAdvice, 60, y + 15, { width: 480 });
            y += doc.heightOfString(rep.treatmentAdvice, { width: 480 }) + 25;
          }

          if (rep.lifestyleAdvice) {
            doc.font("Helvetica-Bold").text("Lifestyle Advice:", 60, y);
            doc.font("Helvetica").text(rep.lifestyleAdvice, 60, y + 15, { width: 480 });
            y += doc.heightOfString(rep.lifestyleAdvice, { width: 480 }) + 25;
          }

          if (rep.advisedInvestigations?.length > 0) {
            doc.font("Helvetica-Bold").text("Advised Investigations:", 60, y);
            doc.font("Helvetica").text(rep.advisedInvestigations.join("\n"), 60, y + 15, { width: 480 });
            y += doc.heightOfString(rep.advisedInvestigations.join("\n"), { width: 480 }) + 25;
          }
        }

        // 5. Follow-up
        if (rep.followUpDate || rep.additionalNotes) {
          y = drawSectionTitle("Follow-up & Notes", y);

          if (rep.followUpDate) {
            doc.font("Helvetica-Bold").text("Follow-up Date:", 60, y);
            doc.font("Helvetica").text(new Date(rep.followUpDate).toLocaleDateString(), 160, y);
            y += 20;
          }

          if (rep.additionalNotes) {
            doc.font("Helvetica-Bold").text("Additional Notes:", 60, y);
            doc.font("Helvetica").text(rep.additionalNotes, 160, y, { width: 380 });
          }
        }

        // Signature
        y += 40;
        doc.font("Helvetica-Bold").text("Doctor's Signature:", 400, y);
        y += 30;
        doc.font("Helvetica").text(`Dr. ${data.doctor?.name || "-"}`, 400, y);
        doc.text(new Date().toLocaleDateString(), 400, y + 15);

        drawFooter(4);
      }


      // ---------------------------------------------------------
      // 📄 PAGE 5: PRESCRIPTION SUMMARY REPORT (Duplicate Disabled)
      // ---------------------------------------------------------
      if (false) {
        doc.addPage();
        drawHeader();
        y = 130;
        doc.font("Helvetica-Bold").fontSize(16).fillColor(COLORS.secondary).text("General Checkup Report", 50, y);

        // Date
        doc.fontSize(10).fillColor("#000").text(`Date: ${new Date().toLocaleString()}`, 50, y + 5, { align: "right" });
        y += 30;

        // Patient Details Block
        y = drawSectionTitle("Patient Details", y);
        doc.font("Helvetica-Bold").fontSize(10).fillColor("#000").text("Name:", 60, y);
        doc.font("Helvetica").text(data.patient?.name || "-", 100, y);

        doc.font("Helvetica-Bold").text("Age/Gender:", 300, y);
        doc.font("Helvetica").text(`${data.patient?.age || "-"} / ${data.patient?.gender || "-"}`, 380, y);
        y += 30;

        const rep = data.report || {};

        // 1. Vitals
        if (rep.vitals) {
          y = drawSectionTitle("Vitals & Measurements", y);
          const v = rep.vitals;

          doc.font("Helvetica").fontSize(10).fillColor("#000");
          const drawVital = (lbl, val, x, ly) => {
            doc.font("Helvetica-Bold").text(lbl, x, ly);
            doc.font("Helvetica").text(val, x, ly + 15);
          };

          // Layout based on user request visual
          drawVital("BP", v.bloodPressure, 60, y);
          drawVital("Pulse", v.pulseRate, 160, y);
          drawVital("Temp", v.temperature, 260, y);
          drawVital("O2 Level", v.oxygenLevel, 360, y);
          drawVital("Weight", v.weight, 460, y);
          y += 40;
        }

        // 2. Clinical Observations
        if (rep.symptoms?.length || rep.physicalExamination || rep.clinicalFindings) {
          y = drawSectionTitle("Clinical Observations", y);

          if (rep.symptoms?.length) {
            doc.font("Helvetica-Bold").text("Symptoms:", 60, y);
            doc.font("Helvetica").text(rep.symptoms.join(", "), 60, y + 15, { width: 480 });
            y += doc.heightOfString(rep.symptoms.join(", "), { width: 480 }) + 25;
          }

          if (rep.physicalExamination) {
            doc.font("Helvetica-Bold").text("Physical Examination:", 60, y);
            doc.font("Helvetica").text(rep.physicalExamination, 60, y + 15, { width: 480 });
            y += doc.heightOfString(rep.physicalExamination, { width: 480 }) + 25;
          }

          if (rep.clinicalFindings) {
            doc.font("Helvetica-Bold").text("Clinical Findings:", 60, y);
            doc.font("Helvetica").text(rep.clinicalFindings, 60, y + 15, { width: 480 });
            y += doc.heightOfString(rep.clinicalFindings, { width: 480 }) + 25;
          }
        }

        // 3. Diagnosis
        if (rep.diagnosis || rep.reportDetails) {
          y = drawSectionTitle("Diagnosis & Details", y);

          if (rep.diagnosis) {
            doc.font("Helvetica-Bold").text("Final Diagnosis:", 60, y);
            doc.font("Helvetica").text(rep.diagnosis, 160, y, { width: 380 });
            y += 20;
          }

          if (rep.reportDetails) {
            doc.font("Helvetica-Bold").text("Report Details:", 60, y);
            doc.font("Helvetica").text(rep.reportDetails, 60, y + 15, { width: 480 });
            y += doc.heightOfString(rep.reportDetails, { width: 480 }) + 25;
          }
        }

        // 4. Plan & Advice
        if (rep.treatmentAdvice || rep.lifestyleAdvice || rep.advisedInvestigations?.length > 0) {
          y = drawSectionTitle("Plan & Advice", y);

          if (rep.treatmentAdvice) {
            doc.font("Helvetica-Bold").text("Treatment Advice:", 60, y);
            doc.font("Helvetica").text(rep.treatmentAdvice, 60, y + 15, { width: 480 });
            y += doc.heightOfString(rep.treatmentAdvice, { width: 480 }) + 25;
          }

          if (rep.lifestyleAdvice) {
            doc.font("Helvetica-Bold").text("Lifestyle Advice:", 60, y);
            doc.font("Helvetica").text(rep.lifestyleAdvice, 60, y + 15, { width: 480 });
            y += doc.heightOfString(rep.lifestyleAdvice, { width: 480 }) + 25;
          }

          if (rep.advisedInvestigations?.length > 0) {
            doc.font("Helvetica-Bold").text("Advised Investigations:", 60, y);
            doc.font("Helvetica").text(rep.advisedInvestigations.join("\n"), 60, y + 15, { width: 480 });
            y += doc.heightOfString(rep.advisedInvestigations.join("\n"), { width: 480 }) + 25;
          }
        }

        // 5. Follow-up
        if (rep.followUpDate || rep.additionalNotes) {
          y = drawSectionTitle("Follow-up & Notes", y);

          if (rep.followUpDate) {
            doc.font("Helvetica-Bold").text("Follow-up Date:", 60, y);
            doc.font("Helvetica").text(new Date(rep.followUpDate).toLocaleDateString(), 160, y);
            y += 20;
          }

          if (rep.additionalNotes) {
            doc.font("Helvetica-Bold").text("Additional Notes:", 60, y);
            doc.font("Helvetica").text(rep.additionalNotes, 160, y, { width: 380 });
          }
        }

        drawFooter(4);
      }





      // ---------------------------------------------------------
      // 📄 PAGE 5: PRESCRIPTION SUMMARY REPORT
      // ---------------------------------------------------------

      if (data.prescription?.medicines?.length > 0) {
        doc.addPage();
        drawHeader();
        y = 130;
        doc.font("Helvetica-Bold").fontSize(16).fillColor(COLORS.secondary).text("Prescription Summary Report", 50, y);
        y += 30;

        // Prescription Table
        y = drawSectionTitle("Prescription / Rx", y);

        // Table Header
        doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.secondary);
        doc.text("Medicine Name", 60, y);
        doc.text("Dosage", 200, y);
        doc.text("Freq", 280, y);
        doc.text("Duration", 340, y);
        doc.text("Instruction", 400, y);

        doc.moveTo(50, y + 12).lineTo(545, y + 12).strokeColor(COLORS.border).stroke();
        y += 20;

        doc.font("Helvetica").fillColor("#000");
        data.prescription.medicines.forEach(med => {
          doc.text(med.name || "-", 60, y, { width: 130 });
          doc.text(med.dosage || "-", 200, y);
          doc.text(med.frequency || "-", 280, y);
          doc.text(med.duration || "-", 340, y);
          doc.text(med.mealInstruction || "-", 400, y);
          y += 25;
        });
        y += 20;

        // Advice (Optional, but useful with Rx)
        if (data.report?.treatmentAdvice || data.report?.additionalNotes) {
          y = drawSectionTitle("Advice & Notes", y);
          if (data.report.treatmentAdvice) {
            doc.font("Helvetica-Bold").text("Advice:", 60, y);
            doc.font("Helvetica").text(data.report.treatmentAdvice, 120, y, { width: 400 });
            y += doc.heightOfString(data.report.treatmentAdvice, { width: 400 }) + 10;
          }
          if (data.report.additionalNotes) {
            doc.font("Helvetica-Bold").text("Notes:", 60, y);
            doc.font("Helvetica").text(data.report.additionalNotes, 120, y, { width: 400 });
          }
        }

        drawFooter(5);
      }


      // ---------------------------------------------------------
      // 📄 PAGE 6: SCAN REPORTS (If any)
      // ---------------------------------------------------------
      if (data.scanReport) {
        doc.addPage();
        drawHeader();
        y = 130;
        doc.font("Helvetica-Bold").fontSize(16).fillColor(COLORS.secondary).text("Radiology / Scan Report", 50, y);
        y += 30;

        const scan = data.scanReport;

        y = drawSectionTitle(`Scan: ${scan.scanName || "General"}`, y);

        const drawField = (lbl, val) => {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#000").text(lbl, 60, y, { width: 100 });
          doc.font("Helvetica").text(val || "-", 160, y, { width: 350 });
          y += 20;
        };

        drawField("Type:", scan.type);
        drawField("Date:", scan.scanDate ? new Date(scan.scanDate).toLocaleDateString() : "-");
        y += 10;

        drawField("Description:", scan.description);
        drawField("Indication:", scan.indication);
        y += 10;

        doc.fillColor(COLORS.primary).font("Helvetica-Bold").text("Findings:", 60, y);
        y += 15;
        doc.fillColor("#000").font("Helvetica").text(scan.findings || "No findings recorded.", 60, y, { width: 480 });
        y += doc.heightOfString(scan.findings || "", { width: 480 }) + 20;

        doc.fillColor(COLORS.primary).font("Helvetica-Bold").text("Impression:", 60, y);
        y += 15;
        doc.fillColor("#000").font("Helvetica").text(scan.impression || "-", 60, y, { width: 480 });

        drawFooter(6);
      }

      // Finish
      doc.end();

      stream.on("finish", () => {
        resolve({ buffer: fs.readFileSync(pdfPath), path: pdfPath });
      });

    } catch (err) {
      reject(err);
    }
  });
};
