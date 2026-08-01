import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const STATUS_STYLES = {
  confirmed: {
    bg: "bg-[#06B6D4]/10",
    text: "text-[#06B6D4]",
    dot: "bg-[#06B6D4]",
  },
  pending: {
    bg: "bg-[#F59E0B]/10",
    text: "text-[#F59E0B]",
    dot: "bg-[#F59E0B]",
  },
  completed: {
    bg: "bg-[#22C55E]/10",
    text: "text-[#22C55E]",
    dot: "bg-[#22C55E]",
  },
  cancelled: {
    bg: "bg-[#EF4444]/10",
    text: "text-[#EF4444]",
    dot: "bg-[#EF4444]",
  },
  default: { bg: "bg-[#EEF2FF]", text: "text-[#2563EB]", dot: "bg-[#2563EB]" },
};

function getStatusStyle(status) {
  const key = (status || "").toLowerCase();
  return STATUS_STYLES[key] || STATUS_STYLES.default;
}

export default function MyLabBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/patient/lab-bookings");
      setBookings(res.data.data || []);
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
        <div className="max-w-4xl mx-auto">
          <div className="h-7 w-48 bg-[#E2E8F0] rounded-md animate-pulse mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5 animate-pulse"
              >
                <div className="flex justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 bg-[#E2E8F0] rounded" />
                    <div className="h-3 w-1/4 bg-[#E2E8F0] rounded" />
                    <div className="h-3 w-1/5 bg-[#E2E8F0] rounded" />
                  </div>
                  <div className="space-y-2 w-20">
                    <div className="h-4 w-full bg-[#E2E8F0] rounded" />
                    <div className="h-3 w-full bg-[#E2E8F0] rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A]">
              My Lab Bookings
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              Track and manage all your lab test bookings in one place
            </p>
          </div>

          <button
            className="bg-blue-700 cursor-pointer px-4 py-2 text-white rounded-xl self-start sm:self-auto"
            onClick={() => navigate("/client/lab-tests")}
          >
            Book Lab Test
          </button>
        </div>

        {/* Empty State */}
        {bookings.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 sm:p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF2FF]">
              <svg
                className="h-7 w-7 text-[#2563EB]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-[#0F172A]">
              No bookings found
            </h3>
            <p className="text-sm text-[#64748B] mt-1">
              You haven't booked any lab tests yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {bookings.map((booking) => {
              const statusStyle = getStatusStyle(booking.status);

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-[#E2E8F0] rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left: Booking Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-[#0F172A] text-sm sm:text-base">
                          #{booking.booking_id}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                          />
                          {booking.status}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-[#64748B]">
                        <span className="flex items-center gap-1.5">
                          <svg
                            className="h-4 w-4 text-[#94A3B8]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {booking.booking_date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg
                            className="h-4 w-4 text-[#94A3B8]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          {booking.tests} Tests
                        </span>
                      </div>
                    </div>

                    {/* Right: Amount + Action */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-3 border-t sm:border-t-0 border-[#E2E8F0] pt-3 sm:pt-0">
                      <p className="text-base sm:text-lg font-bold text-[#0F172A]">
                        ₹{booking.total_amount}
                      </p>

                      <button
                        onClick={() =>
                          navigate(
                            `/client/my-lab-bookings/${booking.booking_id}`,
                          )
                        }
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                      >
                        View Details
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
