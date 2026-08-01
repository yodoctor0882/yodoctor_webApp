
// src/utils/patientRecords.js
export const getPatientHistory = (patientId) => {
  const notes = JSON.parse(localStorage.getItem("doctorNotes")) || [];
  return notes.filter((n) => n.patientId === patientId);
};


