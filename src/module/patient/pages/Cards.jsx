import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { searchVisitDoctors } from "../../../services/patientService";
import { notify } from "../../../utils/notify";
const BASE_URL = import.meta.env.VITE_API_URL || "";

const getImageUrl = (imagePath) => {
  if (!imagePath)
    return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  if (imagePath.startsWith("http")) return imagePath;
  return `${BASE_URL}/${imagePath}`.replace(/([^:])\/\//g, "$1/");
};

export default function Cards() {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const city = params.get("city") || "";
    const search = params.get("search") || "";

    const loadDoctors = async () => {
      setLoading(true);
      try {
        const res = await searchVisitDoctors({ city, search });
        const data = res.data.data?.doctors || [];
        setDoctors(data);
      } catch (err) {
        console.error("Doctor fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [location.search]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0086C3] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-[family-name:var(--font-dm)]">
            Finding doctors...
          </p>
        </div>
      </div>
    );
  }

return (
    <div className="min-h-screen bg-[#f0f4f8] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0c1e3a]">
            Find Your Doctor
          </h1>
          {doctors.length > 0 && (
            <span className="text-sm font-semibold px-3 py-1 rounded-full text-[#0086C3] bg-blue-50">
              {doctors.length} available
            </span>
          )}
        </div>

        {/* Doctor List */}
        {doctors.length > 0 ? (
          <div className="flex flex-col gap-3">
            {doctors.map((doctor) => (
              <div
                key={doctor.doctorId}
                className="bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-250 overflow-hidden group"
              >
                {/* Accent bar */}
                <div className="h-0.5 w-0 group-hover:w-full transition-all duration-300 bg-gradient-to-r from-[#0086C3] to-[#2ecc71]" />

                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">

                  {/* Avatar + View Profile */}
                  <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 flex-shrink-0">
                    <div className="relative">
                      <img
                        src={getImageUrl(doctor.profile_image)}
                        alt={doctor.doctorName}
                        className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl object-cover border-2 border-blue-100"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                        }}
                      />
                      <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/client/doctor-profile/${doctor.doctorId}`, {
                          state: { doctor },
                        })
                      }
                      className="text-[12px] font-bold px-3 py-1 rounded-full text-[#0086C3] border border-blue-200 hover:border-[#0086C3] hover:bg-blue-50 transition-all duration-200 whitespace-nowrap"
                    >
                      View Profile
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h2 className="text-sm sm:text-lg font-bold text-[#0c1e3a] truncate max-w-[180px] sm:max-w-xs">
                        {doctor.doctorName}
                      </h2>
                      {doctor.rating && (
                        <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full text-amber-700 bg-amber-100 flex-shrink-0">
                          ⭐ {doctor.rating}
                        </span>
                      )}
                    </div>

                    <p className="text-[15px] font-semibold text-[#0086C3] mb-2">
                      {doctor.specialization}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {doctor.clinicName && (
                        <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full text-slate-500 bg-[#f0f4f8]">
                          🏥 {doctor.clinicName}
                        </span>
                      )}
                      <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full text-slate-500 bg-[#f0f4f8]">
                        📍 {doctor.city}
                      </span>
                      {doctor.experience && (
                        <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full text-slate-500 bg-[#f0f4f8]">
                          🩺 {doctor.experience} yrs
                        </span>
                      )}
                    </div>

                    {doctor.consultationFee && (
                      <p className="text-sm text-slate-600">
                        Consultation Fee —{" "}
                        <strong className="text-[#0c1e3a] font-bold">
                          ₹{doctor.consultationFee}
                        </strong>
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        navigate(
                          `/client/bookappointmentpage/${doctor.doctorId}`,
                          { state: { doctor } }
                        )
                      }
                      className="flex-1 sm:flex-none text-md sm:text-[15px] font-bold text-white px-4 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0086C3] to-[#00b4d8] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap text-center"
                    >
                      📅 Book Appointment
                    </button>
                   
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-bold text-[#0c1e3a] mb-1">
              No doctors found
            </p>
            <p className="text-sm text-slate-400">
              Try a different city or specialty
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
