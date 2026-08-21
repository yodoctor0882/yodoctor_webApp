import React, { useEffect, useState, useCallback, useMemo } from "react";
import { notify } from "../../../utils/notify";
import api from "../../../services/api";
import { useSocket } from "../../../context/SocketContext";
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
  respondAppointment,
  autoAcceptAppointments,
} from "../../../services/doctorService";

import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaUsers,
  FaClipboardList,
  FaStepForward,
  FaUserSlash,
  FaBell,
  FaCheck,
  FaTimes,
  FaArrowRight,
  FaPlay,
  FaStop,
  FaBullhorn,
  FaClock,
  FaChevronRight,
  FaUserMd,
} from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_URL || "";
const FALLBACK_IMAGE =
  "https://ui-avatars.com/api/?name=Patient&background=eaf7fb&color=0e7490";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${BASE_URL}/${imagePath}`.replace(/([^:])\/\//g, "$1/");
};

const getInitial = (name) => {
  if (!name) return "WP";

  const words = name.trim().split(" ").filter(Boolean);

  if (words.length === 0) return "WP";
  if (words.length === 1) return words[0][0].toUpperCase();

  return words[0][0].toUpperCase() + words[1][0].toUpperCase();
};

const isToday = (date) => {
  const d = new Date(date);
  const today = new Date();

  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

const isTomorrow = (date) => {
  const d = new Date(date);
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
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
    bg: "bg-[#e8f7fc]",
    text: "text-[#0e7490]",
    border: "border-[#b9e4f0]",
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

const ActionButton = ({
  icon,
  label,
  onClick,
  color = "cyan",
  disabled = false,
}) => {
  const colors = {
    cyan: "bg-[#e9f8fc] text-[#0e7490] border-[#c9eaf2] hover:bg-[#dff3f8]",
    red: "bg-red-50 text-red-500 border-red-100 hover:bg-red-100",
    amber: "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100",
  };

  return (
    <button
      type="button"
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-semibold transition-all
        ${colors[color]}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:-translate-y-px"}`}
    >
      {icon}
      {label}
    </button>
  );
};

const StatCard = ({ icon, iconBg, iconColor, label, value, extra }) => (
  <div className="bg-white rounded-xl border border-[#dce3e8] shadow-[0_2px_8px_rgba(0,0,0,0.05)] min-h-[112px] overflow-hidden">
    <div className="flex items-start justify-between h-full">
      <div className="p-4 sm:p-5">
        <p className="font-dm text-[12px] sm:text-[13px] font-semibold text-[#727d85] tracking-wide mb-4">
          {label}
        </p>

        <div className="flex items-end gap-2">
          <span className="font-dm text-[29px] sm:text-[32px] leading-none font-bold text-[#132333]">
            {value}
          </span>

          {extra && (
            <span className="font-dm text-[11px] sm:text-[12px] font-semibold text-[#267894] mb-0.5">
              {extra}
            </span>
          )}
        </div>
      </div>

      <div
        className={`w-[52px] h-[52px] rounded-bl-xl flex items-center justify-center text-[20px] ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const DashboardBanner = ({
  type,
  patient,
  onStart,
  onFinish,
  onCallNext,
  callingNext,
  inProgress,
  hasNext,
}) => {
  const isCurrent = type === "current";

  const name = patient
    ? patient.walk_in_patient_name ||
      patient.familyMemberName ||
      patient.patientName ||
      "Patient"
    : null;

  const image = patient?.profile_image
    ? getImageUrl(patient.profile_image)
    : null;

  return (
    <div
      className={`rounded-[18px] p-4 flex flex-col justify-between gap-3 text-white min-h-[140px] ${
        isCurrent
          ? "bg-gradient-to-r from-[#3c9377] to-[#10b981]"
          : "bg-gradient-to-r from-[#0e7490] to-[#0891b2]"
      }`}
      style={{
        boxShadow: isCurrent
          ? "0 8px 28px rgba(5,150,105,0.22)"
          : "0 8px 28px rgba(14,116,144,0.22)",
      }}
    >
      {/* HEADER + PATIENT */}
      <div>
        <p className="font-dm text-[13px] font-semibold tracking-[0.12em] uppercase text-white/70 mb-2">
          {isCurrent ? "Current Patient" : "Next Patient"}
        </p>

        {patient ? (
          <div className="flex items-center gap-3 mb-3">
            {image ? (
              <img
                src={image}
                alt="patient"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-white/30 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                {getInitial(name)}
              </div>
            )}

            <div className="min-w-0">
              <h3 className="font-playfair text-[16px] sm:text-[18px] font-bold leading-tight truncate">
                {name}
              </h3>

              <p className="font-dm text-[12px] text-white/70">
                Token #{patient.token_number}
              </p>
            </div>
          </div>
        ) : (
          <p className="font-dm text-[14px] text-white/60 mb-3">
            {isCurrent ? "No patient in consultation" : "No patient in queue"}
          </p>
        )}
      </div>

      {/* ACTION */}
      {isCurrent ? (
        patient ? (
          inProgress ? (
            hasNext ? (
              <button
                type="button"
                disabled
                className="self-start bg-gray-300 text-gray-600 font-semibold px-4 py-2 rounded-full cursor-not-allowed"
              >
                Consulting Patient
              </button>
            ) : (
              <button
                type="button"
                onClick={onFinish}
                className="self-start bg-red-600 text-white font-semibold px-4 py-2 rounded-full flex items-center gap-1.5"
              >
                <FaStop />
                Finish Patient
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={onStart}
              className="self-start bg-white text-emerald-700 font-semibold px-4 py-2 rounded-full flex items-center gap-1.5"
            >
              <FaPlay />
              Start Appointment
            </button>
          )
        ) : null
      ) : (
        patient &&
        (inProgress ? (
          <button
            type="button"
            onClick={onCallNext}
            disabled={callingNext}
            className="self-start bg-white text-[#0e7490] font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 disabled:opacity-60"
          >
            <FaBullhorn />
            {callingNext ? "Calling..." : "Call Next Token"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onStart}
            className="self-start bg-white text-emerald-700 font-semibold px-4 py-2 rounded-full flex items-center gap-1.5"
          >
            <FaPlay />
            Start Appointment
          </button>
        ))
      )}
    </div>
  );
};

const TodaysQueuePanel = ({
  slot,
  setSlot,
  sortedQueue,
  loading,
  actionProcessing,
  hasSkipped,
  handleSkipAppointment,
  handleMarkNoShow,
  handleRecall,
  navigate,
}) => {
  const currentInProgress = sortedQueue.find((p) => p.status === "IN_PROGRESS");

  return (
    <div className="bg-white rounded-xl border border-[#d5dde3] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-4 sm:px-5 pt-4 pb-3 bg-[#f1f5ff] border-b border-[#d5dde3]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e5f4f8] text-[#0e7490] flex items-center justify-center">
              <FaClipboardList />
            </div>

            <h2 className="font-dm text-[19px] font-bold text-[#24333e]">
              Today's Queue
            </h2>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex">
            {["MORNING", "EVENING"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                className={`px-4 py-2 font-dm text-[12px] font-semibold border-b-2 transition ${
                  slot === s
                    ? "text-[#166b89] border-[#1680a2]"
                    : "text-[#667780] border-transparent"
                }`}
              >
                {s === "MORNING" ? "Morning Slot" : "Evening Slot"}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <ActionButton
              icon={<FaStepForward className="text-[11px]" />}
              label="Skip"
              color="cyan"
              disabled={actionProcessing.skip || !currentInProgress}
              onClick={handleSkipAppointment}
            />
            <ActionButton
              icon={<FaUserSlash className="text-[11px]" />}
              label="No Show"
              color="cyan"
              disabled={actionProcessing.noShow || !hasSkipped}
              onClick={handleMarkNoShow}
            />
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-2.5">
        {loading ? (
          <div className="flex items-center justify-center py-14">
            <div className="w-8 h-8 border-4 border-[#d6edf3] border-t-[#0e7490] rounded-full animate-spin" />
          </div>
        ) : sortedQueue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <FaClipboardList className="text-3xl text-[#b8c5cc]" />
            <p className="font-dm text-[13px] text-[#7b8991]">
              No patients in queue
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedQueue.map((p) => {
              const st = STATUS[p.status] || STATUS.ACCEPTED;
              const isRecalling = actionProcessing.recall === p.id;

              const patientName =
                p.walk_in_patient_name ||
                p.familyMemberName ||
                p.patientName ||
                "Walk-in";

              return (
                <div
                  key={p.id}
                  className={`group px-3 sm:px-4 py-3 rounded-lg border transition ${
                    p.status === "IN_PROGRESS"
                      ? "border-[#1680a2] bg-[#fbfeff] shadow-[0_1px_5px_rgba(14,116,144,0.12)]"
                      : "border-transparent hover:border-[#dce5e9] hover:bg-[#fafcfd]"
                  } ${p.status === "COMPLETED" ? "opacity-65" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-[48px] shrink-0 text-center">
                        <p className="font-dm text-[9px] font-semibold text-[#8b989f] uppercase">
                          Token
                        </p>
                        <p className="font-dm text-[23px] leading-none font-bold text-[#08719a]">
                          {String(p.token_number).padStart(3, "0")}
                        </p>
                      </div>

                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#e7eef9] flex items-center justify-center text-[#5d7384] font-dm font-bold text-[11px] overflow-hidden shrink-0">
                        {p.patientImage ? (
                          <img
                            src={getImageUrl(p.patientImage)}
                            alt="patient"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = FALLBACK_IMAGE;
                            }}
                          />
                        ) : (
                          getInitial(patientName)
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-dm font-bold text-[13px] text-[#25333c] truncate">
                          {patientName}
                        </p>
                        <p className="font-dm text-[12px] text-[#697983] truncate">
                          {p.reason || "Consultation"}
                          {p.appointment_time ? ` • ${p.appointment_time}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`hidden sm:inline-flex font-dm text-[12px] font-bold px-2.5 py-1 rounded-md border ${st.bg} ${st.text} ${st.border}`}
                      >
                        {st.label}
                      </span>

                      {p.status === "COMPLETED" && (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/doctordashboard/prescription/${p.id}`)
                          }
                          className="px-3 py-1.5 rounded-lg bg-[#eaf7fb] text-[#0b2177] border border-[#c9e8f0] font-dm text-[14px] font-bold cursor-pointer hover:bg-[#dff3f8] whitespace-nowrap"
                          title={
                            p.hasPrescription
                              ? "View Prescription"
                              : "Add Prescription"
                          }
                        >
                          {p.hasPrescription
                            ? "View Prescription"
                            : "Prescription"}
                        </button>
                      )}

                      {p.status === "SKIPPED" && (
                        <button
                          type="button"
                          disabled={isRecalling}
                          onClick={() => handleRecall(p.id)}
                          className="font-dm text-[12px] font-semibold text-[#0e7490] bg-[#eaf8fc] px-2.5 py-1.5 rounded-md border border-[#cceaf1] cursor-pointer disabled:opacity-50"
                        >
                          {isRecalling ? "..." : "Recall"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="sm:hidden flex gap-2 px-3 pb-3">
        <ActionButton
          icon={<FaStepForward className="text-[11px]" />}
          label="Skip"
          color="cyan"
          disabled={actionProcessing.skip || !currentInProgress}
          onClick={handleSkipAppointment}
        />
        <ActionButton
          icon={<FaUserSlash className="text-[11px]" />}
          label="No Show"
          color="red"
          disabled={actionProcessing.noShow || !hasSkipped}
          onClick={handleMarkNoShow}
        />
      </div>
    </div>
  );
};

const IncomingPanel = ({
  appointments,
  processingId,
  onRespond,
  onAutoAccept,
  showConfirmModal,
  setShowConfirmModal,
}) => {
  const [incomingFilter, setIncomingFilter] = useState("ALL");
  const pendingAppointments = appointments.filter(
    (a) => a.status === "PENDING",
  );

  const recentIncoming = useMemo(() => {
    let list = [...appointments];

    // Status filter
    list = list.filter(
      (a) =>
        a.status === "PENDING" ||
        a.status === "ACCEPTED" ||
        a.status === "REJECTED",
    );

    // Incoming filter
    if (incomingFilter === "TODAY") {
      list = list.filter((a) => isToday(a.appointment_date));
    }

    if (incomingFilter === "MORNING") {
      list = list.filter(
        (a) => String(a.appointment_slot).toUpperCase() === "MORNING",
      );
    }

    if (incomingFilter === "EVENING") {
      list = list.filter(
        (a) => String(a.appointment_slot).toUpperCase() === "EVENING",
      );
    }

    // Pending first
    return list.sort((a, b) => {
      if (a.status === "PENDING" && b.status !== "PENDING") return -1;
      if (a.status !== "PENDING" && b.status === "PENDING") return 1;

      // Latest appointment first
      return new Date(b.appointment_date) - new Date(a.appointment_date);
    });
  }, [appointments, incomingFilter]);

  return (
    <>
      <div className="bg-white rounded-xl border border-[#d5dde3] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-4 py-3 bg-[#f5f7fb] border-b border-[#d5dde3] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FaBell className="text-[#c9444a]" />
            <h2 className="font-dm text-[18px] font-bold text-[#24333e]">
              Incoming
            </h2>

            <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#c5282d] text-white flex items-center justify-center font-dm text-[10px] font-bold">
              {pendingAppointments.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={!pendingAppointments.length}
            className="px-3.5 py-1.5 rounded-full border border-[#4b91aa] bg-white text-[#287892] font-dm text-[11px] font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <FaCheck />
            Auto Accept All
          </button>
        </div>
        <div className="flex gap-1.5 px-2.5 py-2 border-b border-[#e1e5e8] overflow-x-auto scrollbar-none">
          {["ALL", "TODAY", "MORNING", "EVENING"].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setIncomingFilter(filter)}
              className={`font-dm px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap border-none cursor-pointer transition ${
                incomingFilter === filter
                  ? "bg-[#e5f2fa] text-[#287892]"
                  : "bg-transparent text-[#6d8290] hover:bg-[#f1f5f7]"
              }`}
            >
              {filter === "ALL"
                ? "All"
                : filter.charAt(0) + filter.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="p-2.5">
          {recentIncoming.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-2 text-[#839099]">
              <FaBell className="text-2xl opacity-40" />
              <p className="font-dm text-[12px]">No incoming appointments</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[268px] overflow-y-auto pr-1">
              {recentIncoming.map((a) => {
                const displayName =
                  a.familyMemberName ||
                  a.patientName ||
                  a.patient_name ||
                  a.walk_in_patient_name ||
                  "Walk-in Patient";

                const isProcessing = processingId === a.id;

                return (
                  <div
                    key={a.id}
                    className="border border-[#e1e5e8] rounded-lg p-2.5 sm:p-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#eaf0f5] flex items-center justify-center text-[#617582] font-dm text-[10px] font-bold shrink-0 overflow-hidden">
                        {a.profile_image && !a.familyMemberName ? (
                          <img
                            src={getImageUrl(a.profile_image)}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitial(displayName)
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-dm text-[13px] font-bold text-[#27343d] truncate">
                          {displayName}
                        </p>

                        <p className="font-dm text-[11px] text-[#737f87] truncate">
                          {a.appointment_slot || "—"}{" "}
                          <span className="font-bold text-[#27343d]">
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

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <span className="font-dm text-[9px] text-[#0e7490] bg-[#ecfeff] px-2 py-1 rounded-md border border-[rgba(14,116,144,0.15)]">
                          #{a.token_number}
                        </span>
                      </div>
                    </div>

                    {a.status === "PENDING" ? (
                      <div className="grid grid-cols-2 gap-2 mt-2.5">
                        <button
                          type="button"
                          disabled={isProcessing || !!processingId}
                          onClick={() => onRespond(a.id, "ACCEPT")}
                          className="h-8 rounded-md bg-[#08769d] text-white font-dm text-[11px] font-bold border-none cursor-pointer hover:bg-[#086885] disabled:opacity-50"
                        >
                          {isProcessing ? "..." : "Accept"}
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing || !!processingId}
                          onClick={() => onRespond(a.id, "REJECT")}
                          className="h-8 rounded-md bg-white text-[#c45858] border border-[#d8dfe3] font-dm text-[11px] font-bold cursor-pointer hover:bg-red-50 disabled:opacity-50"
                        >
                          {isProcessing ? "..." : "Reject"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end mt-2.5">
                        <span
                          className={`font-dm text-[9px] px-2.5 py-1 rounded-md font-bold ${
                            a.status === "ACCEPTED"
                              ? "bg-[#e8f8f1] text-[#0ca678]"
                              : "bg-[#fff0f0] text-[#c45858]"
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[5px] flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] w-full max-w-[390px] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.16)]">
            <div className="w-12 h-12 rounded-xl bg-[#eaf8fc] text-[#0e7490] flex items-center justify-center mx-auto mb-4">
              <FaCheck />
            </div>

            <h3 className="font-dm text-[21px] font-bold text-[#1c2b33] text-center">
              Auto Accept All?
            </h3>

            <p className="font-dm text-[13px] text-[#6b7f88] text-center mt-2 mb-6">
              All pending appointments will be accepted at once.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 rounded-full bg-[#f1f3f5] text-[#687780] font-dm text-[13px] font-semibold border-none cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onAutoAccept}
                className="px-5 py-2.5 rounded-full bg-[#0e7490] text-white font-dm text-[13px] font-semibold border-none cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const TomorrowPreview = ({ appointments }) => {
  const tomorrowAppointments = appointments.filter((a) =>
    isTomorrow(a.appointment_date),
  );

  const morning = tomorrowAppointments.filter(
    (a) => a.appointment_slot === "MORNING",
  ).length;

  const evening = tomorrowAppointments.filter(
    (a) => a.appointment_slot === "EVENING",
  ).length;

  const total = tomorrowAppointments.length;

  return (
    <div className="bg-white rounded-xl border border-[#d5dde3] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <FaCalendarAlt className="text-[#687982]" />
        <h3 className="font-dm text-[17px] font-bold text-[#27353e]">
          TOMORROW'S PREVIEW
        </h3>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-dm text-[13px] text-[#4f5d65]">
            Morning (09:00 - 13:00)
          </span>

          <span className="font-dm text-[11px] font-bold text-[#287d99] bg-[#eef8fb] px-2 py-1 rounded-md">
            {morning} Slots
          </span>
        </div>

        <div className="h-2 rounded-full bg-[#dceafb] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#08749a]"
            style={{ width: `${Math.min(morning * 10, 100)}%` }}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-dm text-[13px] text-[#4f5d65]">
            Evening (15:00 - 19:00)
          </span>

          <span className="font-dm text-[11px] font-bold text-[#287d99] bg-[#eef8fb] px-2 py-1 rounded-md">
            {evening} Slots
          </span>
        </div>

        <div className="h-2 rounded-full bg-[#dceafb] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#08749a]"
            style={{ width: `${Math.min(evening * 10, 100)}%` }}
          />
        </div>
      </div>

      {total === 0 && (
        <p className="font-dm text-[11px] text-[#8b969c] mt-4">
          No appointments scheduled for tomorrow.
        </p>
      )}
    </div>
  );
};

const TodaysQueue = () => {
  const navigate = useNavigate();
  const { socket, connected } = useSocket();

  // =========================
  // TODAY'S QUEUE — ORIGINAL LOGIC
  // =========================
  const [slot, setSlot] = useState(() => {
    const now = new Date();
    const hour = now.getHours();

    return hour < 12 ? "MORNING" : "EVENING";
  });
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
      setActionProcessing((prev) => ({
        ...prev,
        noShow: true,
      }));

      const res = await markNoShow(slot);

      notify.success(res.data.message || "No show marked");

      loadQueue();
    } catch (err) {
      console.error("Mark no show error:", err);
      notify.error("Failed to mark no show");
    } finally {
      setActionProcessing((prev) => ({
        ...prev,
        noShow: false,
      }));
    }
  };

  const handleSkipAppointment = async () => {
    if (actionProcessing.skip) return;

    try {
      setActionProcessing((prev) => ({
        ...prev,
        skip: true,
      }));

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
      setActionProcessing((prev) => ({
        ...prev,
        skip: false,
      }));
    }
  };

  const handleRecall = async (id) => {
    if (actionProcessing.recall === id) return;

    try {
      setActionProcessing((prev) => ({
        ...prev,
        recall: id,
      }));

      await recallPatient(id);

      notify.success("Patient added back to queue");

      loadQueue();
    } catch (err) {
      console.error("Recall error:", err);
      notify.error("Recall failed");
    } finally {
      setActionProcessing((prev) => ({
        ...prev,
        recall: null,
      }));
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

  // =========================
  // INCOMING APPOINTMENTS — ORIGINAL LOGIC
  // =========================
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loadAppointments = useCallback(async () => {
    try {
      const res = await api.get("/doctor/appointments/incoming");

      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Load appointments error:", err);
      notify.error("Failed to load appointments");
    } finally {
      setAppointmentsLoading(false);
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

  // =========================
  // DASHBOARD DISPLAY VALUES
  // These only derive values from already-loaded data.
  // =========================
  const pendingRequests = appointments.filter(
    (a) => a.status === "PENDING",
  ).length;

  const tomorrowLoad = appointments.filter((a) =>
    isTomorrow(a.appointment_date),
  ).length;

  return (
    <div className="font-dm min-h-screen bg-[#f6f8fb] px-3 sm:px-6 py-5 sm:py-7">
      <div className="max-w-[1360px] mx-auto">
        {/* =========================================
            TOP STAT CARDS
        ========================================= */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            icon={<FaClipboardList />}
            iconBg="bg-[#fff0ed]"
            iconColor="text-[#c94843]"
            label="Pending Requests"
            value={pendingRequests}
          />

          <StatCard
            icon={<FaCalendarCheck />}
            iconBg="bg-[#e8f6fc]"
            iconColor="text-[#08759c]"
            label="Today's Queue"
            value={total}
            extra={`+${waiting} waiting`}
          />

          <StatCard
            icon={<FaCalendarAlt />}
            iconBg="bg-[#e8f6fc]"
            iconColor="text-[#08759c]"
            label="Tomorrow's Load"
            value={tomorrowLoad}
          />

          <StatCard
            icon={<FaUsers />}
            iconBg="bg-[#eef1f9]"
            iconColor="text-[#5f6877]"
            label="Completed Today"
            value={done}
          />
        </div>

        {/* =========================================
            BANNER CARDS
        ========================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-7">
          {/* CURRENT */}
          <DashboardBanner
            type="current"
            patient={currentPatient}
            inProgress={inProgress}
            hasNext={!!nextPatient}
            onStart={() => {
              if (currentPatient) {
                handleStart(currentPatient.id);
              }
            }}
            onFinish={handleStopOnly}
          />

          {/* NEXT */}
          <DashboardBanner
            type="next"
            patient={nextPatient}
            inProgress={inProgress}
            hasNext={!!nextPatient}
            callingNext={callingNext}
            onStart={() => {
              if (nextPatient) {
                handleStart(nextPatient.id);
              }
            }}
            onCallNext={handleCallNext}
          />
        </div>

        {/* =========================================
            MAIN CONTENT
        ========================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(330px,0.95fr)] gap-5">
          {/* LEFT — TODAY QUEUE */}
          <TodaysQueuePanel
            slot={slot}
            setSlot={setSlot}
            sortedQueue={sortedQueue}
            loading={loading}
            actionProcessing={actionProcessing}
            hasSkipped={hasSkipped}
            handleSkipAppointment={handleSkipAppointment}
            handleMarkNoShow={handleMarkNoShow}
            handleRecall={handleRecall}
            navigate={navigate}
          />

          {/* RIGHT */}
          <div className="space-y-4">
            <IncomingPanel
              appointments={appointments}
              processingId={processingId}
              onRespond={handleRespond}
              onAutoAccept={confirmAutoAccept}
              showConfirmModal={showConfirmModal}
              setShowConfirmModal={setShowConfirmModal}
            />

            <TomorrowPreview appointments={appointments} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaysQueue;
