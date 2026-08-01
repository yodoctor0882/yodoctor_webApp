// src/utils/doctorNotes.js

export const saveNotes = (data) => {
  const notes = JSON.parse(localStorage.getItem("doctorNotes")) || [];
  notes.push(data);
  localStorage.setItem("doctorNotes", JSON.stringify(notes));
};


