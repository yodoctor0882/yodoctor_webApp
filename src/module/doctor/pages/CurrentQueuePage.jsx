
import React, { useState, useEffect, useCallback } from "react";
import { notify } from "../../../utils/notify";
import {
  getTodayQueue,
  getCurrentAppointment,
  getNextAppointment,
  startAppointment,
  callNextToken,
  skipAppointment,
  recallPatient,
  markNoShow,
} from "../../../services/doctorService";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const CurrentQueuePage = () => {
  const [slot, setSlot] = useState("MORNING");
  const [queue, setQueue] = useState([]);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const [queueRes, currentRes, nextRes] = await Promise.all([
        getTodayQueue(slot),
        getCurrentAppointment(slot),
        getNextAppointment(slot),
      ]);

      setQueue(queueRes.data?.queue || []);
      setCurrentAppointment(
        currentRes.data?.active ? currentRes.data.appointment : null
      );
      setNextAppointment(
        nextRes.data?.next ? nextRes.data.appointment : null
      );
    } catch (err) {
      console.error("Queue load error:", err);
      notify.error("Failed to load queue");
    } finally {
      setLoading(false);
    }
  }, [slot]);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 30000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  const handleStart = async (id) => {
    setActionLoading(true);
    try {
      await startAppointment(id, { slot });
      notify.success("Appointment started");
      loadQueue();
    } catch (err) {
      notify.error(err.response?.data?.message || "Unable to start appointment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCallNext = async () => {
    setActionLoading(true);
    try {
      const res = await callNextToken({ slot });
      if (res.data?.token) {
        notify.success(`Now calling token #${res.data.token}`);
      } else {
        notify.info("No more patients in queue");
      }
      loadQueue();
    } catch (err) {
      notify.error(err.response?.data?.message || "Unable to call next patient");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkip = async (id) => {
    setActionLoading(true);
    try {
      await skipAppointment(id);
      notify.success("Patient skipped");
      loadQueue();
    } catch (err) {
      notify.error(err.response?.data?.message || "Cannot skip appointment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecall = async (id) => {
    setActionLoading(true);
    try {
      await recallPatient(id);
      notify.success("Patient recalled to queue");
      loadQueue();
    } catch (err) {
      notify.error(err.response?.data?.message || "Cannot recall patient");
    } finally {
      setActionLoading(false);
    }
  };

  const handleNoShow = async () => {
    setActionLoading(true);
    try {
      await markNoShow(slot);
      notify.success("No-show patients marked");
      loadQueue();
    } catch (err) {
      notify.error(err.response?.data?.message || "Cannot mark no-show");
    } finally {
      setActionLoading(false);
    }
  };

  const waitingCount = queue.filter(
    (p) => p.status === "ACCEPTED"
  ).length;

  const skippedCount = queue.filter(
    (p) => p.status === "SKIPPED"
  ).length;

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 sm:p-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Live Queue</h2>
            <p className="text-gray-500 text-sm">Manage patients in real-time</p>
          </div>

          <div className="flex gap-2">
            {["MORNING", "EVENING"].map((s) => (
              <button
                key={s}
                onClick={() => setSlot(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  slot === s
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-semibold text-blue-600">{waitingCount}</p>
            <p className="text-xs text-gray-500 mt-1">Waiting</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-semibold text-teal-600">
              {currentAppointment ? 1 : 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">In Progress</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-semibold text-amber-600">{skippedCount}</p>
            <p className="text-xs text-gray-500 mt-1">Skipped</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            
            {currentAppointment ? (
              <div className="bg-teal-500 text-white rounded-xl p-5 mb-4 shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-white text-teal-600 text-xs font-semibold px-3 py-1 rounded-full">
                    Now Consulting
                  </span>
                  <span className="text-sm opacity-90">
                    Token #{currentAppointment.token_number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold">
                  {currentAppointment.patientName ||
                    currentAppointment.familyMemberName ||
                    "Patient"}
                </h3>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCallNext}
                    disabled={actionLoading}
                    className="bg-white text-teal-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal-50 transition cursor-pointer disabled:opacity-60"
                  >
                    Done → Call Next
                  </button>
                  <button
                    onClick={() => handleSkip(currentAppointment.id)}
                    disabled={actionLoading}
                    className="bg-teal-400 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal-300 transition cursor-pointer disabled:opacity-60"
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : (
             
              nextAppointment && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-4">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Ready to start
                  </p>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Token #{nextAppointment.token_number} —{" "}
                    {nextAppointment.patientName ||
                      nextAppointment.familyMemberName ||
                      "Patient"}
                  </h3>
                  <button
                    onClick={() => handleStart(nextAppointment.id)}
                    disabled={actionLoading}
                    className="mt-3 bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:opacity-60"
                  >
                    Start Appointment
                  </button>
                </div>
              )
            )}

            {/* Waiting Queue */}
            {queue.filter((p) => p.status === "ACCEPTED").length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Waiting ({waitingCount})
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {queue
                    .filter((p) => p.status === "ACCEPTED")
                    .map((patient) => (
                      <div
                        key={patient.id}
                        className="bg-white border border-gray-200 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-gray-800 text-sm">
                            {patient.patientName ||
                              patient.familyMemberName ||
                              "Patient"}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            #{patient.token_number}
                          </span>
                        </div>
                        {patient.hasPrescription && (
                          <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                            Has Rx
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            
            {queue.filter((p) => p.status === "SKIPPED").length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-amber-600 mb-2">
                  Skipped ({skippedCount})
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {queue
                    .filter((p) => p.status === "SKIPPED")
                    .map((patient) => (
                      <div
                        key={patient.id}
                        className="bg-amber-50 border border-amber-200 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-800 text-sm">
                            {patient.patientName ||
                              patient.familyMemberName ||
                              "Patient"}
                          </span>
                          <span className="text-xs text-gray-500">
                            #{patient.token_number}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRecall(patient.id)}
                          disabled={actionLoading}
                          className="text-xs text-amber-700 border border-amber-300 px-3 py-1 rounded-lg hover:bg-amber-100 transition cursor-pointer disabled:opacity-60"
                        >
                          Recall
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {queue.length === 0 && !currentAppointment && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg font-medium">No patients in queue</p>
                <p className="text-sm mt-1">
                  {slot.charAt(0) + slot.slice(1).toLowerCase()} queue is empty
                </p>
              </div>
            )}

            {/* Action bar */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
              {!currentAppointment && waitingCount > 0 && (
                <button
                  onClick={handleCallNext}
                  disabled={actionLoading}
                  className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:opacity-60"
                >
                  Call Next Patient
                </button>
              )}
              {skippedCount > 0 && (
                <button
                  onClick={handleNoShow}
                  disabled={actionLoading}
                  className="bg-red-50 text-red-600 border border-red-200 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-red-100 transition cursor-pointer disabled:opacity-60"
                >
                  Mark Skipped as No-Show
                </button>
              )}
              <button
                onClick={loadQueue}
                disabled={loading}
                className="bg-gray-100 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-200 transition cursor-pointer"
              >
                Refresh
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CurrentQueuePage;
