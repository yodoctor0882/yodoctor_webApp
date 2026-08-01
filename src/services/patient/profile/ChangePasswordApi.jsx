import api from "../../api";

export const ChangePasswordApi = async (payload) => {
  const res = await api.put("/patient/change-password", payload);
  return res.data;
};
