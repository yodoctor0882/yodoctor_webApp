import api from "../api";

/* =========================
   CREATE ACCOUNT
========================= */

export const createDoctorAccount = async (payload) => {
  const res = await api.post("/doctor/register", payload);
  return res.data;
};


/* =========================
   PERSONAL DETAILS
========================= */

export const updatePersonalDetails = async (payload) => {
  const res = await api.patch("/doctor/registration/step-1", payload);
  return res.data;
};


/* =========================
   PROFESSIONAL DETAILS
========================= */

export const updateProfessionalDetails = async (payload) => {
  const res = await api.patch("/doctor/registration/step-2", payload);
  return res.data;
};


/* =========================
   CLINIC DETAILS
========================= */

export const updateClinicDetails = async (payload) => {
  const res = await api.patch("/doctor/registration/step-3", payload);
  return res.data;
};


/* =========================
   PRACTICE DETAILS
========================= */

export const updatePracticeDetails = async (payload) => {
  const res = await api.patch("/doctor/registration/step-4", payload);
  return res.data;
};


/* =========================
   CONSULTATION DETAILS
========================= */

export const updateConsultationDetails = async (payload) => {
  const res = await api.patch("/doctor/registration/step-5", payload);
  return res.data;
};


/* =========================
   DOCUMENT UPLOAD
========================= */

export const uploadDoctorDocuments = async (formData) => {
  const res = await api.patch("/doctor/registration/step-6", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};


/* =========================
   FINAL SUBMIT
========================= */

export const submitDoctorRegistration = async (payload) => {
  const res = await api.patch("/doctor/registration/submit", payload);
  return res.data;
};