import api from "./api";

/* ================= DASHBOARD ================= */
export const getPatientDashboard = () => api.get("/patient/dashboard");

/* ================= SEARCH ================= */
export const searchVisitDoctors = (params) =>
  api.get("/patient/visit/doctors", { params });

export const getCities = (search = "") =>
  api.get("/patient/cities", {
    params: { search },
  });

export const getDiseases = () => api.get("/patient/diseases");

export const getDoctorNames = () => api.get("/patient/doctorname");

export const getDoctorById = (doctorId) =>
  api.get(`/patient/visit/doctors/${doctorId}`);

export const getCurrentToken = (params) => {
  console.log("Sending Params:", params);

  return api.get("/patient/current-token", {
    params,
  });
};

/* ================= APPOINTMENTS ================= */
export const bookVisitAppointment = (data) =>
  api.post("/patient/visit/appointments", data);

export const getUpcomingAppointments = (filter = "") =>
  api.get("/patient/appointments/upcoming", {
    params: filter ? { filter } : {},
  });

export const cancelAppointment = (id) =>
  api.put(`/patient/visit/appointments/${id}/cancel`);

export const getAppointmentHistory = (cursor = null) => {
  const params = {};
  if (cursor && typeof cursor === "string") params.cursor = cursor;
  return api.get("/patient/visit/appointments/history", { params });
};

/* ================= FAMILY ================= */
export const getFamilyMembers = () => api.get("/patient/getfamily");

export const addFamilyMember = (data) => api.post("/patient/addfamily", data);

export const updateFamilyMember = (id, data) =>
  api.put(`/patient/updatefamily/${id}`, data);

export const deleteFamilyMember = (id) =>
  api.delete(`/patient/deletefamily/${id}`);

/* ================= NOTIFICATIONS ================= */
export const getNotifications = () => api.get("/patient/notifications");

export const markNotificationRead = (id) =>
  api.put(`/patient/notifications/${id}/read`);

export const getUnreadNotificationCount = () =>
  api.get("/patient/notifications/unread-count");

/* ================= TOKEN STATUS ================= */
export const getTokenStatus = (appointmentId) =>
  api.get(`/patient/visit/token-status/${appointmentId}`);

export const submitDoctorReview = (data) =>
  api.post("/patient/doctor-feedback", data);

export const qrBookVisit = (data) => api.post("/patient/visit/qr-book", data);

// export const updatePatient = (
//   id,
//   body
// ) =>
//   api.patch(
//     `/patient/${id}`,
//     body
//   );