import { useState, useMemo, useEffect } from "react";
import CertificateModal from "../../../components/common/CertificateModal";
import { notify } from "../../../utils/notify";
import {
  getDoctorRequests,
  getRequestDetails,
  getDocuments,
  approveRequest,
  rejectRequest,
  getIssuedCertificates,
} from "../../../services/certificateService";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["All Status", "Pending", "Approved", "Rejected"];
const TYPE_OPTIONS = [
  "All Types",
  "Second Opinion",
  "Medical Fitness",
  "Discharge Summary",
  "Disability Certificate",
];
const FITNESS_OPTIONS = [
  "Select fitness status",
  "Fit — No Restrictions",
  "Fit with Restrictions",
  "Temporarily Unfit",
  "Unfit",
];
const VALIDITY_OPTIONS = ["1 month", "3 months", "6 months", "1 year"];

const BADGE_STYLES = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  warning: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  approved: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  rejected: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const TYPE_BADGE = {
  "Medical Fitness": "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  "Second Opinion": "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  "Discharge Summary": "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  "Disability Certificate": "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  Fitness: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  Medical: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  "Sick Leave": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
};

const AVATAR_COLORS = [
  ["bg-blue-100", "text-blue-700"],
  ["bg-teal-100", "text-teal-700"],
  ["bg-purple-100", "text-purple-700"],
  ["bg-rose-100", "text-rose-700"],
  ["bg-amber-100", "text-amber-700"],
  ["bg-indigo-100", "text-indigo-700"],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function isExpiringSoon(dateStr) {
  if (!dateStr || dateStr === "N/A") return false;
  const diff = new Date(dateStr) - new Date();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
}

// ─── Reusable UI ──────────────────────────────────────────────────────────────

function Avatar({ name = "", size = "sm" }) {
  const [bg, text] = getAvatarColor(name);
  const sz = size === "lg" ? "w-11 h-11 text-sm" : "w-8 h-8 text-xs";
  return (
    <div
      className={`${sz} ${bg} ${text} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}

function Badge({ status, text }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${BADGE_STYLES[status] || BADGE_STYLES.pending}`}
    >
      {text}
    </span>
  );
}

function FieldError({ msg }) {
  return msg ? (
    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
      <span>⚠</span>
      {msg}
    </p>
  ) : null;
}

function SectionCard({ title, children, className = "" }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-5 ${className}`}
    >
      {title && (
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

function MetricCard({ label, value, accent = false, warn = false }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
      <p className="text-md text-gray-600 mb-1">{label}</p>
      <p
        className={`text-2xl font-semibold ${warn ? "text-amber-600" : accent ? "text-teal-600" : "text-gray-800"}`}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Search Icon ─────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6.5" cy="6.5" r="5" />
      <path d="m10.5 10.5 3 3" />
    </svg>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message = "Nothing here yet.", colSpan = 6 }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-14 text-center">
        <div className="flex flex-col items-center gap-2 text-gray-300">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="13" y2="17" />
          </svg>
          <p className="text-sm text-gray-400">{message}</p>
        </div>
      </td>
    </tr>
  );
}

// ─── Table Shell ──────────────────────────────────────────────────────────────

function TableShell({ headers, children, minWidth = "600px" }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-md" style={{ minWidth }}>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {headers.map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3.5 text-sm font-semibold uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: All Requests ────────────────────────────────────────────────────────

function AllRequests({ requests, onReview }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("All Status");
  const [typeFilter, setType] = useState("All Types");

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "All Status" ||
        r.statusText.toLowerCase() === statusFilter.toLowerCase();
      const matchType =
        typeFilter === "All Types" ||
        r.type.toLowerCase() === typeFilter.toLowerCase();
      return matchSearch && matchStatus && matchType;
    });
  }, [search, statusFilter, typeFilter, requests]);

  const pendingCount = requests.filter((r) =>
    ["pending", "verification", "payment_verified"].includes(r.status),
  ).length;

  return (
    <div className="p-5 sm:p-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Certificate Requests
          </h1>
          <p className="text-md text-gray-700 mt-1">
            Review and manage patient certificate requests
          </p>
        </div>
        <div className="flex gap-3">
          <MetricCard label="Pending" value={pendingCount} accent />
          <MetricCard label="Total" value={requests.length} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 mb-5">
        <div className="relative w-full sm:w-60">
          <SearchIcon />
          <input
            placeholder="Search by name or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-md border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
          />
        </div>
        {[
          [STATUS_OPTIONS, statusFilter, setStatus],
          [TYPE_OPTIONS, typeFilter, setType],
        ].map(([opts, val, set], i) => (
          <select
            key={i}
            value={val}
            onChange={(e) => set(e.target.value)}
            className="w-full sm:w-auto border border-gray-200 rounded-xl px-3 py-2.5 text-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
          >
            {opts.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ))}
      </div>

      {/* Table */}
      <TableShell
        headers={[
          "Request ID",
          "Patient",
          "Type",
          "Submitted",
          "Status",
          "Action",
        ]}
      >
        {filtered.length === 0 ? (
          <EmptyState message="No requests match your filters." />
        ) : (
          filtered.map((r) => (
            <tr
              key={r.id}
              className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-5 py-4">
                <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
                  {r.id}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="font-medium text-gray-800 whitespace-nowrap">
                    {r.name}
                  </span>
                </div>
              </td>
              <td className="px-5 py-4">
                <span
                  className={`inline-flex items-center text-md font-medium px-2.5 py-1 rounded-full ${TYPE_BADGE[r.type] || "bg-gray-100 text-gray-600 ring-1 ring-gray-200"}`}
                >
                  {r.type}
                </span>
              </td>
              <td className="px-5 py-4 text-md text-gray-400 whitespace-nowrap">
                {r.date}
              </td>
              <td className="px-5 py-4">
                <Badge status={r.status} text={r.statusText} />
              </td>
              <td className="px-5 py-4 ">
                {["pending", "verification", "payment_verified"].includes(
                  r.status,
                ) ? (
                  <button
                    onClick={() => onReview(r.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 active:scale-95 transition-all"
                  >
                    Review
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </button>
                ) : (
                  <button className="px-3.5 py-1.5 border border-gray-200 text-gray-500 text-md font-medium rounded-xl hover:bg-gray-50 transition-colors">
                    View
                  </button>
                )}
              </td>
            </tr>
          ))
        )}
      </TableShell>

      {/* Footer count */}
      {filtered.length > 0 && (
        <p className="text-md text-gray-400 mt-3 px-1">
          Showing {filtered.length} of {requests.length} requests
        </p>
      )}
    </div>
  );
}

// ─── Tab: Review Patient ──────────────────────────────────────────────────────

function ReviewPatient({
  selectedRequest,
  documents,
  form,
  setForm,
  onApprove,
  onReject,
  onBack,
  loading,
  actionLoading,
}) {
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.notes.trim())
      e.notes = "Clinical notes are required before approving.";
    if (!form.fitnessStatus || form.fitnessStatus === "Select fitness status")
      e.fitnessStatus = "Please select a fitness status.";
    return e;
  };

  const handleApproveClick = async () => {
    if (actionLoading) return;

    const e = validate();

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    const success = await onApprove();

    if (success) {
      setSubmitted(true);
    }
  };

  const handleRejectClick = async () => {
    console.log("reject clicked");
    if (!form.notes.trim()) {
      setErrors({ notes: "Please add a reason for rejection." });
      return;
    }
    await onReject();
  };

  const infoRows = [
    [
      "DOB",
      selectedRequest?.dob
        ? new Date(selectedRequest.dob).toLocaleDateString("en-IN")
        : "N/A",
    ],
    ["Gender", selectedRequest?.gender || "N/A"],
    ["Blood Group", selectedRequest?.blood_group || "N/A"],
    ["Height", selectedRequest?.height || "N/A"],
  ];

  return (
    <div className="p-5 sm:p-7">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
          Review Request
        </h1>
      </div>

      <div
        className="flex flex-col lg:grid lg:gap-5"
        style={{ gridTemplateColumns: "1fr 1.4fr" }}
      >
        {/* ── Left Column ── */}
        <div className="flex flex-col gap-4 mb-4 lg:mb-0">
          {/* Patient Info */}
          <SectionCard title="Patient Information">
            <div className="flex items-center gap-3 mb-5">
              <Avatar name={selectedRequest?.full_name || ""} size="lg" />
              <div>
                <p className="font-semibold text-gray-800 text-md">
                  Name: {selectedRequest?.full_name || "--"}
                </p>
                <p className="text-md text-gray-600 mt-0.5">
                  Medical Conditions:{" "}
                  {selectedRequest?.medical_conditions || "No known conditions"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {infoRows.map(([label, val]) => (
                <div key={label} className="bg-gray-50 rounded-xl px-3.5 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-md font-semibold text-gray-700">{val}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Documents */}
          <SectionCard title="Uploaded Documents">
            {documents.length === 0 ? (
              <p className="text-md text-gray-400">No documents uploaded.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl px-3.5 py-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 font-medium flex-1 truncate">
                      {doc.file_url ? doc.file_url.split("/").pop() : "No File"}
                    </p>
                    <a
                      href={
                        doc.file_url
                          ? `${import.meta.env.VITE_API_URL}/${doc.file_url}`
                          : "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-teal-600"
                    >
                      View →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Right Column ── */}
        <div className="flex flex-col gap-4">
          {/* Certificate Details */}
          <SectionCard title="Certificate Details">
            {/* Certificate Type */}
            <div className="mb-4">
              <label className="text-md font-medium text-gray-400 mb-1.5 block">
                Certificate Type
              </label>
              <div className="w-full border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed">
                {selectedRequest?.certificate_type || "N/A"}
              </div>
            </div>

            {/* Patient Notes */}
            <div className="mb-4">
              <label className="text-md font-medium text-gray-400 mb-1.5 block">
                Patient's Request Notes
              </label>
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm text-gray-600 min-h-[60px]">
                {selectedRequest?.notes || "No notes provided."}
              </div>
            </div>

            {/* Validity */}
            <div className="mb-4">
              <label className="text-md font-medium text-gray-400 mb-1.5 block">
                Validity Period
              </label>
              <select
                value={form.validity}
                onChange={(e) => set("validity", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
              >
                {VALIDITY_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Fitness Status */}
            <div className="mb-4">
              <label className="text-md font-medium text-gray-400 mb-1.5 block">
                Fitness Status <span className="text-red-400">*</span>
              </label>
              <select
                value={form.fitnessStatus}
                onChange={(e) => set("fitnessStatus", e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 transition ${
                  errors.fitnessStatus
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                }`}
              >
                {FITNESS_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <FieldError msg={errors.fitnessStatus} />
            </div>

            {/* Clinical Notes */}
            <div>
              <label className="text-md font-medium text-gray-400 mb-1.5 block">
                Doctor's Clinical Notes <span className="text-red-400">*</span>
              </label>
              <textarea
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 transition resize-none ${
                  errors.notes ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
                placeholder="Add your clinical findings, observations and recommendations…"
                rows={4}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
              <FieldError msg={errors.notes} />
            </div>
          </SectionCard>

          {/* Action Bar */}
          <SectionCard title="Take Action">
            <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
              <button
                type="button"
                onClick={handleApproveClick}
                disabled={actionLoading !== ""}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white text-md font-medium rounded-xl hover:bg-teal-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {actionLoading === "approve" ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Approving...
                  </>
                ) : (
                  <>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    Approve & Generate Certificate
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRejectClick}
                disabled={actionLoading !== ""}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 border border-red-200 text-md font-medium rounded-xl hover:bg-red-100 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {actionLoading === "reject" ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    Reject
                  </>
                )}
              </button>
            </div>
            <p className="text-md text-gray-400 leading-relaxed">
              Fields marked <span className="text-red-400">*</span> are
              required. Approval digitally signs the certificate with
              registration number{" "}
              <span className="font-mono text-gray-500">MCI-78234</span>.
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Issued Certificates ─────────────────────────────────────────────────

function IssuedCerts({ onViewPdf }) {
  const [issuedCertificates, setIssuedCertificates] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const fetchIssuedCertificates = async () => {
      try {
        const res = await getIssuedCertificates();
        const formattedData = res.data.map((c) => ({
          id: c.certificate_id,
          certificate_id: c.certificate_id,
          patient: c.full_name,
          type: c.certificate_type,
          purpose: c.purpose,
          issued: c.issued_at
            ? new Date(c.issued_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A",
          expires: c.expiry_date
            ? new Date(c.expiry_date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A",
          expiringSoon: isExpiringSoon(c.expiry_date),
          doctor: c.doctor_name || "Dr. Assigned",
          file: c.certificate_file,
        }));
        setIssuedCertificates(formattedData);
      } catch (error) {
        console.error("Error fetching issued certificates:", error);
      }
    };
    fetchIssuedCertificates();
  }, []);

  const filtered = useMemo(() => {
    return issuedCertificates.filter((c) => {
      const matchSearch =
        c.patient.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase());
      const matchType = !typeFilter || c.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [search, typeFilter, issuedCertificates]);

  const expiringSoonCount = issuedCertificates.filter(
    (c) => c.expiringSoon,
  ).length;
  const thisMonthCount = issuedCertificates.filter((c) => {
    const d = new Date(c.issued);
    const now = new Date();
    return (
      !isNaN(d) &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="p-5 sm:p-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Issued Certificates
          </h1>
          <p className="text-md text-gray-700 mt-1">
            Certificates you have approved and generated
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <MetricCard label="Total Issued" value={issuedCertificates.length} />
          <MetricCard label="This Month" value={thisMonthCount} accent />
          <MetricCard
            label="Expiring Soon"
            value={expiringSoonCount}
            warn={expiringSoonCount > 0}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
        <div className="relative w-full sm:w-60">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search patient or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full sm:w-auto border border-gray-200 rounded-xl px-3.5 py-2.5 text-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
        >
          <option value="">All types</option>
          <option>Fitness</option>
          <option>Medical</option>
          <option>Sick Leave</option>
          <option>Second Opinion</option>
          <option>Discharge Summary</option>
          <option>Disability Certificate</option>
          <option>Medical Fitness</option>
        </select>
      </div>

      {/* Table */}
      <TableShell
        headers={[
          "Cert ID",
          "Patient",
          "Type",
          "Issued On",
          "Expires",
          "Actions",
        ]}
        minWidth="620px"
      >
        {filtered.length === 0 ? (
          <EmptyState message="No issued certificates found." />
        ) : (
          filtered.map((c) => (
            <tr
              key={c.id}
              className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-5 py-4">
                <span className="font-mono text-sm  bg-gray-100 px-2.5 py-1 rounded-lg">
                  {c.id}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="font-medium text-gray-800">{c.patient}</span>
                </div>
              </td>
              <td className="px-5 py-4">
                <span
                  className={`inline-flex items-center text-md font-medium px-2.5 py-1 rounded-full ${TYPE_BADGE[c.type] || "bg-gray-100 text-gray-600 ring-1 ring-gray-200"}`}
                >
                  {c.type}
                </span>
              </td>
              <td className="px-5 py-4 text-md ">{c.issued}</td>
              <td className="px-5 py-4">
                {c.expiringSoon ? (
                  <span className="inline-flex items-center gap-1.5 text-md font-medium text-amber-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
                    {c.expires}
                  </span>
                ) : (
                  <span className="text-md ">{c.expires}</span>
                )}
              </td>
              <td className="px-5 py-4">
                <button
                  onClick={() => onViewPdf(c)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium border bg-green-600 text-white cursor-pointer border-gray-200 rounded-xl text-gray-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 active:scale-95 transition-all"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 2h8l4 4v8H2z" />
                    <path d="M10 2v4h4" />
                    <path d="M5 9h6M5 11.5h4" />
                  </svg>
                  View PDF
                </button>
              </td>
            </tr>
          ))
        )}
      </TableShell>

      {filtered.length > 0 && (
        <p className="text-md text-gray-400 mt-3 px-1">
          Showing {filtered.length} of {issuedCertificates.length} certificates
        </p>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "requests", label: "All Requests" },
  { id: "issued", label: "Issued Certs" },
];

export default function Certificaterequest() {
  const [activeTab, setActiveTab] = useState("requests");
  const [modalCert, setModalCert] = useState(null);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const [form, setForm] = useState({
    validity: "1 month",
    notes: "",
    fitnessStatus: "",
  });

  const handleViewPdf = (cert) => {
    setModalCert({
      id: cert.id,
      certificate_id: cert.certificate_id,
      type: cert.type,
      patient: cert.patient,
      doctor: cert.doctor,
      issued_at: cert.issued,
      expires: cert.expires,
      status: "Approved",
      purpose: cert.purpose,
      onDownload: () =>
        window.open(`${import.meta.env.VITE_API_URL}/${cert.file}`, "_blank"),
    });
  };

  const fetchRequests = async () => {
    try {
      const res = await getDoctorRequests();
      const formattedData = res.data.map((r) => ({
        id: r.id.toString(),
        name: r.full_name,
        type: r.certificate_type,
        purpose: r.purpose,
        date: new Date(r.created_at).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: r.status.toLowerCase(),
        statusText: r.status,
        initials: getInitials(r.full_name),
      }));
      setRequests(formattedData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReview = async (id) => {
    try {
      const res = await getRequestDetails(id);
      const docs = await getDocuments(id);
      setSelectedRequest(res.data);
      setDocuments(docs.data);
      setActiveTab("review");
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  };

const handleApprove = async () => {
  if (!selectedRequest?.id) {
    notify.error("Invalid certificate request");
    return false;
  }

  try {
    setActionLoading("approve");

    await approveRequest(selectedRequest.id, {
      doctor_notes: form.notes?.trim() || "",
      fitness_status: form.fitnessStatus,
      validity: form.validity,
    });

    notify.success("Certificate Approved Successfully");

    setRequests((prev) =>
      prev.map((r) =>
        String(r.id) === String(selectedRequest.id)
          ? {
              ...r,
              status: "approved",
              statusText: "Approved",
            }
          : r
      )
    );

    setActiveTab("issued");

    return true;
  } catch (error) {
    console.error("Certificate approve error:", error);

    notify.error(
      error?.response?.data?.message ||
        "Certificate approval failed"
    );

    return false;
  } finally {
    setActionLoading("");
  }
};

  const handleReject = async () => {
    try {
      setActionLoading("reject");

      await rejectRequest(selectedRequest.id, {
        doctor_notes: form.notes,
      });

      notify.error("Request Rejected");

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id.toString()
            ? { ...r, status: "rejected", statusText: "Rejected" }
            : r,
        ),
      );

      setActiveTab("requests");
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div
      className="font-dm min-h-screen bg-[#f5f3ef] "
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 10% 5%, rgba(14,116,144,0.05) 0%, transparent 50%)",
      }}
    >
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          className={`py-4 px-5 text-md font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
            activeTab === t.id
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
        >
          {t.label}
        </button>
      ))}

      {activeTab === "requests" && (
        <AllRequests requests={requests} onReview={handleReview} />
      )}
      {activeTab === "review" && (
        <ReviewPatient
          selectedRequest={selectedRequest}
          documents={documents}
          form={form}
          setForm={setForm}
          onApprove={handleApprove}
          onReject={handleReject}
          onBack={() => setActiveTab("requests")}
          loading={loading}
          actionLoading={actionLoading}
        />
      )}
      {activeTab === "issued" && <IssuedCerts onViewPdf={handleViewPdf} />}

      <CertificateModal
        cert={modalCert}
        onClose={() => setModalCert(null)}
        role="doctor"
      />
    </div>
  );
}
