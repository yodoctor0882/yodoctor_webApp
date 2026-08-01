import React, { useState } from "react";
import { CalendarDays, User, Mail, Lock, Phone } from "lucide-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { validateRegisterForm } from "../../controllers/FormValidation";
import { notify } from "../../utils/notify";
import { PatientSignupApi } from "../../services/patient/PatientSignupApi";
import patientImg from "../../assets/patientRegistrationimage.webp";

const ClientRegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length !== 0) return;
    try {
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        gender: formData.gender.toUpperCase(),
        dob: formData.dob,
      };
      await PatientSignupApi(payload);
      notify.success("Registration successful!");
      navigate("/clientloginpage");
    } catch (error) {
      notify.error(error?.response?.data?.message || "Registration failed");
    }
  };

  const inputCls = (field) =>
    `w-full pl-10 pr-4 py-2.5 rounded-xl font-[family-name:var(--font-dm)] text-[16px] text-[#0c1e3a] outline-none transition-all duration-200 ${
      errors[field]
        ? "border-2 border-red-400 bg-red-50"
        : "border border-[rgba(12,30,58,0.15)] bg-white focus:border-2 focus:border-[#0086C3]"
    }`;

  const iconCls =
    "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg,#f0f4f8 0%,#e8f4fd 100%)" }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-r-full"
        style={{ background: "linear-gradient(180deg,#0086C3,#2ecc71)" }}
      />

      <div
        className="relative z-10 bg-white w-full max-w-5xl rounded-3xl overflow-hidden flex animate-[fadeUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]"
        style={{
          boxShadow: "0 8px 48px rgba(12,30,58,0.12)",
          border: "1px solid rgba(12,30,58,0.06)",
        }}
      >
        <div className="w-full md:w-1/2 px-8 md:px-12 py-10 flex flex-col justify-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-[26px] font-extrabold text-[#0c1e3a] mb-1">
            Create Patient Account
          </h2>
          <p
            className="font-[family-name:var(--font-dm)] text-[15px] mb-7"
            style={{ color: "#64748b" }}
          >
            Join us to manage your health with ease.
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <div className="relative">
                <User className={iconCls} size={16} color="#94a3b8" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className={inputCls("fullName")}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-400 text-[11px] mt-1 font-[family-name:var(--font-dm)]">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <Mail className={iconCls} size={16} color="#94a3b8" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={inputCls("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-[11px] mt-1 font-[family-name:var(--font-dm)]">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <Phone className={iconCls} size={16} color="#94a3b8" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="Mobile Number"
                  className={inputCls("phone")}
                />
              </div>
              {errors.phone && (
                <p className="text-red-400 text-[11px] mt-1 font-[family-name:var(--font-dm)]">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl font-[family-name:var(--font-dm)] text-[14px] outline-none transition-all duration-200 appearance-none ${
                  errors.gender
                    ? "border-2 border-red-400 bg-red-50 text-[#0c1e3a]"
                    : "border border-[rgba(12,30,58,0.15)] bg-white text-[#0c1e3a] focus:border-2 focus:border-[#0086C3]"
                }`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-400 text-[11px] mt-1 font-[family-name:var(--font-dm)]">
                  {errors.gender}
                </p>
              )}
            </div>
            <div>
              {" "}
              <div className="relative">
                {" "}
                <CalendarDays
                  className={iconCls}
                  size={16}
                  color="#94a3b8"
                />{" "}
                <input
                  type="date"
                  name="dob"
                  value={formData.dob || "Date of Birth"}
                  onChange={handleChange}
                  style={{ colorScheme: "light" }}
                  className={inputCls("dob")}
                  max={new Date().toISOString().split("T")[0]}
                />{" "}
              </div>{" "}
              {errors.dob && (
                <p className="text-red-400 text-[11px] mt-1 font-[family-name:var(--font-dm)]">
                  {" "}
                  {errors.dob}{" "}
                </p>
              )}{" "}
            </div>

            <div>
              <div className="relative">
                <Lock className={iconCls} size={16} color="#94a3b8" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`${inputCls("password")} pr-10`}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <FaEyeSlash size={14} />
                  ) : (
                    <FaEye size={14} />
                  )}
                </span>
              </div>
              {errors.password && (
                <p className="text-red-400 text-[11px] mt-1 font-[family-name:var(--font-dm)]">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock className={iconCls} size={16} color="#94a3b8" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className={`${inputCls("confirmPassword")} pr-10`}
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={14} />
                  ) : (
                    <FaEye size={14} />
                  )}
                </span>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-[11px] mt-1 font-[family-name:var(--font-dm)]">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full font-[family-name:var(--font-dm)] font-bold text-[15px] text-white py-3 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 mt-1"
              style={{
                background: "linear-gradient(135deg,#0086C3,#00b4d8)",
              }}
            >
              Register & Continue →
            </button>
          </form>

          <p
            className="mt-6 text-center font-[family-name:var(--font-dm)] text-[15px]"
            style={{ color: "#64748b" }}
          >
            Already have an account?{" "}
            <button
              onClick={() => navigate("/clientLoginpage")}
              className="font-semibold cursor-pointer hover:underline transition-all"
              style={{ color: "#0086C3", background: "none", border: "none" }}
            >
              Login here
            </button>
          </p>
        </div>

        <div
          className="hidden md:flex w-1/2 items-center justify-center rounded-r-3xl relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#e8f4fd,#d0eaff)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(rgba(0,134,195,0.2) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-20"
            style={{
              background: "radial-gradient(circle,#0086C3,transparent)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-40 h-40 rounded-full pointer-events-none opacity-15"
            style={{
              background: "radial-gradient(circle,#2ecc71,transparent)",
              filter: "blur(32px)",
            }}
          />
          <img
            src={patientImg}
            alt="Patient Registration"
            className="relative z-10 w-3/4 drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default ClientRegisterPage;
