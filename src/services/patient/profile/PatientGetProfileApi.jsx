import api from "../../api";

export const PatientGetProfileApi = async () => {
  const res = await api.get("/patient/getprofile");
  return res.data;
};