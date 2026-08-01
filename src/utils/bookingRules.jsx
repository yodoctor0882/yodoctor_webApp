// src/utils/bookingRules.js
export const canBookAppointment = (patientId) => {
  const history = JSON.parse(localStorage.getItem("appointments")) || [];

  const noShows = history.filter(
    (a) => a.patientId === patientId && a.status === "No-Show"
  );

  return noShows.length < 3;
};
