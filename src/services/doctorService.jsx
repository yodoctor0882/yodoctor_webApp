

import api from "./api";

/* ================= DASHBOARD ================= */
export const getDoctorDashboard = () =>
  api.get("/doctor/dashboard");

/* ================= EMERGENCY CANCEL ================= */
export const cancelRemainingAppointments = (slot, reason) =>
  api.put("/doctor/appointments/cancel-remaining", { slot, reason });

/* ================= AVAILABILITY ================= */
export const updateDoctorAvailability = (isAvailable) =>
  api.put("/doctor/availability", { isAvailable });

/* ================= APPOINTMENTS ================= */
export const getIncomingAppointments = () =>
  api.get("/doctor/appointments/incoming");

export const autoAcceptAppointments = () =>
  api.put("/doctor/appointments/auto-accept");

export const respondAppointment = (id, action) =>
  api.put(`/doctor/respond-appointment/${id}`, { action });

// ✅ FIXED: was PATCH /doctor/appointments/start/:id
// Backend route is: PUT /doctor/appointments/:id/start
export const startAppointment = (id, data) =>
  api.put(`/doctor/appointments/${id}/start`, data);

// ✅ REMOVED: completeAppointment() — this endpoint doesn't exist on the backend.
// Appointments are completed automatically when callNextToken() is called.
// Use callNextToken({ slot }) instead of completeAppointment().

/* ================= LIVE QUEUE ================= */
export const getTodayQueue = (slot) =>
  api.get(`/doctor/appointments/today-queue?slot=${slot}`);

export const callNextToken = ({ slot }) =>
  api.post("/doctor/appointments/next-token", { slot });

export const skipAppointment = (appointmentId) =>
  api.put(`/doctor/appointments/${appointmentId}/skip`);

export const recallPatient = (appointmentId) =>
  api.put(`/doctor/appointments/recall/${appointmentId}`);

/* ================= HISTORY ================= */
export const getAppointmentHistory = (filter = "all") =>
  api.get(`/doctor/appointments/history?filter=${filter}`);

/* ================= PROFILE ================= */
export const getDoctorProfile = () =>
  api.get("/doctor/profile");

export const updateDoctorProfile = (data) =>
  api.put("/doctor/profile", data);

/* ================= VISIT SUMMARY ================= */
export const addVisitSummary = (appointmentId, data) =>
  api.post(`/doctor/appointments/${appointmentId}/summary`, data);

/* ================= QR ================= */
export const getMyQR = () =>
  api.get("/doctor/my-qr");

/* ================= CURRENT / NEXT TOKEN ================= */
// ✅ FIXED: was /doctor/appointments/current?slot=... (missing "-token")
// Backend route is: GET /doctor/appointments/current-token?slot=...
export const getCurrentAppointment = (slot) =>
  api.get(`/doctor/appointments/current-token?slot=${slot}`);

export const getNextAppointment = (slot) =>
  api.get(`/doctor/appointments/next?slot=${slot}`);

/* ================= AVAILABILITY STATUS ================= */
export const updateClinicStatus = (isAvailable) =>
  api.put("/doctor/availability", { isAvailable });

export const markNoShow = (slot) =>
  api.put("/doctor/appointments/noShow", { slot });

export const carryForwardRemaining = (slot) =>
  api.put("/doctor/appointments/carry-forward", { slot });

/* ================= REVIEWS ================= */
export const getDoctorReviews = (page = 1) =>
  api.get(`/doctor/reviews?page=${page}`);


