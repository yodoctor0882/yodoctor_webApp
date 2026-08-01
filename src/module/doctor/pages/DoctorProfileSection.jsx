import React, { useState } from "react";
import {
  FaUser,
  FaHospital,
  FaBook,
  FaStethoscope,
  FaMapMarkerAlt,
  FaCity,
  FaRupeeSign,
  FaCamera,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaCalendarAlt,
  FaClock,
  FaBuilding,
  FaHashtag,
  FaMapPin,
  FaFileAlt,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaLink,
} from "react-icons/fa";
import useDoctorProfile from "../../../hooks/doctorHooks/useDoctorProfile";
import { useNavigate } from "react-router-dom";

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
const BASE_URL = import.meta.env.VITE_API_URL || "";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PRACTICE_OPTIONS = [
  "Solo Practice",
  "Multi-Speciality Clinic",
  "Hospital Attached",
  "Visiting Consultant",
  "Government Hospital",
];
const QUALIFICATIONS = [
  "MBBS",
  "MD",
  "MS",
  "BDS",
  "MDS",
  "BAMS",
  "BHMS",
  "Other",
];
const DURATIONS = ["10 mins", "15 mins", "20 mins", "30 mins"];
const LANGUAGES = [
  "English",
  "Hindi",
  "Telugu",
  "Marathi",
  "Tamil",
  "Bengali",
  "Gujarati",
  "Kannada",
  "Other",
];
const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman & Nicobar Islands",
  "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const DOC_META = [
  {
    field: "profile_picture",
    label: "Profile Picture",
    hint: "JPG / PNG",
    optional: false,
  },
  {
    field: "certificate",
    label: "Medical Registration Certificate",
    hint: "PDF / Image",
    optional: false,
  },
  {
    field: "id_proof",
    label: "Government ID Proof",
    hint: "Aadhaar / PAN / Passport",
    optional: false,
  },
  {
    field: "clinic_proof",
    label: "Clinic Establishment Proof",
    hint: "Lease deed / Registration",
    optional: true,
  },
];

const buildUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path}`.replace(/([^:])\/\//g, "$1/");
};

/* ══════════════════════════════════════════ */
const DoctorProfileSection = () => {
  const {
    profile,
    profileImage,
    loading,
    handleImageChange,
    removeProfileImage,
    handleChange,
    saveProfile,
  } = useDoctorProfile();

  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const navigate = useNavigate();
const cleanImage = profileImage?.split("?")[0];

  const availableDays = Array.isArray(profile.availableDays)
    ? profile.availableDays
    : (() => {
        try {
          return JSON.parse(profile.availableDays || "[]");
        } catch {
          return [];
        }
      })();

  const languages = Array.isArray(profile.languages)
    ? profile.languages
    : (() => {
        try {
          return JSON.parse(profile.languages || "[]");
        } catch {
          return [];
        }
      })();

  const availability = Array.isArray(profile.availability)
    ? profile.availability
    : [];

  const docs = profile.documents || {};

  const handleDayToggle = (day) => {
    const updated = availableDays.includes(day)
      ? availableDays.filter((d) => d !== day)
      : [...availableDays, day];
    handleChange({ target: { name: "availableDays", value: updated } });
  };

  if (loading) {
    return (
      <div className="font-dm min-h-screen bg-[#f5f3ef] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-cyan-200 border-t-[#0e7490] rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading profile…</p>
      </div>
    );
  }

  const TABS = [
    { id: "personal", label: "Personal", icon: <FaUser /> },
    { id: "professional", label: "Professional", icon: <FaStethoscope /> },
    { id: "clinic", label: "Clinic", icon: <FaHospital /> },
    { id: "practice", label: "Practice", icon: <FaBuilding /> },
    { id: "consultation", label: "Consultation", icon: <FaClock /> },
    { id: "documents", label: "Documents", icon: <FaFileAlt /> },
  ];

  return (
    <div
      className="font-dm min-h-screen bg-[#f5f3ef] px-4 py-11 relative overflow-x-hidden"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 15% 8%, rgba(14,116,144,0.06) 0%, transparent 50%), radial-gradient(ellipse at 85% 88%, rgba(14,116,144,0.04) 0%, transparent 50%)",
      }}
    >
      <div
        className="fixed top-[-140px] left-[-140px] w-[460px] h-[460px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(14,116,144,0.06), transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="fixed bottom-[-60px] right-[-60px] w-[340px] h-[340px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(20,184,166,0.05), transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      <div className="relative z-10 max-w-[1100px] mx-auto">

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowConfirm(true);
          }}
        >
          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            <aside
              className="w-full lg:w-[280px] flex-shrink-0 bg-white border border-black/[0.08] rounded-[20px] p-6 flex flex-col items-center lg:sticky lg:top-6 h-fit"
            >
              <div className="relative mb-[18px]">
                <div
                  className="w-[116px] h-[116px] rounded-full p-[3px] bg-gradient-to-br from-[#0e7490] to-[#67e8f9]"
                  style={{ boxShadow: "0 6px 24px rgba(14,116,144,0.2)" }}
                >
                  <img
                    src={profileImage || DEFAULT_AVATAR}
                    className="w-full h-full rounded-full object-cover border-[3px] border-white block"
                    alt="Doctor"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_AVATAR;
                    }}
                  />
                </div>
                <label
                  htmlFor="docImgUpload"
                  className="absolute bottom-0.5 right-0.5 w-[30px] h-[30px] bg-[#0e7490] hover:bg-[#0c5f75] border-[2.5px] border-white rounded-full flex items-center justify-center cursor-pointer text-white transition-transform hover:scale-110"
                >
                  <FaCamera size={12} />
                </label>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  id="docImgUpload"
                  onChange={handleImageChange}
                />
              </div>

              <div className="text-center w-full mb-4">
                <h2 className="font-playfair text-[18px] font-bold text-[#1c2b33] truncate m-0 mb-1">
                  {profile.doctorName || "Doctor Name"}
                </h2>
                <p className="text-[13px] text-[#6b7f8a] m-0 mb-2.5">
                  {profile.specialization || "Specialization"}
                </p>
                <span className="inline-flex items-center gap-1.5 bg-[#ecfeff] text-[#0e7490] text-[11px] font-medium px-3 py-1 rounded-full border border-[rgba(14,116,144,0.15)]">
                  <FaHospital size={9} />
                  {profile.clinic_name || "Clinic"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 justify-center mb-6 w-full">
                <label
                  htmlFor="docImgUpload"
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium px-4 py-[7px] rounded-full bg-[#ecfeff] text-[#0e7490] border border-[rgba(14,116,144,0.18)] hover:bg-cyan-100 cursor-pointer transition hover:-translate-y-px"
                >
                  <FaCamera size={11} /> Change Photo
                </label>
                {cleanImage && !cleanImage.includes("flaticon") && (
                  <button
                    type="button"
                    onClick={removeProfileImage}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium px-4 py-[7px] rounded-full bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition hover:-translate-y-px"
                  >
                    <FaTrash size={11} /> Remove
                  </button>
                )}
              </div>

              <div className="w-full rounded-[10px] overflow-hidden border border-black/[0.08] bg-[#fafaf8] mb-4">
                <div className="grid grid-cols-2 divide-x divide-black/[0.08]">
                  <div className="py-3 text-center">
                    <span className="block text-[10px] tracking-[0.08em] uppercase text-[#9fb0b8] mb-1">
                      Fee
                    </span>
                    <span className="block text-[16px] font-semibold text-[#1c2b33]">
                      ₹{profile.consultationFee || "—"}
                    </span>
                  </div>
                  <div className="py-3 text-center">
                    <span className="block text-[10px] tracking-[0.08em] uppercase text-[#9fb0b8] mb-1">
                      Exp
                    </span>
                    <span className="block text-[16px] font-semibold text-[#1c2b33]">
                      {profile.experience_years
                        ? `${profile.experience_years}y`
                        : "—"}
                    </span>
                  </div>
                </div>
                <div className="border-t border-black/[0.08] py-3 text-center">
                  <span className="block text-[10px] tracking-[0.08em] uppercase text-[#9fb0b8] mb-1">
                    City
                  </span>
                  <span className="font-playfair block text-[15px] font-bold text-[#1c2b33] truncate px-2">
                    {profile.city || "—"}
                  </span>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div
               className="bg-white border border-black/[0.08] rounded-[14px] p-2 flex flex-wrap gap-2 mb-4"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
              >
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-semibold transition-all duration-200
                      ${activeTab === tab.id ? "bg-[#0e7490] text-white shadow-sm" : "text-[#6b7f8a] hover:bg-[#f3f4f6] hover:text-[#1c2b33]"}`}
                  >
                    <span className="text-[11px]">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div
                className="bg-white border border-black/[0.08] rounded-[20px] p-6 h-full flex flex-col"
                style={{
                  boxShadow:
                    "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                {activeTab === "personal" && (
                  <div>
                    <SectionHead title="Basic Information" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field
                        label="Full Name"
                        icon={<FaUser />}
                        name="doctorName"
                        value={profile.doctorName || ""}
                        onChange={handleChange}
                        placeholder="Dr. Full Name"
                      />
                      <Field
                        label="Email"
                        icon={<FaEnvelope />}
                        name="email"
                        value={profile.email || ""}
                        readOnly
                      />
                      <Field
                        label="Mobile"
                        icon={<FaPhone />}
                        name="mobile"
                        value={profile.mobile || ""}
                        onChange={handleChange}
                      />
                      <SelectField
                        label="Gender"
                        icon={<FaUser />}
                        name="gender"
                        value={profile.gender || ""}
                        readOnly
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </SelectField>
                    </div>
                    <SectionHead title="Professional Bio" />
                    <TextareaField
                      label="About You"
                      icon={<FaBook />}
                      name="bio"
                      value={profile.bio || ""}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Brief professional bio…"
                    />
                  </div>
                )}

                {activeTab === "professional" && (
                  <div>
                    <SectionHead title="Qualifications" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <SelectField
                        label="Primary Qualification"
                        icon={<FaBook />}
                        name="degree"
                        value={profile.degree || ""}
                        onChange={handleChange}
                      >
                        <option value="">Select qualification</option>
                        {QUALIFICATIONS.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </SelectField>
                      <Field
                        label="Specialization"
                        icon={<FaStethoscope />}
                        name="specialization"
                        value={profile.specialization || ""}
                        onChange={handleChange}
                        placeholder="e.g. Cardiology"
                      />
                      <Field
                        label="Years of Experience"
                        icon={<FaClock />}
                        name="experience_years"
                        value={profile.experience_years || ""}
                        onChange={handleChange}
                        placeholder="e.g. 8"
                        type="number"
                        min="0"
                        max="60"
                      />
                    </div>
                    <SectionHead title="Council Registration" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field
                        label="Registration Number"
                        icon={<FaHashtag />}
                        name="licenseNumber"
                        value={profile.licenseNumber || ""}
                        onChange={handleChange}
                        placeholder="e.g. MH-12345678"
                      />
                      <Field
                        label="State Council"
                        icon={<FaShieldAlt />}
                        name="state_council"
                        value={profile.state_council || ""}
                        onChange={handleChange}
                        placeholder="e.g. Maharashtra Medical Council"
                      />
                      <Field
                        label="Registration Valid Till"
                        icon={<FaCalendarAlt />}
                        name="valid_till"
                        value={
                          profile.valid_till
                            ? profile.valid_till.split("T")[0]
                            : ""
                        }
                        onChange={handleChange}
                        type="date"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "clinic" && (
                  <div>
                    <SectionHead title="Clinic Details" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field
                        label="Clinic Name"
                        icon={<FaHospital />}
                        name="clinic_name"
                        value={profile.clinic_name || ""}
                        onChange={handleChange}
                        placeholder="e.g. Apollo Clinic"
                      />
                      <Field
                        label="City"
                        icon={<FaCity />}
                        name="city"
                        value={profile.city || ""}
                        onChange={handleChange}
                        placeholder="e.g. Mumbai"
                      />
                      <SelectField
                        label="State"
                        icon={<FaMapPin />}
                        name="state"
                        value={profile.state || ""}
                        onChange={handleChange}
                      >
                        <option value="">Select state</option>
                        {STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </SelectField>
                      <Field
                        label="Pincode"
                        icon={<FaMapPin />}
                        name="pincode"
                        value={profile.pincode || ""}
                        onChange={handleChange}
                        placeholder="6-digit pincode"
                        maxLength={6}
                      />
                      <Field
                        label="Landmark"
                        icon={<FaMapMarkerAlt />}
                        name="landmark"
                        value={profile.landmark || ""}
                        onChange={handleChange}
                        placeholder="e.g. Near City Mall"
                      />
                      <Field
                        label="Google Maps Link"
                        icon={<FaLink />}
                        name="mapsLink"
                        value={profile.mapsLink || ""}
                        onChange={handleChange}
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                    <div className="mt-3">
                      <TextareaField
                        label="Full Address"
                        icon={<FaMapMarkerAlt />}
                        name="address"
                        value={profile.address || ""}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Building, street, area…"
                      />
                    </div>
                    <SectionHead title="Languages Spoken" />
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES.map((lang) => {
                        const active = languages.includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => {
                              const updated = active
                                ? languages.filter((l) => l !== lang)
                                : [...languages, lang];
                              handleChange({
                                target: { name: "languages", value: updated },
                              });
                            }}
                            className={`px-4 py-2 rounded-full text-[12px] font-semibold border-2 transition-all duration-200
                              ${active ? "bg-[#0e7490] text-white border-[#0e7490]" : "border-slate-200 text-slate-600 hover:border-[#0e7490]/40"}`}
                          >
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "practice" && (
                  <div>
                    <SectionHead title="Practice Type" />
                    <div className="space-y-2.5">
                      {PRACTICE_OPTIONS.map((option) => {
                        const selected = profile.practice_type === option;
                        return (
                          <div
                            key={option}
                            onClick={() =>
                              handleChange({
                                target: {
                                  name: "practice_type",
                                  value: option,
                                },
                              })
                            }
                            className={`flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200
                              ${selected ? "border-[#0e7490] bg-[#ecfeff]/60" : "border-slate-200 hover:border-[#0e7490]/40 hover:bg-slate-50"}`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-[#0e7490]" : "border-slate-300"}`}
                            >
                              {selected && (
                                <div className="w-2.5 h-2.5 bg-[#0e7490] rounded-full" />
                              )}
                            </div>
                            <span
                              className={`text-sm font-semibold font-dm ${selected ? "text-[#0e7490]" : "text-slate-700"}`}
                            >
                              {option}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <SectionHead title="Affiliated Hospital" />
                    <Field
                      label="Hospital / Clinic Name (Optional)"
                      icon={<FaBuilding />}
                      name="hospital_name"
                      value={profile.hospital_name || ""}
                      onChange={handleChange}
                      placeholder="e.g. City General Hospital"
                    />
                  </div>
                )}

                {activeTab === "consultation" && (
                  <div>
                    <SectionHead title="Fees & Duration" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field
                        label="Consultation Fee (₹)"
                        icon={<FaRupeeSign />}
                        name="consultationFee"
                        value={profile.consultationFee || ""}
                        onChange={handleChange}
                        placeholder="e.g. 500"
                        type="number"
                        min="0"
                      />
                      <div className="flex flex-col gap-[5px]">
                        <label className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#6b7f8a]">
                          Avg. Duration
                        </label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {DURATIONS.map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() =>
                                handleChange({
                                  target: {
                                    name: "consultation_duration",
                                    value: d,
                                  },
                                })
                              }
                              className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all duration-200
                                ${profile.consultation_duration === d ? "bg-[#0e7490] text-white border-[#0e7490]" : "border-slate-200 text-slate-600 hover:border-[#0e7490]/40"}`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <SectionHead title="Available Days" />
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((day) => {
                        const active = availableDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayToggle(day)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all duration-200
                              ${active ? "bg-[#0e7490] text-white border-[#0e7490]" : "border-slate-200 text-slate-600 hover:border-[#0e7490]/40"}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                    {availability.length > 0 && (
                      <>
                        <SectionHead title="Shift Timings" />

                        {/* ✅ TOP HEADER (ONLY ONCE) */}
                        <div className="flex items-center gap-4 px-4 text-xs font-semibold text-gray-500 mb-2">
                          <div className="w-10"></div>
                          <div className="flex-1 text-center text-blue-600">
                            Morning Shift
                          </div>
                          <div className="flex-1 text-center text-orange-600">
                            Evening Shift
                          </div>
                        </div>

                        {/* ✅ ROWS */}
                        <div className="space-y-2.5">
                          {availability.map((slot, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
                            >
                              {/* DAY */}
                              <span className="text-[12px] font-bold text-[#0e7490] w-10">
                                {slot.day_code}
                              </span>

                              {/* MORNING */}
                              <div className="flex-1 text-center text-xs bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                                {slot.morning_start
                                  ? `${formatHour(slot.morning_start)} – ${formatHour(
                                      slot.morning_end,
                                    )}`
                                  : "-"}
                              </div>

                              {/* EVENING */}
                              <div className="flex-1 text-center text-xs bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                                {slot.evening_start
                                  ? `${formatHour(slot.evening_start)} – ${formatHour(
                                      slot.evening_end,
                                    )}`
                                  : "-"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === "documents" && (
                  <div>
                    <SectionHead title="Uploaded Documents" />
                    <p className="text-[12px] text-[#6b7f8a] mb-5 -mt-3">
                      Documents submitted during registration. Contact support
                      to update them.
                    </p>

                    <div className="space-y-3">
                      {DOC_META.map((doc) => {
                        const rawPath = docs[doc.field];
                        console.log("Checking:", doc.field, docs?.[doc.field]);
                        const fileUrl = buildUrl(rawPath);
                        const uploaded = !!rawPath;
                        const isPdf =
                          rawPath && rawPath.toLowerCase().endsWith(".pdf");
                        const isImage =
                          rawPath &&
                          /\.(jpg|jpeg|png|gif|webp)$/i.test(rawPath);

                        return (
                          <div
                            key={doc.field}
                            className={`flex items-center gap-4 rounded-[14px] border-2 p-4 transition-all
                              ${
                                uploaded
                                  ? "border-emerald-200 bg-emerald-50/40"
                                  : doc.optional
                                    ? "border-slate-200 bg-slate-50/40"
                                    : "border-red-100 bg-red-50/30"
                              }`}
                          >
                            {uploaded && isImage ? (
                              <img
                                src={fileUrl}
                                alt={doc.label}
                                className="w-14 h-14 rounded-[10px] object-cover border border-emerald-200 flex-shrink-0"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div
                                className={`w-14 h-14 rounded-[10px] flex items-center justify-center flex-shrink-0
                                ${uploaded ? "bg-emerald-100" : "bg-slate-100"}`}
                              >
                                {isPdf ? (
                                  <span className="text-[11px] font-extrabold text-blue-600">
                                    PDF
                                  </span>
                                ) : (
                                  <FaFileAlt
                                    className={
                                      uploaded
                                        ? "text-emerald-500"
                                        : "text-slate-300"
                                    }
                                    size={20}
                                  />
                                )}
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-[#1c2b33]">
                                {doc.label}
                              </p>
                              <p className="text-[11px] text-[#9fb0b8] mt-0.5">
                                {doc.hint}
                              </p>
                              {uploaded && rawPath && (
                                <p className="text-[11px] text-emerald-600 mt-1 font-medium truncate">
                                  {rawPath.split("/").pop()}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              {uploaded ? (
                                <>
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">
                                    <FaCheckCircle size={9} /> Uploaded
                                  </span>
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0e7490] hover:underline"
                                  >
                                    <FaExternalLinkAlt size={9} /> View
                                  </a>
                                </>
                              ) : doc.optional ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                                  <FaHourglassHalf size={9} /> Not uploaded
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                                  <FaTimesCircle size={9} /> Missing
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex items-start gap-3 rounded-[12px] border border-blue-100 bg-blue-50/60 px-4 py-4">
                      <FaShieldAlt
                        className="text-blue-400 mt-0.5 flex-shrink-0"
                        size={15}
                      />
                      <p className="text-[12px] text-slate-600 leading-relaxed">
                        All documents are encrypted and stored securely — used
                        only for credential verification. To replace a document,
                        please contact support.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab !== "documents" && (
                  <div className="flex justify-end gap-3 mt-auto pt-6 border-t border-black/[0.07]">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="px-7 py-[11px] rounded-full bg-white border border-black/[0.13] text-[#6b7f8a] text-[14px] font-medium hover:bg-slate-50 hover:text-[#1c2b33] hover:border-[#bcc5cc] transition cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="px-9 py-[11px] rounded-full bg-[#0e7490] text-white text-[14px] font-semibold tracking-wide hover:bg-[#0c5f75] hover:-translate-y-px active:translate-y-0 transition cursor-pointer"
                      style={{ boxShadow: "0 4px 16px rgba(14,116,144,0.22)" }}
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {showConfirm && (
        <ConfirmModal
          onCancel={() => setShowConfirm(false)}
          onConfirm={async () => {
            const ok = await saveProfile();
            if (ok) setShowConfirm(false);
          }}
        />
      )}
    </div>
  );
};

const formatHour = (time) => {
  if (!time) return "—";

  const [hour, minute] = time.split(":"); // ✅ correct parsing
  const h = Number(hour);

  const h12 = h % 12 === 0 ? 12 : h % 12;

  return `${h12}:${minute} ${h < 12 ? "AM" : "PM"}`;
};
const SectionHead = ({ title }) => (
  <div className="flex items-center gap-2.5 my-6 first:mt-0">
    <span className="w-[18px] h-px bg-[#0e7490] flex-shrink-0" />
    <span className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#0e7490] whitespace-nowrap">
      {title}
    </span>
    <span className="flex-1 h-px bg-black/[0.07]" />
  </div>
);

const Field = ({ label, icon, readOnly, ...props }) => (
  <div className="flex flex-col gap-[5px]">
    <label className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#6b7f8a]">
      {label}
    </label>
    <div
      className={`flex items-center gap-2.5 px-3.5 py-[11px] rounded-[10px] border transition-all duration-200
      ${
        readOnly
          ? "bg-[#f3f4f6] border-black/[0.06] cursor-not-allowed"
          : "bg-[#f8f9fb] border-black/[0.08] focus-within:border-[#0e7490] focus-within:ring-2 focus-within:ring-[rgba(14,116,144,0.12)] focus-within:bg-white"
      }`}
    >
      <span className="text-[#0e7490] opacity-70 flex-shrink-0 text-[13px]">
        {icon}
      </span>
      <input
        {...props}
        readOnly={readOnly}
        className={`flex-1 bg-transparent border-none outline-none font-dm text-[14px] min-w-0 placeholder-[#c4cdd4]
          ${readOnly ? "text-[#9fb0b8] cursor-not-allowed" : "text-[#1c2b33]"}`}
      />
    </div>
  </div>
);

const SelectField = ({ label, icon, children, readOnly, ...props }) => (
  <div className="flex flex-col gap-[5px]">
    <label className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#6b7f8a]">
      {label}
    </label>
    <div
      className={`flex items-center gap-2.5 px-3.5 py-[11px] rounded-[10px] border transition-all duration-200
      ${
        readOnly
          ? "bg-[#f3f4f6] border-black/[0.06] cursor-not-allowed"
          : "bg-[#f8f9fb] border-black/[0.08] focus-within:border-[#0e7490] focus-within:ring-2 focus-within:ring-[rgba(14,116,144,0.12)] focus-within:bg-white"
      }`}
    >
      <span className="text-[#0e7490] opacity-70 flex-shrink-0 text-[13px]">
        {icon}
      </span>
      <select
        {...props}
        disabled={readOnly}
        className={`flex-1 bg-transparent border-none outline-none font-dm text-[14px] min-w-0
          ${readOnly ? "text-[#9fb0b8] cursor-not-allowed" : "text-[#1c2b33] cursor-pointer"}`}
      >
        {children}
      </select>
    </div>
  </div>
);

const TextareaField = ({ label, icon, ...props }) => (
  <div className="flex flex-col gap-[5px]">
    <label className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#6b7f8a]">
      {label}
    </label>
    <div className="flex items-start gap-2.5 px-3.5 py-[11px] rounded-[10px] border border-black/[0.08] bg-[#f8f9fb] focus-within:border-[#0e7490] focus-within:ring-2 focus-within:ring-[rgba(14,116,144,0.12)] focus-within:bg-white transition-all duration-200">
      <span className="text-[#0e7490] opacity-70 flex-shrink-0 text-[13px] mt-0.5">
        {icon}
      </span>
      <textarea
        {...props}
        className="flex-1 bg-transparent border-none outline-none font-dm text-[14px] text-[#1c2b33] placeholder-[#c4cdd4] resize-none leading-relaxed"
      />
    </div>
  </div>
);

const ConfirmModal = ({ onCancel, onConfirm }) => (
  <div className="fixed inset-0 bg-black/25 backdrop-blur-[6px] flex items-center justify-center z-50">
    <div
      className="bg-white border border-black/[0.08] rounded-[22px] px-9 py-10 w-[340px] text-center"
      style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.12)" }}
    >
      <div className="w-[52px] h-[52px] rounded-full bg-[#ecfeff] border border-[rgba(14,116,144,0.15)] text-[#0e7490] text-[22px] flex items-center justify-center mx-auto mb-[18px]">
        ✦
      </div>
      <h3 className="font-playfair text-[22px] font-bold text-[#1c2b33] m-0 mb-2">
        Save Changes?
      </h3>
      <p className="text-[13px] text-[#6b7f8a] m-0 mb-7 leading-relaxed">
        Your profile will be updated with the new information.
      </p>
      <div className="flex gap-2.5 justify-center">
        <button
          onClick={onCancel}
          className="px-7 py-[10px] rounded-full text-[14px] font-medium text-[#6b7f8a] bg-[#f3f4f6] hover:bg-[#e8eaed] hover:text-[#1c2b33] transition cursor-pointer border-none"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-7 py-[10px] rounded-full text-[14px] font-semibold text-white bg-[#0e7490] hover:bg-[#0c5f75] transition cursor-pointer border-none"
          style={{ boxShadow: "0 4px 16px rgba(14,116,144,0.22)" }}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

export default DoctorProfileSection;
