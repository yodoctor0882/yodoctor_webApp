import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { notify } from "../../../utils/notify";
import {
  FaUserNurse,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaNotesMedical,
  FaExclamationTriangle,
} from "react-icons/fa";
import api from "../../../services/api";

const HomeCareBookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/patient/homecarehistory/${id}`);

        if (response.data?.success) {
          setBooking(response.data.data);
        }
      } catch (err) {
        console.error("Home care details error:", err);

        if (err.response?.status === 404) {
          setError("Booking not found.");
        } else {
          setError(
            err.response?.data?.message || "Unable to load booking details.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatStatus = (status) => {
    if (!status) return "Pending";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
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

  const handleCancel = async () => {
    if (!booking) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) return;

    try {
      setCancelling(true);

      const response = await api.put(
        `/patient/homecarehistory/${booking.id}/cancel`,
      );
      if (response.data?.success) {
        setBooking((prev) => ({
          ...prev,
          status: "CANCELLED",
        }));
      }
    } catch (err) {
      console.error("Cancel booking error:", err);

      notify.info(err.response?.data?.message || "Unable to cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-gray-500">Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error || "Booking not found."}</p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-cyan-600 text-white rounded-lg cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const canCancel = ["PENDING", "CONFIRMED"].includes(booking.status);

  return (
    <div className="min-h-screen bg-[#f7f9fc] px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
         <button
            type="button"
            onClick={() => navigate(-1)}
            className=" py-2 rounded-lg hover:text-blue-700 text-gray-800 cursor-pointer transition"
          >
            Back
          </button>
        <div className="flex items-center gap-4 mb-6">
         

          <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Top */}
          <div className="p-6">
            <div className="flex justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center">
                    <FaUserNurse className="text-cyan-600 text-xl" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {booking.service_type || "Home Care"}
                    </h2>

                    <p className="text-gray-500 text-sm mt-1">
                      {formatDate(booking.preferred_date)}
                      {" • "}
                      {booking.time_slot || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <span
                className={`h-fit px-4 py-2 rounded-full text-sm font-semibold ${getStatusStyle(
                  booking.status,
                )}`}
              >
                {formatStatus(booking.status)}
              </span>
            </div>

            {/* Booking ID */}
            <div className="mt-6">
              <p className="text-sm text-gray-500">Booking ID</p>

              <p className="font-semibold text-gray-900 mt-1">
                {booking.booking_id ||
                  `HC-${String(booking.id).padStart(6, "0")}`}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200" />

          {/* Patient */}
          <div className="p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">
              Patient Details
            </h3>

            <div className="space-y-3">
              <DetailRow
                icon={<FaUser />}
                label="Patient Name"
                value={booking.full_name}
              />

              <DetailRow
                label="Age"
                value={
                  booking.patient_age ? `${booking.patient_age} years` : "-"
                }
              />

              <DetailRow label="Gender" value={booking.patient_gender || "-"} />

              <DetailRow
                icon={<FaPhoneAlt />}
                label="Contact"
                value={booking.contact_number}
              />
            </div>
          </div>

          <div className="border-t border-gray-200" />

          {/* Address */}
          <div className="p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">
              Address Details
            </h3>

            <div className="flex gap-3">
              <FaMapMarkerAlt className="text-red-500 mt-1 shrink-0" />

              <p className="text-gray-700 leading-relaxed">
                {booking.address || "-"}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200" />

          {/* Service Details */}
          <div className="p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">
              Service Details
            </h3>

            <div className="space-y-3">
              <DetailRow
                icon={<FaCalendarAlt />}
                label="Duration"
                value={booking.duration_type}
              />

              <DetailRow
                label="Number of Days"
                value={`${booking.number_of_days || 1} day${
                  Number(booking.number_of_days) > 1 ? "s" : ""
                }`}
              />

              <DetailRow
                icon={<FaClock />}
                label="Time Slot"
                value={booking.time_slot}
              />

              <DetailRow
                label="Caregiver Preference"
                value={booking.gender_preference || "Any"}
              />

              <DetailRow
                icon={<FaExclamationTriangle />}
                label="Emergency Booking"
                value={Number(booking.emergency_booking) === 1 ? "Yes" : "No"}
              />
            </div>
          </div>

          {/* Medical Condition */}
          {booking.medical_condition && (
            <>
              <div className="border-t border-gray-200" />

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FaNotesMedical className="text-cyan-600" />

                  <h3 className="font-semibold text-lg text-gray-900">
                    Medical Condition
                  </h3>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  {booking.medical_condition}
                </p>
              </div>
            </>
          )}

          {/* Notes */}
          {booking.notes && (
            <>
              <div className="border-t border-gray-200" />

              <div className="p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Additional Notes
                </h3>

                <p className="text-gray-600">{booking.notes}</p>
              </div>
            </>
          )}
        </div>

        {/* Cancel */}
        {canCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full mt-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition cursor-pointer"
          >
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </button>
        )}

        {/* Help */}
        <div className="mt-5 bg-cyan-50 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold">
            ?
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Need help?</h3>

            <p className="text-sm text-gray-500">We're here to assist you</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ icon, label, value }) => {
  return (
    <div className="flex justify-between gap-5 text-sm">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span>{label}</span>
      </div>

      <span className="font-medium text-gray-900 text-right">
        {value || "-"}
      </span>
    </div>
  );
};

export default HomeCareBookingDetails;
