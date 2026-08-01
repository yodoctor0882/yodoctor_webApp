import api from "../api";

/**
 * Manual appointment booking (Doctor only)
 */
export const createManualBookingApi = (payload) => {
  return api.post("/doctor/manualbooking", payload);
};