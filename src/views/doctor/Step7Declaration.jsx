
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateStep7 } from "../../controllers/FormValidation";
import { submitDoctorRegistration } from "../../services/doctor/doctorRegisterServiceApi";
import { notify } from "../../utils/notify";

const DECLARATIONS = [
  {
    key: "accurate",
    icon: "📋",
    title: "Accuracy of Information",
    text: "I declare that all information provided in this registration is accurate, complete, and up to date.",
  },
  {
    key: "display",
    icon: "🌐",
    title: "Public Profile Consent",
    text: "I authorize Levesque Private Limited to display my professional information publicly for patient booking.",
  },
  {
    key: "privacy",
    icon: "🔒",
    title: "Data Processing Consent",
    text: "I consent to the processing and storage of my personal data as per the platform's Privacy Policy.",
  },
  {
    key: "terms",
    icon: "📄",
    title: "Terms & Policies",
    text: "I agree to the platform's Terms of Service, Cancellation Policy, and Refund Policy.",
  },
];

const SectionTitle = ({ gradient, icon, title }) => (
  <div className="flex items-center gap-3">
    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}>
      {icon}
    </div>
    <span className="text-[13px] font-semibold tracking-tight text-slate-800 font-[family-name:var(--font-dm)]">
      {title}
    </span>
  </div>
);

const ErrIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
    <circle cx="6" cy="6" r="5.5" stroke="#ef4444" />
    <path d="M6 4v3M6 8.5v.5" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/* ══════════════════════════════════════════ */
const Step7Declaration = ({ formData, prevStep }) => {
  const navigate  = useNavigate();
  const [checked, setChecked] = useState({ accurate: false, display: false, privacy: false, terms: false });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const toggle     = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  const allChecked = Object.values(checked).every(Boolean);
  const doneCount  = Object.values(checked).filter(Boolean).length;

  const handleSubmit = async () => {
    const errs = validateStep7(checked);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await submitDoctorRegistration(checked);
      notify.success(res.message || "Registration submitted successfully");
      localStorage.removeItem("doctor_form_data");
      localStorage.removeItem("doctor_step");
      navigate("/approvalstatuspage");
    } catch (err) {
      setErrors({ general: err.message || "Registration failed" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-10 py-10">

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-violet-100/30 blur-3xl" />
      </div>

      <div className="w-full max-w-3xl animate-[var(--animate-fade-up)]">

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/60 backdrop-blur-xl">

          <div className="border-b border-slate-100 px-6 sm:px-8 pt-7 pb-7">
            <SectionTitle
              gradient="from-blue-600 to-blue-700"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Legal Declarations"
            />
            <p className=" my-2 text-xs text-slate-400 font-[family-name:var(--font-dm)]">
              Please review and accept all declarations before submitting
            </p>



            <div className="space-y-3">
              {DECLARATIONS.map(item => {
                const isChecked = checked[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => toggle(item.key)}
                    className={[
                      "flex items-start gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
                      isChecked
                        ? "border-blue-500 bg-blue-50/60"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50/60",
                    ].join(" ")}
                  >
                    <div className={[
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                      isChecked ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white",
                    ].join(" ")}>
                      {isChecked && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round">
                          <path d="M5 13l4 4L19 7"/>
                        </svg>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm leading-none">{item.icon}</span>
                        <p className={[
                          "text-sm font-semibold font-[family-name:var(--font-dm)]",
                          isChecked ? "text-blue-900" : "text-slate-800",
                        ].join(" ")}>
                          {item.title}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-[family-name:var(--font-dm)]">
                        {item.text}
                      </p>
                      {errors[item.key] && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 font-[family-name:var(--font-dm)]">
                          <ErrIcon />{errors[item.key]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.general && (
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/60 px-4 py-3.5">
                <ErrIcon />
                <p className="text-sm font-semibold text-red-600 font-[family-name:var(--font-dm)]">
                  {errors.general}
                </p>
              </div>
            )}
          </div>

          <div className="px-6 sm:px-8 pt-6 pb-7">
            <SectionTitle
              gradient="from-indigo-500 to-violet-600"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Submit Registration"
            />

            <div className="mt-5">
              <button
                onClick={handleSubmit}
                disabled={!allChecked || loading}
                className={[
                  "w-full flex items-center justify-center gap-2.5 rounded-xl py-4",
                  "text-sm font-semibold text-white tracking-wide",
                  "font-[family-name:var(--font-dm)] transition-all duration-200 active:scale-[0.99]",
                  !allChecked || loading
                    ? "cursor-not-allowed bg-slate-300 shadow-none"
                    : "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/35",
                ].join(" ")}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Registration
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>

              {!allChecked && (
                <p className="text-center text-xs text-slate-400 mt-3 font-[family-name:var(--font-dm)]">
                  Accept all {4 - doneCount} remaining declaration{4 - doneCount > 1 ? "s" : ""} to continue
                </p>
              )}
            </div>
          </div>

        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 tracking-wide font-[family-name:var(--font-dm)] border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 active:scale-[0.99]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        </div>

        <p className="mt-3.5 text-center text-xs text-slate-400 font-[family-name:var(--font-dm)]">
          Your data is encrypted and stored securely.
        </p>

      </div>
    </div>
  );
};

export default Step7Declaration;