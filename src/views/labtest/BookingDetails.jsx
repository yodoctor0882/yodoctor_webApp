import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";

const STATUS_STYLES = {
  confirmed: { bg: "bg-[#06B6D4]/10", text: "text-[#06B6D4]", dot: "bg-[#06B6D4]" },
  pending: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", dot: "bg-[#F59E0B]" },
  completed: { bg: "bg-[#22C55E]/10", text: "text-[#22C55E]", dot: "bg-[#22C55E]" },
  cancelled: { bg: "bg-[#EF4444]/10", text: "text-[#EF4444]", dot: "bg-[#EF4444]" },
  default: { bg: "bg-[#EEF2FF]", text: "text-[#2563EB]", dot: "bg-[#2563EB]" },
};

function getStatusStyle(status) {
  const key = (status || "").toLowerCase();
  return STATUS_STYLES[key] || STATUS_STYLES.default;
}

export default function BookingDetails() {
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/patient/lab-bookings/${bookingId}`);
      setBooking(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Loading State ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="h-7 w-48 bg-[#E2E8F0] rounded-md animate-pulse mb-6" />
          <div className="bg-white border border-[#E2E8F0] rounded-xl sm:rounded-2xl p-5 sm:p-6 animate-pulse space-y-4">
            <div className="h-5 w-1/3 bg-[#E2E8F0] rounded" />
            <div className="h-4 w-1/2 bg-[#E2E8F0] rounded" />
            <div className="h-4 w-1/4 bg-[#E2E8F0] rounded" />
            <div className="h-6 w-24 bg-[#E2E8F0] rounded-full" />
            <div className="h-4 w-1/3 bg-[#E2E8F0] rounded mt-4" />
            <div className="h-4 w-2/3 bg-[#E2E8F0] rounded" />
          </div>
        </div>
      </div>
    );
  }

  // ---------- Not Found State ----------
  if (!booking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 sm:p-12 text-center max-w-sm w-full">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EF4444]/10">
            <svg
              className="h-7 w-7 text-[#EF4444]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 4.5c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-[#0F172A]">
            Booking not found
          </h3>
          <p className="text-sm text-[#64748B] mt-1">
            The booking you're looking for doesn't exist or was removed.
          </p>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(booking.booking.status);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A]">
            Booking Details
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Complete information about your lab booking
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl sm:rounded-2xl p-5 sm:p-6">
          {/* Top Section: Booking ID + Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
            <h2 className="font-bold text-[#0F172A] text-lg sm:text-xl">
              #{booking.booking.booking_id}
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold w-fit ${statusStyle.bg} ${statusStyle.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
              {booking.booking.status}
            </span>
          </div>

          {/* Patient & Amount Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF2FF] shrink-0">
                <svg
                  className="h-5 w-5 text-[#2563EB]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#64748B]">Patient</p>
                <p className="text-sm font-semibold text-[#0F172A] truncate">
                  {booking.booking.patient_name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF2FF] shrink-0">
                <svg
                  className="h-5 w-5 text-[#2563EB]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m0-2c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Amount</p>
                <p className="text-sm font-semibold text-[#0F172A]">
                  ₹{booking.booking.total_amount}
                </p>
              </div>
            </div>
          </div>

          {/* Tests Section */}
          <div className="pt-4 border-t border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A] text-sm sm:text-base mb-3">
              Tests ({booking.tests.length})
            </h3>
            <div className="flex flex-col gap-2">
              {booking.tests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center gap-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#14B8A6] shrink-0" />
                  <span className="text-sm text-[#0F172A]">
                    {test.test_name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Section */}
          <div className="pt-5 mt-5 border-t border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A] text-sm sm:text-base mb-4">
              Timeline
            </h3>

            <div className="space-y-0">
              {booking.timeline.map((step, idx) => {
                const isLast = idx === booking.timeline.length - 1;
                return (
                  <div key={step.id} className="relative pl-6 pb-6 last:pb-0">
                    {/* Connector line */}
                    {!isLast && (
                      <span className="absolute left-[5px] top-3 bottom-0 w-px bg-[#E2E8F0]" />
                    )}
                    {/* Dot */}
                    <span className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full bg-[#2563EB] ring-4 ring-[#EEF2FF]" />

                    <p className="font-medium text-[#0F172A] text-sm">
                      {step.status}
                    </p>
                    {step.remarks && (
                      <p className="text-sm text-[#64748B] mt-0.5">
                        {step.remarks}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}