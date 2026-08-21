import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import {
  getPatientDashboard,
  getTokenStatus,
  cancelAppointment,
} from "../../services/patientService";
import {
  Calendar,
  Clock,
  Plus,
  Stethoscope,
  FlaskConical,
  FileCheck2,
} from "lucide-react";
import { FaFlask } from "react-icons/fa";
import { notify } from "../../utils/notify";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const getImageUrl = (imagePath) => {
  if (!imagePath)
    return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  if (imagePath.startsWith("http")) return imagePath;
  return `${BASE_URL}/${imagePath}`.replace(/([^:])\/\//g, "$1/");
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good Morning";
  if (h >= 12 && h < 17) return "Good Afternoon";
  if (h >= 17 && h < 21) return "Good Evening";
  if (h >= 21 && h < 24) return "Good Late Night";
  return "Good Night";
};

const statusConfig = {
  ACCEPTED: { color: "#166534", bg: "#dcfce7" },
  PENDING: { color: "#92400e", bg: "#fef3c7" },
  CANCELLED: { color: "#991b1b", bg: "#fee2e2" },
  COMPLETED: { color: "#2563EB", bg: "#EEF2FF" },
  IN_PROGRESS: { color: "#0F766E", bg: "#f0fdf9" },
};

export default function PatientDashboard() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [patientName, setPatientName] = useState("Patient");
  const [todayToken, setTodayToken] = useState(null);
  const [tokenStatus, setTokenStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [cancelAppointmentId, setCancelAppointmentId] = useState(null);
  const { socket, connected } = useSocket();
  const isMyTurn =
    tokenStatus?.yourToken === tokenStatus?.nowServing &&
    tokenStatus?.status === "IN_PROGRESS";

  useEffect(() => {
    getPatientDashboard()
      .then((res) => {
        const data = res.data;
        setPatientName(data.patientName || "Patient");
        setTodayToken(data.todayToken || null);
        setUpcomingCount(data.upcomingCount || 0);
        if (data.appointments) {
          setAppointments(
            data.appointments.map((appt) => ({
              id: appt.id,
              doctor: appt.doctorName,
              specialization: appt.specialization,
              date: appt.appointment_date,
              slot: appt.appointment_slot,
              token: appt.token_number,
              status: appt.status,
              familyName: appt.familyName,
              relation: appt.relation,
              isFamily: !!appt.family_member_id,
              img: getImageUrl(appt.profile_image),
              experience: appt.experience,
              qualification: appt.qualification,
              consultationFee: appt.consultationFee,
              clinic: appt.clinic_name,
              address: appt.address,
              maps_link: appt.maps_link,
              city: appt.city,
              languages: appt.languages,
              rating: appt.rating,
            })),
          );
        }
      })
      .catch(() => notify.error("Dashboard load failed"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (todayToken?.appointmentId) fetchTokenStatus(todayToken.appointmentId);
  }, [todayToken]);

  useEffect(() => {
    if (!socket || !connected) return;

    const handleStatusUpdate = (data) => {
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === data.appointmentId
            ? {
                ...appt,
                status: data.status,
              }
            : appt,
        ),
      );

      if (selectedAppointment?.id === data.appointmentId) {
        setSelectedAppointment((prev) => ({
          ...prev,
          status: data.status,
        }));
      }

      notify.success(data.message);
    };

    socket.on("appointment-status-updated", handleStatusUpdate);

    return () => {
      socket.off("appointment-status-updated", handleStatusUpdate);
    };
  }, [socket, connected, selectedAppointment]);
  useEffect(() => {
    if (!socket || !connected) return;

    const handleAppointmentStarted = (data) => {
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === data.appointmentId
            ? {
                ...appt,
                status: "IN_PROGRESS",
              }
            : appt,
        ),
      );

      notify.success("Your consultation has started.");
    };

    socket.on("appointment-started", handleAppointmentStarted);

    return () => {
      socket.off("appointment-started", handleAppointmentStarted);
    };
  }, [socket, connected]);
  useEffect(() => {
    if (!socket || !connected) return;

    const handleCompleted = (data) => {
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === data.appointmentId
            ? {
                ...appt,
                status: "COMPLETED",
              }
            : appt,
        ),
      );

      notify.success("Appointment completed.");
    };

    socket.on("appointment-completed", handleCompleted);

    return () => {
      socket.off("appointment-completed", handleCompleted);
    };
  }, [socket, connected]);

  const fetchTokenStatus = async (appointmentId) => {
    try {
      const res = await getTokenStatus(appointmentId);
      setTokenStatus(res.data);
    } catch (err) {
      console.error("Token status error:", err);
    }
  };

  useEffect(() => {
    if (!socket || !connected) return;

    const handleQueueUpdate = (data) => {
      setTokenStatus((prev) => ({
        ...prev,
        nowServing: data.currentToken,
      }));
    };

    socket.on("queue-updated", handleQueueUpdate);

    return () => {
      socket.off("queue-updated", handleQueueUpdate);
    };
  }, [socket, connected]);

  const handleCancelAppointment = async () => {
    try {
      const res = await cancelAppointment(cancelAppointmentId);
      if (res.data.success) {
        notify.success("Appointment cancelled successfully");
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.id === cancelAppointmentId
              ? { ...appt, status: "CANCELLED" }
              : appt,
          ),
        );
        setSelectedAppointment((prev) => ({ ...prev, status: "CANCELLED" }));
        setShowCancelPopup(false);
      }
    } catch (err) {
      console.log(err);
      notify.error(
        err?.response?.data?.message || "Failed to cancel appointment",
      );
    }
  };

  const filteredAppointments = useMemo(() => {
    if (activeTab === "today") {
      const today = new Date().toDateString();
      return appointments.filter(
        (a) => new Date(a.date).toDateString() === today,
      );
    }
    if (activeTab === "next7") {
      const today = new Date();
      const next7 = new Date();
      next7.setDate(today.getDate() + 7);
      return appointments.filter((a) => {
        const d = new Date(a.date);
        return d >= today && d <= next7;
      });
    }
    return appointments;
  }, [appointments, activeTab]);

  if (loading) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ background: "#F8FAFC" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <p className="font-[family-name:var(--font-dm)] text-sm text-[#64748B]">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 pb-20 pt-8"
      style={{ background: "#F8FAFC" }}
    >
      {/* ── Greeting ── */}
      <div className="flex justify-between items-center mb-8 animate-[fadeUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
        <div>
          <p
            className=" text-[14px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "#2563EB" }}
          >
            {getGreeting()}
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-[26px] sm:text-[30px] font-extrabold text-[#0F172A]">
            {patientName}
          </h1>
        </div>
      </div>

      {/* ── Top Cards ── */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 mb-8 animate-[fadeUp_0.5s_0.08s_cubic-bezier(0.22,1,0.36,1)_both]">
        {/* ================= UPCOMING VISITS ================= */}
        <div
          className="lg:col-span-3 rounded-2xl overflow-hidden"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            boxShadow: "0 2px 20px rgba(15,23,42,0.07)",
          }}
        >
          <div className="px-5 py-3 " style={{ background: "#2563EB" }}>
            <p className="text-[14px] font-bold text-white tracking-wide">
              Upcoming Visits
            </p>
          </div>

          <div className="flex items-center justify-between px-5 py-6 ">
            <div>
              <h2
                className="text-[34px] font-extrabold leading-none"
                style={{ color: "#0F172A" }}
              >
                {upcomingCount}
              </h2>

              <p className="text-[13px] mt-2" style={{ color: "#64748B" }}>
                Appointments scheduled
              </p>
            </div>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#EEF2FF" }}
            >
              <Calendar size={24} color="#2563EB" />
            </div>
          </div>
        </div>

        {/* ================= TOKEN CARD ================= */}
        {todayToken ? (
          <div
            className="lg:col-span-3 rounded-2xl p-5"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 20px rgba(15,23,42,0.07)",
            }}
          >
            <p
              className="text-[12px] font-bold uppercase tracking-widest mb-3"
              style={{ color: "#94A3B8" }}
            >
              Upcoming Token Visit
            </p>

            <div className="flex items-center justify-between gap-3">
              <h2
                className="text-[30px] font-bold leading-none flex-shrink-0"
                style={{ color: "#2563EB" }}
              >
                #{tokenStatus?.yourToken || todayToken.token}
              </h2>

              <span
                className="text-[11px] font-bold px-3 py-1.5 rounded-full text-center"
                style={
                  tokenStatus?.yourToken === tokenStatus?.nowServing
                    ? {
                        color: "#166534",
                        background: "#dcfce7",
                      }
                    : {
                        color: "#2563EB",
                        background: "#EEF2FF",
                      }
                }
              >
                {tokenStatus?.nowServing !== null ? (
                  isMyTurn ? (
                    "🟢 Now Serving: Your Token"
                  ) : (
                    <>
                      Now Serving: #{tokenStatus?.nowServing}
                      <br />
                      Your Token: #{tokenStatus?.yourToken}
                    </>
                  )
                ) : (
                  "Waiting..."
                )}
              </span>
            </div>

            <p className="text-[13px] mt-3" style={{ color: "#64748B" }}>
              {todayToken.type} Visit
            </p>
          </div>
        ) : (
          <div
            className="lg:col-span-3 rounded-2xl flex flex-col items-center justify-center py-6"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 20px rgba(15,23,42,0.07)",
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
              style={{
                background: "#EEF2FF",
                border: "2px solid #DBEAFE",
              }}
            >
              <Clock size={27} color="#2563EB" />
            </div>

            <p
              className="text-[13px] font-bold uppercase tracking-widest"
              style={{ color: "#0F172A" }}
            >
              No token for today
            </p>
          </div>
        )}

        {/* ================= QUICK ACTIONS ================= */}
        <div className="md:col-span-2 lg:col-span-6">
          <p
            className="text-[15px] font-bold mb-3"
            style={{ color: "#0F172A" }}
          >
            Quick Actions
          </p>

          <div className="flex flex-wrap gap-4">
            {/* Book Now */}
            <button
              onClick={() => navigate("/client/book-appointment")}
              className="rounded-2xl w-50 flex flex-col items-center justify-center py-6 gap-3 transition-all duration-200 cursor-pointer"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 20px rgba(15,23,42,0.07)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 8px 28px rgba(37,99,235,0.15)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 2px 20px rgba(15,23,42,0.07)")
              }
            >
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "#EEF2FF" }}
                >
                  <Stethoscope size={22} color="#2563EB" />
                </div>

                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    background: "#2563EB",
                    border: "2px solid #FFFFFF",
                  }}
                >
                  <Plus size={10} color="#FFFFFF" strokeWidth={3} />
                </div>
              </div>

              <span
                className="text-[14px] font-bold text-center"
                style={{ color: "#0F172A" }}
              >
                Book Now
              </span>
            </button>

            {/* Lab Test */}
            <button
              onClick={() => navigate("/client/lab-tests")}
              className="rounded-2xl w-50 flex flex-col items-center justify-center py-6 gap-3 transition-all duration-200 cursor-pointer"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 20px rgba(15,23,42,0.07)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 8px 28px rgba(20,184,166,0.15)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 2px 20px rgba(15,23,42,0.07)")
              }
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "#F0FDFA" }}
              >
                <FlaskConical size={22} color="#14B8A6" />
              </div>

              <span
                className="text-[14px] font-bold text-center"
                style={{ color: "#0F172A" }}
              >
                Lab Test Book
              </span>
            </button>

            {/* Apply Certificate */}
            <button
              onClick={() => navigate("/client/certificatedoctors")}
              className="rounded-2xl w-50 flex flex-col items-center justify-center py-6 gap-3 transition-all duration-200 cursor-pointer"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 20px rgba(15,23,42,0.07)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 8px 28px rgba(37,99,235,0.15)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 2px 20px rgba(15,23,42,0.07)")
              }
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "#EEF2FF" }}
              >
                <FileCheck2 size={22} color="#2563EB" />
              </div>

              <span
                className="text-[14px] font-bold text-center"
                style={{ color: "#0F172A" }}
              >
                Apply Certificate
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Appointments List ── */}
      <div className="animate-[fadeUp_0.5s_0.16s_cubic-bezier(0.22,1,0.36,1)_both]">
        <div className="flex justify-between items-center mb-4">
          <h3 className=" text-[18px] font-bold text-[#0F172A]">
            Upcoming List
          </h3>
        </div>

        {/* Tabs */}
        <div className="mb-5 overflow-x-auto">
          <div
            className="flex p-1 gap-1 rounded-xl w-max"
            style={{ background: "#EEF2FF" }}
          >
            {[
              { key: "all", label: "All" },
              { key: "today", label: "Today" },
              { key: "next7", label: "Next 7 Days" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className=" text-[16px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 whitespace-nowrap"
                style={
                  activeTab === tab.key
                    ? {
                        background: "#2563EB",
                        color: "#fff",
                        boxShadow: "0 2px 8px rgba(37,99,235,0.30)",
                      }
                    : { color: "#64748B", background: "transparent" }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4">
            {filteredAppointments.map((appt, idx) => {
              const cfg = statusConfig[appt.status] || {
                color: "#64748B",
                bg: "#F8FAFC",
              };
              return (
                <div
                  key={appt.id}
                  className="bg-white rounded-2xl p-5 transition-all duration-250 hover:-translate-y-1 cursor-pointer"
                  style={{
                    boxShadow: "0 2px 12px rgba(15,23,42,0.07)",
                    border: "1px solid #E2E8F0",
                    animation: `fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) ${idx * 0.05}s both`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 8px 28px rgba(37,99,235,0.12)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 2px 12px rgba(15,23,42,0.07)")
                  }
                  onClick={() => {
                    setSelectedAppointment(appt);
                    setShowDetails(true);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={appt.img}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        style={{ border: "2px solid #EEF2FF" }}
                        alt="doctor"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                        }}
                      />
                      <div>
                        <p className=" text-[15px] font-semibold text-[#0F172A] leading-tight">
                          {appt.doctor}
                        </p>
                        <p
                          className=" text-[14px] font-semibold mt-0.5"
                          style={{ color: "#2563EB" }}
                        >
                          {appt.specialization}
                        </p>
                        <p
                          className=" text-[13px] mt-0.5 font-medium"
                          style={{
                            color: appt.isFamily ? "#0F766E" : "#14B8A6",
                          }}
                        >
                          {appt.isFamily ? `👨‍👩‍👦 ${appt.familyName}` : "👤 Self"}
                        </p>
                      </div>
                    </div>
                    <span
                      className=" text-[12px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex-shrink-0"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {appt.status}
                    </span>
                  </div>

                  <div
                    className="flex items-center justify-between mt-4 px-3 py-2.5 rounded-xl gap-2 flex-wrap"
                    style={{ background: "#F8FAFC" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} color="#94A3B8" />
                      <p className=" text-[13px] font-medium text-[#64748B]">
                        {new Date(appt.date).toDateString()}
                      </p>
                    </div>
                    <p className=" text-[13px] font-medium text-[#64748B]">
                      {appt.slot}
                    </p>
                    <p
                      className=" text-[13px] font-extrabold"
                      style={{ color: "#2563EB" }}
                    >
                      #{appt.token}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="bg-white rounded-2xl py-12 flex flex-col items-center gap-3"
            style={{
              boxShadow: "0 2px 12px rgba(15,23,42,0.07)",
              border: "1px solid #E2E8F0",
            }}
          >
            <Calendar size={32} color="#94A3B8" />
            <p
              className=" text-[14px] font-semibold"
              style={{ color: "#94A3B8" }}
            >
              No upcoming appointments
            </p>
          </div>
        )}
      </div>

      {/* ── Appointment Details Modal ── */}
      {showDetails && selectedAppointment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-hide"
            style={{ background: "#FFFFFF" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-6 pt-5 pb-4"
              style={{ borderBottom: "1px solid #E2E8F0" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "#EEF2FF" }}
                >
                  <svg
                    className="w-5 h-5"
                    style={{ color: "#2563EB" }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h2
                  className="text-[17px] font-bold"
                  style={{ color: "#0F172A" }}
                >
                  Appointment Details
                </h2>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-light transition-colors"
                style={{ color: "#94A3B8", background: "transparent" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F8FAFC";
                  e.currentTarget.style.color = "#0F172A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#94A3B8";
                }}
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* ── Doctor Row ── */}
              <div
                className="flex items-center justify-between p-4 rounded-2xl"
                style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={selectedAppointment.img}
                    alt="doctor"
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    style={{ border: "2px solid #EEF2FF" }}
                  />
                  <div>
                    <h3
                      className="text-[15px] font-bold leading-tight"
                      style={{ color: "#0F172A" }}
                    >
                      {selectedAppointment.doctor}
                    </h3>
                    <p
                      className="text-[13px] font-semibold mt-0.5"
                      style={{ color: "#2563EB" }}
                    >
                      {selectedAppointment.specialization}
                    </p>
                    <p
                      className="text-[13px] font-semibold mt-0.5"
                      style={{ color: "#2563EB" }}
                    >
                      {selectedAppointment.qualification}
                    </p>
                    <p
                      className="text-[12px] mt-0.5"
                      style={{ color: "#94A3B8" }}
                    >
                      {selectedAppointment.rating} ⭐
                    </p>
                  </div>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase"
                  style={{
                    background:
                      statusConfig[selectedAppointment.status]?.bg || "#F8FAFC",
                    color:
                      statusConfig[selectedAppointment.status]?.color ||
                      "#64748B",
                  }}
                >
                  {selectedAppointment.status}
                </span>
              </div>

              {/* ── Appointment Info Card ── */}
              <div>
                <p
                  className="text-[11px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#94A3B8" }}
                >
                  Appointment Info
                </p>
                <div
                  className="rounded-2xl p-4 grid grid-cols-2 gap-y-4 gap-x-3"
                  style={{ border: "1px solid #E2E8F0", background: "#FFFFFF" }}
                >
                  <InfoField
                    label="Patient"
                    value={
                      selectedAppointment.isFamily
                        ? selectedAppointment.familyName
                        : "Self"
                    }
                    icon={
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    }
                    circle
                  />
                  <InfoField
                    label="Date"
                    value={new Date(selectedAppointment.date).toDateString()}
                    icon={
                      <>
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </>
                    }
                  />
                  <InfoField
                    label="Time Slot"
                    value={selectedAppointment.slot}
                    icon={
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </>
                    }
                  />
                  <InfoField
                    label="Token Number"
                    value={`#${selectedAppointment.token}`}
                    icon={
                      <>
                        <line x1="4" y1="9" x2="20" y2="9" />
                        <line x1="4" y1="15" x2="20" y2="15" />
                        <line x1="10" y1="3" x2="8" y2="21" />
                        <line x1="16" y1="3" x2="14" y2="21" />
                      </>
                    }
                    highlight
                  />
                </div>
              </div>

              {/* ── Doctor & Clinic Info ── */}
              <div>
                <p
                  className="text-[11px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#94A3B8" }}
                >
                  Doctor &amp; Clinic Information
                </p>
                <div
                  className="rounded-2xl p-5 grid grid-cols-2 gap-5"
                  style={{ border: "1px solid #E2E8F0", background: "#FFFFFF" }}
                >
                  <SimpleField
                    label="Experience"
                    value={`${selectedAppointment.experience} Years`}
                  />
                  <SimpleField
                    label="Qualification"
                    value={selectedAppointment.qualification}
                  />
                  <SimpleField
                    label="Clinic"
                    value={selectedAppointment.clinic}
                  />
                  <SimpleField
                    label="Consultation Fee"
                    value={`₹${selectedAppointment.consultationFee}`}
                    highlight
                  />
                  <SimpleField
                    label="Languages"
                    value={selectedAppointment.languages}
                  />
                  <SimpleField label="City" value={selectedAppointment.city} />
                  <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Address */}
                    <div className="space-y-1">
                      <span
                        className="text-[11px] font-semibold uppercase tracking-wide"
                        style={{ color: "#94A3B8" }}
                      >
                        Address
                      </span>
                      <p
                        className="text-[13px] font-semibold break-words"
                        style={{ color: "#0F172A" }}
                      >
                        {selectedAppointment.address}
                      </p>
                    </div>

                    {/* Maps Link */}
                    <div className="space-y-1 flex flex-col">
                      <span
                        className="text-[11px] font-semibold uppercase tracking-wide"
                        style={{ color: "#94A3B8" }}
                      >
                        Maps Link
                      </span>

                      {selectedAppointment.maps_link ? (
                        <a
                          href={selectedAppointment.maps_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          📍 Get Directions
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">
                          Location not available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Actions ── */}
              <div>
                <p
                  className="text-[11px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#94A3B8" }}
                >
                  Actions
                </p>
                <div className="flex gap-3">
                  {/* Cancel Button */}
                  <button
                    onClick={() => {
                      setCancelAppointmentId(selectedAppointment.id);
                      setShowCancelPopup(true);
                    }}
                    disabled={
                      selectedAppointment.status === "CANCELLED" ||
                      selectedAppointment.status === "COMPLETED"
                    }
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[13px] transition-all"
                    style={
                      selectedAppointment.status === "CANCELLED" ||
                      selectedAppointment.status === "COMPLETED"
                        ? {
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            color: "#94A3B8",
                            cursor: "not-allowed",
                          }
                        : {
                            background: "#fff1f1",
                            border: "1px solid #fecaca",
                            color: "#EF4444",
                            cursor: "pointer",
                          }
                    }
                    onMouseEnter={(e) => {
                      if (
                        selectedAppointment.status !== "CANCELLED" &&
                        selectedAppointment.status !== "COMPLETED"
                      )
                        e.currentTarget.style.background = "#ffe4e4";
                    }}
                    onMouseLeave={(e) => {
                      if (
                        selectedAppointment.status !== "CANCELLED" &&
                        selectedAppointment.status !== "COMPLETED"
                      )
                        e.currentTarget.style.background = "#fff1f1";
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                    {selectedAppointment.status === "CANCELLED"
                      ? "Appointment Cancelled"
                      : selectedAppointment.status === "COMPLETED"
                        ? "Appointment Completed"
                        : "Cancel Appointment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Confirm Popup ── */}
      {showCancelPopup && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-[fadeUp_0.2s_ease]">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "#fff1f1" }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: "#EF4444" }}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-center text-[#0F172A] mb-3">
              Cancel Appointment?
            </h2>

            <p className="text-sm text-[#64748B] text-center leading-relaxed mb-8">
              Are you sure you want to cancel this appointment? This action
              cannot be undone.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCancelPopup(false)}
                className="py-3 rounded-2xl font-semibold transition-colors"
                style={{
                  border: "1px solid #E2E8F0",
                  color: "#0F172A",
                  background: "#fff",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#F8FAFC")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#fff")
                }
              >
                Keep Appointment
              </button>

              <button
                onClick={handleCancelAppointment}
                className="py-3 rounded-2xl font-semibold text-white transition-colors"
                style={{
                  background: "#EF4444",
                  boxShadow: "0 4px 14px rgba(239,68,68,0.25)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#DC2626")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#EF4444")
                }
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Small helper components ── */
function InfoField({ label, value, icon, circle }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        <svg
          className="w-3.5 h-3.5"
          style={{ color: "#94A3B8" }}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
          {circle && <circle cx="12" cy="7" r="4" />}
        </svg>
        <span className="text-xs text-[#94A3B8]">{label}</span>
      </div>
      <p className="text-sm font-semibold text-[#0F172A]">{value}</p>
    </div>
  );
}

function SimpleField({ label, value }) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-[#94A3B8]">{label}</span>
      <p className="text-sm font-semibold text-[#0F172A] break-words">
        {value}
      </p>
    </div>
  );
}

function Action({ icon, label, onClick, color }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: `${color}15`,
        border: `1px solid ${color}30`,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${color}25`)}
      onMouseLeave={(e) => (e.currentTarget.style.background = `${color}15`)}
    >
      <div style={{ color }}>{icon}</div>
      <p className="font-[family-name:var(--font-dm)] text-[12px] font-bold text-[#0F172A]">
        {label}
      </p>
    </div>
  );
}
