import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaShieldAlt, FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import { notify } from "../../utils/notify";
import { forgotPassword } from "../../services/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validate = (val) => {
    if (!val) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Enter a valid email address";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    try {
      setLoading(true);
      const res = await forgotPassword(email);
      notify.success(res.data?.message || "Reset link sent successfully");
      setSent(true);
    } catch (err) {
      notify.error(err.response?.data?.message || "Something went wrong");
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
            background:
              "linear-gradient(145deg, #0c6680 0%, #0e7490 45%, #0891b2 80%, #06b6d4 100%)",
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
              Account<br />Recovery
            </h1>
            <p className="font-dm text-[13px] text-white/65 leading-relaxed max-w-[220px]">
              Enter your registered email and we'll send you a secure link to reset your password.
            </p>
          </div>

          {/* Bottom steps */}
          <div className="relative z-10 mt-8">
            <p className="font-dm text-[10px] font-semibold tracking-[0.1em] uppercase text-white/40 mb-3">
              What happens next
            </p>
            {[
              "Check your email inbox",
              "Click the reset link we send",
              "Create a new strong password",
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-2.5 mb-2">
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                  <span className="font-dm text-[9px] font-bold text-white/70">{i + 1}</span>
                </div>
                <p className="font-dm text-[12px] text-white/55">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="bg-white flex flex-col justify-center px-8 md:px-10 py-10">

          {!sent ? (
            <>
             

              <h2 className="font-playfair text-[24px] font-bold text-[#1c2b33] mb-1">
                Forgot Password?
              </h2>
              <p className="font-dm text-[13px] text-[#6b7f8a] mb-7">
                We'll send a reset link to your email address
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Email field */}
                <div className="flex flex-col gap-1">
                  <label className="font-dm text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6b7f8a]">
                    Email Address
                  </label>
                  <div
                    className={`flex items-center gap-2.5 px-4 py-[11px] rounded-[12px] border transition-all duration-200
                      ${error
                        ? "border-red-400 bg-red-50/50 focus-within:ring-2 focus-within:ring-red-200"
                        : "border-black/[0.08] bg-[#f8fafb] focus-within:border-[#0e7490] focus-within:ring-2 focus-within:ring-[rgba(14,116,144,0.12)] focus-within:bg-white"
                      }`}
                  >
                    <FaEnvelope size={12} className={error ? "text-red-400" : "text-[#b0c0c8]"} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      className="font-dm flex-1 bg-transparent border-none outline-none text-[14px] text-[#1c2b33] placeholder-[#c4cdd4]"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                  {error && (
                    <p className="font-dm text-[11px] text-red-500">{error}</p>
                  )}
                </div>

                <div className="h-px bg-black/[0.06] my-1" />

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 font-dm text-[13px] font-semibold text-[#6b7f8a] bg-[#f3f4f6] hover:bg-[#e8eaed] rounded-[12px] py-3 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 font-dm text-[13px] font-semibold text-white rounded-[12px] py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-px"
                    style={{
                      background: loading
                        ? "#0e7490"
                        : "linear-gradient(135deg, #0e7490, #0891b2)",
                      boxShadow: loading
                        ? "none"
                        : "0 4px 16px rgba(14,116,144,0.30)",
                    }}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2 justify-center">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : (
                      "Send Reset Link"
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
                <FaPaperPlane size={22} className="text-white" />
              </div>

              <h2 className="font-playfair text-[22px] font-bold text-[#1c2b33] mb-2">
                Check your inbox
              </h2>
              <p className="font-dm text-[13px] text-[#6b7f8a] leading-relaxed mb-1">
                We've sent a reset link to
              </p>
              <p className="font-dm text-[13px] font-semibold text-[#0e7490] mb-6">
                {email || "your email"}
              </p>

              {/* Steps */}
              <div className="w-full bg-[#f8fafb] border border-black/[0.06] rounded-[14px] p-4 mb-6 text-left">
                {[
                  "Open the email we sent you",
                  "Click the password reset link",
                  "Create your new password",
                ].map((step, i) => (
                  <div key={i} className={`flex items-center gap-3 ${i !== 2 ? "mb-3" : ""}`}>
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #0e7490, #0891b2)" }}
                    >
                      <span className="font-dm text-[9px] font-bold text-white">{i + 1}</span>
                    </div>
                    <p className="font-dm text-[12px] text-[#4b6070]">{step}</p>
                  </div>
                ))}
              </div>

              <p className="font-dm text-[12px] text-[#9aacb5] mb-5">
                Didn't receive it? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="text-[#0e7490] font-semibold hover:underline"
                >
                  try again
                </button>
              </p>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="font-dm inline-flex items-center gap-1.5 text-[12px] text-[#6b7f8a] hover:text-[#0e7490] transition-colors"
              >
                <FaArrowLeft size={10} />
                Back to login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;