import api from "../../api";

export const PatientUpdateProfileApi = async (payload) => {
  const res = await api.put("/patient/updateProfile", payload);
  return res.data;
};