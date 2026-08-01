import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaLock, FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import { notify } from "../../../utils/notify";
import { ChangePasswordApi } from "../../../services/patient/profile/ChangePasswordApi";

const validateChangePassword = (currentPassword, newPassword, confirmPassword) => {
  const errors = {};
  if (!currentPassword) errors.currentPassword = "Current password is required";
  if (!newPassword) errors.newPassword = "New password is required";
  else if (newPassword.length < 8)
    errors.newPassword = "Must be at least 8 characters";
  if (newPassword !== confirmPassword)
    errors.confirmPassword = "Passwords do not match";
  return errors;
};

const getStrength = (password) => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const strengthMeta = [
  { label: "Too short",  color: "#ef4444" },
  { label: "Weak",       color: "#f97316" },
  { label: "Fair",       color: "#eab308" },
  { label: "Good",       color: "#22c55e" },
  { label: "Strong",     color: "#0e7490" },
];

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

const ChangePassword = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const strength = getStrength(newPassword);
  const meta = strengthMeta[strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateChangePassword(currentPassword, newPassword, confirmPassword);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length !== 0) return;

    try {
      setLoading(true);
      const res = await ChangePasswordApi({ currentPassword, newPassword, confirmPassword });
      notify.success(res.data?.message || "Password changed successfully");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      navigate("/client/dashboard");
    } catch (error) {
      notify.error(error.response?.data?.message || "Failed to change password");
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
        className={`w-full max-w-[900px] grid grid-cols-1 md:grid-cols-2 rounded-[28px] overflow-hidden transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.12)" }}
      >

        <div
          className="relative flex flex-col justify-between p-10 overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0c6680 0%, #0e7490 45%, #0891b2 80%, #06b6d4 100%)",
          }}
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/10" />
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full border border-white/10" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full border border-white/[0.07]" />
          <div className="absolute bottom-10 right-6 w-24 h-24 rounded-full border border-white/[0.12]" />

          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-[16px] bg-white/15 backdrop-blur-sm flex items-center justify-center mb-8"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
              <FaShieldAlt size={22} className="text-white" />
            </div>
            <h1 className="font-playfair text-[28px] font-bold text-white leading-tight mb-3">
              Security<br />Update
            </h1>
            <p className="font-dm text-[13px] text-white/65 leading-relaxed max-w-[220px]">
              Keep your account secure by using a strong, unique password that you don't use elsewhere.
            </p>
          </div>

          {/* Tips */}
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

        <div className="bg-white flex flex-col justify-center px-8 md:px-10 py-10">

          <h2 className="font-playfair text-[24px] font-bold text-[#1c2b33] mb-1">Change Password</h2>
          <p className="font-dm text-[13px] text-[#6b7f8a] mb-7">Update your credentials below</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <PasswordField
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              show={showCurrent}
              onToggle={() => setShowCurrent(!showCurrent)}
              error={errors.currentPassword}
            />

            <div className="flex flex-col gap-1">
              <PasswordField
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                show={showNew}
                onToggle={() => setShowNew(!showNew)}
                error={errors.newPassword}
              />

              {newPassword && (
                <div className="mt-1.5">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ backgroundColor: strength >= i ? meta.color : "#e5e7eb" }}
                      />
                    ))}
                  </div>
                  <p className="font-dm text-[11px]" style={{ color: meta.color }}>
                    {meta.label}
                  </p>
                </div>
              )}
            </div>

            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              error={errors.confirmPassword}
              hint={confirmPassword && !errors.confirmPassword && newPassword === confirmPassword ? "✓ Passwords match" : undefined}
            />

            <div className="h-px bg-black/[0.06] my-1" />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/client/dashboard")}
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
                    Updating…
                  </span>
                ) : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;