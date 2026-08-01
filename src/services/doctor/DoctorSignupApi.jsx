import api from "../api"; // axios instance

export const DoctorSignupApi = async (payload) => {
  try {
    const res = await api.post("/doctor/register", payload);
    return res.data;
  } catch (error) {
    console.error("Doctor register error 👉", error.response?.data);

    throw (
      error.response?.data || {
        message: "Server error while registering doctor",
      }
    );
  }
};
