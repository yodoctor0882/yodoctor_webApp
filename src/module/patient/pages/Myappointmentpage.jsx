

import React, { useEffect, useState } from "react";
import { Calendar, Sun, CloudSun, X, Download, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notify } from "../../../utils/notify";
import AppointmentService from "../../../services/AppointmentService";
import { generatePrescriptionPDF } from "../../../utils/generatePrescriptionPDF";
import api from "../../../services/api";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const getImageUrl = (imagePath) => {
  if (!imagePath)
    return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  if (imagePath.startsWith("http")) return imagePath;
  return `${BASE_URL}/${imagePath}`.replace(/([^:])\/\//g, "$1/");
};

const getUiStatus = (status) => {
  switch (status) {
    case "ACCEPTED":     return "Confirmed";
    case "IN_PROGRESS":  return "In Progress";
    case "COMPLETED":    return "Completed";
    case "CANCELLED":    return "Cancelled";
    case "REJECTED":     return "Rejected";
    case "PENDING":
    default:             return "Pending";
  }
};

const statusConfig = {
  Completed:   { color: "#166534",  bg: "#dcfce7" },
  Cancelled:   { color: "#991b1b",  bg: "#fee2e2" },
  Rejected:    { color: "#991b1b",  bg: "#fee2e2" },
  Confirmed:   { color: "#2563EB",  bg: "#EEF2FF" },
  "In Progress": { color: "#7c3aed", bg: "rgba(124,58,237,0.09)" },
  Pending:     { color: "#b45309",  bg: "#fef3c7" },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.Pending;
  return (
    <span
      className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      ● {status}
    </span>
  );
}

function AppointmentActions({ doc, joinCall, setSelectedAppointment, fetchPrescription }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {(doc.status === "ACCEPTED" || doc.status === "IN_PROGRESS") && (
        <button
          onClick={() => joinCall(doc)}
          className="font-bold text-[12px] px-3 py-1.5 rounded-lg text-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg,#22C55E,#16a34a)",
            boxShadow: "0 3px 10px rgba(34,197,94,0.3)",
          }}
        >
          Join Call
        </button>
      )}
      {doc.status === "COMPLETED" && (
        <button
          onClick={() => { setSelectedAppointment(doc); fetchPrescription(doc.id); }}
          className="font-bold text-[13px] px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          style={{
            color: "#2563EB",
            background: "#EEF2FF",
            border: "1px solid rgba(37,99,235,0.2)",
          }}
        >
          View Details
        </button>
      )}
    </div>
  );
}

export default function MyAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments]         = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rating, setRating]                     = useState(0);
  const [comment, setComment]                   = useState("");
  const [prescription, setPrescription]         = useState(null);
  const [cursor, setCursor]                     = useState(null);
  const [nextCursor, setNextCursor]             = useState(null);
  const [prevStack, setPrevStack]               = useState([]);

  const fetchAppointments = async (cursorValue = null) => {
    setLoading(true);
    try {
      const res = await AppointmentService.getHistory(cursorValue);
      const mapped = res.data.map((appt) => ({
        ...appt,
        statusUi: getUiStatus(appt.status),
        profile_image: getImageUrl(appt.profile_image),
      }));
      setAppointments(mapped);
      setNextCursor(res.nextCursor);
    } catch {
      notify.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescription = async (appointmentId) => {
    try {
      const { data } = await api.get(`/patient/appointments/${appointmentId}/prescription`);
      setPrescription(data);
    } catch {
      setPrescription(null);
    }
  };

  useEffect(() => { fetchAppointments(null); }, []);

  const handleNext = () => {
    if (!nextCursor) return;
    setPrevStack((p) => [...p, cursor ?? null]);
    setCursor(nextCursor);
    fetchAppointments(nextCursor);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (prevStack.length === 0) return;
    const prev = prevStack[prevStack.length - 1];
    setPrevStack((p) => p.slice(0, -1));
    setCursor(prev);
    fetchAppointments(prev);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const joinCall = (appt) => navigate(`/client/onlineconsultation?room=${appt.id}`);

  const handleDownloadPrescription = () => {
    if (!prescription) { notify.error("Doctor has not provided a prescription"); return; }
    generatePrescriptionPDF({ ...selectedAppointment, ...prescription });
    notify.success("Prescription downloaded successfully");
  };

  const submitRating = async () => {
    try {
      await AppointmentService.rateDoctor({ appointmentId: selectedAppointment.id, rating, comment });
      notify.success("Feedback submitted");
      setSelectedAppointment(null); setRating(0); setComment("");
    } catch {
      notify.error("Feedback already submitted");
    }
  };

  const closeModal = () => {
    setSelectedAppointment(null); setPrescription(null); setComment(""); setRating(0);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8" style={{ background: "#F8FAFC" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.93); }
          to   { opacity: 1; transform: scale(1); }
        }
        .fade-up { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .appt-card:hover { box-shadow: 0 8px 28px rgba(15,23,42,0.11) !important; }
        .pagination-btn:not(:disabled):hover {
          background: #EEF2FF !important;
          color: #2563EB !important;
          border-color: #2563EB !important;
        }
      `}</style>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7 fade-up">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: "#0F172A" }}>
            My Appointments
          </h1>
        </div>
        {appointments.length > 0 && (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold self-start sm:self-auto"
            style={{ color: "#2563EB", background: "#EEF2FF" }}
          >
            <Calendar size={14} />
            {appointments.length} Appointments
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-9 h-9 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: "#2563EB", borderTopColor: "transparent" }}
            />
            <p className="text-[13px]" style={{ color: "#94A3B8" }}>Loading appointments…</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && appointments.length === 0 && (
        <div
          className="bg-white rounded-2xl py-16 flex flex-col items-center gap-3 fade-up"
          style={{ boxShadow: "0 2px 16px rgba(15,23,42,0.07)", border: "1px solid #E2E8F0" }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1" style={{ background: "#EEF2FF" }}>
            <Calendar size={30} color="#2563EB" />
          </div>
          <p className="text-[17px] font-bold" style={{ color: "#0F172A" }}>No appointments found</p>
          <p className="text-[13px]" style={{ color: "#94A3B8" }}>Your appointment history will appear here</p>
        </div>
      )}

      {/* Table */}
      {!loading && appointments.length > 0 && (
        <>
          {/* Desktop column headers */}
          <div
            className="hidden lg:grid grid-cols-5 px-6 py-3 mb-2 rounded-xl"
            style={{ background: "#EEF2FF" }}
          >
            {["Doctor & Specialization", "Date & Shift", "Token", "Status", "Actions"].map((h) => (
              <p key={h} className="text-[14px] font-bold uppercase tracking-wider" style={{ color: "#64748B" }}>
                {h}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {appointments.map((doc, idx) => (
              <div
                key={doc.id}
                className="appt-card bg-white rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  boxShadow: "0 2px 12px rgba(15,23,42,0.07)",
                  border: "1px solid #E2E8F0",
                  animation: `fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) ${idx * 0.05}s both`,
                }}
              >
                {/* Desktop row */}
                <div className="hidden lg:grid grid-cols-5 items-center px-6 py-4 gap-4">
                  {/* Doctor */}
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate(`/client/doctor-profile/${doc.doctorId}`)}
                  >
                    <img
                      src={doc.profile_image}
                      alt={doc.doctorName}
                      className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                      style={{ border: "2px solid #E2E8F0" }}
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; }}
                    />
                    <div>
                      <p className="text-[14px] font-bold leading-tight" style={{ color: "#0F172A" }}>{doc.doctorName}</p>
                      <p className="text-[13px] font-semibold mt-0.5" style={{ color: "#2563EB" }}>{doc.specialization}</p>
                      <p className="text-[12px] mt-0.5" style={{ color: "#64748B" }}>
                        Patient: {doc.patientName} {doc.isFamily ? "(Family)" : "(Self)"}
                      </p>
                    </div>
                  </div>

                  {/* Date & Shift */}
                  <div className="flex items-center gap-2">
                    <Calendar size={14} color="#94A3B8" />
                    <div>
                      <p className="text-[14px] font-bold" style={{ color: "#0F172A" }}>{doc.date}</p>
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-md mt-1 inline-flex items-center gap-1"
                        style={{ color: "#14B8A6", background: "rgba(20,184,166,0.1)" }}
                      >
                        {doc.shift === "Morning" ? <Sun size={11} /> : <CloudSun size={11} />}
                        {doc.shift?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Token */}
                  <div>
                    <span
                      className="text-[17px] font-bold px-4 py-1.5 rounded-xl"
                      style={{ color: "#2563EB", background: "#EEF2FF" }}
                    >
                      #{doc.token}
                    </span>
                  </div>

                  {/* Status */}
                  <div><StatusBadge status={doc.statusUi} /></div>

                  {/* Actions */}
                  <AppointmentActions
                    doc={doc}
                    joinCall={joinCall}
                    setSelectedAppointment={setSelectedAppointment}
                    fetchPrescription={fetchPrescription}
                  />
                </div>

                {/* Mobile card */}
                <div className="lg:hidden px-4 py-4">
                  <div
                    className="flex items-center gap-3 mb-3 cursor-pointer"
                    onClick={() => navigate(`/client/doctor-profile/${doc.doctorId}`)}
                  >
                    <img
                      src={doc.profile_image}
                      alt={doc.doctorName}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                      style={{ border: "2px solid #E2E8F0" }}
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold truncate" style={{ color: "#0F172A" }}>{doc.doctorName}</p>
                      <p className="text-[12px] font-semibold" style={{ color: "#2563EB" }}>{doc.specialization}</p>
                    </div>
                    <StatusBadge status={doc.statusUi} />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3 p-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    {[
                      { label: "Date",  value: doc.date },
                      { label: "Shift", value: doc.shift?.toUpperCase(), teal: true },
                      { label: "Token", value: `#${doc.token}`, blue: true },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#94A3B8" }}>{item.label}</p>
                        <p
                          className="text-[12px] font-bold"
                          style={{ color: item.blue ? "#2563EB" : item.teal ? "#14B8A6" : "#0F172A" }}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2" style={{ borderTop: "1px solid #E2E8F0" }}>
                    <AppointmentActions
                      doc={doc}
                      joinCall={joinCall}
                      setSelectedAppointment={setSelectedAppointment}
                      fetchPrescription={fetchPrescription}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-3 mt-8">
            {[
              { label: "← Previous", onClick: handlePrevious, disabled: prevStack.length === 0 },
              { label: "Next →",     onClick: handleNext,     disabled: !nextCursor },
            ].map(({ label, onClick, disabled }) => (
              <button
                key={label}
                disabled={disabled}
                onClick={onClick}
                className="pagination-btn text-[13px] font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  color: "#64748B",
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 2px 6px rgba(15,23,42,0.05)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Detail modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div
            className="relative bg-white rounded-2xl w-full max-w-lg z-10 overflow-hidden"
            style={{
              boxShadow: "0 24px 80px rgba(15,23,42,0.2)",
              border: "1px solid #E2E8F0",
              animation: "scaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            {/* Modal header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg,#2563EB,#14B8A6)", borderBottom: "1px solid #E2E8F0" }}
            >
              <h3 className="text-[17px] font-bold text-white">Appointment Details</h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-white/20"
              >
                <X size={15} color="white" />
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              {/* Summary grid */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                {[
                  { label: "Doctor", value: selectedAppointment.doctorName },
                  { label: "Date",   value: selectedAppointment.date },
                  { label: "Token",  value: `#${selectedAppointment.token}` },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#94A3B8" }}>{item.label}</p>
                    <p className="text-[13px] font-semibold" style={{ color: "#0F172A" }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Prescription */}
              {prescription && (
                <div className="p-4 rounded-xl" style={{ background: "#EEF2FF", border: "1px solid rgba(37,99,235,0.15)" }}>
                  {[
                    { label: "Medicines",     value: prescription.medicines },
                    { label: "Instructions",  value: prescription.instructions },
                  ].map((item) => (
                    <div key={item.label} className="mb-3 last:mb-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "#2563EB" }}>{item.label}</p>
                      <p className="text-[13px] whitespace-pre-line" style={{ color: "#0F172A" }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Rating */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#94A3B8" }}>Rate Doctor</p>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="text-[28px] cursor-pointer transition-transform hover:scale-110"
                      style={{ color: rating >= star ? "#F59E0B" : "#E2E8F0" }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your feedback…"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl text-[13px] outline-none resize-none transition-all duration-200"
                  style={{ border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#0F172A" }}
                  onFocus={(e) => (e.target.style.border = "1.5px solid #2563EB")}
                  onBlur={(e)  => (e.target.style.border = "1px solid #E2E8F0")}
                />
              </div>

              {/* CTA buttons */}
              <div className="flex gap-3">
                <button
                  disabled={!rating}
                  onClick={submitRating}
                  className="flex-1 font-bold text-[13px] py-2.5 rounded-xl text-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
                >
                  <Star size={15} /> Submit Rating
                </button>
                <button
                  onClick={handleDownloadPrescription}
                  className="flex-1 font-bold text-[13px] py-2.5 rounded-xl text-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#14B8A6,#0F766E)", boxShadow: "0 4px 12px rgba(20,184,166,0.3)" }}
                >
                  <Download size={15} /> Download Rx
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}