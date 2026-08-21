import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { notify } from "../../../utils/notify";
import { getDoctorById } from "../../../services/patientService";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const getImageUrl = (imagePath) => {
  if (!imagePath)
    return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  if (imagePath.startsWith("http")) return imagePath;
  return `${BASE_URL}/${imagePath}`.replace(/([^:])\/\//g, "$1/");
};

const DoctorDetailPage = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const isQR = location.search.includes("fromQR=true");

  const dayMap = {
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
    7: "Sun",
  };
  useEffect(() => {
    if (state?.doctor) setDoctor(state.doctor);

    const fetchDoctor = async () => {
      try {
        const res = await getDoctorById(id);
        setDoctor(res.data.doctor);
      } catch (err) {
        notify.error("Doctor not found");
        if (!state?.doctor) navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ background: "#f0f4f8" }}
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
        className="flex justify-center items-center min-h-screen"
        style={{ background: "#f0f4f8" }}
      >
        <p className="font-[family-name:var(--font-dm)] text-gray-500">
          Doctor data not found
        </p>
      </div>
    );
  }
  const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const formattedDays = doctor?.availableDays
    ? Array.isArray(doctor.availableDays)
      ? doctor.availableDays
          .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
          .join(", ")
      : doctor.availableDays
    : "Not Available";

  const infoItems = [
    { label: "Clinic Name", value: doctor.clinicName, icon: "🏥" },
    { label: "City", value: doctor.city, icon: "📍" },
    { label: "Address", value: doctor.address, icon: "🗺️" },
    {
      label: "Location",
      value: (
        <a
          href={doctor.maps_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Open Clinic Location
        </a>
      ),
      icon: "📍",
    },
    { label: "License No", value: doctor.licenseNumber, icon: "📋" },
    {
      label: "Consultation Fee",
      value: doctor.consultationFee ? `₹${doctor.consultationFee}` : null,
      icon: "💰",
      highlight: true,
    },
    {
      label: "Morning",
      value: doctor.sessionTimings?.morning,
      icon: "🌅",
    },
    {
      label: "Evening",
      value: doctor.sessionTimings?.evening,
      icon: "🌙",
    },
     { label: "Timings", value: doctor.timings, icon: "🕐" },

    {
      label: "Available Days",
      value: formattedDays,
      icon: "📅",
    },
  ];

  const getStatus = () => {
    if (!doctor.available_today) {
      return {
        text: "Not Available",
        color: "bg-orange-100 text-orange-700  text-center py-1 font-bold",
      };
    }

    if (!doctor.is_available) {
      return {
        text: "Not Available",
        color: "bg-red-100 text-red-700 text-center py-1 font-bold",
      };
    }

    return {
      text: "Available",
      color: "bg-green-100 text-green-700 text-center py-1 font-bold",
    };
  };

  const status = getStatus();

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-8"
      style={{ background: "#f0f4f8" }}
    >
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="font-[family-name:var(--font-dm)] text-[13px] font-semibold mb-5 flex items-center gap-1.5 cursor-pointer transition-all duration-200 hover:-translate-x-1"
          style={{ color: "#0086C3", background: "none", border: "none" }}
        >
          ← Back to Doctors
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-[fadeUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div
            className="lg:col-span-2 bg-white rounded-2xl overflow-hidden"
            style={{
              boxShadow: "0 2px 20px rgba(12,30,58,0.08)",
              border: "1px solid rgba(12,30,58,0.06)",
            }}
          >
            <div
              className="h-24 w-full relative"
              style={{
                background: "linear-gradient(135deg,#0086C3,#00b4d8,#2ecc71)",
              }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
            </div>

            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
                <div className="relative flex-shrink-0">
                  <img
                    src={getImageUrl(doctor.profile_image)}
                    alt={doctor.doctorName}
                    className="w-24 h-24 rounded-2xl object-cover"
                    style={{
                      border: "3px solid #fff",
                      boxShadow: "0 4px 16px rgba(12,30,58,0.15)",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                    }}
                  />
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}
                  >
                    {status.text}
                  </span>
                </div>

                <div className="pb-1">
                  <h1 className="font-[family-name:var(--font-playfair)] text-[22px] font-extrabold text-[#0c1e3a] leading-tight">
                    {doctor.doctorName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span
                      className="font-[family-name:var(--font-dm)] text-[12px] font-semibold px-3 py-0.5 rounded-full"
                      style={{
                        color: "#0086C3",
                        background: "rgba(0,134,195,0.1)",
                      }}
                    >
                      {doctor.specialization}
                      {doctor.degree && ` • ${doctor.degree}`}
                    </span>
                    {doctor.rating && (
                      <span
                        className="font-[family-name:var(--font-dm)] text-[12px] font-semibold px-3 py-0.5 rounded-full"
                        style={{ color: "#b45309", background: "#fef3c7" }}
                      >
                        ⭐ {doctor.rating} / 5
                      </span>
                    )}
                    {doctor.experience_years && (
                      <span
                        className="font-[family-name:var(--font-dm)] text-[12px] font-semibold px-3 py-0.5 rounded-full"
                        style={{ color: "#166534", background: "#dcfce7" }}
                      >
                        🩺 {doctor.experience_years} yrs exp
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="h-px w-full mb-5"
                style={{ background: "rgba(12,30,58,0.07)" }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {infoItems.map((item, i) => (
                  <div
                    key={i}
                    className={`rounded-xl px-4 py-3 ${item.full ? "sm:col-span-2" : ""}`}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid rgba(12,30,58,0.05)",
                    }}
                  >
                    <p
                      className=" text-[11px] font-bold uppercase tracking-wider mb-1"
                      style={{ color: "#94a3b8" }}
                    >
                      {item.icon} {item.label}
                    </p>
                    <p
                      className={` text-[14px] font-bold ${
                        item.highlight ? "text-[#0086C3]" : "text-[#0c1e3a]"
                      }`}
                    >
                      {item.value || "Not Available"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div
              className="bg-white rounded-2xl p-5 sticky top-24"
              style={{
                boxShadow: "0 2px 20px rgba(12,30,58,0.08)",
                border: "1px solid rgba(12,30,58,0.06)",
              }}
            >
              <h4 className=" text-[16px] font-bold text-[#0c1e3a] text-center mb-4">
                Take Action
              </h4>

              {doctor.consultationFee && (
                <div
                  className="rounded-xl px-4 py-3 mb-4 text-center"
                  style={{
                    background: "rgba(0,134,195,0.07)",
                    border: "1px solid rgba(0,134,195,0.15)",
                  }}
                >
                  <p
                    className=" text-[11px] font-bold uppercase tracking-wider mb-0.5"
                    style={{ color: "#94a3b8" }}
                  >
                    Consultation Fee
                  </p>
                  <p
                    className="text-[24px] font-semibold"
                    style={{ color: "#0086C3" }}
                  >
                    ₹{doctor.consultationFee}
                  </p>
                </div>
              )}

              <button
                onClick={() =>
                  navigate(
                    `/client/bookappointmentpage/${doctor.doctorId}${
                      isQR ? "?fromQR=true" : ""
                    }`,
                    { state: { doctor } },
                  )
                }
                className="w-full  font-bold text-[15px] text-white py-3 rounded-xl cursor-pointer transition-all duration-250 hover:-translate-y-0.5 mb-2"
                style={{
                  background: "linear-gradient(135deg,#0086C3,#00b4d8)",
                  boxShadow: "0 4px 14px rgba(0,134,195,0.35)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(0,134,195,0.5)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 4px 14px rgba(0,134,195,0.35)")
                }
              >
                📅 Book Appointment
              </button>
              <button
                onClick={() =>
                  navigate(
                    `/client/apply-certificate?doctorId=${doctor.doctorId}`,
                    { state: { doctor } },
                  )
                }
                className="w-full  font-bold text-[15px] text-white py-3 rounded-xl cursor-pointer transition-all duration-250 hover:-translate-y-0.5 mb-2"
                style={{
                  background: "linear-gradient(135deg,#0086C3,#00b4d8)",
                  boxShadow: "0 4px 14px rgba(0,134,195,0.35)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(0,134,195,0.5)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 4px 14px rgba(0,134,195,0.35)")
                }
              >
                ➕ Apply Certificate
              </button>

              {doctor.description && (
                <>
                  <div
                    className="h-px w-full my-4"
                    style={{ background: "rgba(12,30,58,0.07)" }}
                  />
                  <h4 className=" text-[15px] font-bold text-[#0c1e3a] mb-2">
                    About Doctor
                  </h4>
                  <p
                    className=" text-[14px] font-semibold leading-relaxed"
                    style={{ color: "#64748b" }}
                  >
                    {doctor.description}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailPage;
