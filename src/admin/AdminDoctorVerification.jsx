import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { notify } from "../utils/notify";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const getFileUrl = (filePath) => {
  if (!filePath) return "";
  const clean = filePath.replace(/\\/g, "/");
  if (clean.startsWith("http")) return clean;
  return `${BASE_URL}/${clean}`.replace(/([^:])\/\//g, "$1/");
};

const Icon = ({ d, size = 16, color = "currentColor", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  back:   "M19 12H5M12 19l-7-7 7-7",
  eye:    "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  check:  "M5 13l4 4L19 7",
  x:      "M6 18L18 6M6 6l12 12",
  shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  file:   "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  id:     "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0",
  degree: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  user:   "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
};

const DOC_ICON = {
  certificate: ICONS.degree,
  idProof:     ICONS.id,
  profile:     ICONS.user,
};

const STATUS_CFG = {
  VERIFIED: { label: "Verified",       cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Rejected",       cls: "bg-red-50    text-red-600    border-red-200"       },
  PENDING:  { label: "Pending Review", cls: "bg-amber-50  text-amber-600  border-amber-200"     },
};

/* ── Doc Card ── */
const DocCard = ({ title, date, status, icon, fileUrl, onApprove, onReject }) => {
  const cfg       = STATUS_CFG[status] || STATUS_CFG.PENDING;
  const isPending = status === "PENDING";
  const iconPath  = DOC_ICON[icon] || ICONS.file;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Icon d={iconPath} size={20} color="#3b82f6" sw={1.8} />
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border font-[family-name:var(--font-dm)] ${cfg.cls}`}>
          {cfg.label}
        </span>
      </div>

      <div>
        <p className="text-sm font-bold text-slate-800 font-[family-name:var(--font-dm)]">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5 font-[family-name:var(--font-dm)]">Uploaded: {date}</p>
      </div>

      <button
        onClick={() => window.open(fileUrl, "_blank")}
        className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition font-[family-name:var(--font-dm)] w-fit"
      >
        <Icon d={ICONS.eye} size={14} color="#3b82f6" sw={2} />
        View Document
      </button>

      {isPending && (
        <div className="flex gap-2 mt-auto">
          <button onClick={onApprove}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition font-[family-name:var(--font-dm)]">
            <Icon d={ICONS.check} size={13} color="white" sw={2.5} />
            Approve
          </button>
          <button onClick={onReject}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition font-[family-name:var(--font-dm)]">
            <Icon d={ICONS.x} size={13} color="#dc2626" sw={2.5} />
            Reject
          </button>
        </div>
      )}

      {!isPending && (
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${status === "VERIFIED" ? "bg-emerald-50" : "bg-red-50"}`}>
          <Icon
            d={status === "VERIFIED" ? ICONS.check : ICONS.x}
            size={14}
            color={status === "VERIFIED" ? "#16a34a" : "#dc2626"}
            sw={2.5}
          />
          <span className={`text-xs font-semibold font-[family-name:var(--font-dm)] ${status === "VERIFIED" ? "text-emerald-700" : "text-red-600"}`}>
            {status === "VERIFIED" ? "Document verified" : "Document rejected"}
          </span>
        </div>
      )}
    </div>
  );
};

/* ── Confirm Modal ── */
const ConfirmModal = ({ type, doc, rejectReason, setRejectReason, rejectError, onCancel, onConfirm }) => {
  const isApprove = type === "approve";
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-7 w-full max-w-sm shadow-2xl">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isApprove ? "bg-emerald-50" : "bg-red-50"}`}>
          <Icon d={isApprove ? ICONS.check : ICONS.x} size={22}
            color={isApprove ? "#16a34a" : "#dc2626"} sw={2.5} />
        </div>
        <h3 className="text-base font-bold text-slate-800 text-center font-[family-name:var(--font-dm)] mb-1">
          {isApprove ? "Approve Document?" : "Reject Document?"}
        </h3>
        <p className="text-sm text-slate-400 text-center font-[family-name:var(--font-dm)] mb-5">
          Are you sure you want to {isApprove ? "approve" : "reject"}{" "}
          <span className="font-semibold text-slate-600">{doc?.title}</span>?
        </p>

        {/* ✅ Reject reason — required */}
        {!isApprove && (
          <div className="mb-4">
            <textarea
              placeholder="Rejection reason (required)..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none font-[family-name:var(--font-dm)] placeholder:text-slate-300 transition
                ${rejectError
                  ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
                  : "border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                }`}
            />
            {rejectError && (
              <p className="text-xs text-red-500 mt-1.5 font-[family-name:var(--font-dm)]">
                ⚠ Rejection reason is required
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-[family-name:var(--font-dm)]">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition font-[family-name:var(--font-dm)]
              ${isApprove ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"}`}>
            {isApprove ? "Yes, Approve" : "Yes, Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};


/* ══════════════════════════════════════════ */
const AdminDoctorVerification = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [loading, setLoading]             = useState(true);
  const [docs, setDocs]                   = useState([]);
  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [rejectReason, setRejectReason]   = useState("");
  const [rejectError, setRejectError]     = useState(false);
  const [doctorStatus, setDoctorStatus]   = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const [docsRes, doctorRes] = await Promise.all([
        api.get(`/admin/doctors/${id}/documents`),
        api.get(`/admin/doctors/${id}`),
      ]);

      setDocs(docsRes.data.documents.map(doc => ({
        id:      doc.id,
        title:   doc.doc_type === "certificate" ? "Degree Certificate"
                 : doc.doc_type === "idProof"   ? "Identity Proof"
                 : "Profile Photo",
        date:    new Date(doc.uploaded_at).toDateString(),
        // ✅ 0 = PENDING, 1 = VERIFIED, 2 = REJECTED
        status:  doc.verified === 1 ? "VERIFIED" : doc.verified === 2 ? "REJECTED" : "PENDING",
        icon:    doc.doc_type,
        fileUrl: getFileUrl(doc.file_path),
        docType: doc.doc_type,
      })));

      const status =
        doctorRes.data?.doctor?.status ||
        doctorRes.data?.status         ||
        null;
      setDoctorStatus(status);

    } catch { notify.error("Failed to load documents"); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchDocuments(); }, [id]);

  const approveDocument = async (doc) => {
    try {
      api.put(`/admin/doctors/${id}/documents/verify`, { docType: doc.docType, verified: true });
      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: "VERIFIED" } : d));
      notify.success("Document approved");
    } catch { notify.error("Approval failed"); }
  };

  const rejectDocument = async (doc, reason) => {
    try {
      await api.put(`/admin/doctors/${id}/verify-document`, {
  docType: doc.docType,
  verified: false,
  reason
});
      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: "REJECTED" } : d));
      notify.success("Document rejected");
    } catch { notify.error("Reject failed"); }
  };

  const handleSubmitAll = async () => {
    try {
      await api.put(`/admin/doctors/${id}/verify`);
      
      notify.success("Doctor verified successfully");
      setConfirmOpen(false);
      navigate("/admin/doctors");
    } catch (err) { notify.error(err.response?.data?.message || "Verification failed"); }
  };

  const allDocsVerified = docs.length > 0 && docs.every(d => d.status !== "PENDING")
  const isDoctorApproved = doctorStatus === "APPROVED";
  const canSubmit        = allDocsVerified && !isDoctorApproved;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-[family-name:var(--font-dm)]">Loading documents...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-10 py-8">
      <div className="max-w-5xl mx-auto">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition font-[family-name:var(--font-dm)] mb-7 shadow-sm">
          <Icon d={ICONS.back} size={15} sw={2.5} />
          Back
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-7">
          {docs.map(doc => (
            <DocCard
              key={doc.id}
              {...doc}
           
              onApprove={() => {
                setRejectReason("");
                setRejectError(false);
                setConfirmAction({ type: "approve", doc });
              }}
              onReject={() => {
                setRejectReason("");
                setRejectError(false);
                setConfirmAction({ type: "reject", doc });
              }}
            />
          ))}
        </div>

      </div>
      {confirmAction && (
        <ConfirmModal
          type={confirmAction.type}
          doc={confirmAction.doc}
          rejectReason={rejectReason}
          setRejectReason={(val) => {
            setRejectReason(val);
            if (val.trim()) setRejectError(false);
          }}
          rejectError={rejectError}
          onCancel={() => {
            setConfirmAction(null);
            setRejectError(false);
          }}
          
          onConfirm={async () => {
            if (confirmAction.type === "reject" && !rejectReason.trim()) {
              setRejectError(true);
              return;
            }
            if (confirmAction.type === "approve") await approveDocument(confirmAction.doc);
            else await rejectDocument(confirmAction.doc, rejectReason);
            setConfirmAction(null);
            setRejectError(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminDoctorVerification;