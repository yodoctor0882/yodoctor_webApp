import React, { useState, useEffect } from "react";
import { notify } from "../../../utils/notify";
import { createManualBookingApi } from "../../../services/doctor/ManualBookingApi";
import { FaUser, FaPhone, FaBirthdayCake, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ManualVisitBooking() {
  const [formData, setFormData] = useState({
    appointmentType: "CLINIC",
    slot: "MORNING",
    patientName: "",
    patientMobile: "",
    patientAge: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientName.trim()) {
      notify.error("Patient name is required");
      return;
    }
    if (!/^\d{10}$/.test(formData.patientMobile)) {
      notify.error("Enter valid 10-digit mobile number");
      return;
    }
    if (
      formData.patientAge &&
      (Number(formData.patientAge) <= 0 || Number(formData.patientAge) > 120)
    ) {
      notify.error("Enter valid age (1-120)");
      return;
    }
    try {
      setLoading(true);
      const { data } = await createManualBookingApi({
        appointmentType: formData.appointmentType,
        slot: formData.slot,
        patientName: formData.patientName.trim(),
        patientMobile: formData.patientMobile,
        patientAge: formData.patientAge ? Number(formData.patientAge) : null,
      });
      notify.success(
        `Token #${data.token} booked successfully (${data.slot} shift)`,
      );
      navigate("/doctordashboard");

      setFormData((prev) => ({
        appointmentType: "CLINIC",
        ...prev,
        patientName: "",
        patientMobile: "",
        patientAge: "",
      }));
    } catch (err) {
      notify.error(err?.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      setFormData((prev) => ({ ...prev, slot: "MORNING" }));
    } else {
      setFormData((prev) => ({ ...prev, slot: "EVENING" }));
    }
  }, []);
  return (
    <div
      className="font-dm min-h-screen bg-[#f5f3ef] flex items-start justify-center px-4 py-12"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 10% 5%, rgba(14,116,144,0.05) 0%, transparent 50%)",
      }}
    >
      <div className="w-full max-w-[520px]">
        {/* HEADER */}
        <div className="animate-fade-up mb-8">
          <h1 className="font-playfair text-[clamp(24px,3.5vw,34px)] font-bold text-[#1c2b33] leading-tight m-0">
            Manual Booking
          </h1>
          <p className="font-dm text-[15px] text-[#6b7f8a] mt-1">
            Register a walk-in patient appointment manually.
          </p>
        </div>

        {/* FORM CARD */}
        <div
          className="animate-fade-up [animation-delay:0.08s] bg-white border border-black/[0.07] rounded-[22px] p-8"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Patient Name */}
            <Field label="Patient Name" icon={<FaUser />} required>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                placeholder="Enter patient name"
                className="font-dm flex-1 bg-transparent border-none outline-none text-[14px] text-[#1c2b33] placeholder-[#c4cdd4]"
              />
            </Field>

            {/* Mobile */}
            <Field label="Mobile Number" icon={<FaPhone />} required>
              <input
                type="tel"
                name="patientMobile"
                value={formData.patientMobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                className="font-dm flex-1 bg-transparent border-none outline-none text-[14px] text-[#1c2b33] placeholder-[#c4cdd4]"
              />
            </Field>

            {/* Age */}
            <Field label="Age" icon={<FaBirthdayCake />} optional>
              <input
                type="number"
                name="patientAge"
                value={formData.patientAge}
                onChange={handleChange}
                placeholder="1 – 120"
                min={1}
                max={120}
                className="font-dm flex-1 bg-transparent border-none outline-none text-[14px] text-[#1c2b33] placeholder-[#c4cdd4]"
              />
            </Field>

            {/* Slot */}
            <Field label="Shift" icon={<FaClock />} required>
              <div className="font-dm text-[14px] text-[#1c2b33]">
                {formData.slot === "MORNING"
                  ? "🌅 Morning Shift"
                  : "🌙 Evening Shift"}
              </div>
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="font-dm w-full py-3.5 rounded-full text-[14px] font-semibold text-white bg-[#0e7490] border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#0c5f75] hover:-translate-y-px transition mt-2"
              style={{ boxShadow: "0 4px 16px rgba(14,116,144,0.22)" }}
            >
              {loading ? "Booking…" : "Book Appointment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, icon, children, required, optional }) => (
  <div className="flex flex-col gap-[5px]">
    <label className="font-dm text-[13px] font-semibold tracking-[0.08em] uppercase text-[#6b7f8a] flex items-center gap-1">
      {label}
      {required && <span className="text-red-400">*</span>}
      {optional && (
        <span className="text-[#9fb0b8] normal-case tracking-normal font-normal">
          (optional)
        </span>
      )}
    </label>
    <div className="flex items-center gap-2.5 px-3.5 py-[11px] rounded-[10px] border border-black/[0.08] bg-[#f8f9fb] focus-within:border-[#0e7490] focus-within:ring-2 focus-within:ring-[rgba(14,116,144,0.12)] focus-within:bg-white transition-all duration-200">
      <span className="text-[#0e7490] opacity-70 flex-shrink-0 text-[13px]">
        {icon}
      </span>
      {children}
    </div>
  </div>
);
