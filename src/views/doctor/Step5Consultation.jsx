
import React, { useState } from "react";
import { validateStep5 } from "../../controllers/FormValidation";
import { updateConsultationDetails } from "../../services/doctor/doctorRegisterServiceApi";
import { notify } from "../../utils/notify";

const DAYS = [
  { label: "Mon", value: "Mon"  },
  { label: "Tue", value: "Tue"  },
  { label: "Wed", value: "Wed"  },
  { label: "Thu", value: "Thu" },
  { label: "Fri", value: "Fri"  },
  { label: "Sat", value: "Sat"  },
  { label: "Sun", value: "Sun" },
];

const DURATIONS = ["10 mins", "15 mins", "20 mins", "30 mins"];

const allTimeOptions = Array.from({ length: 17 }, (_, i) => {
  const h24 = i + 5;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { value: h24, label: `${h12}:00 ${h24 < 12 ? "AM" : "PM"}` };
});

// Morning: 5 AM → 12 PM
const morningOptions = allTimeOptions.filter(t => t.value >= 5 && t.value <= 12);

// Evening: 12 PM → 10 PM
const eveningOptions = allTimeOptions.filter(t => t.value >= 12 && t.value <= 22);

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

const Toggle = ({ enabled, onToggle, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <div
      onClick={onToggle}
      className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-all duration-200 cursor-pointer
        ${enabled ? "bg-blue-600" : "bg-slate-200"}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </div>
    <span className="text-sm font-semibold text-slate-700 font-[family-name:var(--font-dm)]">{label}</span>
  </label>
);

const ShiftBlock = ({ label, enabled, onToggle, start, onStart, end, onEnd, options, labelCls, selectCls }) => (
  <div className={`rounded-xl border-2 p-5 transition-all duration-200 ${enabled ? "border-blue-200 bg-blue-50/40" : "border-slate-200 bg-white/60"}`}>
    <Toggle enabled={enabled} onToggle={onToggle} label={label} />
    {enabled && (
      <div className="grid grid-cols-2 gap-4 mt-5">
        <div>
          <label className={labelCls}>Start Time</label>
          <select value={start || ""} onChange={onStart} className={selectCls}>
            <option value="">Select</option>
            {options.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>End Time</label>
          <select value={end || ""} onChange={onEnd} className={selectCls}>
            <option value="">Select</option>
            {options.filter(t => t.value > start).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
    )}
  </div>
);

/* ══════════════════════════════════════════ */
const Step5Consultation = ({ formData, setFormData, nextStep, prevStep }) => {
  const data = formData.consultation || {};
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const labelCls  = "block text-[12px] font-semibold uppercase tracking-widest text-slate-500 font-[family-name:var(--font-dm)] mb-1.5";
  const errMsgCls = "mt-1.5 flex items-center gap-1 text-xs text-red-500 font-[family-name:var(--font-dm)]";
  const selectCls = [
    "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none cursor-pointer",
    "font-[family-name:var(--font-dm)] transition-all duration-200",
    "border-slate-200 bg-white/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
  ].join(" ");

  const update = (field, value) =>
    setFormData(prev => ({ ...prev, consultation: { ...prev.consultation, [field]: value } }));

  const toggleDay = (day) => {
    const days = data.selectedDays?.includes(day)
      ? data.selectedDays.filter(d => d !== day)
      : [...(data.selectedDays || []), day];
    update("selectedDays", days);
  };

  const handleNext = async () => {
    const errs = validateStep5(data);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setLoading(true);
      const res = await updateConsultationDetails(data);
      notify.success(res.message || "Step 5 saved");
      if (res.nextStep) nextStep();
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      else notify.error(err.message || "Step 5 failed");
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
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Fees & Duration"
            />

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">

              <div>
                <label className={labelCls}>Consultation Fee (₹) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 translate-y-[-30%] text-sm font-bold text-slate-400 pointer-events-none">₹</span>
                  <input
                    type="text"
                    value={data.fee || ""}
                    onChange={e => update("fee", e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 500"
                    className={[
                      "mt-2 w-full rounded-xl border px-4 py-3 pl-9 text-sm outline-none",
                      "font-[family-name:var(--font-dm)] placeholder:text-slate-400 transition-all duration-200",
                      errors.fee
                        ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 bg-white/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                    ].join(" ")}
                  />
                </div>
                {errors.fee && <p className={errMsgCls}><ErrIcon />{errors.fee}</p>}
              </div>

              <div>
                <label className={labelCls}>Avg. Duration *</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DURATIONS.map(d => (
                    <button
                      key={d} type="button"
                      onClick={() => update("duration", d)}
                      className={[
                        "px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all duration-200",
                        "font-[family-name:var(--font-dm)]",
                        data.duration === d
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-slate-200 text-slate-600 hover:border-blue-300",
                      ].join(" ")}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                {errors.duration && <p className={errMsgCls}><ErrIcon />{errors.duration}</p>}
              </div>

            </div>
          </div>

          <div className="border-b border-slate-100 px-6 sm:px-8 py-6">
            <SectionTitle
              gradient="from-indigo-500 to-violet-600"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Available Days"
            />

            <div className="mt-5 flex flex-wrap gap-2">
              {DAYS.map(day => {
                const active = data.selectedDays?.includes(day.value);
                return (
                  <button
                    key={day.value} type="button"
                    onClick={() => toggleDay(day.value)}
                    className={[
                      "px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all duration-200",
                      "font-[family-name:var(--font-dm)]",
                      active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-slate-200 text-slate-600 hover:border-blue-300",
                    ].join(" ")}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            {errors.selectedDays && <p className={errMsgCls + " mt-2"}><ErrIcon />{errors.selectedDays}</p>}
          </div>

          <div className="px-6 sm:px-8 pt-6 pb-7">
            <SectionTitle
              gradient="from-teal-500 to-cyan-600"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Shift Timings"
            />

            <div className="mt-5 space-y-3">
              <ShiftBlock
                label="Morning Shift"
                enabled={data.morningEnabled || false}
                onToggle={() => update("morningEnabled", !data.morningEnabled)}
                start={data.morningStart} end={data.morningEnd}
                options={morningOptions}
                labelCls={labelCls}
                selectCls={selectCls}
                onStart={e => { const v = Number(e.target.value); update("morningStart", v); if (data.morningEnd <= v) update("morningEnd", ""); }}
                onEnd={e => update("morningEnd", Number(e.target.value))}
              />
              <ShiftBlock
                label="Evening Shift"
                enabled={data.eveningEnabled || false}
                onToggle={() => update("eveningEnabled", !data.eveningEnabled)}
                start={data.eveningStart} end={data.eveningEnd}
                options={eveningOptions}
                labelCls={labelCls}
                selectCls={selectCls}
                onStart={e => { const v = Number(e.target.value); update("eveningStart", v); if (data.eveningEnd <= v) update("eveningEnd", ""); }}
                onEnd={e => update("eveningEnd", Number(e.target.value))}
              />
            </div>
            {errors.shifts && <p className={errMsgCls + " mt-2"}><ErrIcon />{errors.shifts}</p>}
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

export default Step5Consultation;