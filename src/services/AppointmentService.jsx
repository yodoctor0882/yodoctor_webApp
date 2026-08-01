import api from "./api";

const AppointmentService = {

  /* ================= HISTORY ================= */
  getHistory: async (cursor = null) => {

    const params = {};

    if (cursor && typeof cursor === "string") {
      params.cursor = cursor;
    }

    const res = await api.get("/patient/visit/appointments/history", { params });

    const appointments = res.data?.data || [];

    return {
      data: appointments.map((item) => ({
        id: item.id,
        doctorName: item.doctorName,
        specialization: item.specialization,
        date: item.appointment_date,
        shift: item.appointment_slot,
        token: item.token_number,
        status: item.status,
        doctorId: item.doctorId,
        profile_image: item.profile_image,
         patientName: item.patientName,
         isFamily: item.isFamily,
      })),
      nextCursor: res.data?.nextCursor || null,
    };
  },

  /* ================= CANCEL ================= */
  cancel: async (id) => {
    const res = await api.put(`/patient/visit/appointments/${id}/cancel`);
    return res.data;
  },

  /* ================= RATE DOCTOR ================= */
  rateDoctor: async ({ appointmentId, rating, comment = "" }) => {
    const res = await api.post("/patient/doctor-feedback", {
      appointmentId,
      rating,
      comment,
    });

    return res.data;
  },
};

export default AppointmentService;