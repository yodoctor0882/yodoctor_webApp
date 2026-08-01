import React, { useEffect, useState, useCallback, useMemo } from "react";
import { notify } from "../../../utils/notify";
import { useNavigate } from "react-router-dom";
import {
  getTodayQueue,
  startAppointment,
  callNextToken,
  skipAppointment,
  markNoShow,
  getCurrentAppointment,
  getNextAppointment,
  recallPatient,
} from "../../../services/doctorService";
import {
  FaClock,
  FaUserSlash,
  FaStepForward,
  FaBullhorn,
} from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_URL || "";
const FALLBACK_IMAGE = "https://ui-avatars.com/api/?name=Patient";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  return `${BASE_URL}/${imagePath}`.replace(/([^:])\/\//g, "$1/");
};

const getInitial = (name) => {
  if (!name) return "WP";

  const words = name.trim().split(" ").filter(Boolean);

  if (words.length === 0) return "WP";

  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }

  return words[0][0].toUpperCase() + words[1][0].toUpperCase();
};

const STATUS = {
  ACCEPTED: {
    label: "Waiting",
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-[#ecfeff]",
    text: "text-[#0e7490]",
    border: "border-[rgba(14,116,144,0.2)]",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },
  SKIPPED: {
    label: "Skipped",
    bg: "bg-red-50",
    text: "text-red-500",
    border: "border-red-200",
  },
};

const ActionBtn = ({
  icon,
  label,
  onClick,
  color = "cyan",
  disabled = false,
}) => {
  const colors = {
    cyan: "bg-[#ecfeff] text-[#0e7490] border border-[rgba(14,116,144,0.18)] hover:bg-cyan-100",
    red: "bg-red-50 text-red-500 border border-red-100 hover:bg-red-100",
    amber:
      "bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100",
  };
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`flex flex-col items-center justify-center gap-1.5 p-3 sm:p-5 rounded-[14px] transition hover:-translate-y-0.5 ${colors[color]}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
    >
      <div className="text-xl sm:text-2xl">{icon}</div>
      <p className="font-dm text-[14px] sm:text-[15px] font-semibold text-center leading-tight">
        {label}
      </p>
    </div>
  );
};

const TodaysQueue = () => {
  const navigate = useNavigate();

  const [slot, setSlot] = useState("MORNING");
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [callingNext, setCallingNext] = useState(false);
  const [nextPatient, setNextPatient] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);

  const [actionProcessing, setActionProcessing] = useState({
    noShow: false,
    skip: false,
    recall: null,
  });

  const hasSkipped = queue.some((p) => p.status === "SKIPPED");

  const loadQueue = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getTodayQueue(slot);
      setQueue(data.queue || []);
    } catch (err) {
      console.error("Load queue error:", err);
      notify.error("Unable to load queue");
    } finally {
      setLoading(false);
    }
  }, [slot]);

  const loadCurrentPatient = useCallback(async () => {
    try {
      const res = await getCurrentAppointment(slot);
      setCurrentPatient(res.data?.active ? res.data.appointment : null);
    } catch (err) {
      console.error("Current patient load failed", err);
    }
  }, [slot]);

  const loadNextPatient = useCallback(async () => {
    try {
      const res = await getNextAppointment(slot);
      setNextPatient(res.data?.next ? res.data.appointment : null);
    } catch (err) {
      console.error("Next patient load failed", err);
    }
  }, [slot]);

  useEffect(() => {
    const refreshAll = () => {
      loadQueue();
      loadCurrentPatient();
      loadNextPatient();
    };
    refreshAll();
    const interval = setInterval(refreshAll, 10000);
    return () => clearInterval(interval);
  }, [loadQueue, loadCurrentPatient, loadNextPatient]);

  const handleStart = async (id) => {
    try {
      await startAppointment(id, { slot });
      notify.success("Appointment started");
      loadQueue();
    } catch (err) {
      console.error("Start appointment error:", err);
      notify.error(
        err.response?.data?.message || "Unable to start appointment",
      );
    }
  };

  const handleCallNext = async () => {
    if (callingNext) return;
    try {
      setCallingNext(true);
      const res = await callNextToken({ slot });
      notify.success(res.data.message);
      loadQueue();
    } catch (err) {
      console.error("Call next token error:", err);
      notify.error("Unable to call next token");
    } finally {
      setCallingNext(false);
    }
  };

  const handleMarkNoShow = async () => {
    if (actionProcessing.noShow) return;
    try {
      setActionProcessing((prev) => ({ ...prev, noShow: true }));
      const res = await markNoShow(slot);
      notify.success(res.data.message || "No show marked");
      loadQueue();
    } catch (err) {
      console.error("Mark no show error:", err);
      notify.error("Failed to mark no show");
    } finally {
      setActionProcessing((prev) => ({ ...prev, noShow: false }));
    }
  };

  const handleSkipAppointment = async () => {
    if (actionProcessing.skip) return;
    try {
      setActionProcessing((prev) => ({ ...prev, skip: true }));

      const { data } = await getTodayQueue(slot);
      const freshQueue = data.queue || [];
      const current = freshQueue.find((p) => p.status === "IN_PROGRESS");
      if (!current) {
        notify.info("No appointment in progress");
        return;
      }
      await skipAppointment(current.id);
      notify.info("Appointment skipped");
      await callNextToken({ slot });
      loadQueue();
    } catch (err) {
      console.error("Skip appointment error:", err);
      notify.error("Unable to skip appointment");
    } finally {
      setActionProcessing((prev) => ({ ...prev, skip: false }));
    }
  };

  const handleRecall = async (id) => {
    if (actionProcessing.recall === id) return;
    try {
      setActionProcessing((prev) => ({ ...prev, recall: id }));
      await recallPatient(id);
      notify.success("Patient added back to queue");
      loadQueue();
    } catch (err) {
      console.error("Recall error:", err);
      notify.error("Recall failed");
    } finally {
      setActionProcessing((prev) => ({ ...prev, recall: null }));
    }
  };

  const handleStopOnly = async () => {
    try {
      await callNextToken({ slot });

      notify.success("Last appointment completed");
      loadQueue();
      loadCurrentPatient();
      loadNextPatient();
    } catch (err) {
      notify.error("Failed to stop appointment");
    }
  };

  const { total, waiting, done, inProgress } = useMemo(
    () => ({
      total: queue.length,
      waiting: queue.filter((p) => p.status === "ACCEPTED").length,
      done: queue.filter((p) => p.status === "COMPLETED").length,
      inProgress: queue.some((p) => p.status === "IN_PROGRESS"),
    }),
    [queue],
  );

  const sortedQueue = useMemo(
    () =>
      [...queue].sort((a, b) => {
        if (a.status === "IN_PROGRESS") return -1;
        if (b.status === "IN_PROGRESS") return 1;
        return a.token_number - b.token_number;
      }),
    [queue],
  );

  return (
    <div
      className="font-dm min-h-screen bg-[#f5f3ef] px-3 sm:px-6 py-6 sm:py-10"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 10% 5%, rgba(14,116,144,0.05) 0%, transparent 50%), radial-gradient(ellipse at 90% 90%, rgba(14,116,144,0.04) 0%, transparent 50%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="animate-fade-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <p className="text-[14px] font-semibold tracking-[0.12em] uppercase text-[#0e7490] mb-1">
              Clinic Management
            </p>
            <h1 className="font-playfair text-[clamp(22px,3.5vw,36px)] font-bold text-[#1c2b33] leading-tight m-0">
              Today's Queue
            </h1>
          </div>

          <div
            className="bg-white border border-black/[0.08] rounded-xl p-1 flex gap-1 self-start sm:self-auto"
            style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
          >
            {["MORNING", "EVENING"].map((s) => (
              <button
                key={s}
                onClick={() => setSlot(s)}
                className={`px-4 sm:px-5 py-2 rounded-[10px] text-[12px] sm:text-[13px] font-semibold transition cursor-pointer border-none
                  ${slot === s ? "bg-[#0e7490] text-white shadow-sm" : "text-[#6b7f8a] hover:bg-[#f0f0f0]"}`}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:0.07s] grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {[
            {
              label: "Total",
              value: total,
              tag: "Today",
              tagCls: "bg-[#ecfeff] text-[#0e7490]",
              numCls: "text-[#1c2b33]",
            },
            {
              label: "Waiting",
              value: waiting,
              tag: "Queue",
              tagCls: "bg-amber-50 text-amber-500",
              numCls: "text-[#1c2b33]",
            },
            {
              label: "Done",
              value: done,
              tag: "Finished",
              tagCls: "bg-emerald-50 text-emerald-600",
              numCls: "text-[#1c2b33]",
            },
          ].map(({ label, value, tag, tagCls, numCls }) => (
            <div
              key={label}
              className="bg-white border border-black/[0.07] rounded-[14px] sm:rounded-[18px] p-3 sm:p-5"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <p className="font-dm text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-[#6b7f8a]">
                  {label}
                </p>
                <span
                  className={`hidden sm:inline text-[10px] font-semibold tracking-widest uppercase px-2.5 py-0.5 rounded-full ${tagCls}`}
                >
                  {tag}
                </span>
              </div>
              <p
                className={`text-[28px] sm:text-[30px] font-bold leading-none ${numCls}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="animate-fade-up [animation-delay:0.13s] grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <ActionBtn
            icon={<FaClock />}
            label="Incoming Appointments"
            color="cyan"
            onClick={() => navigate("/doctordashboard/incoming")}
          />
          <ActionBtn
            icon={<FaStepForward />}
            label="Skip Appointment"
            color="amber"
            disabled={actionProcessing.skip}
            onClick={handleSkipAppointment}
          />
          <ActionBtn
            icon={<FaUserSlash />}
            label="Mark No Show"
            color="red"
            disabled={!hasSkipped}
            onClick={handleMarkNoShow}
          />
        </div>

        <div className="animate-fade-up [animation-delay:0.18s] grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-6 sm:mb-8">
          <div
            className="rounded-[18px] p-4 flex flex-col justify-between gap-3 text-white min-h-[140px]"
            style={{
              background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
              boxShadow: "0 8px 28px rgba(5,150,105,0.22)",
            }}
          >
            <div>
              <p className="font-dm text-[13px] font-semibold tracking-[0.12em] uppercase text-white/70 mb-2">
                Current Patient
              </p>
              {currentPatient ? (
                <div className="flex items-center gap-3 mb-3">
                  {currentPatient.profile_image ? (
                    <img
                      src={getImageUrl(currentPatient.profile_image)}
                      alt="patient"
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-white/30 flex-shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                      {getInitial(
                        currentPatient.walk_in_patient_name ||
                          currentPatient.familyMemberName ||
                          currentPatient.patientName ||
                          "Patient",
                      )}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="font-playfair text-[16px] sm:text-[18px] font-bold leading-tight truncate">
                      {currentPatient.walk_in_patient_name ||
                        currentPatient.familyMemberName ||
                        currentPatient.patientName ||
                        "Patient"}
                    </h3>

                    <p className="font-dm text-[12px] text-white/70">
                      Token #{currentPatient.token_number}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="font-dm text-[14px] text-white/60 mb-3">
                  No patient in consultation
                </p>
              )}
            </div>

            {currentPatient &&
              (inProgress ? (
                nextPatient ? (
                  <button
                    disabled
                    className="self-start bg-gray-300 text-gray-600 font-semibold px-4 py-2 rounded-full cursor-not-allowed"
                  >
                    Consulting Patient
                  </button>
                ) : (
                  <button
                    onClick={handleStopOnly}
                    className="self-start bg-red-600 text-white font-semibold px-4 py-2 rounded-full"
                  >
                    ⏹ Stop Patient
                  </button>
                )
              ) : (
                <button
                  onClick={() => handleStart(currentPatient.id)}
                  className="self-start bg-white text-emerald-700 font-semibold px-4 py-2 rounded-full"
                >
                  ▶ Start Appointment
                </button>
              ))}
          </div>

          {/* NEXT */}
          <div
            className="rounded-[18px] p-4 flex flex-col justify-between gap-3 text-white min-h-[140px]"
            style={{
              background: "linear-gradient(135deg, #0e7490 0%, #0891b2 100%)",
              boxShadow: "0 8px 28px rgba(14,116,144,0.22)",
            }}
          >
            <div>
              <p className="font-dm text-[13px] font-semibold tracking-[0.12em] uppercase text-white/70 mb-2">
                Next Patient
              </p>

              {nextPatient ? (
                <div className="flex items-center gap-3 mb-3">
                  {nextPatient.profile_image ? (
                    <img
                      src={getImageUrl(nextPatient.profile_image)}
                      alt="patient"
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-white/30 flex-shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                      {getInitial(
                        nextPatient.walk_in_patient_name ||
                          nextPatient.familyMemberName ||
                          nextPatient.patientName ||
                          "Patient",
                      )}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="font-playfair text-[16px] sm:text-[18px] font-bold leading-tight truncate">
                      {nextPatient.walk_in_patient_name ||
                        nextPatient.familyMemberName ||
                        nextPatient.patientName ||
                        "Patient"}
                    </h3>

                    <p className="font-dm text-[12px] text-white/70">
                      Token #{nextPatient.token_number}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="font-dm text-[14px] text-white/60 mb-3">
                  No patient in queue
                </p>
              )}
            </div>
            {nextPatient &&
              (!inProgress ? (
                // ✅ FIRST TIME → START (Token #3 se hi start hoga)
                <button
                  onClick={() => handleStart(nextPatient.id)}
                  className="self-start bg-white text-emerald-700 font-semibold px-4 py-2 rounded-full"
                >
                  ▶ Start Appointment
                </button>
              ) : (
                // ✅ AFTER START → CALL NEXT
                <button
                  onClick={handleCallNext}
                  disabled={callingNext}
                  className="self-start bg-white text-[#0e7490] font-semibold px-4 py-2 rounded-full"
                >
                  📢 {callingNext ? "Calling..." : "Call Next Token"}
                </button>
              ))}
          </div>
        </div>

        {/* ── PATIENT LIST ── */}
        <div className="animate-fade-up [animation-delay:0.23s]">
          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <h2 className="font-playfair text-[20px] sm:text-[22px] font-bold text-[#1c2b33] m-0">
              Patient List
            </h2>
            <span className="inline-flex items-center gap-1.5 bg-[#ecfeff] text-[#0e7490] text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full border border-[rgba(14,116,144,0.15)]">
              <span className="animate-pulse-dot w-1.5 h-1.5 bg-[#0e7490] rounded-full inline-block" />
              Live
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-9 h-9 border-4 border-[rgba(14,116,144,0.2)] border-t-[#0e7490] rounded-full animate-spin" />
              <p className="font-dm text-[13px] text-[#6b7f8a]">
                Loading queue…
              </p>
            </div>
          ) : queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="text-4xl opacity-30">🏥</span>
              <p className="font-dm text-[14px] text-[#6b7f8a]">
                No patients in queue
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {sortedQueue.map((p) => {
                const st = STATUS[p.status] || STATUS.ACCEPTED;
                const isRecalling = actionProcessing.recall === p.id;
                return (
                  <div
                    key={p.id}
                    className={`bg-white border border-black/[0.07] rounded-[14px] sm:rounded-[16px] px-3 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition
                      ${p.status === "COMPLETED" ? "opacity-60" : ""}
                      ${p.status === "IN_PROGRESS" ? "border-[rgba(14,116,144,0.25)] ring-2 ring-[rgba(14,116,144,0.08)]" : ""}`}
                    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
                  >
                    {/* Left — avatar + name + token */}
<div className="flex items-center gap-3">
  {p.patientImage ? (
    <img
      src={getImageUrl(p.patientImage)}
      alt="patient"
      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-black/[0.08] flex-shrink-0"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = FALLBACK_IMAGE;
      }}
    />
  ) : (
    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0e7490] text-white flex items-center justify-center font-bold text-sm sm:text-base border border-black/[0.08] flex-shrink-0">
      {getInitial(
        p.walk_in_patient_name ||
          p.familyMemberName ||
          p.patientName ||
          "Walk-in"
      )}
    </div>
  )}

  <div className="min-w-0 flex-1">
    <p
      className={`font-dm font-semibold text-[13px] sm:text-[14px] text-[#1c2b33] truncate ${
        p.status === "COMPLETED" ? "line-through" : ""
      }`}
    >
      {p.walk_in_patient_name ||
        p.familyMemberName ||
        p.patientName ||
        "Walk-in"}
    </p>

    <p className="font-dm text-[14px] sm:text-[15px] text-[#6b7f8a]">
      {p.reason || "Consultation"}
    </p>
  </div>

  <div className="text-center ml-auto sm:ml-0">
    <p className="font-dm text-[14px] sm:text-[15px] font-semibold tracking-widest uppercase text-[#9fb0b8]">
      TOKEN
    </p>

    <p className="font-playfair text-[20px] sm:text-[22px] font-bold text-[#1c2b33] leading-none">
      {p.token_number}
    </p>
  </div>
</div>

                    {/* Right — status + actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-dm text-[10px] sm:text-[13px] font-semibold tracking-widest uppercase px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}
                      >
                        {st.label}
                      </span>

                      {p.status === "COMPLETED" && (
                        <button
                          onClick={() =>
                            navigate(`/doctordashboard/prescription/${p.id}`)
                          }
                          className="font-dm text-[14px] sm:text-[15px] font-semibold text-white bg-[#0e7490] hover:bg-[#0c5f75] px-3 sm:px-4 py-1.5 rounded-full border-none cursor-pointer transition"
                          style={{
                            boxShadow: "0 2px 8px rgba(14,116,144,0.2)",
                          }}
                        >
                          {p.hasPrescription ? "Update Rx" : "+ Prescription"}
                        </button>
                      )}

                      {p.status === "SKIPPED" && (
                        <button
                          disabled={isRecalling}
                          onClick={() => handleRecall(p.id)}
                          className="font-dm text-[14px] sm:text-[15px] font-semibold text-[#0e7490] bg-[#ecfeff] hover:bg-cyan-100 px-3 sm:px-4 py-1.5 rounded-full border border-[rgba(14,116,144,0.18)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {isRecalling ? "…" : "Recall"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodaysQueue;
