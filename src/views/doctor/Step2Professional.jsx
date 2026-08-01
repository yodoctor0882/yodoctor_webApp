
import React, { useState } from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import { updateProfessionalDetails } from "../../services/doctor/doctorRegisterServiceApi";
import { notify } from "../../utils/notify";
import { FaArrowRight } from "react-icons/fa";

const validateStep2 = (data) => {
  const errors = {};
  const q  = data.qualification?.trim()  || "";
  const s  = data.specialization?.trim() || "";
  const e  = data.experience?.trim()     || "";
  const r  = data.regNumber?.trim()      || "";
  const sc = data.stateCouncil?.trim()   || "";
  const v  = data.validTill              || "";

  if (!q) errors.qualification = "Qualification is required";

  if (!s) errors.specialization = "Specialization is required";
  else if (s.length < 3) errors.specialization = "Minimum 3 characters";
  else if (!/^[a-zA-Z\s&-]+$/.test(s)) errors.specialization = "Only letters allowed";

  if (!e) errors.experience = "Experience is required";
  else if (!/^\d+$/.test(e)) errors.experience = "Must be a number";
  else { const n = Number(e); if (n < 0) errors.experience = "Cannot be negative"; else if (n > 60) errors.experience = "Cannot exceed 60 years"; }

  if (!r) errors.regNumber = "Registration number is required";
  else if (r.length < 5) errors.regNumber = "Too short";
  else if (r.length > 20) errors.regNumber = "Too long";
  else if (!/^[a-zA-Z0-9-/]+$/.test(r)) errors.regNumber = "Only letters, numbers, dash allowed";

  if (!sc) errors.stateCouncil = "State council is required";
  else if (sc.length < 3) errors.stateCouncil = "Too short";
  else if (!/^[a-zA-Z\s]+$/.test(sc)) errors.stateCouncil = "Only letters allowed";

  if (!v) errors.validTill = "Expiry date is required";
  else { const d = new Date(v), now = new Date(); now.setHours(0,0,0,0); if (d <= now) errors.validTill = "Must be a future date"; }

  return errors;
};

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
const Step2Professional = ({ formData, setFormData, nextStep }) => {
  const data = formData.professional;
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const getToday = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
};

const today = getToday();

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

  const validateField = (name, value) => {
    const errs = validateStep2({ ...data, [name]: value });
    setErrors(prev => ({ ...prev, [name]: errs[name] }));
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "experience") value = value.replace(/\D/g, "");
    if (name === "regNumber")  value = value.toUpperCase();
    setFormData(prev => ({ ...prev, professional: { ...prev.professional, [name]: value } }));
    validateField(name, value);
  };

  const handleSubmit = async () => {
    const errs = validateStep2(data);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setLoading(true);
      const res = await updateProfessionalDetails(data);
      console.log("Sending Data:", data);
      notify.success(res.message || "Step 2 saved");
      if (res.nextStep) nextStep();
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      else notify.error(err.message || "Step 2 failed");
    } finally { setLoading(false); }
  };

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
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Qualifications"
            />

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className={labelCls}>Primary Qualification *</label>
                <select
                  name="qualification"
                  value={data.qualification || ""}
                  onChange={handleChange}
                  className={inputCls("qualification") + " cursor-pointer mt-2"}
                >
                  <option value="">Select qualification</option>
                  {["MBBS","MD","MS","BDS","MDS","BAMS","BHMS","Other"].map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                {errors.qualification && (
                  <p className={errMsgCls}><ErrIcon />{errors.qualification}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Specialization *</label>
                <input
                  type="text"
                  name="specialization"
                  value={data.specialization || ""}
                  onChange={handleChange}
                  placeholder="e.g. Cardiology"
                  className={inputCls("specialization")}
                />
                {errors.specialization && (
                  <p className={errMsgCls}><ErrIcon />{errors.specialization}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Years of Experience *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="experience"
                    value={data.experience || ""}
                    onChange={handleChange}
                    placeholder="e.g. 8"
                    className={inputCls("experience") + " pr-14"}
                  />
                  <span className="absolute right-4 top-1/2 translate-y-[-30%] text-xs font-semibold text-slate-400 pointer-events-none">
                    yrs
                  </span>
                </div>
                {errors.experience && (
                  <p className={errMsgCls}><ErrIcon />{errors.experience}</p>
                )}
              </div>

            </div>
          </div>

          <div className="border-b border-slate-100 px-6 sm:px-8 py-6">
            <SectionTitle
              gradient="from-indigo-500 to-violet-600"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 6v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6l-8-4z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Council Registration"
            />

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className={labelCls}>Registration Number *</label>
                <input
                  type="text"
                  name="regNumber"
                  value={data.regNumber || ""}
                  onChange={handleChange}
                  placeholder="e.g. MH-12345678"
                  className={inputCls("regNumber")}
                />
                {errors.regNumber && (
                  <p className={errMsgCls}><ErrIcon />{errors.regNumber}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Registering State Council *</label>
                <input
                  type="text"
                  name="stateCouncil"
                  value={data.stateCouncil || ""}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra Medical Council"
                  className={inputCls("stateCouncil")}
                />
                {errors.stateCouncil && (
                  <p className={errMsgCls}><ErrIcon />{errors.stateCouncil}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Registration Valid Till *</label>
                <input
                  type="date"
                  name="validTill"
                  min={today}
                  value={data.validTill || ""}
                  onChange={handleChange}
                  className={inputCls("validTill")}
                />
                {errors.validTill && (
                  <p className={errMsgCls}><ErrIcon />{errors.validTill}</p>
                )}
              </div>

            </div>
          </div>

          <div className="px-6 sm:px-8 pt-6 pb-7">
            <SectionTitle
              gradient="from-teal-500 to-cyan-600"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              }
              title="Verification"
            />

            <div className="mt-5 flex items-start gap-3.5 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
                <path d="M12 2L4 6v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6l-8-4z" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm text-slate-600 leading-relaxed font-[family-name:var(--font-dm)]">
                We may verify your credentials with medical councils to ensure platform integrity and patient safety.
              </p>
            </div>
          </div>

        </div>

       <div className="mt-5 flex items-center justify-end gap-3">

          

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={[
              "flex items-center gap-2 rounded-xl px-5 py-3",
              "text-sm font-semibold text-white tracking-wide",
              "font-[family-name:var(--font-dm)] transition-all duration-200 active:scale-[0.99]",
              loading
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
                Saving...
              </>
            ) : (
              <>
                Next <FaArrowRight />
              </>
            )}
          </button>

        </div>

        <p className="mt-3.5 text-center text-xs text-slate-400 font-[family-name:var(--font-dm)]">
          Your data is encrypted and stored securely.
        </p>

      </div>
    </div>
  );
};

export default Step2Professional;