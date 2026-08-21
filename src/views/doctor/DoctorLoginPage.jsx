import React, { useState, useEffect } from "react";
import { validateDoctorLogin } from "../../controllers/FormValidation";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { notify } from "../../utils/notify";
import { DoctorLoginApi } from "../../services/doctor/DoctorLoginApi";
import loginimageImg from "../../assets/loginimage.webp";
import api from "../../services/api";
import { useLocation } from "react-router-dom";



const DoctorLoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formValues, setFormValues] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formValues, [name]: value };
    setFormValues(updated);
    const fieldErrors = validateDoctorLogin(updated);
    setErrors({ ...errors, [name]: fieldErrors[name] });
  };

  const handleForgotPassword = () => {
    notify.info("Redirecting to password reset...");
    navigate("/forgot-password");
  };

  useEffect(() => {
    if (location.state?.message) {
      notify.info(location.state.message);

      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await DoctorLoginApi({
        identifier: formValues.identifier,
        password: formValues.password,
        portal: "DOCTOR",
      });

      const token = res.data.data.token;
      const redirect = res.data.redirect;
      const nextStep = res.data.nextStep;
      const status = res.data.status;
      const paymentStatus =
        res.data?.paymentStatus || res.data?.data?.paymentStatus || "inactive";

      const loggedInUser = {
        role: "DOCTOR",
        identifier: formValues.identifier,
        status,
        paymentStatus,
      };

      window.dispatchEvent(new Event("userLogin"));

      // ================= DASHBOARD =================

      if (redirect === "dashboard") {
        if (rememberMe) {
          localStorage.setItem("token", token);
          localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
        } else {
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
        }

        try {
          const subRes = await api.get("/razorpay/subscriptions/active", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (subRes?.data?.success && subRes?.data?.data?.subscription) {
            notify.success("Doctor login successful");

            // update latest payment status
            loggedInUser.paymentStatus = "active";

            if (rememberMe) {
              localStorage.setItem(
                "loggedInUser",
                JSON.stringify(loggedInUser),
              );
            } else {
              sessionStorage.setItem(
                "loggedInUser",
                JSON.stringify(loggedInUser),
              );
            }

            navigate("/doctordashboard/dashboard");
          } else {
            loggedInUser.paymentStatus = "inactive";

            if (rememberMe) {
              localStorage.setItem(
                "loggedInUser",
                JSON.stringify(loggedInUser),
              );
            } else {
              sessionStorage.setItem(
                "loggedInUser",
                JSON.stringify(loggedInUser),
              );
            }

            notify.info("Please complete subscription payment");

            navigate("/payment", {
              replace: true,
            });
          }
        } catch (err) {
          console.error(err);

          if (err?.response?.status === 404) {
            loggedInUser.paymentStatus = "inactive";

            if (rememberMe) {
              localStorage.setItem(
                "loggedInUser",
                JSON.stringify(loggedInUser),
              );
            } else {
              sessionStorage.setItem(
                "loggedInUser",
                JSON.stringify(loggedInUser),
              );
            }

            notify.info("Please complete subscription payment");

            navigate("/payment", {
              replace: true,
            });

            return;
          }

          notify.error("Unable to verify subscription. Please try again.");

          return;
        }
      }

      // ================= RESUME REGISTRATION =================

      if (redirect === "resume") {
        notify.info("Resume your registration");

        sessionStorage.setItem("tempToken", token);

        navigate(`/doctorregistration?step=${nextStep}`);
        return;
      }

      // ================= WAITING APPROVAL =================

      if (redirect === "waiting-approval") {
        notify.info("Your profile is under verification");

        sessionStorage.setItem("tempToken", token);

        navigate("/approvalstatuspage");
        return;
      }
    } catch (err) {
      notify.error(
        err.response?.data?.message || "Invalid email/mobile or password",
      );
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    const loginToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const raw =
      localStorage.getItem("loggedInUser") ||
      sessionStorage.getItem("loggedInUser");

    if (loginToken && raw) {
      const user = JSON.parse(raw);

      if (user.role === "DOCTOR") {
        if (user.status === "APPROVED" && user.paymentStatus === "active") {
          navigate("/doctordashboard", {
            replace: true,
          });
          return;
        }

        if (user.status === "APPROVED" && user.paymentStatus !== "active") {
          navigate("/payment", {
            replace: true,
          });
          return;
        }

        if (user.status === "PENDING") {
          navigate("/approvalstatuspage", {
            replace: true,
          });
          return;
        }
      }
    }
  }, [navigate]);

  const inputCls = (field) =>
    `w-full px-4 py-2.5 rounded-lg text-sm text-gray-800 outline-none border transition-colors duration-150 ${
      errors[field]
        ? "border-red-400 bg-red-50"
        : "border-gray-200 bg-white focus:border-[#0086C3] focus:ring-1 focus:ring-[#0086C3]/20"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden md:flex shadow-md border border-gray-100">
        <div className="w-full md:w-1/2 bg-white px-8 py-10 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className=" font-[family-name:var(--font-playfair)] text-3xl font-bold text-gray-800 leading-tight">
              Login to{" "}
              <img
                src="/images/logo.webp"
                alt="YoDoctor"
                className="h-7 inline align-middle ml-1"
              />
            </h1>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Email / Mobile Number
              </label>
              <input
                type="text"
                name="identifier"
                value={formValues.identifier}
                placeholder="Enter email or mobile number"
                onChange={handleChange}
                className={inputCls("identifier")}
              />
              {errors.identifier && (
                <p className="text-red-400 text-xs mt-1">{errors.identifier}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formValues.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className={inputCls("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0086C3] transition-colors duration-150"
                >
                  {showPassword ? (
                    <FaEyeSlash size={15} />
                  ) : (
                    <FaEye size={15} />
                  )}
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
                <span className="text-sm text-gray-500">Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-red-400 font-medium hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#0086C3] hover:bg-[#006fa3] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-lg transition-colors duration-150"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin " />
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();

                  navigate("/doctorregistration");
                }}
                className="flex-1 text-[#0086C3] cursor-pointer border border-[#0086C3]/40 hover:bg-[#0086C3]/5 font-semibold text-sm py-2.5 rounded-lg transition-colors duration-150"
              >
                Register
              </button>
            </div>
             {/* <button
                type="button"
                className="flex-1 text-[#0086C3] cursor-pointer border border-[#0086C3]/40 hover:bg-[#0086C3]/5 font-semibold text-sm py-2.5 rounded-lg transition-colors duration-150"
              >
                Check Status
              </button> */}

          </form>
        </div>

        <div className="hidden md:flex w-1/2 relative items-end justify-center overflow-hidden bg-[#0086C3]">
          <img
            src={loginimageImg}
            alt="doctor"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default DoctorLoginPage;
