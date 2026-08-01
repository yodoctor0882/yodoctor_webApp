import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { notify } from "../../utils/notify";
import { resetPassword } from "../../services/authService";

const PasswordField = ({ label, value, onChange, show, onToggle, error, hint }) => (
  <div className="flex flex-col gap-1">
    <label className="font-dm text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6b7f8a]">
      {label}
    </label>
    <div
      className={`flex items-center gap-2.5 px-4 py-[11px] rounded-[12px] border transition-all duration-200
        ${error
          ? "border-red-400 bg-red-50/50 focus-within:ring-2 focus-within:ring-red-200"
          : "border-black/[0.08] bg-[#f8fafb] focus-within:border-[#0e7490] focus-within:ring-2 focus-within:ring-[rgba(14,116,144,0.12)] focus-within:bg-white"
        }`}
    >
      <FaLock size={12} className={error ? "text-red-400" : "text-[#b0c0c8]"} />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="font-dm flex-1 bg-transparent border-none outline-none text-[14px] text-[#1c2b33] placeholder-[#c4cdd4]"
        placeholder="••••••••"
      />
      <button type="button" onClick={onToggle} className="text-[#b0c0c8] hover:text-[#0e7490] transition-colors">
        {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
      </button>
    </div>
    {error && <p className="font-dm text-[11px] text-red-500">{error}</p>}
    {hint && !error && <p className="font-dm text-[11px] text-[#22c55e]">{hint}</p>}
  </div>
);

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const validate = () => {
    const errs = {};
    if (!form.newPassword) errs.newPassword = "New password is required";
    else if (form.newPassword.length < 8) errs.newPassword = "Must be at least 8 characters";
    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (form.newPassword !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length !== 0) return;

    try {
      setLoading(true);
      await resetPassword({ token, newPassword: form.newPassword, confirmPassword: form.confirmPassword });
      notify.success("Password reset successful");
      setSuccess(true);
    } catch (err) {
      notify.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="font-dm min-h-screen flex items-center justify-center bg-[#f5f3ef] px-4 py-10"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 10% 5%, rgba(14,116,144,0.06) 0%, transparent 50%), radial-gradient(ellipse at 90% 90%, rgba(14,116,144,0.04) 0%, transparent 50%)",
      }}
    >
      <div
        className={`w-full max-w-[900px] grid grid-cols-1 md:grid-cols-2 rounded-[28px] overflow-hidden transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.12)" }}
      >
        {/* ── Left Panel ── */}
        <div
          className="relative flex flex-col justify-between p-10 overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0c6680 0%, #0e7490 45%, #0891b2 80%, #06b6d4 100%)",
          }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/10" />
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full border border-white/10" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full border border-white/[0.07]" />
          <div className="absolute bottom-10 right-6 w-24 h-24 rounded-full border border-white/[0.12]" />

          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Top content */}
          <div className="relative z-10">
            <div
              className="w-14 h-14 rounded-[16px] bg-white/15 backdrop-blur-sm flex items-center justify-center mb-8"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
            >
              <FaShieldAlt size={22} className="text-white" />
            </div>
            <h1 className="font-playfair text-[28px] font-bold text-white leading-tight mb-3">
              Reset<br />Password
            </h1>
            <p className="font-dm text-[13px] text-white/65 leading-relaxed max-w-[220px]">
              Choose a new password that's strong and different from your previous one.
            </p>
          </div>

          {/* Password tips */}
          <div className="relative z-10 mt-8">
            <p className="font-dm text-[10px] font-semibold tracking-[0.1em] uppercase text-white/40 mb-3">
              Password Tips
            </p>
            {[
              "At least 8 characters long",
              "Mix uppercase & lowercase",
              "Include numbers & symbols",
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-2.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
                <p className="font-dm text-[12px] text-white/55">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="bg-white flex flex-col justify-center px-8 md:px-10 py-10">

          {!success ? (
            <>
              <h2 className="font-playfair text-[24px] font-bold text-[#1c2b33] mb-1">
                Set New Password
              </h2>
              <p className="font-dm text-[13px] text-[#6b7f8a] mb-7">
                Enter and confirm your new password below
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* New Password */}
                <div className="flex flex-col gap-1">
                  <PasswordField
                    label="New Password"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    show={showNew}
                    onToggle={() => setShowNew(!showNew)}
                    error={errors.newPassword}
                  />
                  {form.newPassword && (
                    <div className="mt-1.5">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                           
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <PasswordField
                  label="Confirm New Password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  show={showConfirm}
                  onToggle={() => setShowConfirm(!showConfirm)}
                  error={errors.confirmPassword}
                  hint={
                    form.confirmPassword && !errors.confirmPassword && form.newPassword === form.confirmPassword
                      ? "✓ Passwords match"
                      : undefined
                  }
                />

                <div className="h-px bg-black/[0.06] my-1" />

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/clientloginpage")}
                    className="flex-1 font-dm text-[13px] font-semibold text-[#6b7f8a] bg-[#f3f4f6] hover:bg-[#e8eaed] rounded-[12px] py-3 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 font-dm text-[13px] font-semibold text-white rounded-[12px] py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-px"
                    style={{
                      background: loading ? "#0e7490" : "linear-gradient(135deg, #0e7490, #0891b2)",
                      boxShadow: loading ? "none" : "0 4px 16px rgba(14,116,144,0.30)",
                    }}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2 justify-center">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Resetting…
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* ── Success State ── */
            <div className="flex flex-col items-center text-center py-4">
              <div
                className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-6"
                style={{
                  background: "linear-gradient(135deg, #0e7490, #0891b2)",
                  boxShadow: "0 8px 24px rgba(14,116,144,0.30)",
                }}
              >
                <FaCheckCircle size={26} className="text-white" />
              </div>

              <h2 className="font-playfair text-[22px] font-bold text-[#1c2b33] mb-2">
                Password Reset!
              </h2>
              <p className="font-dm text-[13px] text-[#6b7f8a] leading-relaxed mb-6 max-w-[220px]">
                Your password has been updated successfully. You can now log in with your new password.
              </p>

              <button
                type="button"
                onClick={() => navigate("/clientloginpage")}
                className="w-full font-dm text-[13px] font-semibold text-white rounded-[12px] py-3 transition-all hover:-translate-y-px"
                style={{
                  background: "linear-gradient(135deg, #0e7490, #0891b2)",
                  boxShadow: "0 4px 16px rgba(14,116,144,0.30)",
                }}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;