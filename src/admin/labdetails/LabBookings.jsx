import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { notify } from "../../utils/notify";

const STATUS_STYLES = {
  Confirmed: {
    bg: "bg-[#06B6D4]/10",
    text: "text-[#06B6D4]",
    dot: "bg-[#06B6D4]",
  },
  "Sample Collected": {
    bg: "bg-[#F59E0B]/10",
    text: "text-[#F59E0B]",
    dot: "bg-[#F59E0B]",
  },
  Processing: {
    bg: "bg-[#2563EB]/10",
    text: "text-[#2563EB]",
    dot: "bg-[#2563EB]",
  },
  Completed: {
    bg: "bg-[#22C55E]/10",
    text: "text-[#22C55E]",
    dot: "bg-[#22C55E]",
  },
  Cancelled: {
    bg: "bg-[#EF4444]/10",
    text: "text-[#EF4444]",
    dot: "bg-[#EF4444]",
  },
};

const PAYMENT_STYLES = {
  Paid: { bg: "bg-[#22C55E]/10", text: "text-[#22C55E]" },
  Pending: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]" },
};

export default function LabBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/admin/lab/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBookings(res.data.data || []);
    } catch (error) {
      console.log(error);
      notify.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.booking_id?.toLowerCase().includes(search.toLowerCase()) ||
      booking.patient_name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) =>
    STATUS_STYLES[status] || {
      bg: "bg-[#EEF2FF]",
      text: "text-[#2563EB]",
      dot: "bg-[#2563EB]",
    };

  const getPaymentStyle = (status) =>
    PAYMENT_STYLES[status] || { bg: "bg-[#EEF2FF]", text: "text-[#2563EB]" };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A]">
          Lab Bookings
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          View and manage all patient lab bookings
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row">
        <div className="relative w-full sm:flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search booking ID / patient"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-[#E2E8F0] bg-white rounded-lg pl-9 pr-3 py-2.5 w-full text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[#E2E8F0] bg-white rounded-lg px-4 py-2.5 w-full sm:w-56 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
        >
          <option value="All">All Status</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Sample Collected">Sample Collected</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Desktop / tablet table */}
      <div className="hidden md:block bg-white border border-[#E2E8F0] rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="p-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Booking ID
                </th>
                <th className="p-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Patient
                </th>
                <th className="p-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Amount
                </th>
                <th className="p-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Payment
                </th>
                <th className="p-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Status
                </th>
                <th className="p-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Date
                </th>
                <th className="p-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} className="border-t border-[#E2E8F0]">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 w-full max-w-[100px] bg-[#E2E8F0] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2FF]">
                        <svg
                          className="h-6 w-6 text-[#2563EB]"
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
                      </div>
                      <p className="text-sm font-medium text-[#0F172A]">
                        No bookings found
                      </p>
                      <p className="text-xs text-[#64748B]">
                        Try a different search or filter
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const statusStyle = getStatusStyle(booking.status);
                  const paymentStyle = getPaymentStyle(booking.payment_status);

                  return (
                    <tr
                      key={booking.id}
                      className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="p-4 text-sm font-semibold text-[#0F172A]">
                        {booking.booking_id}
                      </td>
                      <td className="p-4 text-sm text-[#0F172A]">
                        {booking.patient_name}
                      </td>
                      <td className="p-4 text-sm font-medium text-[#0F172A]">
                        ₹{booking.total_amount}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${paymentStyle.bg} ${paymentStyle.text}`}
                        >
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                          />
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm text-[#64748B]">
                        {booking.created_at
                          ? new Date(booking.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/lab-bookings/${booking.booking_id}`,
                            )
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 animate-pulse space-y-3"
            >
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/2 bg-[#E2E8F0] rounded" />
                  <div className="h-3 w-1/3 bg-[#E2E8F0] rounded" />
                </div>
                <div className="h-6 w-20 bg-[#E2E8F0] rounded-full" />
              </div>
              <div className="h-8 bg-[#E2E8F0] rounded" />
              <div className="h-9 bg-[#E2E8F0] rounded-lg" />
            </div>
          ))
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2FF]">
              <svg
                className="h-6 w-6 text-[#2563EB]"
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
            </div>
            <p className="text-sm font-medium text-[#0F172A]">
              No bookings found
            </p>
            <p className="text-xs text-[#64748B] mt-1">
              Try a different search or filter
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const statusStyle = getStatusStyle(booking.status);
            const paymentStyle = getPaymentStyle(booking.payment_status);

            return (
              <div
                key={booking.id}
                className="bg-white border border-[#E2E8F0] rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0F172A] text-sm sm:text-base truncate">
                      {booking.booking_id}
                    </p>
                    <p className="text-sm text-[#64748B] truncate">
                      {booking.patient_name}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                    />
                    {booking.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm mb-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3">
                  <span className="font-semibold text-[#0F172A]">
                    ₹{booking.total_amount}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${paymentStyle.bg} ${paymentStyle.text}`}
                  >
                    {booking.payment_status}
                  </span>
                  <span className="text-[#64748B] text-xs">
                    {booking.created_at
                      ? new Date(booking.created_at).toLocaleDateString()
                      : "-"}
                  </span>
                </div>

                <button
                  onClick={() =>
                    navigate(`/admin/lab-bookings/${booking.booking_id}`)
                  }
                  className="w-full bg-[#2563EB] text-white px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
                >
                  View Details
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
