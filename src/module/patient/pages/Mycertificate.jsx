import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import CertificateModal from "../../../components/common/CertificateModal";
import { notify } from "../../../utils/notify";
import {
  getMyRequests,
  getRequestById,
  downloadCertificate,
} from "../../../services/certificateService";

// Config & Helpers
const statusConfig = {
  Pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  Verification: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
  },
  "Payment Verified": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  Approved: {
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  Rejected: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  Expired: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
};

const normalizeStatus = (s) => {
  const map = {
    pending: "Pending",
    verification: "Verification",
    payment_verified: "Payment Verified",
    approved: "Approved",
    rejected: "Rejected",
    expired: "Expired",
  };
  return map[s?.toLowerCase()] || "Pending";
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "N/A");

// ─────────────────────────────────────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = statusConfig[status] ?? {
    bg: "bg-gray-50",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// CertCard
function CertCard({ rawCert, onView, onDownload, onTrack }) {
  const [hovered, setHovered] = useState(false);

  const status = normalizeStatus(rawCert.status);
  const certType = rawCert.certificate_type || "Certificate";
  const doctorName = rawCert.doctor_name || "Assigned Doctor";
  const createdAt = fmtDate(rawCert.created_at);
  const isApproved = status.toLowerCase() === "approved";
    const expiryText = rawCert.expiry_date
    ? `Expires ${fmtDate(rawCert.expiry_date)}`
    : "No expiry set";
  const progress   = rawCert.status?.toLowerCase() === "approved" ? 100 : 50;

  return (
    <div
      className={`bg-white rounded-2xl p-[18px] flex flex-col gap-3.5 transition-all duration-200 cursor-default ${
        hovered
          ? "shadow-[0_8px_24px_rgba(37,99,235,0.10)] -translate-y-0.5"
          : "shadow-none"
      }`}
      style={{ border: "1px solid #E2E8F0" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: "#EEF2FF" }}
        >
          📄
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-[14px] font-semibold uppercase tracking-[.08em] mb-0.5"
            style={{ color: "#4b5e7a" }}
          >
            {certType}
          </div>
          <div
            className="text-[16px] font-semibold leading-[1.35]"
            style={{ color: "#0F172A" }}
          >
            {certType} Certificate
          </div>
          <div className="text-[14px] mt-0.5" style={{ color: "#4b5e7a" }}>
            {doctorName} · {createdAt}
          </div>
        </div>
      </div>

            {/* Progress bar */}
      <div>
        <div className="h-1 rounded-full bg-[#f0ede6] overflow-hidden mt-0.5">
          <div
            className="h-full rounded-full transition-all duration-[600ms] ease-in-out"
            style={{ background: "#16a34a", width: `${progress}%` }}
          />
        </div>
        <div className="text-[11px] text-[#aaa] mt-1.5 tabular-nums">
          {expiryText}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <StatusBadge status={status} />
        <div className="flex gap-1.5">
          {/* Track button */}
          <button
            className="text-[14px] px-3 py-1.5 rounded-lg transition-colors font-medium"
            style={{
              border: "1px solid #E2E8F0",
              background: "transparent",
              color: "#64748B",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#F8FAFC")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            onClick={() => onTrack(rawCert.id)}
          >
            Track
          </button>

          {/* Download button */}
          <button
            className="text-[14px] px-3 py-1.5 rounded-lg border-none text-white transition-colors font-medium"
            style={{
              background: isApproved ? "#2563EB" : "#94A3B8",
              cursor: isApproved ? "pointer" : "not-allowed",
            }}
            onMouseEnter={(e) => {
              if (isApproved) e.currentTarget.style.background = "#1D4ED8";
            }}
            onMouseLeave={(e) => {
              if (isApproved) e.currentTarget.style.background = "#2563EB";
            }}
            onClick={() => isApproved && onDownload(rawCert)}
            disabled={!isApproved}
            title={!isApproved ? "Download available after approval" : ""}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

// WalletTab
function WalletTab({ certificates, showSuccess, onView, onDownload, onTrack }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const visible = (cert) => {
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      cert.certificate_type?.toLowerCase().includes(q) ||
      cert.doctor_name?.toLowerCase().includes(q);
    const matchT =
      !typeFilter ||
      cert.certificate_type?.toLowerCase() === typeFilter.toLowerCase();
    const matchS =
      !statusFilter || normalizeStatus(cert.status) === statusFilter;
    return matchQ && matchT && matchS;
  };

  const inputCls =
    "rounded-[10px] px-3.5 py-2 text-[15px] bg-white outline-none transition-colors";

  const filtered = certificates.filter(visible);

  return (
    <div>
      {/* Title */}
      <div className="mb-5">
        <div
          className="text-[22px] font-bold mb-1"
          style={{ color: "#0F172A" }}
        >
          Certificate wallet
        </div>
        <div className="text-[16px]" style={{ color: "#4b5e7a" }}>
          All your digital medical certificates in one place
        </div>
      </div>

      {/* Success Banner */}
      {showSuccess && (
        <div
          className="mb-5 px-4 py-3 rounded-xl text-[14px] font-medium flex items-center gap-2"
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
          }}
        >
          <span>✅</span> Your certificate request was submitted successfully!
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <input
          className={inputCls}
          style={{
            width: "220px",
            border: "1px solid #E2E8F0",
            color: "#0F172A",
          }}
          type="text"
          placeholder="Search certificates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
        />
        <select
          className={inputCls}
          style={{
            border: "1px solid #E2E8F0",
            color: "#64748B",
            cursor: "pointer",
          }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All types</option>
          <option value="medical">Medical</option>
          <option value="vaccination">Vaccination</option>
          <option value="second opinion">Second Opinion</option>
        </select>
        <select
          className={inputCls}
          style={{
            border: "1px solid #E2E8F0",
            color: "#64748B",
            cursor: "pointer",
          }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All status</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Expired">Expired</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          className="text-center py-20 text-[15px]"
          style={{ color: "#94A3B8" }}
        >
          No certificates found.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {filtered.map((cert) => (
            <CertCard
              key={cert.id}
              rawCert={cert}
              onView={onView}
              onDownload={onDownload}
              onTrack={onTrack}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TrackTab
// ─────────────────────────────────────────────────────────────────────────────
function TrackTab({ requestId }) {
  const [timeline, setTimeline] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!requestId) return;

    const fetchRequestDetails = async () => {
      setLoading(true);
      setError(null);
      setSelectedRequest(null);
      setTimeline([]);
      try {
        const res = await getRequestById(requestId);
        setSelectedRequest(res.data.request);
        setTimeline(res.data.timeline);
      } catch (err) {
        console.error("Error fetching request details:", err);
        setError("Failed to load request details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId]);

  const tlDotCls = (state) => {
    if (state === "done") return "border-[#22C55E] bg-[#22C55E]";
    if (state === "active") return "border-[#F59E0B] bg-transparent";
    return "border-[#E2E8F0] bg-transparent";
  };

  const tlLabelCls = (state) =>
    state === "waiting" ? "text-[#94A3B8]" : "text-[#0F172A]";

  return (
    <div className="max-w-2xl">
      {/* Title */}
      <div className="mb-5">
        <div
          className="text-[20px] font-semibold mb-1"
          style={{ color: "#0F172A" }}
        >
          Track request status
        </div>
        <div className="text-[16px]" style={{ color: "#4b5e7a" }}>
          Monitor the progress of your certificate requests
        </div>
      </div>

      {/* No request selected */}
      {!requestId && (
        <div
          className="bg-white rounded-2xl p-10 text-center"
          style={{ border: "1px solid #E2E8F0" }}
        >
          <div className="text-3xl mb-3">🗂️</div>
          <div
            className="text-[15px] font-bold mb-1"
            style={{ color: "#0F172A" }}
          >
            No request selected
          </div>
          <div className="text-[14px]" style={{ color: "#4b5e7a" }}>
            Go to <strong style={{ color: "#2563EB" }}>Wallet</strong>, click
            the <strong style={{ color: "#2563EB" }}>Track</strong> button on
            any certificate to monitor its progress.
          </div>
        </div>
      )}

      {/* Loading */}
      {requestId && loading && (
        <div
          className="bg-white rounded-2xl p-10 text-center text-[13px]"
          style={{ border: "1px solid #E2E8F0", color: "#94A3B8" }}
        >
          <div
            className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3"
          />
          Loading request details…
        </div>
      )}

      {/* Error */}
      {requestId && !loading && error && (
        <div
          className="rounded-2xl p-5 text-[13px]"
          style={{
            background: "#fff1f1",
            border: "1px solid #fecaca",
            color: "#EF4444",
          }}
        >
          {error}
        </div>
      )}

      {/* Request card */}
      {requestId && !loading && !error && selectedRequest && (
        <div
          className="bg-white rounded-2xl p-5 mb-4"
          style={{ border: "1px solid #E2E8F0" }}
        >
          {/* Card header */}
          <div className="flex flex-wrap justify-between items-start gap-2 mb-5">
            <div
              className="text-[16px] font-semibold"
              style={{ color: "#0F172A" }}
            >
              {selectedRequest.certificate_type || "Certificate"}
            </div>
            <div
              className="text-[14px] font-mono"
              style={{ color: "#4b5e7a" }}
            >
              #{selectedRequest.id} · Submitted{" "}
              {fmtDate(selectedRequest.created_at)}
            </div>
            <StatusBadge status={normalizeStatus(selectedRequest.status)} />
          </div>

          {/* Timeline */}
          {timeline.length > 0 ? (
            <div className="flex flex-col">
              {timeline.map((step, i) => (
                <div key={step.id ?? i} className="flex gap-3.5 relative">
                  {i < timeline.length - 1 && (
                    <div
                      className="absolute left-[7px] top-5 bottom-[-4px] w-px"
                      style={{ background: "#E2E8F0" }}
                    />
                  )}
                  <div
                    className={`w-[15px] h-[15px] rounded-full flex-shrink-0 mt-0.5 border-2 ${tlDotCls(step.state)}`}
                  />
                  <div className="pb-5">
                    <div
                      className={`text-[13px] font-semibold ${tlLabelCls(step.state)}`}
                    >
                      {step.label}
                    </div>
                    <div
                      className="text-[14px] font-mono mt-0.5"
                      style={{ color: "#4b5e7a" }}
                    >
                      {step.date ?? fmtDate(step.created_at)}
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-[12px] py-3 text-center"
              style={{ color: "#94A3B8" }}
            >
              No timeline events yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Root Component — MyCertificate
const MyCertificate = () => {
  const [activeTab, setActiveTab] = useState("wallet");
  const [showSuccess, setShowSuccess] = useState(false);
  const [modalCert, setModalCert] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.success) {
      setShowSuccess(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await getMyRequests();
        setCertificates(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("❌ Error fetching certificates:", error);
        setCertificates([]);
      } finally {
        setLoadingList(false);
      }
    };
    fetchCertificates();
  }, []);

  const handleTrack = (id) => {
    setSelectedRequestId(id);
    setActiveTab("track");
  };

  const handleConfirmDownload = async (id) => {
    try {
      const res = await downloadCertificate(id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setModalCert(null);
    } catch (error) {
      console.error("Download error:", error);
      notify.info("Failed to open certificate PDF");
    }
  };

  const handleDownload = (rawCert) => {
    setModalCert({
      id: rawCert.id,
      certificate_id: rawCert.certificate_id,
      type: rawCert.certificate_type,
      status: normalizeStatus(rawCert.status),
      patient: rawCert.full_name || "N/A",
      doctor: rawCert.doctor_name || "Assigned Doctor",
      issued: fmtDate(rawCert.issued_at),
      expires: fmtDate(rawCert.expiry_date),
      purpose: rawCert.purpose || "General Medical Use",
      onDownload: handleConfirmDownload,
    });
  };

  return (
    <div
      className="min-h-screen pt-7 px-5 pb-12"
      style={{ background: "#F8FAFC" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
          {/* Tab pills */}
          <div
            className="flex gap-1 p-1 rounded-full"
            style={{ background: "#EEF2FF" }}
          >
            {["wallet", "track"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setShowSuccess(false);
                }}
                className="px-5 py-2 rounded-full text-[16px] font-medium cursor-pointer transition-all duration-[180ms]"
                style={
                  activeTab === tab
                    ? {
                        background: "#2563EB",
                        color: "#fff",
                        boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
                        border: "none",
                      }
                    : {
                        background: "transparent",
                        color: "#64748B",
                        border: "none",
                      }
                }
              >
                {tab === "wallet" ? "Wallet" : "Track status"}
              </button>
            ))}
          </div>

          {/* Apply button */}
          <button
            className="flex items-center gap-[7px] px-[18px] py-[9px] rounded-[10px] border-none text-white text-[16px] font-semibold cursor-pointer transition-all duration-150"
            style={{
              background: "#2563EB",
              boxShadow: "0 2px 8px rgba(37,99,235,0.22)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1D4ED8";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#2563EB";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={() => navigate("/client/certificatedoctors")}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="7.5" cy="7.5" r="6.5" stroke="white" strokeWidth="1.3" />
              <path
                d="M7.5 4.5v6M4.5 7.5h6"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Apply for Certificate
          </button>
        </div>

        {/* Body */}
        {loadingList ? (
          <div className="text-center py-24">
            <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[14px]" style={{ color: "#94A3B8" }}>
              Loading your certificates…
            </p>
          </div>
        ) : activeTab === "wallet" ? (
          <WalletTab
            certificates={certificates}
            showSuccess={showSuccess}
            onDownload={handleDownload}
            onTrack={handleTrack}
          />
        ) : (
          <TrackTab requestId={selectedRequestId} />
        )}
      </div>

      {/* Modal */}
      {modalCert && (
        <CertificateModal
          cert={modalCert}
          onClose={() => setModalCert(null)}
          role="patient"
        />
      )}
    </div>
  );
};

export default MyCertificate;