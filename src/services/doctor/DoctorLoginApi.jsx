import api from "../../services/api";

export const DoctorLoginApi = async (loginData) => {
  try {
    const response = await api.post("/auth/login", loginData);
    return response; 
  } catch (error) {
    throw error;
  }
};