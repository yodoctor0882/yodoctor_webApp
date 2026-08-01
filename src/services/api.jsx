import axios from "axios";

// console.log("API BASE URL 👉", import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST INTERCEPTOR ================= */
/* ✅ YAHI SABSE IMPORTANT PART THA */
api.interceptors.request.use(
  (config) => {
    const token =
  sessionStorage.getItem("tempToken") ||
  localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    // ✅ sirf REAL token expiry par logout
    if (status === 401 && message === "Invalid or expired token") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    // optional logging
    if (error.response) {
      console.error("API Error:", status, error.response.data);
    } else {
      console.error("Network error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;




