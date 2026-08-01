import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { notify } from "../../utils/notify";

const STATUS_STYLES = {
  Confirmed: { bg: "bg-[#06B6D4]/10", text: "text-[#06B6D4]", dot: "bg-[#06B6D4]" },
  "Sample Collected": { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", dot: "bg-[#F59E0B]" },
  Processing: { bg: "bg-[#2563EB]/10", text: "text-[#2563EB]", dot: "bg-[#2563EB]" },
  Completed: { bg: "bg-[#22C55E]/10", text: "text-[#22C55E]", dot: "bg-[#22C55E]" },
  Cancelled: { bg: "bg-[#EF4444]/10", text: "text-[#EF4444]", dot: "bg-[#EF4444]" },
};

const PAYMENT_STYLES = {
  Paid: { bg: "bg-[#22C55E]/10", text: "text-[#22C55E]" },
  Pending: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]" },
};

export default function LabBookingDetails() {
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [tests, setTests] = useState([]);
  const [status, setStatus] = useState("");
  const [file, setFile] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(`/admin/lab/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBooking(res.data.data.booking);
      setTests(res.data.data.tests);
      setReport(res.data.data.latestReport);
      setStatus(res.data.data.booking.status);
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/admin/lab/bookings/${bookingId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      notify.success("Status Updated");
      fetchBooking();
    } catch (error) {
      console.log(error);
    } finally {
      setUpdating(false);
    }
  };

  const uploadReport = async () => {
    if (!file) {
      return notify.warning("Select PDF");
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("report", file);

      await api.post(`/admin/lab/bookings/${bookingId}/report`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      notify.success("Report Uploaded");
      fetchBooking();
    } catch (error) {
      console.log(error);
    } finally {
      setUpdating(false);
    }
  };

  // ---------- Loading State ----------
  if (!booking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="h-7 w-48 bg-[#E2E8F0] rounded-md animate-pulse mb-6" />
          <div className="bg-white border border-[#E2E8F0] rounded-xl sm:rounded-2xl p-5 sm:p-6 animate-pulse space-y-4">
            <div className="h-4 w-2/3 bg-[#E2E8F0] rounded" />
            <div className="h-4 w-1/2 bg-[#E2E8F0] rounded" />
            <div className="h-20 bg-[#E2E8F0] rounded" />
            <div className="h-32 bg-[#E2E8F0] rounded" />
          </div>
        </div>
      </div>
    );
  }

  const timeline = ["Confirmed", "Sample Collected", "Processing", "Completed"];
  const currentStep = timeline.indexOf(booking?.status);
  const statusStyle = STATUS_STYLES[booking.status] || {
    bg: "bg-[#EEF2FF]",
    text: "text-[#2563EB]",
    dot: "bg-[#2563EB]",
  };
  const paymentStyle = PAYMENT_STYLES[booking.payment_status] || {
    bg: "bg-[#EEF2FF]",
    text: "text-[#2563EB]",
  };

  const inputClass =
    "w-full border border-[#E2E8F0] bg-white p-3 rounded-lg text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A]">
              Booking Details
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              #{booking.booking_id}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold w-fit ${statusStyle.bg} ${statusStyle.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
            {booking.status}
          </span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-6">
          {/* Patient info */}
          <div>
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide border-b border-[#E2E8F0] pb-2 mb-4">
              Patient Information
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[#64748B]">Booking ID</p>
                <p className="text-sm font-medium text-[#0F172A]">
                  {booking.booking_id}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Patient</p>
                <p className="text-sm font-medium text-[#0F172A]">
                  {booking.patient_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Phone</p>
                <p className="text-sm font-medium text-[#0F172A]">
                  {booking.phone}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Amount</p>
                <p className="text-sm font-medium text-[#0F172A]">
                  ₹{booking.total_amount}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-[#64748B]">Address</p>
                <p className="text-sm font-medium text-[#0F172A]">
                  {booking.address}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide border-b border-[#E2E8F0] pb-2 mb-4">
              Progress
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {timeline.map((step, index) => {
                const isDone = index <= currentStep;
                return (
                  <div
                    key={step}
                    className={`flex flex-col items-center gap-1.5 text-center p-3 rounded-lg text-xs font-semibold transition-colors ${
                      isDone
                        ? "bg-[#22C55E]/10 text-[#22C55E]"
                        : "bg-[#F8FAFC] text-[#94A3B8] border border-[#E2E8F0]"
                    }`}
                  >
                    {isDone ? (
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
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-[#94A3B8]" />
                    )}
                    {step}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment info */}
          <div>
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide border-b border-[#E2E8F0] pb-2 mb-4">
              Payment Information
            </h2>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-[#64748B]">Status</p>
                <span
                  className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${paymentStyle.bg} ${paymentStyle.text}`}
                >
                  {booking.payment_status}
                </span>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Amount</p>
                <p className="text-sm font-semibold text-[#0F172A] mt-1">
                  ₹{booking.total_amount}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Booking Date</p>
                <p className="text-sm font-medium text-[#0F172A] mt-1">
                  {booking.created_at
                    ? new Date(booking.created_at).toLocaleString()
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Tests */}
          <div>
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide border-b border-[#E2E8F0] pb-2 mb-4">
              Tests ({tests.length})
            </h2>
            <div className="flex flex-col gap-2">
              {tests.map((test) => (
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

          {/* Status update */}
          <div>
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide border-b border-[#E2E8F0] pb-2 mb-4">
              Update Status
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Sample Collected">Sample Collected</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <button
                disabled={updating}
                onClick={updateStatus}
                className="bg-[#2563EB] text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>

          {/* Report upload */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide mb-4">
              Lab Report
            </h2>

            <div className="space-y-3">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const selected = e.target.files?.[0];

                  if (!selected) return;
                  setFile(selected);
                }}
                className="block w-full text-sm text-[#64748B] border border-[#E2E8F0] rounded-lg p-2 file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-[#2563EB] file:text-white file:text-sm file:font-medium file:cursor-pointer hover:file:bg-[#1D4ED8] file:transition-colors"
              />

              {report && (
                <div className="flex items-center gap-2 bg-[#22C55E]/10 text-[#22C55E] px-4 py-2.5 rounded-lg text-sm font-medium">
                  <svg
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  Report Uploaded Successfully
                </div>
              )}

              {booking.status !== "Completed" && (
                <p className="flex items-center gap-1.5 text-[#EF4444] text-sm">
                  <svg
                    className="h-4 w-4 shrink-0"
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
                  Complete booking first before uploading report.
                </p>
              )}

              <button
                disabled={booking.status !== "Completed" || uploading}
                onClick={uploadReport}
                className={`w-full sm:w-auto text-white px-5 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  booking.status === "Completed"
                    ? "bg-[#14B8A6] hover:bg-[#0F766E]"
                    : "bg-[#94A3B8] cursor-not-allowed"
                }`}
              >
                {uploading ? "Uploading..." : "Upload Report"}
              </button>

              {report && (
                
              <a href={`${import.meta.env.VITE_API_URL}/${report.report_file}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#2563EB] hover:text-[#1D4ED8] text-sm font-medium transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M10.5 6h-3a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-3M15 3h6m0 0v6m0-6L10.5 13.5"
                    />
                  </svg>
                  View Uploaded Report
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}