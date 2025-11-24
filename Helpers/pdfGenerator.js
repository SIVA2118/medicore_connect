import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generatePDF = (data, fileName) => {
  return new Promise((resolve, reject) => {
    try {
      const pdfDir = path.join(process.cwd(), "pdfs");

      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const pdfPath = path.join(pdfDir, fileName);
      const tempStream = fs.createWriteStream(pdfPath);

      const doc = new PDFDocument({
        size: "A4",
        margin: 40
      });

      // PIPE PDF DATA TO FILE (Faster)
      doc.pipe(tempStream);

      // ---- PDF CONTENT ----
      doc.fontSize(22).text("Hospital Scan Report", { align: "center" });
      doc.moveDown();

      doc.fontSize(14).text(`Patient Name : ${data.patientName}`);
      doc.text(`Doctor Name  : ${data.doctorName}`);
      doc.text(`Scan Type     : ${data.type}`);
      doc.text(`Description   : ${data.description}`);
      doc.moveDown();

      doc.end();

      // WHEN FILE IS FINISHED
      tempStream.on("finish", () => {
        resolve(pdfPath);
      });

      tempStream.on("error", (err) => {
        reject(err);
      });

    } catch (err) {
      reject(err);
    }
  });
};
