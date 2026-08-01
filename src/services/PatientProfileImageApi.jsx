import api from "../services/api";

/* ================= UPLOAD IMAGE ================= */
export const uploadProfileImageApi = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  return api.post("/auth/upload-profile-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/* ================= GET IMAGE ================= */
export const getProfileImageApi = () => {
  return api.get("/auth/getprofile-image");
};

/* ================= UPDATE IMAGE ================= */
export const updateProfileImageApi = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  return api.put("/auth/updateprofile-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/* ================= DELETE IMAGE ================= */
export const deleteProfileImageApi = () => {
  return api.delete("/auth/deleteprofile-image"); // ✅ FIXED
};
