import { validateStep3 } from "../../controllers/FormValidation";
import React, { useState, useRef, useEffect } from "react";
import { updateClinicDetails } from "../../services/doctor/doctorRegisterServiceApi";
import { notify } from "../../utils/notify";

const emptyClinic = {
  clinicName: "", address: "", city: "", state: "", pincode: "",
  landmark: "", mapsLink: "", languages: [], otherLanguage: "",
};

const LANGUAGES = ["English","Hindi","Telugu","Marathi","Tamil","Bengali","Gujarati","Kannada","Other"];
const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman & Nicobar Islands","Chandigarh","Dadra & Nagar Haveli and Daman & Diu",
  "Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry",
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

const LangDropdown = ({ languages, otherLanguage, onToggle, onOtherChange, error, errMsgCls, labelCls }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="sm:col-span-2">
      <label className={labelCls}>Languages Spoken *</label>

      <div ref={wrapperRef} className="relative mt-2">
        <div
          onClick={() => setOpen(prev => !prev)}
          className={[
            "w-full rounded-xl border px-4 py-3 text-sm cursor-pointer",
            "font-[family-name:var(--font-dm)] transition-all duration-200",
            "flex items-center justify-between",
            error
              ? "border-red-300 bg-red-50/50"
              : "border-slate-200 bg-white/70 hover:border-blue-400",
          ].join(" ")}
        >
          <span className={languages?.length ? "text-slate-700" : "text-slate-400"}>
            {languages?.length ? languages.join(", ") : "Select languages"}
          </span>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#94a3b8" strokeWidth={2.5} strokeLinecap="round"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {open && (
          <ul className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
            {LANGUAGES.map(lang => (
              <li key={lang}>
                <label className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm font-[family-name:var(--font-dm)]">
                  <input
                    type="checkbox"
                    checked={languages?.includes(lang)}
                    onChange={() => onToggle(lang)}
                    className="accent-blue-600 w-4 h-4"
                  />
                  {lang}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className={errMsgCls}><ErrIcon />{error}</p>}

      {languages?.includes("Other") && (
        <div className="mt-3">
          <label className={labelCls}>Specify Other Language *</label>
          <input
            type="text"
            placeholder="e.g. Bhojpuri, Konkani..."
            value={otherLanguage || ""}
            onChange={e => onOtherChange(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm outline-none font-[family-name:var(--font-dm)] placeholder:text-slate-400 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════ */
const Step3Clinic = ({ formData, setFormData, nextStep, prevStep }) => {
  const clinics = formData.clinic || [emptyClinic];
  const [errors, setErrors]   = useState([]);
  const [loading, setLoading] = useState(false);

  const inputCls = (field, idx) => [
    "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none",
    "font-[family-name:var(--font-dm)] placeholder:text-slate-400 transition-all duration-200",
    errors[idx]?.[field]
      ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-slate-200 bg-white/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
  ].join(" ");

  const labelCls  = "block text-[12px] font-semibold uppercase tracking-widest text-slate-500 font-[family-name:var(--font-dm)]";
  const errMsgCls = "mt-1.5 flex items-center gap-1 text-xs text-red-500 font-[family-name:var(--font-dm)]";

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...clinics];
    updated[index][name] = name === "pincode" ? value.replace(/\D/g, "") : value;
    setFormData(prev => ({ ...prev, clinic: updated }));
  };

  const handleLanguageToggle = (index, lang) => {
    const updated = [...clinics];
    const current = updated[index].languages || [];
    updated[index].languages = current.includes(lang)
      ? current.filter(l => l !== lang)
      : [...current, lang];
    if (lang === "Other" && current.includes(lang)) updated[index].otherLanguage = "";
    setFormData(prev => ({ ...prev, clinic: updated }));
  };

  const handleOtherLang = (index, value) => {
    const updated = [...clinics];
    updated[index].otherLanguage = value;
    setFormData(prev => ({ ...prev, clinic: updated }));
  };

  const addClinic    = () => setFormData(prev => ({ ...prev, clinic: [...prev.clinic, { ...emptyClinic }] }));
  const removeClinic = (i) => setFormData(prev => ({ ...prev, clinic: clinics.filter((_, idx) => idx !== i) }));

  const handleNext = async () => {
    let allErrors = [], hasError = false;
    clinics.forEach((c, i) => {
      const e = validateStep3(c);
      allErrors[i] = e;
      if (Object.keys(e).length) hasError = true;
    });
    if (hasError) { setErrors(allErrors); return; }
    try {
      setLoading(true);
      const res = await updateClinicDetails({ clinic: clinics });
      notify.success(res.message || "Step 3 saved");
      if (res.nextStep) nextStep();
    } catch (err) { notify.error(err.message || "Step 3 failed"); }
    finally { setLoading(false); }
  };

  const isFormValid = clinics.every(c =>
    (c.clinicName || "").trim() && (c.address || "").trim() && (c.city || "").trim() && (c.state || "").trim() &&
    (c.pincode || "").length === 6 && (c.languages || []).length > 0 &&
    (!(c.languages || []).includes("Other") || (c.otherLanguage && (c.otherLanguage || "").trim().length > 1))
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-10 py-10">

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-violet-100/30 blur-3xl" />
      </div>

      <div className="w-full max-w-3xl animate-[var(--animate-fade-up)]">

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/60 backdrop-blur-xl">

          {clinics.map((data, index) => (
            <div key={index} className={index < clinics.length - 1 ? "border-b border-slate-100" : ""}>

              <div className="px-6 sm:px-8 pt-7 pb-2 flex items-center justify-between">
                <SectionTitle
                  gradient="from-blue-600 to-blue-700"
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M9 22V12h6v10" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                    </svg>
                  }
                  title={clinics.length > 1 ? `Clinic ${index + 1}` : "Clinic Details"}
                />
                {clinics.length > 1 && (
                  <button onClick={() => removeClinic(index)}
                    className="text-xs font-semibold text-red-400 hover:text-red-600 transition font-[family-name:var(--font-dm)]">
                    Remove
                  </button>
                )}
              </div>

              <div className="px-6 sm:px-8 pt-5 pb-7 grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div>
                  <label className={labelCls}>Clinic Name *</label>
                  <input name="clinicName" value={data.clinicName} onChange={e => handleChange(index, e)}
                    placeholder="e.g. Apollo Clinic" className={inputCls("clinicName", index)} />
                  {errors[index]?.clinicName && <p className={errMsgCls}><ErrIcon />{errors[index].clinicName}</p>}
                </div>

                <div>
                  <label className={labelCls}>City *</label>
                  <input name="city" value={data.city} onChange={e => handleChange(index, e)}
                    placeholder="e.g. Mumbai" className={inputCls("city", index)} />
                  {errors[index]?.city && <p className={errMsgCls}><ErrIcon />{errors[index].city}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Full Address *</label>
                  <textarea name="address" rows={3} value={data.address} onChange={e => handleChange(index, e)}
                    placeholder="Building, street, area..."
                    className={[
                      "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none leading-relaxed",
                      "font-[family-name:var(--font-dm)] placeholder:text-slate-400 transition-all duration-200",
                      errors[index]?.address
                        ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 bg-white/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                    ].join(" ")} />
                  {errors[index]?.address && <p className={errMsgCls}><ErrIcon />{errors[index].address}</p>}
                </div>

                <div>
                  <label className={labelCls}>State *</label>
                  <select name="state" value={data.state} onChange={e => handleChange(index, e)}
                    className={inputCls("state", index) + " cursor-pointer"}>
                    <option value="">Select state</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors[index]?.state && <p className={errMsgCls}><ErrIcon />{errors[index].state}</p>}
                </div>

                <div>
                  <label className={labelCls}>Pincode *</label>
                  <input name="pincode" maxLength={6} value={data.pincode} onChange={e => handleChange(index, e)}
                    placeholder="6-digit pincode" className={inputCls("pincode", index)} />
                  {errors[index]?.pincode && <p className={errMsgCls}><ErrIcon />{errors[index].pincode}</p>}
                </div>

                <div>
                  <label className={labelCls}>Landmark </label>
                  <input name="landmark" value={data.landmark} onChange={e => handleChange(index, e)}
                    placeholder="e.g. Near City Mall" className={inputCls("landmark", index)} />
                </div>

                <div>
                  <label className={labelCls}>Google Maps Link</label>
                  <input name="mapsLink" value={data.mapsLink} onChange={e => handleChange(index, e)}
                    placeholder="https://maps.google.com/..." className={inputCls("mapsLink", index)} />
                </div>

                <LangDropdown
                  languages={data.languages}
                  otherLanguage={data.otherLanguage}
                  onToggle={(lang) => handleLanguageToggle(index, lang)}
                  onOtherChange={(val) => handleOtherLang(index, val)}
                  error={errors[index]?.languages}
                  errMsgCls={errMsgCls}
                  labelCls={labelCls}
                />

              </div>
            </div>
          ))}

          <div className="border-t border-slate-100 px-6 sm:px-8 py-4">
            <button 
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition font-[family-name:var(--font-dm)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add Another Clinic
            </button>
          </div>

        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button onClick={prevStep}
            className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 tracking-wide font-[family-name:var(--font-dm)] border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 active:scale-[0.99]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>

          <button onClick={handleNext} disabled={!isFormValid || loading}
            className={[
              "flex items-center gap-2 rounded-xl px-5 py-3",
              "text-sm font-semibold text-white tracking-wide",
              "font-[family-name:var(--font-dm)] transition-all duration-200 active:scale-[0.99]",
              !isFormValid || loading
                ? "cursor-not-allowed bg-slate-300 shadow-none"
                : "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/35",
            ].join(" ")}>
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

export default Step3Clinic;