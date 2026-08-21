import React, { useState } from "react";
import { validateStep1 } from "../../controllers/FormValidation";
import { Eye, EyeOff } from "lucide-react";
import {
  createDoctorAccount,
} from "../../services/doctor/doctorRegisterServiceApi";
import { notify } from "../../utils/notify";
import { FaArrowRight } from "react-icons/fa";

const Step1Personal = ({ formData, setFormData, nextStep }) => {
  const data = formData.personal;
  const [errors, setErrors] = useState({});
  const maxWords = 100;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const wordCount =
    data.bio.trim() === "" ? 0 : data.bio.trim().split(/\s+/).length;

  const validateField = (name, value) => {
    const updatedData = { ...data, [name]: value };
    const validationErrors = validateStep1(updatedData);
    setErrors((prev) => ({ ...prev, [name]: validationErrors[name] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = name === "mobile" ? value.replace(/\D/g, "") : value;
    setFormData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [name]: cleanedValue },
    }));
    validateField(name, cleanedValue);
  };

  const handleSubmit = async () => {
    const validationErrors = validateStep1(data);

    if (Object.keys(validationErrors).length !== 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
  sessionStorage.removeItem("tempToken");
      const res = await createDoctorAccount(data);

      if (res.token) {
        sessionStorage.setItem("tempToken", res.token); 
      }

      notify.success(res.message || "Step 1 saved");

      if (res.nextStep) nextStep();

    } catch (error) {
      const errData = error.response?.data;

      if (errData?.errors) {
        setErrors(errData.errors);
      } else {
        notify.error(errData?.message || "Step failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field) =>
    [
      "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none",
      "font-[family-name:var(--font-dm)] placeholder:text-slate-400",
      "transition-all duration-200",
      errors[field]
        ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
        : "border-slate-200 bg-white/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
    ].join(" ");

  const labelCls =
    "block text-[12px] font-semibold uppercase tracking-widest text-slate-500 font-[family-name:var(--font-dm)]";

  const errMsgCls =
    "mt-1.5 flex items-center gap-1 text-xs text-red-500 font-[family-name:var(--font-dm)]";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-10 py-10 from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-violet-100/30 blur-3xl" />
      </div>

      <div className="w-full max-w-3xl animate-[var(--animate-fade-up)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/60 backdrop-blur-xl">

          <div className="border-b border-slate-100 px-6 sm:px-8 pt-7 pb-6">
            <SectionTitle
              gradient="from-blue-600 to-blue-700"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" />
                  <path
                    d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              }
              title="Basic Information"
            />

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={data.fullName}
                  onChange={handleChange}
                  placeholder="Dr. Arjun Mehta"
                  className={inputCls("fullName")}
                />
                {errors.fullName && (
                  <p className={errMsgCls}>
                    <ErrIcon />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className={labelCls}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                  placeholder="doctor@hospital.com"
                  className={inputCls("email")}
                />
                {errors.email && (
                  <p className={errMsgCls}>
                    <ErrIcon />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className={labelCls}>Mobile Number *</label>
                <input
                  type="text"
                  name="mobile"
                  maxLength={10}
                  value={data.mobile}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className={inputCls("mobile")}
                />
                {errors.mobile && (
                  <p className={errMsgCls}>
                    <ErrIcon />
                    {errors.mobile}
                  </p>
                )}
              </div>

              <div>
                <label className={labelCls}>Gender *</label>
                <select
                  name="gender"
                  value={data.gender}
                  onChange={handleChange}
                  className={inputCls("gender") + " cursor-pointer"}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className={errMsgCls}>
                    <ErrIcon />
                    {errors.gender}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-slate-100 px-6 sm:px-8 py-6">
            <SectionTitle
              gradient="from-indigo-500 to-violet-600"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L4 6v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6l-8-4z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              title="Account Security"
            />

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={data.password}
                    onChange={handleChange}
                    className={inputCls("password") + " pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className={errMsgCls}>
                    <ErrIcon />
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className={labelCls}>Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={data.confirmPassword}
                    onChange={handleChange}
                    className={inputCls("confirmPassword") + " pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className={errMsgCls}>
                    <ErrIcon />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 sm:px-8 pt-6 pb-7">
            <SectionTitle
              gradient="from-teal-500 to-cyan-600"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 6h16M4 10h16M4 14h10"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              }
              title="Professional Bio"
            />

            <div className="mt-5">
              <label className={labelCls}>About You *</label>
              <textarea
                rows={5}
                name="bio"
                value={data.bio}
                onChange={handleChange}
                placeholder="Share your clinical expertise, specializations, and what makes your practice unique..."
                className={[
                  "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none resize-y leading-relaxed",
                  "font-[family-name:var(--font-dm)] placeholder:text-slate-400 transition-all duration-200",
                  errors.bio
                    ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-slate-200 bg-white/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                ].join(" ")}
              />

              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-[family-name:var(--font-dm)]">
                  Minimum 15 words required
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        wordCount >= 15
                          ? "bg-gradient-to-r from-emerald-400 to-green-500"
                          : "bg-gradient-to-r from-red-400 to-rose-400"
                      }`}
                      style={{
                        width: `${Math.min((wordCount / maxWords) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span
                    className={`text-xs font-semibold tabular-nums font-[family-name:var(--font-dm)] ${
                      wordCount >= 15 ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {wordCount}/{maxWords}
                  </span>
                </div>
              </div>

              {errors.bio && (
                <p className={errMsgCls + " mt-1"}>
                  <ErrIcon />
                  {errors.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={[
              "w-full flex items-center justify-center gap-2.5 rounded-xl py-4",
              "text-sm font-semibold text-white tracking-wide",
              "font-[family-name:var(--font-dm)] transition-all duration-200 active:scale-[0.99]",
              loading
                ? "cursor-not-allowed bg-slate-300 shadow-none"
                : "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/35",
            ].join(" ")}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="3"
                  />
                  <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                Saving...
              </>
            ) : (
              <>
                Continue to Professional Details <FaArrowRight />
                
              </>
            )}
          </button>

          <p className="mt-3.5 text-center text-xs text-slate-400 font-[family-name:var(--font-dm)]">
            Your data is encrypted and stored securely.
          </p>
        </div>
      </div>
    </div>
  );
};


const SectionTitle = ({ gradient, icon, title }) => (
  <div className="flex items-center gap-3">
    <div
      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}
    >
      {icon}
    </div>
    <span className="text-[13px] font-semibold tracking-tight text-slate-800 font-[family-name:var(--font-dm)]">
      {title}
    </span>
  </div>
);

const ErrIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    className="flex-shrink-0"
  >
    <circle cx="6" cy="6" r="5.5" stroke="#ef4444" />
    <path
      d="M6 4v3M6 8.5v.5"
      stroke="#ef4444"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

export default Step1Personal;