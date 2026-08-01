import api from "./api";
/* ================= APPOINTMENTS ================= */
export const getIncomingAppointments = () =>
  api.get("/doctor/appointments/incoming");

export const respondAppointment = (id, action) =>
  api.put(`/doctor/respond-appointment/${id}`, { action });

export const startAppointment = (id) =>
  api.put(`/doctor/appointments/${id}/start`);   // ✅ FIXED

export const completeAppointment = (id) =>
  api.put(`/doctor/appointments/${id}/complete`); // ✅ FIXED