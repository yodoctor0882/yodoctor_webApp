import api from "../../../services/api";

/* ================= GET PROFILE ================= */
export const getDoctorProfile = () => {
  return api.get("/doctor/profile");
};

/* ================= UPDATE PROFILE ================= */
export const updateDoctorProfile = (payload) => {
  return api.put("/doctor/profile", payload);
};
