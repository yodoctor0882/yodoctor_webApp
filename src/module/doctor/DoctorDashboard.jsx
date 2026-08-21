import React, { useEffect, useState, lazy, Suspense } from "react";
import {
  FaBook,
  FaExclamationTriangle,
  FaToggleOn,
  FaToggleOff,
  FaList,
  FaStar,
  FaUser,
  FaCheckCircle,
  FaQrcode,
  FaDownload,
  FaTimes,
  FaClock,
  FaFileMedical,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { notify } from "../../utils/notify";
import api from "../../services/api";
import { useImage } from "../../context/ImageContext";
import {
  cancelRemainingAppointments,
  updateClinicStatus,
  getMyQR,
} from "../../services/doctorService";
import useDoctorProfile from "../../hooks/doctorHooks/useDoctorProfile";
import CertificateService from "./pages/CertificateService";
const QRCodeCanvas = lazy(() =>
  import("qrcode.react").then((module) => ({
    default: module.QRCodeCanvas,
  })),
);

const FALLBACK_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const StatCard = ({ icon, label, value, tag, tagColor, iconColor }) => (
  <div
    className="bg-white border border-black/[0.07] rounded-[18px] p-6"
    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
  >
    <div className="flex items-center justify-between mb-4">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${iconColor}`}
      >
        {icon}
      </div>
      <span
        className={`text-[13px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full ${tagColor}`}
      >
        {tag}
      </span>
    </div>
    <p className=" text-[30px] font-semibold text-[#1c2b33] leading-none mb-1">
      {value}
    </p>
    <p className="font-dm text-[15px] text-[#6b7f8a]">{label}</p>
  </div>
);

const ActionCard = ({ icon, title, subtitle, onClick, accent = false }) => (
  <div
    onClick={onClick}
    className={`rounded-[18px] p-6 flex flex-col gap-3 cursor-pointer transition hover:-translate-y-0.5 hover:shadow-lg
      ${
        accent
          ? "bg-gradient-to-br from-[#0e7490] to-[#0891b2] text-white"
          : "bg-white border border-black/[0.07] text-[#1c2b33]"
      }`}
    style={{
      boxShadow: accent
        ? "0 8px 28px rgba(14,116,144,0.22)"
        : "0 4px 20px rgba(0,0,0,0.06)",
    }}
  >
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl
      ${accent ? "bg-white/20" : "bg-[#ecfeff] text-[#0e7490]"}`}
    >
      {icon}
    </div>
    <div>
      <p
        className={`font-dm font-semibold text-[16px] ${accent ? "text-white" : "text-[#1c2b33]"}`}
      >
        {title}
      </p>
      {subtitle && (
        <p
          className={`font-dm text-[15px] mt-0.5 leading-relaxed ${accent ? "text-white/70" : "text-[#6b7f8a]"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [slot, setSlot] = useState("MORNING");
  const [reason, setReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [doctorId, setDoctorId] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const { profile } = useDoctorProfile();
  const { doctorImage } = useImage();



const [certificateEnabled, setCertificateEnabled] = useState(false);
const [certificateFee, setCertificateFee] = useState(0);

const [certificateModalOpen, setCertificateModalOpen] =
  useState(false);

const [certificateModalMode, setCertificateModalMode] =
  useState("start");

  useEffect(() => {
    loadDashboard();
    loadCertificateService();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get("/doctor/dashboard");
      setDoctorName(res.data.doctor?.doctorName || "Doctor");
      setIsOnline(res.data.doctor?.isAvailable ?? true);
    } catch (err) {
      console.error("Dashboard load failed", err);
    }
  };

  const loadCertificateService = async () => {
  try {
    const res = await api.get("/doctor/get-certificate");

    if (res.data?.success && res.data?.data) {
      const data = res.data.data;

      setCertificateEnabled(Boolean(data.enabled));
      setCertificateFee(Number(data.fee || 0));
    } else {
      setCertificateEnabled(false);
      setCertificateFee(0);
    }
  } catch (err) {
    console.error(
      "Certificate service load failed:",
      err
    );

    setCertificateEnabled(false);
    setCertificateFee(0);
  }
};

  const toggleAvailability = async () => {
    const newStatus = !isOnline;
    try {
      await updateClinicStatus(newStatus);
      setIsOnline(newStatus);
      notify.success(
        `Clinic is now ${newStatus ? "AVAILABLE" : "UNAVAILABLE"}`,
      );
    } catch {
      notify.error("Unable to update status");
    }
  };

  const handleEmergencyCancel = async () => {
    if (!reason.trim()) {
      notify.error("Please enter cancellation reason");
      return;
    }
    try {
      setCancelLoading(true);
      const res = await cancelRemainingAppointments(slot, reason);
      notify.success(res.data.message || "Appointments cancelled");
      setShowCancelModal(false);
      setReason("");
      loadDashboard();
    } catch {
      notify.error("Cancellation failed");
    } finally {
      setCancelLoading(false);
    }
  };

  const openQRModal = async () => {
    setShowQRModal(true);
    if (qrValue) return;
    setQrLoading(true);
    try {
      const res = await getMyQR();
      setQrValue(res.data.qrUrl);
      setDoctorId(res.data.doctorId);
    } catch {
      notify.error("Doctor not approved or unauthorized");
    } finally {
      setQrLoading(false);
    }
  };

  const downloadQR = async () => {
    try {
      const res = await api.post(
        "/doctor/download-qr",
        {
          qrValue,
          doctorName,
          specialization: profile?.specialization,
        },
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));

      const a = document.createElement("a");
      a.href = url;
      a.download = `doctor-${doctorId}-qr.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Download failed", err);
      notify.error("Failed to download QR");
    }
  };
  const greeting = (() => {
    const h = new Date().getHours();

    if (h >= 5 && h < 12) return "Good Morning";
    if (h >= 12 && h < 17) return "Good Afternoon";
    if (h >= 17 && h < 21) return "Good Evening";
    if (h >= 21 && h < 24) return "Good Late Night";
    return "Good Night";
  })();

  return (
    <div
      className="font-dm min-h-screen bg-[#f0f4f8] px-4 sm:px-6 py-10"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 10% 5%, rgba(14,116,144,0.05) 0%, transparent 50%), radial-gradient(ellipse at 90% 90%, rgba(14,116,144,0.04) 0%, transparent 50%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="animate-fade-up flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p
              className="font-[family-name:var(--font-dm)] text-[13px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: "#0086C3" }}
            >
              {greeting}
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-[26px] sm:text-[30px] font-extrabold text-[#0c1e3a]">
              {doctorName || "Doctor"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAvailability}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition hover:-translate-y-px
              ${
                isOnline
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
              }`}
            >
              {isOnline ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
              {isOnline ? "Available" : "Offline"}
            </button>
          </div>
        </div>

        <div className=" [animation-delay:0.07s] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-15 mb-14">
          <div
            className="bg-white border border-black/[0.07] rounded-[18px] p-6 flex gap-4 items-center"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
          >
            <div
              className="w-[72px] h-[72px] rounded-[14px] p-[2.5px] flex-shrink-0 bg-gradient-to-br from-[#0e7490] to-[#67e8f9]"
              style={{ boxShadow: "0 4px 14px rgba(14,116,144,0.18)" }}
            >
              <img
                src={doctorImage || FALLBACK_IMAGE}
                alt="doctor"
                className="w-full h-full rounded-[12px] object-cover border-2 border-white block"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
            </div>
            <div className="min-w-0">
              <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-[#0e7490] bg-[#ecfeff] border border-[rgba(14,116,144,0.15)] px-2.5 py-0.5 rounded-full mb-1.5">
                Verified Specialist
              </span>
              <h2 className="font-playfair text-[18px] font-bold text-[#1c2b33] m-0 truncate">
                {doctorName}
              </h2>
              <p className="font-dm text-[14px] text-[#6b7f8a] mt-0.5 truncate">
                {profile?.specialization || "Specialist"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[13px] text-[#9fb0b8]">
                  {profile?.experience_years ?? 0} yrs exp
                </span>
                <span className="w-1 h-1 bg-[#d1dde3] rounded-full" />
                <span className="text-[13px] text-[#9fb0b8]">
                  {profile?.rating ? Number(profile.rating).toFixed(1) : "N/A"}{" "}
                  ⭐
                </span>
              </div>
            </div>
          </div>

          <ActionCard
            icon={<FaList />}
            title="Today's Queue"
            subtitle="View and manage live patient queue"
            onClick={() => navigate("/doctordashboard/livequeue")}
          />
          <ActionCard
            icon={<FaFileMedical />}
            title="Certificate Requests"
            subtitle="View and manage certificate requests"
            onClick={() => navigate("/doctordashboard/Certificaterequest")}
            tagColor="bg-orange-50 text-orange-500"
            iconColor="bg-orange-50 text-orange-500"
          />
        </div>

        <div className="[animation-delay:0.13s] grid grid-cols-1 sm:grid-cols-3 gap-15 mb-14">
          <ActionCard
            icon={<FaExclamationTriangle className="text-red-500" />}
            title="Emergency Cancellations"
            subtitle="Cancel remaining slot appointments"
            onClick={() => setShowCancelModal(true)}
          />
          <ActionCard
            icon={<FaStar />}
            title="Patient Reviews"
            subtitle="Read feedback from your patients"
            onClick={() => navigate("/doctordashboard/reviews")}
          />

          <ActionCard
            icon={<FaBook />}
            title="Manual Booking"
            subtitle="Register a walk-in patient manually"
            onClick={() => navigate("/doctordashboard/manualbooking")}
          />
        </div>

        <div className=" [animation-delay:0.19s] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
<div className="max-w-md">
  <div
    className="
      bg-white
      rounded-[18px]
      border border-slate-200
      shadow-[0_3px_8px_rgba(15,23,42,0.10)]
      p-6
      flex flex-col
      gap-5
    "
  >
    {/* Header */}
    <div className="flex items-start justify-between gap-4">

      <div className="flex items-center gap-4">
        <div
          className="
            w-14 h-14
            rounded-2xl
            bg-[#ecfbf5]
            flex items-center justify-center
            flex-shrink-0
          "
        >
          <svg
            className="w-7 h-7 text-[#00a875]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M9 12h6m-6 4h6M7 3h7l4 4v14H7a2 2 0 01-2-2V5a2 2 0 012-2z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M14 3v5h5"
            />
          </svg>
        </div>

        <div>
          <h2 className="text-[20px] font-semibold text-[#071a35]">
            Certificate Service
          </h2>

          <p className="text-[15px] text-[#607594] mt-1">
            Medical Certificate
          </p>
        </div>
      </div>

      {/* Status */}
      <span
        className={`
          inline-flex items-center gap-2
          px-3.5 py-1.5
          rounded-full
          text-[13px] font-semibold
          ${
            certificateEnabled
              ? "bg-[#e9fbf3] text-[#08a876]"
              : "bg-[#f1f5f9] text-[#64748b]"
          }
        `}
      >
        <span
          className={`
            w-2 h-2 rounded-full
            ${
              certificateEnabled
                ? "bg-[#10b981]"
                : "bg-[#94a3b8]"
            }
          `}
        />

        {certificateEnabled ? "Active" : "Inactive"}
      </span>
    </div>

    {/* Active */}
    {certificateEnabled ? (
      <>
        <p className="text-[16px] text-[#58708f] leading-[1.7]">
          Allow patients to apply for medical certificates
          through your profile.
        </p>

        <div className="flex items-center justify-between gap-4">
          <p className="text-[14px] text-[#58708f] mb-1">
            Certificate Fee - <span className="text-[14px] font-bold text-[#071a35]"> ₹{Number(certificateFee).toLocaleString("en-IN")}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCertificateModalMode("edit");
            setCertificateModalOpen(true);
          }}
          className="
            w-full
            h-[52px]
            rounded-[10px]
            border border-[#2860ff]
            text-[#2450d8]
            text-[17px]
            font-medium
            flex items-center justify-center gap-3
            hover:bg-[#f5f8ff]
            transition
          "
        >
          <svg
            className="w-[17px] h-[17px]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.232 5.232l3.536 3.536M4 20h4l10.5-10.5a2.121 2.121 0 00-3-3L5 17v3z"
            />
          </svg>

          Edit Service
        </button>
      </>
    ) : (
      <>
        <p className="text-[18px] text-[#58708f] leading-[1.7]">
          Certificate service is currently not available to
          patients.
        </p>

        <button
          type="button"
          onClick={() => {
            setCertificateModalMode("start");
            setCertificateModalOpen(true);
          }}
          className="
            w-full
            h-[51px]
            rounded-[10px]
            bg-[#2450d8]
            text-white
            text-[17px]
            font-semibold
            flex items-center justify-center gap-3
            hover:bg-[#1f46c4]
            transition
          "
        >
          <span className="text-[25px] font-light leading-none">
            +
          </span>

          Start Service
        </button>
      </>
    )}
  </div>
</div>

          <div
            className="rounded-[18px] p-6 flex flex-col justify-between gap-4 text-white"
            style={{
              background:
                "linear-gradient(135deg, #0e7490 0%, #0891b2 60%, #06b6d4 100%)",
              boxShadow: "0 8px 28px rgba(14,116,144,0.25)",
            }}
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-xl mb-3">
                <FaQrcode />
              </div>
              <p className="font-playfair text-[19px] font-bold leading-snug">
                Patient Direct Booking
              </p>
              <p className="font-dm text-[15px] text-white/70 mt-1.5 leading-relaxed">
                Share QR code with patients for easy walk-in appointments and
                digital registration.
              </p>
            </div>
            <button
              onClick={openQRModal}
              className="self-start bg-white text-[#0e7490] font-dm font-semibold text-[13px] px-5 py-2 rounded-full hover:bg-white/90 transition"
            >
              Show QR Code
            </button>
          </div>
        </div>
      </div>

      {showQRModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[6px] flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="bg-white rounded-[24px] w-[90%] max-w-[400px] p-8 flex flex-col items-center relative animate-scale-in"
            style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.16)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[#6b7f8a] hover:bg-[#e5e7eb] transition"
            >
              <FaTimes size={13} />
            </button>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4"
              style={{
                background: "linear-gradient(135deg, #0e7490, #06b6d4)",
                color: "white",
                boxShadow: "0 4px 14px rgba(14,116,144,0.25)",
              }}
            >
              <FaQrcode />
            </div>
            <h2 className="font-playfair text-[20px] font-bold text-[#1c2b33] mb-1 text-center">
              Clinic Walk-In QR
            </h2>
            <p className="font-dm text-[12px] text-[#6b7f8a] mb-6 text-center">
              Patients can scan this to book appointments directly
            </p>

            <div className="mb-5">
              {qrLoading ? (
                <div className="flex flex-col items-center justify-center w-[220px] h-[220px] gap-3">
                  <div className="w-9 h-9 border-4 border-[#0e7490] border-t-transparent rounded-full animate-spin" />
                  <p className="font-dm text-[12px] text-[#9fb0b8]">
                    Loading QR...
                  </p>
                </div>
              ) : qrValue ? (
                <div
                  className="p-3 rounded-[14px] border-2 border-[#e0f2fe]"
                  style={{ boxShadow: "0 4px 16px rgba(14,116,144,0.10)" }}
                >
                  <Suspense fallback={<div>Loading QR...</div>}>
                    <QRCodeCanvas
                      id="doctor-qr-modal"
                      value={qrValue}
                      size={200}
                      level="H"
                    />
                  </Suspense>
                </div>
              ) : (
                <div className="flex items-center justify-center w-[220px] h-[120px]">
                  <p className="font-dm text-[13px] text-red-400">
                    QR not available
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={downloadQR}
              disabled={!qrValue || qrLoading}
              className="inline-flex items-center gap-2 font-dm font-semibold text-[13px] text-white px-6 py-2.5 rounded-full transition hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{
                background: "linear-gradient(135deg, #0e7490, #0891b2)",
                boxShadow: "0 4px 14px rgba(14,116,144,0.28)",
              }}
            >
              <FaDownload size={12} />
              Download QR
            </button>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div
          className="animate-fade-in fixed inset-0 bg-black/25 backdrop-blur-[6px] flex items-center justify-center z-50"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            className="animate-scale-in bg-white rounded-[22px] w-[90%] max-w-[440px] p-8"
            style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.14)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-xl mx-auto mb-5">
              <FaExclamationTriangle />
            </div>
            <h2 className="font-playfair text-[22px] font-bold text-[#1c2b33] text-center m-0 mb-2">
              Emergency Cancellation
            </h2>
            <p className="font-dm text-[16px] text-red-500 text-center mb-6 leading-relaxed">
              ⚠️ All remaining appointments for this slot will be cancelled and
              patients will be notified.
            </p>

            <div className="mb-4">
              <label className="block font-dm text-[14px] font-semibold tracking-[0.08em] uppercase text-[#6b7f8a] mb-1.5">
                Select Slot
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-[11px] rounded-[10px] border border-black/[0.08] bg-[#f8f9fb] focus-within:border-[#0e7490] focus-within:ring-2 focus-within:ring-[rgba(14,116,144,0.12)] focus-within:bg-white transition-all">
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="font-dm flex-1 bg-transparent border-none outline-none text-[14px] text-[#1c2b33] cursor-pointer appearance-none"
                >
                  <option value="MORNING">Morning</option>
                  <option value="EVENING">Evening</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block font-dm text-[14px] font-semibold tracking-[0.08em] uppercase text-[#6b7f8a] mb-1.5">
                Reason
              </label>
              <div className="px-3.5 py-[11px] rounded-[10px] border border-black/[0.08] bg-[#f8f9fb] focus-within:border-[#0e7490] focus-within:ring-2 focus-within:ring-[rgba(14,116,144,0.12)] focus-within:bg-white transition-all">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter cancellation reason…"
                  rows={3}
                  className="font-dm w-full bg-transparent border-none outline-none text-[14px] text-[#1c2b33] placeholder-[#c4cdd4] resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setReason("");
                  setSlot("MORNING");
                }}
                className="font-dm px-6 py-2.5 rounded-full text-[14px] font-medium text-[#6b7f8a] bg-[#f3f4f6] border-none cursor-pointer hover:bg-[#e8eaed] transition"
              >
                Close
              </button>
              <button
                onClick={handleEmergencyCancel}
                disabled={cancelLoading}
                className="font-dm px-6 py-2.5 rounded-full text-[14px] font-semibold text-white bg-red-500 border-none cursor-pointer hover:bg-red-600 disabled:opacity-50 transition"
                style={{ boxShadow: "0 4px 14px rgba(239,68,68,0.25)" }}
              >
                {cancelLoading ? "Cancelling…" : "Cancel Appointments"}
              </button>
            </div>
          </div>
        </div>
      )}

<CertificateService
  openFromDashboard={certificateModalOpen}
  initialMode={certificateModalMode}
  onClose={() => setCertificateModalOpen(false)}
  certificateEnabled={certificateEnabled}
  certificateFee={certificateFee}
  setCertificateEnabled={setCertificateEnabled}
  setCertificateFee={setCertificateFee}
/>
    </div>
  );
};

export default DoctorDashboard;
