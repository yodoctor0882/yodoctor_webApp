import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChevronRight,
  FaUserNurse,
  FaCalendarAlt,
} from "react-icons/fa";
import api from "../../../services/api";

const HomeCareHistory = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/patient/homecarehistory");

        if (response.data?.success) {
          setBookings(response.data.data || []);
        }
      } catch (err) {
        console.error("Home care history error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load booking history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-50 text-green-700";

      case "CONFIRMED":
        return "bg-blue-50 text-blue-700";

      case "REJECTED":
        return "bg-red-50 text-red-600";

      case "IN_PROGRESS":
        return "bg-cyan-50 text-cyan-700";

      case "CANCELLED":
        return "bg-gray-100 text-gray-600";

      case "PENDING":
      default:
        return "bg-yellow-50 text-yellow-700";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Pending";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-gray-500">
          Loading booking history...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] py-6 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">
            Home Care History
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Your previous and current home care bookings
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 mb-5">
            {error}
          </div>
        )}

        {/* Empty */}
        {!error && bookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-cyan-50 rounded-full flex items-center justify-center mb-4">
              <FaUserNurse className="text-cyan-600 text-2xl" />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              No bookings yet
            </h2>

            <p className="text-gray-500 mt-2">
              Your home care bookings will appear here.
            </p>
          </div>
        )}

        {/* Booking History */}
        {!error && bookings.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {bookings.map((booking, index) => (
              <button
                key={booking.id}
                type="button"
                onClick={() =>
                  navigate(
                    `/client/homecarehistory/${booking.id}`
                  )
                }
                className={`w-full text-left px-5 py-5 hover:bg-gray-50 transition cursor-pointer ${
                  index !== bookings.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">

                  {/* Icon */}
                  <div className="w-12 h-12 shrink-0 rounded-full bg-cyan-50 flex items-center justify-center">
                    <FaUserNurse className="text-cyan-600 text-xl" />
                  </div>

                  {/* Information */}
                  <div className="flex-1 min-w-0">

                    {/* Service */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {booking.service_type || "Home Care"}
                      </h3>

                      {Number(booking.emergency_booking) === 1 && (
                        <span className="text-xs font-semibold bg-red-50 text-red-600 px-2 py-1 rounded-full">
                          Emergency
                        </span>
                      )}
                    </div>

                    {/* Date + Time */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <FaCalendarAlt className="text-xs" />

                      <span>
                        {formatDate(booking.preferred_date)}
                      </span>

                      <span>•</span>

                      <span>
                        {booking.time_slot || "-"}
                      </span>
                    </div>

                    {/* Status + Booking ID */}
                    <div className="flex flex-wrap items-center gap-3 mt-2">

                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusStyle(
                          booking.status
                        )}`}
                      >
                        {formatStatus(booking.status)}
                      </span>

                      <span className="text-xs text-gray-400">
                        {booking.booking_id ||
                          `HC-${String(booking.id).padStart(
                            6,
                            "0"
                          )}`}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <FaChevronRight className="text-gray-400 shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default HomeCareHistory;