import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generatePDF = (data, fileName) => {
    return new Promise((resolve, reject) => {
        const pdfPath = path.join("uploads", fileName);
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(pdfPath));

        doc.fontSize(25).text("Hospital Report", { align: "center" });
        doc.moveDown();
        doc.fontSize(14).text(`Patient Name: ${data.patientName}`);
        doc.text(`Doctor Name: ${data.doctorName}`);
        doc.text(`Description: ${data.description}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.end();

        doc.on("finish", () => resolve(pdfPath));
        doc.on("error", reject);
    });
};
