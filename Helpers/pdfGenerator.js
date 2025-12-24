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

      // ---------- SAFE DEFAULTS ----------
      const patient = data.patient || {};
      const doctor = data.doctor || {};
      const prescription = data.prescription || {};
      const report = data.report || null;
      const scanReport = data.scanReport || null;

      data.billItems = Array.isArray(data.billItems) ? data.billItems : [];

      const COLORS = {
        primary: "#1A73E8",
        gradient1: "#4E8EF7",
        gradient2: "#A6C8FF",
        dark: "#102542",
        text: "#2D2F30",
        border: "#CBD6E2",
        shadow: "#00000020",
      };

      const doc = new PDFDocument({ size: "A4", margin: 0 });
      doc.pipe(stream);

      // ------------------------------------------------------------
      // PREMIUM HEADER
      // ------------------------------------------------------------
      const modernHeader = (title) => {
        const PAGE_WIDTH = 595;

        doc.rect(0, 0, PAGE_WIDTH, 105).fill(COLORS.gradient1);
        doc.rect(0, 0, PAGE_WIDTH, 105).fillOpacity(0.2).fill("#FFFFFF").fillOpacity(1);

        doc.fillColor("#fff").font("Helvetica-Bold").fontSize(50).text("✚", 20, 15);

        doc
          .fillColor("#fff")
          .font("Helvetica-Bold")
          .fontSize(28)
          .text("CITY CARE HOSPITAL", 0, 28, { align: "center" });

        doc
          .fontSize(11)
          .fillColor("#fff")
          .text(
            "123 Main Road, Coimbatore • +91 99421 29724 • www.citycare.com",
            0,
            65,
            { align: "center" }
          );

        const titleWidth = doc.widthOfString(title);
        const boxX = (PAGE_WIDTH - (titleWidth + 150)) / 2;

        doc.roundedRect(boxX, 130, titleWidth + 150, 48, 14).fill(COLORS.primary);

        doc
          .fillColor("#fff")
          .font("Helvetica-Bold")
          .fontSize(17)
          .text(title, 0, 145, { align: "center" });
      };

      // FIELD FUNCTION
      const field = (label, value, y) => {
        doc.fontSize(12).fillColor(COLORS.dark).text(label, 80, y);
        doc.font("Helvetica-Bold").fillColor("#000").text(value ?? "-", 260, y);
        doc.font("Helvetica");
      };

      // FOOTER
      const footer = (page) => {
        doc
          .fontSize(10)
          .fillColor("#777")
          .text(`Page ${page} • CityCare Digital System`, 0, 820, {
            align: "center",
          });
      };

      // ============================================================
      // PAGE 1: PATIENT DETAILS (FULL INFO)
      // ============================================================
      modernHeader("Patient Information");

      let y = 200;

      // BASIC DETAILS
      field("Patient Name:", patient.name, y);
      y += 20;

      field("Age:", patient.age, y);
      y += 20;

      field("Gender:", patient.gender, y);
      y += 20;

      field("Phone:", patient.phone, y);
      y += 20;

      field("Email:", patient.email || "-", y);
      y += 20;

      field("Patient Type:", patient.patientType || "-", y);
      y += 20;

      field("Blood Group:", patient.bloodGroup || "-", y);
      y += 20;
      // ADDRESS
      doc.font("Helvetica-Bold").fontSize(14).text("Address:", 80, y);
      y += 25;

      doc.font("Helvetica").fontSize(12)
        .text(`Line 1: ${patient.address?.line1 || "-"}`, 100, y);
      y += 20;

      doc.text(` ${patient.address?.line2 || "-"}`, 100, y);
      y += 20;

      doc.text(`City: ${patient.address?.city || "-"}`, 100, y);
      y += 20;

      doc.text(`State: ${patient.address?.state || "-"}`, 100, y);
      y += 20;

      doc.text(`Pincode: ${patient.address?.pincode || "-"}`, 100, y);
      y += 30;

      // EMERGENCY CONTACT
      doc.font("Helvetica-Bold").fontSize(14).text("Emergency Contact:", 80, y);
      y += 25;

      doc.font("Helvetica").fontSize(12)
        .text(`Name: ${patient.emergencyContact?.name || "-"}`, 100, y);
      y += 20;

      doc.text(
        `Relation: ${patient.emergencyContact?.relation || "-"}`,
        100,
        y
      );
      y += 20;

      doc.text(`Phone: ${patient.emergencyContact?.phone || "-"}`, 100, y);
      y += 30;

      // MEDICAL DETAILS
      doc.font("Helvetica-Bold").fontSize(14).text("Medical Details:", 80, y);
      y += 25;

      doc.font("Helvetica").fontSize(12)
        .text(
          `Allergies: ${
            Array.isArray(patient.allergies) && patient.allergies.length
              ? patient.allergies.join(", ")
              : "-"
          }`,
          100,
          y
        );
      y += 20;

      doc.text(
        `Existing Conditions: ${
          Array.isArray(patient.existingConditions) &&
          patient.existingConditions.length
            ? patient.existingConditions.join(", ")
            : "-"
        }`,
        100,
        y
      );
      y += 20;

      doc.text(
        `Current Medications: ${
          Array.isArray(patient.currentMedications) &&
          patient.currentMedications.length
            ? patient.currentMedications.join(", ")
            : "-"
        }`,
        100,
        y
      );
      y += 30;
      
      // OPD DETAILS
      if (patient.patientType === "OPD") {
        doc.font("Helvetica-Bold").fontSize(14).text("OPD Visit Details:", 80, y);
        y += 25;

        doc.font("Helvetica").fontSize(12)
          .text(
            `Visit Count: ${patient.opdDetails?.visitCount || 1}`,
            100,
            y
          );
        y += 20;

        doc.text(
          `Last Visit: ${
            patient.opdDetails?.lastVisitDate
              ? new Date(patient.opdDetails.lastVisitDate).toLocaleDateString()
              : "-"
          }`,
          100,
          y
        );
        y += 30;
      }

      // IPD DETAILS
      if (patient.patientType === "IPD") {
        doc.font("Helvetica-Bold").fontSize(14).text("Inpatient (IPD) Details:", 80, y);
        y += 25;

        doc.font("Helvetica").fontSize(12)
          .text(`Ward: ${patient.ipdDetails?.ward || "-"}`, 100, y);
        y += 20;

        doc.text(`Room No: ${patient.ipdDetails?.roomNo || "-"}`, 100, y);
        y += 20;

        doc.text(`Bed No: ${patient.ipdDetails?.bedNo || "-"}`, 100, y);
        y += 20;

        doc.text(
          `Admission: ${
            patient.ipdDetails?.admissionDate
              ? new Date(patient.ipdDetails.admissionDate).toLocaleDateString()
              : "-"
          }`,
          100,
          y
        );
        y += 20;

        doc.text(
          `Discharge: ${
            patient.ipdDetails?.dischargeDate
              ? new Date(patient.ipdDetails.dischargeDate).toLocaleDateString()
              : "-"
          }`,
          100,
          y
        );
        y += 30;
      }

      footer(1);

// ============================================================
// PAGE 2: FULL DOCTOR DETAILS
// ============================================================
doc.addPage();
modernHeader("Doctor Details");

// Y Position Start
let dy = 230;

// Helper function for doctor field
const doctorField = (label, value, y) => {
  doc.fontSize(12).fillColor(COLORS.dark).text(label, 80, y);
  doc.font("Helvetica-Bold").fillColor("#000").text(value ?? "-", 260, y);
  doc.font("Helvetica");
};

// BASIC DETAILS
doctorField("Doctor Name:", doctor.name, dy);
dy += 22;

doctorField("Specialization:", doctor.specialization, dy);
dy += 22;

doctorField("Experience:", `${doctor.experience || 0} years`, dy);
dy += 22;

doctorField("Qualification:", doctor.qualification, dy);
dy += 22;

doctorField("Registration No:", doctor.registrationNumber || "-", dy);
dy += 22;

doctorField("Consultation Fee:", `Rs ${doctor.consultationFee || 0}`, dy);
dy += 35;

// CONTACT DETAILS
doc.font("Helvetica-Bold").fontSize(14).text("Contact Details:", 80, dy);
dy += 25;

doctorField("Phone:", doctor.phone, dy);
dy += 22;

doctorField("Email:", doctor.email, dy);
dy += 35;

// AVAILABILITY
doc.font("Helvetica-Bold").fontSize(14).text("Availability:", 80, dy);
dy += 25;

doc.font("Helvetica").fontSize(12).text(
  `Days: ${(doctor.availability?.days || []).join(", ") || "-"}`,
  100,
  dy
);
dy += 20;

doc.text(
  `Time: ${doctor.availability?.from || "-"} to ${doctor.availability?.to || "-"}`,
  100,
  dy
);
dy += 35;

// BIO
doc.font("Helvetica-Bold").fontSize(14).text("Doctor Bio:", 80, dy);
dy += 25;

doc.font("Helvetica").fontSize(12).text(
  doctor.bio || "No bio available",
  100,
  dy,
  { width: 400 }
);
dy += 50;

// RATING
doc.font("Helvetica-Bold").fontSize(14).text("Rating:", 80, dy);
dy += 25;

doc.font("Helvetica").fontSize(12).text(
  `Average Rating: ${doctor.rating?.average || 0} / 5`,
  100,
  dy
);
dy += 20;

doc.text(
  `Total Reviews: ${doctor.rating?.count || 0}`,
  100,
  dy
);

footer(2);

      // ============================================================
      // PAGE 3: PRESCRIPTION
      // ============================================================
      doc.addPage();
      modernHeader("Prescription Details");

      if (Array.isArray(prescription.medicines) && prescription.medicines.length > 0) {
        let yp = 230;

        doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.primary)
          .text("Name", 60, yp)
          .text("Dosage", 160, yp)
          .text("Frequency", 250, yp)
          .text("Duration", 340, yp)
          .text("Part of Day", 430, yp)
          .text("Meal", 520, yp);

        yp += 20;
        doc.moveTo(50, yp).lineTo(560, yp).strokeColor(COLORS.border).stroke();
        yp += 10;

        prescription.medicines.forEach((m) => {
          doc.font("Helvetica").fontSize(11).fillColor("#000")
            .text(m.name || "-", 60, yp)
            .text(m.dosage || "-", 160, yp)
            .text(m.frequency || "-", 250, yp)
            .text(m.duration || "-", 340, yp)
            .text(m.partOfDay || "-", 430, yp)
            .text(m.mealInstruction || "-", 520, yp);

          yp += 25;
          doc.moveTo(50, yp).lineTo(560, yp).strokeColor(COLORS.border).stroke();
          yp += 10;
        });
      } else {
        field("Prescription:", "No medicines available", 230);
      }

      footer(3);

// ============================================================
// PAGE 4: DOCTOR EXAMINATION REPORT (AUTO PAGE BREAK)
// ============================================================

doc.addPage();
modernHeader("Doctor Examination Report");

// ---------------- PAGE LIMITS ----------------
const PAGE_TOP = 220;
const PAGE_BOTTOM = 760;

let ry = PAGE_TOP;

// ---------------- PAGE BREAK HANDLER ----------------
const checkPageBreak = (extraSpace = 40) => {
  if (ry + extraSpace > PAGE_BOTTOM) {
    doc.addPage();
    modernHeader("Doctor Examination Report");
    ry = PAGE_TOP;
  }
};

// ---------------- COMMON FIELD ----------------
const reportField = (label, value) => {
  checkPageBreak(30);

  doc.font("Helvetica")
    .fontSize(12)
    .fillColor(COLORS.dark)
    .text(label, 60, ry, { width: 150 });

  doc.font("Helvetica-Bold")
    .fillColor("#000")
    .text(value ?? "-", 220, ry, { width: 300 });

  doc.font("Helvetica");
  ry += 24;
};

// ---------------- SECTION TITLE ----------------
const sectionTitle = (title) => {
  checkPageBreak(50);

  ry += 10;
  doc.font("Helvetica-Bold")
    .fontSize(14)
    .fillColor("#333")
    .text(title, 60, ry);

  ry += 22;
};

// ---------------- CONTENT ----------------
if (report) {

  // REPORT DETAILS
  sectionTitle("Report Details");
  reportField("Report Title", report.reportTitle);
  reportField("Report Date", report.date ? new Date(report.date).toLocaleDateString() : "-");
  reportField("Diagnosis", report.diagnosis);

  // SYMPTOMS
  sectionTitle("Symptoms");
  checkPageBreak(80);
  doc.fontSize(12).text(
    Array.isArray(report.symptoms) && report.symptoms.length
      ? report.symptoms.join(", ")
      : "-",
    80,
    ry,
    { width: 450 }
  );
  ry += 40;

  // PHYSICAL EXAMINATION
  sectionTitle("Physical Examination");
  checkPageBreak(80);
  doc.fontSize(12).text(report.physicalExamination || "-", 80, ry, { width: 450 });
  ry += 40;

  // CLINICAL FINDINGS
  sectionTitle("Clinical Findings");
  checkPageBreak(80);
  doc.fontSize(12).text(report.clinicalFindings || "-", 80, ry, { width: 450 });
  ry += 40;

  // VITALS
  sectionTitle("Vitals");

  const vitals = report.vitals || {};
  const vitalsRow = (label, value) => {
    checkPageBreak(30);

    doc.fontSize(12).text(label, 80, ry, { width: 160 });
    doc.font("Helvetica-Bold").text(value ?? "-", 260, ry);
    doc.font("Helvetica");
    ry += 22;
  };

  vitalsRow("Temperature", vitals.temperature);
  vitalsRow("Blood Pressure", vitals.bloodPressure);
  vitalsRow("Pulse Rate", vitals.pulseRate);
  vitalsRow("Respiratory Rate", vitals.respiratoryRate);
  vitalsRow("Oxygen Level", vitals.oxygenLevel);
  vitalsRow("Weight", vitals.weight);

  ry += 20;

  // INVESTIGATIONS
  sectionTitle("Advised Investigations");
  checkPageBreak(80);
  doc.fontSize(12).text(
    Array.isArray(report.advisedInvestigations) && report.advisedInvestigations.length
      ? report.advisedInvestigations.join(", ")
      : "-",
    80,
    ry,
    { width: 450 }
  );
  ry += 40;

  // TREATMENT ADVICE
  sectionTitle("Treatment Advice");
  checkPageBreak(80);
  doc.fontSize(12).text(report.treatmentAdvice || "-", 80, ry, { width: 450 });
  ry += 40;

  // LIFESTYLE ADVICE
  sectionTitle("Lifestyle Advice");
  checkPageBreak(80);
  doc.fontSize(12).text(report.lifestyleAdvice || "-", 80, ry, { width: 450 });
  ry += 40;

  // FOLLOW UP
  reportField(
    "Follow Up Date",
    report.followUpDate ? new Date(report.followUpDate).toLocaleDateString() : "-"
  );

  // ADDITIONAL NOTES
  sectionTitle("Additional Notes");
  checkPageBreak(80);
  doc.fontSize(12).text(report.additionalNotes || "-", 80, ry, { width: 450 });
  ry += 40;

  // DOCTOR SIGNATURE
  sectionTitle("Doctor Signature");
  checkPageBreak(100);

  if (report.doctorSignature) {
    try {
      doc.image(report.doctorSignature, 80, ry, { width: 140 });
      ry += 70;
    } catch {
      doc.fontSize(12).text("(Invalid signature image)", 80, ry);
      ry += 30;
    }
  } else {
    doc.fontSize(12).text("-", 80, ry);
    ry += 30;
  }

} else {
  reportField("Doctor Report", "No report available");
}

// ---------------- FOOTER ----------------
footer(4);


// ============================================================
// PAGE 5: SCAN REPORT
// ============================================================
doc.addPage();
modernHeader("Radiology & Scan Reports");

let ys = 230;

if (scanReport) {
  field("Scan Type", scanReport.type || "-", ys); ys += 25;
  field("Scan Name", scanReport.scanName || "-", ys); ys += 25;
  field("Description", scanReport.description || "-", ys); ys += 25;
  field("Indication", scanReport.indication || "-", ys); ys += 25;

  field("Findings", scanReport.findings || "-", ys); ys += 25;
  field("Impression", scanReport.impression || "-", ys); ys += 25;
  field("Result Status", scanReport.resultStatus || "Pending", ys); ys += 25;

  field("Lab Name", scanReport.labName || "-", ys); ys += 25;
  field("Technician", scanReport.technicianName || "-", ys); ys += 25;

  field(
    "Scan Date",
    scanReport.scanDate
      ? new Date(scanReport.scanDate).toLocaleDateString("en-IN")
      : "-",
    ys
  );
} else {
  field("Scan Report", "No scan report available", ys);
  console.log("SCAN REPORT DATA =>", scanReport);
}

footer(5);


      // ============================================================
      // PAGE 6: COMPLETE BILL – DOCPULSE STYLE WITH ALL DATA
      // ============================================================
      doc.addPage();

      // HOSPITAL HEADER
      doc.font("Helvetica-Bold").fontSize(22).text("City Care Hospital", 0, 40, {
        align: "center",
      });

      doc.font("Helvetica").fontSize(11).text(
        "123 Main Road, Coimbatore - 641001 | +91 99421 29724 | citycarehospital.com",
        0,
        65,
        { align: "center" }
      );

      doc.moveTo(30, 95).lineTo(565, 95).stroke("#999");

      let billY = 115;
      doc.fontSize(12).fillColor("#000");

      // BILL INFO
      doc.text("Invoice No:", 40, billY);
      doc.font("Helvetica-Bold").text(String(data.billId || "-"), 120, billY);

      doc.font("Helvetica").text("Bill Date:", 350, billY);
      doc.font("Helvetica-Bold").text(data.date || new Date().toLocaleDateString(), 420, billY);

      billY += 20;

      // PATIENT DETAILS
      doc.font("Helvetica").text("Patient Name:", 40, billY);
      doc.font("Helvetica-Bold").text(patient.name || "-", 120, billY);

      doc.font("Helvetica").text("Age/Gender:", 350, billY);
      doc.font("Helvetica-Bold").text(`${patient.age || "-"} / ${patient.gender || "-"}`, 420, billY);

      billY += 20;

      doc.font("Helvetica").text("Phone:", 40, billY);
      doc.font("Helvetica-Bold").text(patient.phone || "-", 120, billY);

      doc.font("Helvetica").text("Patient ID:", 350, billY);
      doc.font("Helvetica-Bold").text(patient.id || patient._id || "-", 420, billY);

      billY += 30;

      // DOCTOR DETAILS
      doc.font("Helvetica-Bold").fontSize(13).text("Doctor Details", 40, billY);
      billY += 15;

      doc.font("Helvetica").fontSize(12).text("Doctor Name:", 40, billY);
      doc.font("Helvetica-Bold").text(doctor.name || "-", 140, billY);

      doc.font("Helvetica").text("Specialization:", 350, billY);
      doc.font("Helvetica-Bold").text(doctor.specialization || "-", 450, billY);

      billY += 30;

      // Divider
      doc.moveTo(30, billY).lineTo(565, billY).stroke("#999");
      billY += 20;

      // TREATMENT SECTION
      doc.font("Helvetica-Bold").fontSize(13).text("Treatment Details", 40, billY);
      billY += 15;

      doc.font("Helvetica").fontSize(12).text("Treatment:", 40, billY);
      doc.font("Helvetica-Bold").text(data.treatment || "-", 140, billY);

      billY += 25;

      // Divider
      doc.moveTo(30, billY).lineTo(565, billY).stroke("#999");
      billY += 20;

      // BILL ITEMS TABLE
      doc.font("Helvetica-Bold").fontSize(13).text("Bill Items", 40, billY);
      billY += 20;

      doc.font("Helvetica-Bold").fontSize(12);
      doc.text("Sl.No", 40, billY);
      doc.text("Particulars", 100, billY);
      doc.text("Charges", 300, billY);
      doc.text("Qty", 380, billY);
      doc.text("Amount", 450, billY);

      billY += 15;
      doc.moveTo(30, billY).lineTo(565, billY).stroke("#999");
      billY += 10;

      doc.font("Helvetica").fontSize(11);

      let sl = 1;
      let total = 0;

      // Ensure bill items is array (already normalized above)
      let items = data.billItems;
      if (typeof items === "string") {
        try {
          items = JSON.parse(items);
        } catch {
          items = [];
        }
      }
      if (!Array.isArray(items)) items = [];

      // Render Bill Items
      items.forEach((item) => {
        const amt = (item.charge || 0) * (item.qty || 0);
        total += amt;

        doc.text(sl, 40, billY);
        doc.text(item.name || "-", 100, billY);
        doc.text(String(item.charge ?? 0), 300, billY);
        doc.text(String(item.qty ?? 0), 380, billY);
        doc.text(String(amt), 450, billY);

        sl++;
        billY += 20;
      });

      // Divider
      billY += 10;
      doc.moveTo(30, billY).lineTo(565, billY).stroke("#999");
      billY += 20;

      // TOTAL AMOUNTS
      doc.font("Helvetica-Bold").fontSize(12).text("Total Amount:", 350, billY);
      doc.text(`₹ ${total}`, 450, billY);

      billY += 25;

      doc.font("Helvetica-Bold").text("Payable Amount:", 350, billY);
      doc.text(`₹ ${total}`, 450, billY);

      billY += 40;

      // SIGNATURE
      doc.font("Helvetica").fontSize(12).text("Authorized Signatory", 400, billY);
      doc.moveTo(400, billY - 10).lineTo(550, billY - 10).stroke("#999");

      // FOOTER (PAGE 6)
      doc.fontSize(10).fillColor("#777")
        .text("Powered by CityCare Digital System | citycarehospital.com", 0, 820, {
          align: "center",
        });

      // END PDF
      doc.end();

      stream.on("finish", () => {
        resolve({ buffer: fs.readFileSync(pdfPath), path: pdfPath });
      });
    } catch (err) {
      reject(err);
    }
  });
};
