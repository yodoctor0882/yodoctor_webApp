import { useState } from "react";
import api from "../services/api";
import { validateHomeCareForm } from "../controllers/FormValidation";
import { notify } from "../utils/notify";

const SERVICES = [
  {
    val: "General Nursing",
    name: "General Nursing",
    desc: "Basic nursing care",
    icon: "👩‍⚕️",
  },
  {
    val: "Elderly Care",
    name: "Elderly Care",
    desc: "Senior citizen assistance",
    icon: "🧓",
  },
  {
    val: "Post Surgery Care",
    name: "Post Surgery",
    desc: "Recovery support",
    icon: "🩹",
  },
  {
    val: "ICU Trained Nurse",
    name: "ICU Nurse",
    desc: "Critical care specialist",
    icon: "🏥",
  },
  {
    val: "Attendant",
    name: "Attendant",
    desc: "Daily patient support",
    icon: "🤝",
  },
];

const DURATIONS = [
  { val: "1 Day", label: "1 Day", days: 1 },
  { val: "Multiple Days", label: "Multiple Days", days: null },
  { val: "Weekly", label: "Weekly", days: 7 },
  { val: "Monthly", label: "Monthly", days: 30 },
];

const TIME_SLOTS = [
  { val: "Morning", label: "Morning", range: "6am – 12pm", icon: "🌅" },
  { val: "Afternoon", label: "Afternoon", range: "12pm – 5pm", icon: "☀️" },
  { val: "Evening", label: "Evening", range: "5pm – 9pm", icon: "🌆" },
  { val: "Night", label: "Night", range: "9pm – 6am", icon: "🌙" },
];

const today = new Date().toISOString().split("T")[0];

// ─── Confirmation Modal ───────────────────────────────────────────────────────
function ConfirmModal({ form, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Modal — bottom sheet on mobile, centered card on sm+ */}
      <div
        className="relative bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden"
        style={{ animation: "fadeUp 0.22s ease" }}
      >
        {/* Top accent */}
        <div
          className="h-1.5"
          style={{
            background: "linear-gradient(135deg,#0C447C,#185FA5,#378ADD)",
          }}
        />

        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pb-6 pt-3 sm:p-6">
          {/* Icon */}
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
            style={{ background: "#E6F1FB" }}
          >
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7"
              style={{ color: "#185FA5" }}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2
            className="text-base sm:text-lg font-bold text-center mb-1"
            style={{ color: "#0C447C" }}
          >
            Confirm Booking?
          </h2>
          <p
            className="text-xs text-center mb-4 sm:mb-5"
            style={{ color: "#888" }}
          >
            Please review your details before submitting.
          </p>

          {/* Summary */}
          <div
            className="rounded-xl p-3.5 sm:p-4 mb-4 sm:mb-5 space-y-2"
            style={{ background: "#F4F8FD" }}
          >
            {[
              { label: "Name", val: form.fullName },
              { label: "Age", val: form.patientAge },
              { label: "Gender", val: form.patientGender },
              { label: "Contact", val: form.contact },
              { label: "Service", val: form.service },
              { label: "Medical Condition", val: form.condition },
              { label: "Caregiver", val: form.genderPreference },
              {
                label: "Emergency",
                val: form.emergencyBooking ? "Yes" : "No",
              },
              { label: "Date", val: form.prefDate },
              { label: "Time", val: form.timeSlot },
              {
                label: "Location",
                val: form.locationCaptured
                  ? "Current Location Added"
                  : "Not Added",
              },
            ].map(({ label, val }) =>
              val ? (
                <div
                  key={label}
                  className="flex justify-between items-center gap-2"
                >
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: "#999" }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[11px] font-semibold text-right"
                    style={{ color: "#1a1a1a" }}
                  >
                    {val}
                  </span>
                </div>
              ) : null,
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 sm:py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                border: "0.5px solid #d0d0d0",
                color: "#555",
                background: "#fff",
              }}
            >
              Edit Details
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-3 sm:py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#185FA5,#378ADD)" }}
            >
              {loading ? (
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              Yes, Confirm
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span
        className="text-[10px] font-bold tracking-widest uppercase whitespace-nowrap"
        style={{ color: "#378ADD" }}
      >
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: "#E6F1FB" }} />
    </div>
  );
}

// ─── Field Label ──────────────────────────────────────────────────────────────
function FieldLabel({ children, optional }) {
  return (
    <label
      className="block text-xs font-semibold mb-1.5"
      style={{ color: "#555" }}
    >
      {children}
      {optional ? (
        <span className="font-normal ml-1" style={{ color: "#bbb" }}>
          (optional)
        </span>
      ) : (
        <span className="ml-0.5" style={{ color: "#E24B4A" }}>
          *
        </span>
      )}
    </label>
  );
}

// ─── Error Message ────────────────────────────────────────────────────────────
function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <p className="text-[11px] mt-1" style={{ color: "#E24B4A" }}>
      {msg}
    </p>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function InputField({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  min,
  disabled,
  hasError,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min={min}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      // py-3 on mobile for bigger tap target, py-2.5 on sm+
      className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{
        border: hasError
          ? "1px solid #E24B4A"
          : focused
            ? "1px solid #378ADD"
            : "0.5px solid #d0d0d0",
        background: hasError ? "#fff5f5" : focused ? "#fff" : "#f8f8f7",
        color: "#1a1a1a",
        boxShadow:
          focused && !hasError ? "0 0 0 3px rgba(55,138,221,0.12)" : "none",
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "not-allowed" : "text",
        fontFamily: "inherit",
        fontSize: "16px", // prevents iOS zoom on focus
      }}
    />
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
function TextAreaField({ id, placeholder, value, onChange, minHeight = 80 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl text-sm outline-none transition-all resize-y leading-relaxed"
      style={{
        minHeight,
        border: focused ? "1px solid #378ADD" : "0.5px solid #d0d0d0",
        background: focused ? "#fff" : "#f8f8f7",
        color: "#1a1a1a",
        boxShadow: focused ? "0 0 0 3px rgba(55,138,221,0.12)" : "none",
        fontFamily: "inherit",
        fontSize: "16px", // prevents iOS zoom
      }}
    />
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 mb-3 ${className}`}
      style={{
        background: "#fff",
        border: "0.5px solid #e8e8e6",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PatientBookHomeService() {
  const [form, setForm] = useState({
    fullName: "",
    patientAge: "",
    patientGender: "",

    patientLat: "",
    patientLng: "",
    locationCaptured: false,

    genderPreference: "",
    emergencyBooking: false,

    address: "",
    contact: "",

    service: "",
    condition: "",

    durationType: "",
    numDays: "",

    prefDate: "",
    timeSlot: "",

    prescription: null,

    notes: "",
  });
  const bookingId = "HC-" + Date.now().toString().slice(-6);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const selectDuration = (dur) => {
    set("durationType", dur.val);
    if (dur.days !== null) set("numDays", String(dur.days));
    else if (dur.val === "Multiple Days") set("numDays", "");
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      notify.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        set("patientLat", lat);
        set("patientLng", lng);
        set("locationCaptured", true);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          );

          const data = await res.json();

          if (data?.display_name) {
            set("address", data.display_name);
          }
        } catch (err) {
          console.log(err);
        }

        notify.success("Location captured successfully");
      },
      () => {
        notify.error("Unable to fetch location");
      },
    );
  };

  const handleSubmitClick = () => {
    const errs = validateHomeCareForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
const payload = {
  full_name: form.fullName,

  patient_age: Number(form.patientAge),
  patient_gender: form.patientGender,

  patient_latitude: form.patientLat,
  patient_longitude: form.patientLng,

  gender_preference: form.genderPreference || "Any",
  emergency_booking: form.emergencyBooking ? 1 : 0,

  address: form.address,
  contact_number: form.contact,

  service_type: form.service,
  medical_condition: form.condition,

  duration_type: form.durationType,
  number_of_days: Number(form.numDays),

  preferred_date: form.prefDate,
  time_slot: form.timeSlot,

  notes: form.notes,
};

console.log("Payload:", payload);

const res = await api.post("/patient/bookhomecare", payload);

      if (res.data.success) {
        setShowModal(false);
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Booking Error:", error);
      notify.error(error?.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm({
      fullName: "",
      address: "",
      contact: "",
      service: "",
      condition: "",
      durationType: "",
      numDays: "",
      prefDate: "",
      timeSlot: "",
      notes: "",
    });
    setErrors({});
    setSubmitted(false);
  };

  const chipSelected = {
    border: "1.5px solid #185FA5",
    background: "#E6F1FB",
    boxShadow: "0 0 0 1px #185FA5",
    color: "#0C447C",
  };
  const chipDefault = {
    border: "0.5px solid #d8d8d8",
    background: "#f8f8f7",
    color: "#666",
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          background: "#f5f6f8",
        }}
      >
        <div
          className="w-full max-w-sm sm:max-w-md rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center gap-4"
          style={{
            background: "#fff",
            border: "0.5px solid #e8e8e6",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "#EAF3DE" }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: "#3B6D11" }}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Booking Submitted Successfully</h2>

          <div className="space-y-2">
            <p>
              <strong>Booking ID:</strong> {bookingId}
            </p>

            <p>
              <strong>Status:</strong> Pending Assignment
            </p>

            <p>
              <strong>Expected Confirmation:</strong>
              Within 30 Minutes
            </p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#888" }}>
            Thank you,{" "}
            <strong style={{ color: "#1a1a1a" }}>{form.fullName}</strong>. Our
            team will contact you at{" "}
            <strong style={{ color: "#1a1a1a" }}>{form.contact}</strong> within
            24 hours to confirm.
          </p>
          <button
            onClick={reset}
            className="mt-1 w-full sm:w-auto px-8 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#185FA5,#378ADD)" }}
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  // ── Main Form ───────────────────────────────────────────────────────────────
  return (
    <div
      // px-3 on mobile → px-4 on sm → px-6 on md; max-w grows with screen
      className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-3 sm:px-4 md:px-6 pt-6 sm:pt-10 pb-10 mt-14"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* ── Header ── */}
      <div
        className="relative rounded-2xl px-5 sm:px-6 py-6 sm:py-7 mb-3 sm:mb-4 overflow-hidden "
        style={{
          background:
            "linear-gradient(135deg,#0C447C 0%,#185FA5 60%,#378ADD 100%)",
        }}
      >
        <div
          className="absolute -top-8 -right-8 w-32 sm:w-36 h-32 sm:h-36 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
        <div
          className="absolute -bottom-6 -left-6 w-20 sm:w-24 h-20 sm:h-24 rounded-full"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />

        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-3"
          style={{ background: "rgba(255,255,255,0.15)", color: "#B5D4F4" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: "#5DCAA5" }}
          />
          Home Healthcare Services
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1.5 leading-snug">
          Book a Care Service
        </h1>
        <p
          className="text-xs sm:text-sm leading-relaxed"
          style={{ color: "#85B7EB" }}
        >
          Schedule a nurse, home care, or consultation at your doorstep.
        </p>
      </div>

      {/* ── Personal Details ── */}
      <Card>
        <SectionLabel>Personal Details</SectionLabel>
        {/* Stack on mobile, 2-col on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <FieldLabel>Full Name</FieldLabel>
            <InputField
              id="fullName"
              placeholder="Enter Your Full Name"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              hasError={!!errors.fullName}
            />
            <ErrorMsg msg={errors.fullName} />
          </div>
          <div>
            <FieldLabel>Contact Number</FieldLabel>
            <InputField
              id="contact"
              type="tel"
              placeholder="Enter Your Phone Number"
              value={form.contact}
              maxLength={10}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, ""); // sirf digits
                if (value.length > 10) value = value.slice(0, 10); // hard limit
                set("contact", value);
              }}
              onKeyDown={(e) => {
                if (
                  !/[0-9]/.test(e.key) &&
                  e.key !== "Backspace" &&
                  e.key !== "ArrowLeft" &&
                  e.key !== "ArrowRight" &&
                  e.key !== "Tab"
                ) {
                  e.preventDefault();
                }
              }}
              hasError={!!errors.contact}
            />
            <ErrorMsg msg={errors.contact} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div>
            <FieldLabel>Patient Age</FieldLabel>
            <InputField
              type="number"
              value={form.patientAge}
              onChange={(e) => set("patientAge", e.target.value)}
              placeholder="Enter age"
            />
          </div>

          <div>
            <FieldLabel>Patient Gender</FieldLabel>
            <select
              value={form.patientGender}
              onChange={(e) => set("patientGender", e.target.value)}
              className="w-full px-3 py-3 rounded-xl border"
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div>
          <FieldLabel>Address</FieldLabel>
          <InputField
            id="address"
            placeholder="House no., street, area, city"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            hasError={!!errors.address}
          />
          <ErrorMsg msg={errors.address} />
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={getCurrentLocation}
            className="px-4 py-2 rounded-xl text-white text-sm font-medium"
            style={{
              background: "linear-gradient(135deg,#185FA5,#378ADD)",
            }}
          >
            📍 Use Current Location
          </button>

          {form.locationCaptured && (
            <div
              className="mt-3 p-3 rounded-xl"
              style={{
                background: "#EAF7EE",
                border: "1px solid #B8E3C3",
              }}
            >
              <p className="text-sm font-medium" style={{ color: "#2E7D32" }}>
                ✅ Current Location Captured
              </p>

              <p className="text-xs mt-1">Lat: {form.patientLat}</p>

              <p className="text-xs">Lng: {form.patientLng}</p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <SectionLabel>Caregiver Preference</SectionLabel>

        <FieldLabel>Preferred Caregiver Gender</FieldLabel>

        <select
          value={form.genderPreference}
          onChange={(e) => set("genderPreference", e.target.value)}
          className="w-full px-3 py-3 rounded-xl border"
        >
          <option value="">No Preference</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <div className="mt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.emergencyBooking}
              onChange={(e) => set("emergencyBooking", e.target.checked)}
            />
            Need Emergency Service (within 2 hours)
          </label>
        </div>
      </Card>

      {/* ── Service Type ── */}
      <Card>
        <SectionLabel>Type of Service</SectionLabel>
        {errors.service && (
          <p className="text-[11px] mb-3" style={{ color: "#E24B4A" }}>
            Please select a service type.
          </p>
        )}
        {/* 1-col mobile → 3-col sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SERVICES.map((s) => (
            <button
              key={s.val}
              type="button"
              onClick={() => set("service", s.val)}
              // horizontal layout on mobile, vertical on sm+
              className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-1.5 py-3 sm:py-4 px-4 sm:px-2 rounded-xl text-left sm:text-center transition-all cursor-pointer"
              style={form.service === s.val ? chipSelected : chipDefault}
            >
              <span className="text-2xl">{s.icon}</span>
              <div className="flex flex-col sm:items-center">
                <span
                  className="text-xs sm:text-[11px] font-semibold"
                  style={{ color: "#1a1a1a" }}
                >
                  {s.name}
                </span>
                <span
                  className="text-[10px] sm:text-[9px] leading-tight"
                  style={{ color: "#888" }}
                >
                  {s.desc}
                </span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionLabel>Prescription Upload</SectionLabel>

        <FieldLabel optional>Upload Prescription / Medical Report</FieldLabel>

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => set("prescription", e.target.files[0])}
          className="w-full p-3 rounded-xl border"
        />
      </Card>

      {/* ── Medical Condition ── */}
      <Card>
        <SectionLabel>Medical Condition</SectionLabel>
        <FieldLabel>Health Issue / Bimari</FieldLabel>
        <TextAreaField
          id="condition"
          placeholder="Describe the patient's medical condition, current symptoms, or ongoing treatment…"
          value={form.condition}
          onChange={(e) => set("condition", e.target.value)}
        />
        <ErrorMsg msg={errors.condition} />
      </Card>

      {/* ── Duration ── */}
      <Card>
        <SectionLabel>Service Duration</SectionLabel>
        <div className="mb-3">
          <FieldLabel>Duration Type</FieldLabel>
          {errors.durationType && (
            <p className="text-[11px] mb-2" style={{ color: "#E24B4A" }}>
              Please select a duration.
            </p>
          )}
          {/* 2-col on mobile → 4-col on sm+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.val}
                type="button"
                onClick={() => selectDuration(d)}
                className="py-2.5 sm:py-2 px-2 rounded-xl text-xs sm:text-[11px] font-semibold text-center transition-all cursor-pointer"
                style={form.durationType === d.val ? chipSelected : chipDefault}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        {/* Stack on mobile → 2-col on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <FieldLabel>Number of Days</FieldLabel>
            <InputField
              id="numDays"
              type="number"
              placeholder="e.g. 7"
              value={form.numDays}
              onChange={(e) => set("numDays", e.target.value)}
              min="1"
              disabled={form.durationType === "1 Day"}
              hasError={!!errors.numDays}
            />
            <ErrorMsg msg={errors.numDays} />
          </div>
          <div>
            <FieldLabel>Preferred Start Date</FieldLabel>
            <InputField
              id="prefDate"
              type="date"
              value={form.prefDate}
              onChange={(e) => set("prefDate", e.target.value)}
              min={today}
              hasError={!!errors.prefDate}
            />
            <ErrorMsg msg={errors.prefDate} />
          </div>
        </div>
      </Card>

      {/* ── Time Slot ── */}
      <Card>
        <SectionLabel>Time Preference</SectionLabel>
        {errors.timeSlot && (
          <p className="text-[11px] mb-3" style={{ color: "#E24B4A" }}>
            Please select a time slot.
          </p>
        )}
        {/* 2-col on mobile → 4-col on sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TIME_SLOTS.map((t) => (
            <button
              key={t.val}
              type="button"
              onClick={() => set("timeSlot", t.val)}
              className="flex flex-col items-center gap-1 py-3.5 sm:py-3 px-1.5 rounded-xl text-center transition-all cursor-pointer"
              style={form.timeSlot === t.val ? chipSelected : chipDefault}
            >
              <span className="text-2xl sm:text-xl">{t.icon}</span>
              <span
                className="text-xs sm:text-[10px] font-semibold"
                style={{ color: "#1a1a1a" }}
              >
                {t.label}
              </span>
              <span
                className="text-[10px] sm:text-[9px]"
                style={{ color: "#888" }}
              >
                {t.range}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* ── Notes ── */}
      <Card>
        <SectionLabel>Additional Notes</SectionLabel>
        <FieldLabel optional>Any special instructions?</FieldLabel>
        <TextAreaField
          id="notes"
          placeholder="e.g. patient is wheelchair-bound, prefer female caregiver, building access code…"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          minHeight={70}
        />
      </Card>

      {/* ── Submit Button ── */}
      <button
        type="button"
        onClick={handleSubmitClick}
        className="w-full py-4 sm:py-3.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.99]"
        style={{
          background: "linear-gradient(135deg,#185FA5,#378ADD)",
          boxShadow: "0 4px 16px rgba(24,95,165,0.28)",
          fontFamily: "inherit",
        }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22l-4-9-9-4 20-7z" />
        </svg>
        Submit Booking Request
      </button>

      {/* ── Confirmation Modal ── */}
      {showModal && (
        <ConfirmModal
          form={form}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
          loading={loading}
        />
      )}
    </div>
  );
}
