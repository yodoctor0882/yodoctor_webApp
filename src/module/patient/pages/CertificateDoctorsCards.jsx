import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  return `${BASE_URL}/${imagePath}`.replace(/([^:])\/+/g, "$1/");
};

const CertificateDoctorsCards = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCertificateDoctors();
  }, []);

  const fetchCertificateDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/certificate/allcertificate-doctors");

      console.log("Certificate Doctors API:", response.data);

      if (response.data?.success) {
        setDoctors(response.data.doctors || []);
      } else {
        setDoctors([]);

        setError(response.data?.message || "No doctors found");
      }
    } catch (err) {
      console.error("Error fetching certificate doctors:", err);

      setDoctors([]);

      setError(
        err.response?.data?.message || "Unable to load certificate doctors",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0c1e3a]">
              Certificate Doctors
            </h1>
          </div>

          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#0086C3] border-t-transparent rounded-full animate-spin" />

              <p className="text-gray-400 text-sm">Finding doctors...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0c1e3a]">
              Certificate Doctors
            </h1>
          </div>

          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>

            <p className="text-lg font-bold text-[#0c1e3a] mb-1">
              No doctors found
            </p>

            <p className="text-sm text-slate-400">
              No certificate doctors are currently available
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
     
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0c1e3a]">
            Certificate Doctors
          </h1>

          {doctors.length > 0 && (
            <span className="text-sm font-semibold px-3 py-1 rounded-full text-[#0086C3] bg-blue-50">
              {doctors.length} available
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {doctors.map((doctor) => {
            const image = getImageUrl(doctor.profile_image);

            return (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-250 overflow-hidden group"
              >
                {/* Accent bar */}
                <div className="h-0.5 w-0 group-hover:w-full transition-all duration-300 bg-gradient-to-r from-[#0086C3] to-[#2ecc71]" />

                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">

                  <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 flex-shrink-0">
                    <div className="relative">
                      <img
                        src={image}
                        alt={doctor.doctorName || "Doctor"}
                        className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl object-cover border-2 border-blue-100"
                        onError={(e) => {
                          e.currentTarget.onerror = null;

                          e.currentTarget.src =
                            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name + Rating */}

                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h2 className="text-sm sm:text-lg font-bold text-[#0c1e3a] truncate max-w-[180px] sm:max-w-xs">
                        {doctor.doctorName || "Doctor"}
                      </h2>

                      {doctor.rating !== null &&
                        doctor.rating !== undefined && (
                          <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full text-amber-700 bg-amber-100 flex-shrink-0">
                            ⭐ {Number(doctor.rating).toFixed(1)}
                          </span>
                        )}
                    </div>

                    {/* Specialization */}

                    <p className="text-[15px] font-semibold text-[#0086C3] mb-2">
                      {doctor.specialization || "General Physician"}
                    </p>

                    {/* Details */}

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {doctor.experience_years !== null &&
                        doctor.experience_years !== undefined && (
                          <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full text-slate-500 bg-[#f0f4f8]">
                            🩺 {doctor.experience_years} yrs
                          </span>
                        )}
                    </div>

                    {/* Certificate Fee */}

                    <p className="text-sm text-slate-600">
                      Certificate Fee —{" "}
                      <strong className="text-[#0c1e3a] font-bold">
                        ₹{Number(doctor.certificate_fee || 0).toFixed(0)}
                      </strong>
                    </p>
                  </div>

                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        navigate(
                          `/client/apply-certificate?doctorId=${doctor.id}`,
                          {
                            state: {
                              doctor,
                            },
                          },
                        );
                      }}
                      className="flex-1 sm:flex-none text-md sm:text-[15px] font-bold text-white px-4 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0086C3] to-[#00b4d8] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap text-center"
                    >
                      📄 Get Certificate
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CertificateDoctorsCards;
