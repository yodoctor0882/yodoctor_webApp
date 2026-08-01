import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${BASE_URL}/${imagePath}`.replace(/([^:])\/\//g, "$1/");
};

const STATUS = {
  PENDING: {
    label: "Pending",
    cls: "bg-amber-50  text-amber-600  border-amber-200",
  },
  APPROVED: {
    label: "Approved",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    cls: "bg-red-50    text-red-600    border-red-200",
  },
};

/* ── SVG Icons ── */
const Icon = ({ d, size = 16, color = "currentColor", sw = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  back: "M19 12H5M12 19l-7-7 7-7",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  phone:
    "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  pin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M15 10a3 3 0 11-6 0 3 3 0 016 0z",
  id: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0",
  gender:
    "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197",
  degree: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  license:
    "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  globe:
    "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129",
  verify:
    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
};

/* ── Info Row ── */
const InfoRow = ({ iconPath, label, value, highlight = false }) => (
  <div className="flex items-start gap-4 py-3.5 border-b border-slate-100 last:border-b-0">
    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon d={iconPath} size={15} color="#3b82f6" sw={2} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-[family-name:var(--font-dm)]">
        {label}
      </p>
      <p
        className={`text-sm font-semibold mt-0.5 font-[family-name:var(--font-dm)] ${highlight ? "text-blue-600" : "text-slate-700"}`}
      >
        {value || <span className="text-slate-300 font-normal">—</span>}
      </p>
    </div>
  </div>
);

/* ── Section card ── */
const Section = ({ title, gradient, iconPath, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
      <div
        className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}
      >
        <Icon d={iconPath} size={13} color="white" sw={2} />
      </div>
      <span className="text-sm font-bold text-slate-800 font-[family-name:var(--font-dm)]">
        {title}
      </span>
    </div>
    <div className="px-6 py-1">{children}</div>
  </div>
);

/* ══════════════════════════════════════════ */
const Doctordetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);


  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);

      try {
        const res = await api.get(`/admin/doctors/${id}`);

        console.log("API Response:", res.data);

        
        setDoctor(res.data.doctor);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-[family-name:var(--font-dm)]">
            Loading doctor details...
          </p>
        </div>
      </div>
    );

  if (!doctor)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 text-sm font-[family-name:var(--font-dm)]">
          Doctor not found
        </p>
      </div>
    );

  const st = STATUS[doctor.status] || STATUS.PENDING;
  const initials = doctor.doctorName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
      const clinic = doctor.clinics?.[0];

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-10 py-8">
      <div className="max-w-5xl mx-auto">
        {/* ── Back ── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition font-[family-name:var(--font-dm)] mb-7 shadow-sm"
        >
          <Icon d={ICONS.back} size={15} sw={2.5} />
          Back
        </button>

        {/* ── Profile hero card ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 flex flex-col sm:flex-row items-center sm:items-start gap-7 mb-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200">
              {doctor.profile_image && !imgError ? (
                <img
                  src={getImageUrl(doctor.profile_image)}
                  alt={doctor.doctorName}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-500 bg-slate-100">
                  {initials}
                </div>
              )}
            </div>
            {/* Online dot */}
            <div className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-dm)]">
              {doctor.doctorName}
            </h1>
            <p className="text-base font-semibold text-blue-600 mt-1 font-[family-name:var(--font-dm)]">
              {doctor.specialization}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-3 justify-center sm:justify-start">
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-full border font-[family-name:var(--font-dm)] ${st.cls}`}
              >
                {st.label}
              </span>
              {doctor.experience_years && (
                <span className="flex items-center gap-1.5 text-xs text-slate-400 font-[family-name:var(--font-dm)]">
                  <Icon d={ICONS.clock} size={13} color="#94a3b8" />
                  {doctor.experience_years} years experience
                </span>
              )}
              {doctor.city && (
                <span className="flex items-center gap-1.5 text-xs text-slate-400 font-[family-name:var(--font-dm)]">
                  <Icon d={ICONS.pin} size={13} color="#94a3b8" />
                  {clinic?.city}
                </span>
              )}
            </div>

            {doctor.bio && (
              <p className="mt-4 text-sm text-slate-500 leading-relaxed font-[family-name:var(--font-dm)] max-w-xl">
                <span className="font-semibold text-md">Bio :</span>{" "}
                {doctor.bio}
              </p>
            )}
          </div>
        </div>

        {/* ── Info grid ── */}
        {/* ── Info grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Personal Info */}
          <Section
            title="Personal Information"
            gradient="from-blue-600 to-blue-700"
            iconPath={ICONS.gender}
          >
            <InfoRow
              iconPath={ICONS.gender}
              label="Gender"
              value={doctor.gender || "Not Provided"}
            />
            <InfoRow
              iconPath={ICONS.degree}
              label="Degree"
              value={doctor.degree}
            />
            <InfoRow
              iconPath={ICONS.license}
              label="License No"
              value={doctor.licenseNumber}
              highlight
            />
            <InfoRow
              iconPath={ICONS.globe}
              label="Languages"
              value={clinic?.languages?.join(", ")}
            />
            <InfoRow
              iconPath={ICONS.id}
              label="Practice Type"
              value={doctor.practice_type}
              highlight
            />
            <InfoRow
              iconPath={ICONS.id}
              label="Available Days"
              value={
                Array.isArray(doctor.availableDays)
                  ? doctor.availableDays.join(", ")
                  : doctor.availableDays
              }
            />
            <InfoRow
              iconPath={ICONS.clock}
              label="Consultation Duration"
              value={doctor.consultation_duration}
            />
            <InfoRow
              iconPath={ICONS.globe}
              label="Consultation Fee"
              value={
                doctor.consultationFee ? `₹${doctor.consultationFee}` : null
              }
              highlight
            />
          </Section>

          {/* Contact Info */}
          <Section
            title="Contact & Location"
            gradient="from-indigo-500 to-violet-600"
            iconPath={ICONS.mail}
          >
            <InfoRow iconPath={ICONS.mail} label="Email" value={doctor.email} />
            <InfoRow
              iconPath={ICONS.phone}
              label="Mobile"
              value={doctor.mobile}
            />
            <InfoRow
              iconPath={ICONS.pin}
              label="Clinic Name"
              value={clinic?.clinic_name}
            />
            <InfoRow
              iconPath={ICONS.pin}
              label="Address"
              value={[clinic?.address, clinic?.city].filter(Boolean).join(", ")}
            />
            <InfoRow iconPath={ICONS.pin} label="State" value={clinic?.state} />
            <InfoRow
              iconPath={ICONS.pin}
              label="Pincode"
              value={clinic?.pincode}
            />
            <InfoRow
              iconPath={ICONS.verify}
              label="State Council"
              value={doctor.state_council}
            />
            <InfoRow
              iconPath={ICONS.id}
              label="Valid Till"
              value={
                doctor?.valid_till
                  ? new Date(doctor.valid_till).toLocaleDateString()
                  : "N/A"
              }
            />
          </Section>

          {/* Shift Timings - Full Width */}
          <Section
            title="Morning Shift "
            gradient="from-teal-500 to-cyan-600"
            iconPath={ICONS.clock}
          >
            <InfoRow
              iconPath={ICONS.clock}
              label="Morning Start"
              value={doctor.shift?.morning_start || "Not Set"}
            />
            <InfoRow
              iconPath={ICONS.clock}
              label="Morning End"
              value={doctor.shift?.morning_end || "Not Set"}
            />
          </Section>

          <Section
            title="Evening Shift"
            gradient="from-orange-400 to-pink-500"
            iconPath={ICONS.clock}
          >
            <InfoRow
              iconPath={ICONS.clock}
              label="Evening Start"
              value={doctor.shift?.evening_start || "Not Set"}
            />
            <InfoRow
              iconPath={ICONS.clock}
              label="Evening End"
              value={doctor.shift?.evening_end || "Not Set"}
            />
          </Section>
        </div>

        {/* ── Verify Documents CTA ── */}
        <button
          onClick={() =>
            navigate(`/admin/doctorsverification/${doctor.id}`)
          }
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-200 font-[family-name:var(--font-dm)]"
        >
          <Icon d={ICONS.verify} size={20} color="white" sw={2} />
          Verify Documents
        </button>
      </div>
    </div>
  );
};

export default Doctordetails;
