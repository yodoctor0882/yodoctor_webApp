
import React, { useState } from "react";
import { validateStep6Files, validateStep6Required } from "../../controllers/FormValidation";
import { uploadDoctorDocuments } from "../../services/doctor/doctorRegisterServiceApi";
import { notify } from "../../utils/notify";

const DOC_FIELDS = [
  { field: "profile",     label: "Profile Picture",                  required: true,  accept: "image/*",      hint: "JPG or PNG, max 2MB" },
  { field: "certificate", label: "Medical Registration Certificate", required: true,  accept: "image/*,.pdf", hint: "PDF or image, max 5MB" },
  { field: "idProof",     label: "Government ID Proof",              required: true,  accept: "image/*,.pdf", hint: "Aadhaar / PAN / Passport" },
  { field: "clinicProof", label: "Clinic Establishment Proof",       required: false, accept: "image/*,.pdf", hint: "Optional — lease deed or registration" },
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

const FileCard = ({ field, label, required, accept, hint, file, onUpload, onDelete, onView, error }) => {
  const isImg = file && file.type?.startsWith("image/");

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-[12px] font-semibold uppercase tracking-widest text-slate-500 font-[family-name:var(--font-dm)]">
          {label}{" "}
          {required
            ? <span className="text-red-500">*</span>
            : <span className="text-slate-400 font-normal normal-case tracking-normal">(Optional)</span>
          }
        </label>
        {file && (
          <div className="flex items-center gap-3">
            <button onClick={() => onView(file)}
              className="text-xs font-semibold text-blue-600 hover:underline font-[family-name:var(--font-dm)]">
              View
            </button>
            <button onClick={() => onDelete(field)}
              className="text-xs font-semibold text-red-400 hover:text-red-600 hover:underline font-[family-name:var(--font-dm)]">
              Remove
            </button>
          </div>
        )}
      </div>

      {!file ? (
        <label className="flex items-center gap-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-5 py-5 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-blue-100/80 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700 font-[family-name:var(--font-dm)]">Click to upload</p>
            <p className="text-xs text-slate-400 mt-0.5 font-[family-name:var(--font-dm)]">{hint}</p>
          </div>
          <input type="file" accept={accept} onChange={onUpload} className="hidden" />
        </label>
      ) : (
        <div className="flex items-center gap-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/50 px-5 py-4">
          {isImg ? (
            <img src={URL.createObjectURL(file)} alt="preview"
              className="w-12 h-12 rounded-xl object-cover border border-emerald-200 flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-extrabold text-blue-600">PDF</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-800 truncate font-[family-name:var(--font-dm)]">{file.name}</p>
            <p className="text-xs text-emerald-600 mt-0.5 font-[family-name:var(--font-dm)]">
              {(file.size / 1024).toFixed(0)} KB · Uploaded
            </p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
      )}

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 font-[family-name:var(--font-dm)]">
          <ErrIcon />{error}
        </p>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════ */
const Step6Documents = ({ formData, setFormData, nextStep, prevStep }) => {
  const data = formData.documents || {};
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const uploaded = DOC_FIELDS.filter(d => d.required && data[d.field]).length;
  const total    = DOC_FIELDS.filter(d => d.required).length;

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    const msg  = validateStep6Files(file, field);
    if (msg) { setErrors(prev => ({ ...prev, [field]: msg })); return; }
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setFormData(prev => ({ ...prev, documents: { ...prev.documents, [field]: file } }));
  };

  const handleDelete = (field) =>
    setFormData(prev => ({ ...prev, documents: { ...prev.documents, [field]: null } }));

  const handleView = (file) => window.open(URL.createObjectURL(file), "_blank");

  const handleNext = async () => {
    const errs = validateStep6Required(data);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setLoading(true);
      const form = new FormData();
      form.append("profile", data.profile);
      form.append("certificate", data.certificate);
      form.append("idProof", data.idProof);
      if (data.clinicProof) form.append("clinicProof", data.clinicProof);
      const res = await uploadDoctorDocuments(form);
      notify.success(res.message || "Documents uploaded");
      if (res.nextStep) nextStep();
    } catch (err) { notify.error(err.message || "Upload failed"); }
    finally { setLoading(false); }
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
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Required Documents"
            />


            <div className="space-y-4 mt-4">
              {DOC_FIELDS.map(doc => (
                <FileCard
                  key={doc.field}
                  {...doc}
                  file={data[doc.field]}
                  error={errors[doc.field]}
                  onUpload={e => handleFileChange(e, doc.field)}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </div>

            {errors.general && (
              <p className="mt-4 flex items-center gap-1 text-xs text-red-500 font-semibold font-[family-name:var(--font-dm)]">
                <ErrIcon />{errors.general}
              </p>
            )}
          </div>

          <div className="px-6 sm:px-8 pt-6 pb-7">
            <SectionTitle
              gradient="from-teal-500 to-cyan-600"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 6v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6l-8-4z"
                    stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Data Security"
            />
            <div className="mt-5 flex items-start gap-3.5 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
                <path d="M12 2L4 6v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6l-8-4z" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm text-slate-600 leading-relaxed font-[family-name:var(--font-dm)]">
                All documents are encrypted and stored securely. They are only used for credential verification.
              </p>
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
                Uploading...
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

export default Step6Documents;