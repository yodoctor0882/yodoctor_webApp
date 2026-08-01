import api from "./api";

export const forgotPassword = (email) => {
  return api.post("/auth/forgot-password", {
    identifier: email,
  });
};

export const verifyReset = (token) => {
  return api.post("/auth/verify-reset", {
    token,
  });
};

export const resetPassword = (data) => {
  return api.post("/auth/reset-password", data);
};

// ================= DELETE ACCOUNT =================

export const deleteAccount = (data) => {
  return api.delete("/auth/account-deletion", {
    data,
  });
};