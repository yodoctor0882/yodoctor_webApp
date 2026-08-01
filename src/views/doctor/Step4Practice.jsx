

import React, { useState } from "react";
import { CheckCircleIcon, BuildingOffice2Icon } from "@heroicons/react/24/solid";
import { validateStep4 } from "../../controllers/FormValidation";
import { updatePracticeDetails } from "../../services/doctor/doctorRegisterServiceApi";
import { notify } from "../../utils/notify";

const PRACTICE_OPTIONS = [
  { title: "Solo Practice",          desc: "Private clinic owned by you",               icon: "🏥" },
  { title: "Multi-Speciality Clinic", desc: "Shared practice with multiple doctors",    icon: "🏨" },
  { title: "Hospital Attached",      desc: "Located within a hospital premises",        icon: "🏦" },
  { title: "Visiting Consultant",    desc: "Consulting at various locations",           icon: "🚗" },
  { title: "Government Hospital",    desc: "Practicing in a public health facility",    icon: "🏛️" },
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
const Step4Practice = ({ formData, setFormData, nextStep, prevStep }) => {
  const data = formData.practice;
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const labelCls  = "block text-[12px] font-semibold uppercase tracking-widest text-slate-500 font-[family-name:var(--font-dm)]";
  const errMsgCls = "mt-1.5 flex items-center gap-1 text-xs text-red-500 font-[family-name:var(--font-dm)]";

  const handlePracticeSelect = (value) =>
    setFormData(prev => ({ ...prev, practice: { ...prev.practice, practiceType: value } }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, practice: { ...prev.practice, [name]: value } }));
  };

  const handleNext = async () => {
    const errs = validateStep4(data);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setLoading(true);
      const res = await updatePracticeDetails(data);
      notify.success(res.message || "Step 4 saved");
      if (res.nextStep) nextStep();
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      else notify.error(err.message || "Step 4 failed");
    } finally { setLoading(false); }
  };

  const isHospitalRequired =
    data.practiceType === "Hospital Attached" ||
    data.practiceType === "Government Hospital";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-10 py-10">

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-violet-100/30 blur-3xl" />
      </div>

      <div className="w-full max-w-3xl animate-[var(--animate-fade-up)]">

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/60 backdrop-blur-xl">

          <div className="border-b border-slate-100 px-6 sm:px-8 pt-7 pb-6">
            <SectionTitle
              gradient="from-blue-600 to-blue-700"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Practice Type"
            />

            <p className="mt-1 text-xs text-slate-400 font-[family-name:var(--font-dm)]">
              Select the type that best describes your practice
            </p>

            <div className="mt-5 space-y-3">
              {PRACTICE_OPTIONS.map((item) => {
                const selected = data.practiceType === item.title;
                return (
                  <div
                    key={item.title}
                    onClick={() => handlePracticeSelect(item.title)}
                    className={[
                      "flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
                      selected
                        ? "border-blue-500 bg-blue-50/60"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50/60",
                    ].join(" ")}
                  >
                    <div className={[
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                      selected ? "border-blue-600" : "border-slate-300",
                    ].join(" ")}>
                      {selected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                    </div>

                    <span className="text-xl leading-none flex-shrink-0">{item.icon}</span>

                    <div className="flex-1">
                      <p className={[
                        "text-sm font-semibold font-[family-name:var(--font-dm)]",
                        selected ? "text-blue-900" : "text-slate-800",
                      ].join(" ")}>
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 font-[family-name:var(--font-dm)]">
                        {item.desc}
                      </p>
                    </div>

                    {selected && (
                      <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {errors.practiceType && (
              <p className={errMsgCls + " mt-3"}><ErrIcon />{errors.practiceType}</p>
            )}
          </div>

          <div className="px-6 sm:px-8 pt-6 pb-7">
            <SectionTitle
              gradient="from-indigo-500 to-violet-600"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M9 22V12h6v10" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              }
              title="Affiliated Hospital / Clinic"
            />

            <div className="mt-5">
              <label className={labelCls}>
                Hospital or Clinic Name
                {isHospitalRequired
                  ? <span className="text-red-500 ml-1">*</span>
                  : <span className="text-slate-400 font-normal ml-1 normal-case tracking-normal">(Optional)</span>
                }
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="hospitalName"
                  value={data.hospitalName || ""}
                  onChange={handleChange}
                  placeholder="e.g. City General Hospital"
                  className={[
                    "mt-2 w-full rounded-xl border px-4 py-3 pr-12 text-sm outline-none",
                    "font-[family-name:var(--font-dm)] placeholder:text-slate-400 transition-all duration-200",
                    errors.hospitalName
                      ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-slate-200 bg-white/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                  ].join(" ")}
                />
                <BuildingOffice2Icon className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 translate-y-[-30%]" />
              </div>
              {errors.hospitalName && (
                <p className={errMsgCls}><ErrIcon />{errors.hospitalName}</p>
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

          <button
            onClick={handleNext}
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
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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

export default Step4Practice;