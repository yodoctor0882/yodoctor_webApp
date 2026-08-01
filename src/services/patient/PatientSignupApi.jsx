import api from "../api";


export const PatientSignupApi = (payload) => {
  return api.post("/patient/register", payload);
};
