import React, { useState, useEffect } from "react";
import { FaUser, FaUsers } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { notify } from "../../../utils/notify";
import { useSearchParams } from "react-router-dom";
import {
  bookVisitAppointment,
  getDoctorById,
  getFamilyMembers,
  qrBookVisit,
  getCurrentToken,
} from "../../../services/patientService";

const getLocalDate = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(0, 0, 0, 0);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientType, setPatientType] = useState("SELF");
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [selectedDateType, setSelectedDateType] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [booking, setBooking] = useState(false);
  const [currentToken, setCurrentToken] = useState(0);

  const [searchParams] = useSearchParams();
  const isQR = searchParams.get("fromQR") === "true";

  const [showPaymentModal, setShowPaymentModal] = useState(false);
const [paymentMethod, setPaymentMethod] = useState("CASH");

  useEffect(() => {
    const fetchCurrentToken = async () => {
      try {
        if (!selectedSession) return;

        const appointmentDate =
          selectedDateType === "today"
            ? getLocalDate(0)
            : selectedDateType === "tomorrow"
              ? getLocalDate(1)
              : customDate;

        const res = await getCurrentToken({
          doctorId,
          appointmentDate,
          appointmentSlot: selectedSession,
        });

        setCurrentToken(res.data.currentToken || 0);
        console.log("API Response:", res.data);
      } catch (err) {
        console.error("Current token fetch failed:", err);
      }
    };

    fetchCurrentToken();
  }, [doctorId, selectedDateType, customDate, selectedSession]);

  useEffect(() => {
    const loadFamilyMembers = async () => {
      try {
        const res = await getFamilyMembers();
        const members = (res.data?.members || []).map((m) => ({
          id: m.id,
          name: m.full_name,
          relation: m.relation,
        }));
        setFamilyMembers(members);
      } catch (err) {
        console.error("Family members fetch failed:", err);
      }
    };
    loadFamilyMembers();
  }, []);

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      try {
        const res = await getDoctorById(doctorId);
        const doctorData = res.data.doctor || res.data;
        if (!doctorData) {
          notify.error("Doctor not found");
          navigate(-1);
          return;
        }
        setDoctor(doctorData);
      } catch (err) {
        notify.error("Doctor fetch failed");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    if (doctorId) fetchDoctor();
  }, [doctorId, navigate]);

  useEffect(() => {
    setSelectedSession("");
  }, [selectedDateType]);

  const handleConfirm = async () => {
      if (!doctor?.is_available) {
    notify.error("Doctor is currently unavailable");
    return;
  }
    if (booking) return;
    if (!doctor) return;
    if (patientType === "OTHER" && !selectedFamilyId) {
      notify.error("Please select a family member");
      return;
    }
    if (!isQR && !selectedSession) {
      notify.error("Please select Morning or Evening");
      return;
    }

    const appointmentDate =
      selectedDateType === "today"
        ? getLocalDate(0)
        : selectedDateType === "tomorrow"
          ? getLocalDate(1)
          : customDate;

    if (!isQR && !appointmentDate) {
      notify.error("Please select a date");
      return;
    }

    const payload = {
      doctorId: Number(doctorId),
      appointmentType: "CLINIC",
      bookingFor: patientType,
      appointmentDate,
      slot: selectedSession,
        paymentMethod: paymentMethod,
  paymentStatus: "PENDING",
      familyMemberIds:
        patientType === "OTHER" ? [Number(selectedFamilyId)] : [],
    };

    setBooking(true);
    try {
      let res;

      if (isQR) {
        res = await qrBookVisit({
          doctorId: Number(doctorId),
          familyMemberIds:
            patientType === "OTHER" ? [Number(selectedFamilyId)] : [],
        });
      } else {
        res = await bookVisitAppointment(payload);
      }
      const { appointmentId, token, slot } = res.data.data;
      notify.success(`Token #${token} booked successfully`);
      navigate("/client/patientqueuepage", {
        state: {
          appointmentId,
          token,
          slot,
          bookingFor: patientType,
          patientName:
            patientType === "SELF"
              ? "You"
              : familyMembers.find(
                  (f) => String(f.id) === String(selectedFamilyId),
                )?.name || "Family Member",
        },
      });
    } catch (err) {
      notify.error(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "#F8FAFC" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0086C3] border-t-transparent rounded-full animate-spin" />
          <p className="font-[family-name:var(--font-dm)] text-sm text-gray-400">
            Loading doctor details...
          </p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "#f0f4f8" }}
      >
        <p className="font-[family-name:var(--font-dm)] text-gray-500">
          Doctor not found
        </p>
      </div>
    );
  }

  const btnBase =
    "font-[family-name:var(--font-dm)] font-semibold text-[13px] px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 border";
  const btnActive = "text-white border-transparent";
  const btnInactive = "text-[#4b5e7a] bg-white hover:bg-[#f8fafc]";

  const now = new Date();
  const currentHour = now.getHours();

  const isTodaySelected = selectedDateType === "today";

  const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const formattedDays = doctor?.availableDays
    ? (Array.isArray(doctor.availableDays)
        ? doctor.availableDays
        : JSON.parse(doctor.availableDays)
      ).sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
    : [];

  return (
    <div
      className="min-h-screen px-4 py-10 flex items-center justify-center"
      style={{ background: "#f0f4f8" }}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden animate-[fadeUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]"
        style={{
          boxShadow: "0 4px 32px rgba(12,30,58,0.1)",
          border: "1px solid rgba(12,30,58,0.06)",
        }}
      >
        <div
          className="px-7 py-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#2563EB,#14B8A6)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <button
            onClick={() => navigate(-1)}
            className="font-[family-name:var(--font-dm)] text-[12px] font-semibold text-white/70 hover:text-white flex items-center gap-1 mb-3 cursor-pointer transition-all hover:-translate-x-1"
            style={{ background: "none", border: "none" }}
          >
            ← Back
          </button>
          <h1 className=" text-[24px] font-semibold text-white leading-tight">
            Book Appointment
          </h1>
          <p className="  text-white/80 mt-0.5">
            with{" "}
            <span
              className="text-white font-bold cursor-pointer hover:underline"
              onClick={() =>
                navigate(
                  `/client/doctor-profile/${doctor.doctorId}${
                    isQR ? "?fromQR=true" : ""
                  }`,
                )
              }
            >
              {doctor.doctorName}
            </span>
            {doctor.specialization && ` • ${doctor.specialization}`}
          </p>

          <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <p className="text-white text-[16px] font-semibold">
              Total Bookings: {currentToken}
            </p>
          </div>
        </div>

        <div className="px-7 py-6 flex flex-col gap-6">
          <div>
            <p className=" text-[12px] font-bold uppercase tracking-widest mb-3">
              Step 1 — Who is this for?
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setPatientType("SELF");
                  setSelectedFamilyId("");
                }}
                className={`${btnBase} flex items-center gap-2 ${patientType === "SELF" ? btnActive : btnInactive}`}
                style={
                  patientType === "SELF"
                    ? {
                        background: "linear-gradient(135deg,#2563EB,#14B8A6)",
                        borderColor: "transparent",
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                      }
                    : { borderColor: "rgba(12,30,58,0.12)" }
                }
              >
                <FaUser size={12} /> Self
              </button>

              {/* Family select */}
              <div className="relative">
                <select
                  disabled={familyMembers.length === 0}
                  value={patientType === "OTHER" ? selectedFamilyId : ""}
                  onChange={(e) => {
                    setPatientType("OTHER");
                    setSelectedFamilyId(e.target.value);
                  }}
                  className={`${btnBase} pr-8 appearance-none ${patientType === "OTHER" && selectedFamilyId ? btnActive : btnInactive}`}
                  style={
                    patientType === "OTHER" && selectedFamilyId
                      ? {
                          background: "linear-gradient(135deg,#2563EB,#14B8A6)",
                          borderColor: "transparent",
                          color: "#fff",
                          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                        }
                      : { borderColor: "rgba(12,30,58,0.12)" }
                  }
                >
                  <option value="">
                    {familyMembers.length === 0
                      ? "No family members"
                      : "Select Family"}
                  </option>
                  {familyMembers.map((m) => (
                    <option key={m.id} value={String(m.id)}>
                      {m.name} ({m.relation})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => navigate("/client/addfamilypage")}
                className={`${btnBase} flex items-center gap-2 ${btnInactive}`}
                style={{ borderColor: "rgba(12,30,58,0.12)" }}
              >
                <FaUsers size={12} /> Add Family
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[12px] font-bold  mb-2">📅 Available Days</p>

            <div className="flex flex-wrap gap-2">
              {formattedDays.map((day, index) => (
                <div
                  key={index}
                  className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-[12px] font-medium border border-gray-200 cursor-default select-none"
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="h-px" style={{ background: "rgba(12,30,58,0.07)" }} />
          {!isQR && (
            <>
              <div>
                <p className=" text-[12px] font-bold uppercase tracking-widest mb-3">
                  Step 2 — Select Date
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  {["today", "tomorrow"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDateType(d)}
                      className={`${btnBase} ${selectedDateType === d ? btnActive : btnInactive}`}
                      style={
                        selectedDateType === d
                          ? {
                              background:
                                "linear-gradient(135deg,#2563EB,#14B8A6)",
                              borderColor: "transparent",
                              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                            }
                          : { borderColor: "rgba(12,30,58,0.12)" }
                      }
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}

                  <input
                    type="date"
                    min={getLocalDate(0)}
                    max={getLocalDate(7)}
                    value={customDate}
                    onChange={(e) => {
                      setSelectedDateType("custom");
                      setCustomDate(e.target.value);
                    }}
                    className={`${btnBase} ${selectedDateType === "custom" ? btnActive : btnInactive}`}
                    style={
                      selectedDateType === "custom"
                        ? {
                            background:
                              "linear-gradient(135deg,#2563EB,#14B8A6)",
                            borderColor: "transparent",
                            color: "#fff",
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                          }
                        : { borderColor: "rgba(12,30,58,0.12)" }
                    }
                  />
                </div>
              </div>

              <div
                className="h-px"
                style={{ background: "rgba(12,30,58,0.07)" }}
              />

              <div>
                <p className="text-[12px] font-bold uppercase tracking-widest mb-3">
                  Step 3 — Select Session
                </p>
                <div className="flex gap-3">
                  {[
                    { key: "MORNING", label: "🌅 Morning", sub: "Before noon" },
                    { key: "EVENING", label: "🌆 Evening", sub: "After noon" },
                  ].map((s) => {
                    const isDisabled =
                      isTodaySelected &&
                      currentHour >= 12 &&
                      s.key === "MORNING";

                    return (
                      <button
                        key={s.key}
                        disabled={isDisabled}
                        onClick={() => setSelectedSession(s.key)}
                        className="flex-1 py-3.5 rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center gap-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={
                          selectedSession === s.key
                            ? {
                                background:
                                  "linear-gradient(135deg,#2563EB,#14B8A6)",
                                border: "1.5px solid transparent",
                                boxShadow: "0 4px 16px rgba(37, 99, 235, 0.35)",
                              }
                            : {
                                background: "#FFFFFF",
                                border: "1.5px solid rgba(12,30,58,0.1)",
                              }
                        }
                      >
                        <span
                          className="font-[family-name:var(--font-dm)] text-[14px] font-bold"
                          style={{
                            color:
                              selectedSession === s.key ? "#fff" : "#0c1e3a",
                          }}
                        >
                          {s.label}
                        </span>
                        <span
                          className="font-[family-name:var(--font-dm)] text-[11px]"
                          style={{
                            color:
                              selectedSession === s.key
                                ? "rgba(255,255,255,0.7)"
                                : "#94a3b8",
                          }}
                        >
                          {s.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          <button
           onClick={() => setShowPaymentModal(true)}
            disabled={booking || (!isQR && !selectedSession)}
            className="w-full py-3.5 rounded-xl font-[family-name:var(--font-dm)] font-bold text-[15px] text-white cursor-pointer transition-all duration-250 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg,#2563EB,#14B8A6)",
              boxShadow: "0 4px 20px rgba(37,99,235,0.25)",
            }}
            onMouseEnter={(e) =>
              !booking &&
              (e.currentTarget.style.boxShadow =
                "0 6px 24px rgba(37,99,235,0.55)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 4px 18px rgba(37,99,235,0.25)")
            }
          >
            {booking ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Booking...
              </span>
            ) : (
              "Confirm Appointment →"
            )}
          </button>

          {doctor.consultationFee && (
            <p
              className="font-[family-name:var(--font-dm)] text-[12px] text-center -mt-3"
              style={{ color: "#94a3b8" }}
            >
              Consultation fee:{" "}
              <strong className="text-[#0086C3]">
                ₹{doctor.consultationFee}
              </strong>{" "}
              payable at clinic
            </p>
          )}
        </div>
      </div>

      {showPaymentModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-[400px] shadow-xl">

      <h2 className="text-xl font-bold mb-4">
        Select Payment Method
      </h2>

      <div
        className={`border rounded-xl p-4 cursor-pointer ${
          paymentMethod === "CASH"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200"
        }`}
        onClick={() => setPaymentMethod("CASH")}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">💵 Cash at Clinic</h3>
            <p className="text-sm text-gray-500">
              Pay consultation fee at clinic
            </p>
          </div>

          <input
            type="radio"
            checked={paymentMethod === "CASH"}
            readOnly
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">

        <button
          onClick={() => setShowPaymentModal(false)}
          className="px-5 py-2 rounded-lg border"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            setShowPaymentModal(false);
            await handleConfirm();
          }}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white"
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

export default BookAppointmentPage;
