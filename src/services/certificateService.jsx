import api from "./api";

/* ================= PATIENT APIs ================= */

// Create certificate request
export const createRequest = (data) =>
  api.post("/certificate/create", data);

// Upload documents
export const uploadDocuments = (formData) =>
  api.post("/certificate/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Get all certificates of logged-in patient
export const getMyRequests = () =>
  api.get("/certificate/my-requests");

// Get certificate details by ID (Patient)
export const getRequestById = (id) =>
  api.get(`/certificate/${id}`);

// Download approved certificate
export const downloadCertificate = (id) =>
  api.get(`/certificate/download/${id}`, {
    responseType: "blob",
  });


/* ================= DOCTOR APIs ================= */

// Get all certificate requests assigned to doctor
export const getDoctorRequests = () =>
  api.get("/certificate/requests");

// Get request details for doctor
export const getRequestDetails = (id) =>
  api.get(`/certificate/requests/${id}`);

// Get uploaded documents for a request
export const getDocuments = (id) =>
  api.get(`/certificate/documents/${id}`);

// Approve certificate
export const approveRequest = (id, data) =>
  api.put(`/certificate/approve/${id}`, data);

// Reject certificate
export const rejectRequest = (id, data) =>
  api.put(`/certificate/reject/${id}`, data);

// Get issued certificates by doctor
export const getIssuedCertificates = () =>
  api.get("/certificate/issued");


/* ================= PUBLIC API ================= */

// Verify certificate via QR code
export const verifyCertificate = (certificateId) =>
  api.get(`/certificate/verify/${certificateId}`);