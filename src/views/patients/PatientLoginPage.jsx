
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { validateLoginForm } from "../../controllers/FormValidation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { patientLoginApi } from "../../services/patient/PatientLoginApi";
import { jwtDecode } from "jwt-decode";
import { notify } from "../../utils/notify";
import { auth, provider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import api from "../../services/api";

const ClientLoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");


  useEffect(() => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const raw =
    localStorage.getItem("loggedInUser") ||
    sessionStorage.getItem("loggedInUser");

  if (token && raw) {
    try {
      const user = JSON.parse(raw); 
      const role = user.role;       

      if (redirect) {
        navigate(redirect);
      } else {
        if (role === "ADMIN") navigate("/admin/dashboard");
        else if (role === "PATIENT") navigate("/client/dashboard");
        else notify.error("Unauthorized role");
      }
    } catch {}
  }

  setChecking(false);
}, []);

  if (checking) return null;

  const handleIdentifierChange = (e) => {
    const value = e.target.value;
    setIdentifier(value);
    setErrors(validateLoginForm({ identifier: value, password }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setErrors(validateLoginForm({ identifier, password: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await patientLoginApi({ identifier, password, portal: "USER", });
      const token = res.data.data.token;
      const decoded = jwtDecode(token);
      const role = decoded.role?.toUpperCase();
      const loggedInUser = { role, identifier };
      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
      }
      notify.success("Login successful");

      if (redirect) {
        navigate(redirect);
      } else {
        if (role === "ADMIN") navigate("/admin/dashboard");
        else if (role === "PATIENT") navigate("/client/dashboard");
        else notify.error("Unauthorized role");
      }
    } catch (err) {
      notify.error(err.response?.data?.message || "Login failed");
    }
  };

  const handleGoogleLogin = async () => {
  try {

    const result = await signInWithPopup(auth, provider);

    const firebaseToken = await result.user.getIdToken();

    const res = await api.post("/auth/google-login", {
      token: firebaseToken,
      portal: "USER",
    });

    const token = res.data.data.token;

    const decoded = jwtDecode(token);

    const role = decoded.role?.toUpperCase();

    const loggedInUser = {
      role,
      identifier: decoded.email,
    };

    if (rememberMe) {
      localStorage.setItem("token", token);
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(loggedInUser)
      );
    } else {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify(loggedInUser)
      );
    }

    notify.success("Login Successful");

    if (redirect) {
      navigate(redirect);
    } else {
      navigate("/client/dashboard");
    }

  } catch (err) {

    console.log(err);

    notify.error(
      err.response?.data?.message ||
      "Google Login Failed"
    );
  }
};

  const inputCls = (field) =>
    `w-full px-4 py-2.5 rounded-lg text-md text-gray-800 outline-none border transition-colors duration-150 ${
      errors[field]
        ? "border-red-400 bg-red-50"
        : "border-gray-200 bg-white focus:border-[#0086C3] focus:ring-1 focus:ring-[#0086C3]/20"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="text-center mb-4 mt-4">
          <h1 className=" font-[family-name:var(--font-playfair)] text-2xl font-bold text-gray-800 leading-tight">
            Login to{" "}
            <img
              src="/images/logo.webp"
              alt="YoDoctor"
              className="h-7 inline align-middle ml-1"
            />
          </h1>
        </div>

        <hr />

        <form onSubmit={handleLogin} className="px-8 py-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Phone Number / Email
            </label>
            <input
              type="text"
              value={identifier}
              placeholder="Enter phone or email"
              onChange={handleIdentifierChange}
              className={inputCls("identifier")}
            />
            {errors.identifier && (
              <p className="text-red-400 text-xs mt-1">{errors.identifier}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Enter password"
                onChange={handlePasswordChange}
                className={inputCls("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0086C3] transition-colors duration-150"
              >
                {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[#0086C3] cursor-pointer"
              />
              <span className="text-md text-gray-500">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => {
                notify.info("Redirecting to password reset...");
                navigate("/forgot-password");
              }}
              className="text-md text-red-400 hover:underline font-medium cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0086C3] hover:bg-[#006fa3] text-white cursor-pointer font-semibold text-md py-2.5 rounded-lg transition-colors duration-150 mt-1"
          >
            Login →
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-md text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 cursor-pointer rounded-lg border border-gray-200 hover:bg-gray-50 text-md font-medium text-gray-700 transition-colors duration-150"
          >
            <img src="/images/google.webp" alt="Google" className="h-4 w-4" />
            Sign in with Google
          </button>

          <p className="text-center text-md text-gray-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/clientregisterpage")}
              className="text-[#0086C3] font-semibold hover:underline cursor-pointer"
            >
              Register here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ClientLoginPage;
