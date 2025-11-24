export const sendWhatsAppPDF = async (phone, pdfLink) => {
  const formatted = phone.replace(/^\+?91/, "91"); // India country code
  const message = `Your hospital bill is ready.\nDownload PDF: ${pdfLink}`;
  return `https://api.whatsapp.com/send?phone=${formatted}&text=${encodeURIComponent(message)}`;
};
