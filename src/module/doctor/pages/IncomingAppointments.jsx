import { useEffect, useState, useMemo, useCallback } from "react";
import { notify } from "../../../utils/notify";
import api from "../../../services/api";
import { useSocket } from "../../../context/SocketContext";
import {
  respondAppointment,
  autoAcceptAppointments,
} from "../../../services/doctorService";
import { Navigate, useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path}`.replace(/([^:])\/\//g, "$1/");
};

const getInitial = (name) => {
  if (!name) return "WP";
  const words = name.trim().split(" ").filter(Boolean);
  if (words.length === 0) return "WP";
  if (words.length === 1) return words[0][0].toUpperCase();
  return words[0][0].toUpperCase() + words[1][0].toUpperCase();
};

const isToday = (date) => {
  const d = new Date(date),
    today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

const FILTERS = ["ALL", "TODAY", "MORNING", "EVENING"];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { socket, connected } = useSocket();
  const navigate = useNavigate();

  const loadAppointments = useCallback(async () => {
    try {
      const res = await api.get("/doctor/appointments/incoming");
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Load appointments error:", err);
      notify.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewAppointment = () => {
      loadAppointments();
      notify.success("New appointment received");
    };

    const handleStatusUpdate = () => {
      loadAppointments();
    };

    socket.on("appointment-requested", handleNewAppointment);

    socket.on("appointment-status-updated", handleStatusUpdate);

    return () => {
      socket.off("appointment-requested", handleNewAppointment);

      socket.off("appointment-status-updated", handleStatusUpdate);
    };
  }, [socket, connected, loadAppointments]);

  const handleAutoAccept = async () => {
    try {
      const res = await autoAcceptAppointments();
      notify.success(res.data.message || "All appointments accepted");
      loadAppointments();
    } catch (err) {
      console.error("Auto accept error:", err);
      notify.error("Auto accept failed");
    }
  };

  const confirmAutoAccept = async () => {
    setShowConfirmModal(false);
    await handleAutoAccept();
  };

  const filteredAppointments = useMemo(() => {
    let list = appointments;
    if (filter === "TODAY")
      list = appointments.filter((a) => isToday(a.appointment_date));
    if (filter === "MORNING")
      list = appointments.filter((a) => a.appointment_slot === "MORNING");
    if (filter === "EVENING")
      list = appointments.filter((a) => a.appointment_slot === "EVENING");
    return [...list].sort((a, b) => {
      if (a.status === "PENDING" && b.status !== "PENDING") return -1;
      if (a.status !== "PENDING" && b.status === "PENDING") return 1;
      if (isToday(a.appointment_date) && !isToday(b.appointment_date))
        return -1;
      if (!isToday(a.appointment_date) && isToday(b.appointment_date)) return 1;
      return new Date(a.appointment_date) - new Date(b.appointment_date);
    });
  }, [appointments, filter]);

  const handleRespond = async (id, action) => {
    if (processingId) return;
    try {
      setProcessingId(id);
      await respondAppointment(id, action);
      notify.success(`Appointment ${action.toLowerCase()}ed`);
      await loadAppointments();
    } catch (err) {
      console.error("Respond appointment error:", err);
      if (!err?.response?.data?.message?.includes("already processed")) {
        notify.error("Action failed");
      }
      loadAppointments();
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="font-dm min-h-screen bg-[#f5f3ef] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[rgba(14,116,144,0.2)] border-t-[#0e7490] rounded-full animate-spin" />
        <p className="text-[#6b7f8a] text-sm">Loading appointments…</p>
      </div>
    );
  }

  return (
    <div
      className="font-dm min-h-screen bg-[#f5f3ef] px-4 sm:px-6 py-10"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 10% 5%, rgba(14,116,144,0.05) 0%, transparent 50%)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="font-[family-name:var(--font-dm)] text-[13px] font-semibold mb-5 flex items-center gap-1.5 cursor-pointer transition-all duration-200 hover:-translate-x-1"
          style={{ color: "#0086C3", background: "none", border: "none" }}
        >
          ← Back
        </button>
        <div className="animate-fade-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-playfair text-[clamp(24px,3.5vw,36px)] font-bold text-[#1c2b33] leading-tight m-0">
              Incoming Appointments
            </h1>
          </div>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="font-dm self-start sm:self-auto px-6 py-2.5 rounded-full bg-[#0e7490] text-white text-[13px] font-semibold border-none cursor-pointer transition hover:bg-[#0c5f75] hover:-translate-y-px"
            style={{ boxShadow: "0 4px 14px rgba(14,116,144,0.22)" }}
          >
            Auto Accept All
          </button>
        </div>

        {/* FILTER TABS */}
        <div className="animate-fade-up [animation-delay:0.07s] flex gap-2 mb-6 overflow-x-auto scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-dm px-5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap border transition cursor-pointer
                ${
                  filter === f
                    ? "bg-[#0e7490] text-white border-[#0e7490]"
                    : "bg-white text-[#6b7f8a] border-black/[0.08] hover:border-[#0e7490] hover:text-[#0e7490]"
                }`}
            >
              {f === "ALL"
                ? `All (${appointments.length})`
                : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="animate-fade-up [animation-delay:0.13s] space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-4xl opacity-30">📋</span>
              <p className="font-dm text-[14px] text-[#6b7f8a]">
                No appointments found
              </p>
            </div>
          ) : (
            filteredAppointments.map((a) => {
              const displayName =
                a.familyMemberName ||
                a.patientName ||
                a.patient_name ||
                a.walk_in_patient_name ||
                "Walk-in Patient";
              const isProcessing = processingId === a.id;
              const imgUrl = getImageUrl(a.profile_image);
              return (
                <div
                  key={a.id}
                  className="bg-white border border-black/[0.07] rounded-[18px] p-5 sm:p-6 transition hover:shadow-md"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {imgUrl && !a.familyMemberName ? (
                        <img
                          src={imgUrl}
                          alt={displayName}
                          className="w-12 h-12 rounded-full object-cover border border-black/[0.07] flex-shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#0e7490] text-white flex items-center justify-center font-playfair font-bold text-[16px] flex-shrink-0">
                          {getInitial(displayName)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-dm font-semibold text-[15px] text-[#1c2b33] truncate">
                          {displayName}
                        </p>
                        <p className="font-dm text-[14px] font-semibold  text-[#6b7f8a]">
                          {a.appointment_slot}{" "}
                          <span className="font-bold text-[#000000]">
                            ·{" "}
                            {new Date(a.appointment_date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-dm text-[11px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full bg-[#ecfeff] text-[#0e7490] border border-[rgba(14,116,144,0.15)]">
                        #{a.token_number}
                      </span>
                      <span
                        className={`font-dm text-[11px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full border
                        ${
                          a.status === "PENDING"
                            ? "bg-amber-50 text-amber-600 border-amber-200"
                            : "bg-emerald-50 text-emerald-600 border-emerald-200"
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>

                    {a.status === "PENDING" && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          disabled={isProcessing || !!processingId}
                          onClick={() => handleRespond(a.id, "ACCEPT")}
                          className="font-dm px-5 py-2 rounded-full text-[13px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600 border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                          {isProcessing ? "…" : "Accept"}
                        </button>
                        <button
                          disabled={isProcessing || !!processingId}
                          onClick={() => handleRespond(a.id, "REJECT")}
                          className="font-dm px-5 py-2 rounded-full text-[13px] font-semibold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                          {isProcessing ? "…" : "Reject"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="animate-fade-in fixed inset-0 bg-black/25 backdrop-blur-[6px] flex items-center justify-center z-50">
          <div
            className="animate-scale-in bg-white rounded-[22px] w-[90%] max-w-[400px] p-8 text-center"
            style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.14)" }}
          >
            <div className="w-12 h-12 rounded-xl bg-[#ecfeff] text-[#0e7490] text-xl flex items-center justify-center mx-auto mb-5">
              ✦
            </div>
            <h3 className="font-playfair text-[22px] font-bold text-[#1c2b33] m-0 mb-2">
              Auto Accept All?
            </h3>
            <p className="font-dm text-[13px] text-[#6b7f8a] m-0 mb-7 leading-relaxed">
              All pending appointments will be accepted at once.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="font-dm px-6 py-2.5 rounded-full text-[13px] font-medium text-[#6b7f8a] bg-[#f3f4f6] border-none cursor-pointer hover:bg-[#e8eaed] transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmAutoAccept}
                className="font-dm px-6 py-2.5 rounded-full text-[13px] font-semibold text-white bg-[#0e7490] border-none cursor-pointer hover:bg-[#0c5f75] transition"
                style={{ boxShadow: "0 4px 14px rgba(14,116,144,0.22)" }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
