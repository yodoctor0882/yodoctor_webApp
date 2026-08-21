import jsPDF from "jspdf";

export const generatePrescriptionPDF = (appointment) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Medical Prescription", 20, 20);

  doc.setFontSize(12);
  doc.text(`Doctor: ${appointment.doctorName}`, 20, 35);
  doc.text(`Date: ${appointment.date}`, 20, 45);
  doc.text(`Clinic: ${appointment.clinic_name || "N/A"}`, 20, 55);

  doc.text("Medicines:", 20, 70);
  doc.text(appointment.medicines || "No medicines prescribed", 25, 80);

  doc.text("Instructions:", 20, 100);
  doc.text(appointment.instructions || "No instructions", 25, 110);

  doc.save(`Prescription_${appointment.id}.pdf`);
};