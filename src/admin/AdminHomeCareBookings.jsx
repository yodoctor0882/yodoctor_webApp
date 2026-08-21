import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminHomeCareBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
const [updatingId, setUpdatingId] = useState(null);
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/admin/homecarebookings");
      setBookings(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateBookingStatus = async (id, status) => {
  try {
    setUpdatingId(id);

    const res = await api.put(
      `/admin/homecarebookings/${id}/status`,
      { status }
    );

    if (res.data?.success) {
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id
            ? { ...booking, status }
            : booking
        )
      );
    }
  } catch (err) {
    console.error("Update home care status error:", err);

    alert(
      err.response?.data?.message ||
        "Unable to update booking status."
    );
  } finally {
    setUpdatingId(null);
  }
};

const updateServiceStatus = async (id, status) => {
  try {
    setUpdatingId(id);

    const res = await api.put(
      `/admin/homecarebookings/${id}/service-status`,
      { status }
    );

    if (res.data?.success) {
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id
            ? { ...booking, status }
            : booking
        )
      );
    }
  } catch (err) {
    console.error("Update service status error:", err);

    alert(
      err.response?.data?.message ||
        "Unable to update service status."
    );
  } finally {
    setUpdatingId(null);
  }
};


const statusClass = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-50 text-yellow-700";

    case "CONFIRMED":
      return "bg-blue-50 text-blue-700";

    case "REJECTED":
      return "bg-red-50 text-red-600";

    case "IN_PROGRESS":
      return "bg-cyan-50 text-cyan-700";

    case "COMPLETED":
      return "bg-green-50 text-green-700";

    case "CANCELLED":
      return "bg-gray-100 text-gray-600";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

const formatStatus = (status) => {
  if (!status) return "Pending";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

  const filtered = bookings.filter(
    (b) =>
      b.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.service_type?.toLowerCase().includes(search.toLowerCase()) ||
      b.contact_number?.includes(search),
  );

const avgDays = filtered.length
  ? (
      filtered.reduce(
        (s, b) => s + Number(b.number_of_days || 0),
        0
      ) / filtered.length
    ).toFixed(1)
  : 0;
  const uniqueServices = new Set(filtered.map((b) => b.service_type)).size;
  const thisWeek = filtered.filter((b) => {
    const d = new Date(b.preferred_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;

  const initials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const badgeClass = (service) => {
    const s = service?.toLowerCase() || "";
    if (s.includes("nurs")) return "bg-emerald-50 text-emerald-800";
    if (s.includes("physio")) return "bg-blue-50 text-blue-800";
    if (s.includes("elder")) return "bg-amber-50 text-amber-800";
    if (s.includes("wound")) return "bg-red-50 text-red-800";
    return "bg-gray-100 text-gray-600";
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const stats = [
    { label: "Total Bookings", value: filtered.length, color: "text-gray-900" },
    { label: "This Week", value: thisWeek, color: "text-emerald-700" },
    { label: "Avg. Days", value: avgDays, color: "text-amber-700" },
    { label: "Services", value: uniqueServices, color: "text-blue-700" },
  ];

  return (
    <div className="p-6 font-sans max-w-full bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 m-0">
            Home Care Bookings
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            All active patient booking requests
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 h-9">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle
              cx="6.5"
              cy="6.5"
              r="5"
              stroke="#9ca3af"
              strokeWidth="1.5"
            />
            <path
              d="M10.5 10.5L14 14"
              stroke="#9ca3af"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search name or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none outline-none bg-transparent text-sm text-gray-800 w-44 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-100 px-4 py-3"
          >
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="p-5">
        <h2 className="text-xl font-medium mb-5">🏥 Home Care Bookings</h2>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full border-collapse bg-white text-sm">
            {/* HEADER */}
            <thead className="bg-[#0072BC] text-white">
              <tr>
                {[
                  "S.No",
                  "Patient",
                  "Contact",
                  "Address",
                  "Health Issue",
                  "Service",
                  "Date",
                  "Days",
                  "Time",
                  "Status",
                  "Location",
                  "Action",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left font-medium text-sm"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-5 text-gray-400">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filtered.map((b, index) => (
                  <tr
                    key={b.id}
                    className={`border-b border-gray-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    {/* S.No */}
                    <td className="px-4 py-3 text-gray-400">{index + 1}</td>

                    {/* Patient */}
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {b.full_name}
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3 text-gray-700">
                      {b.contact_number}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{b.address}</td>

                    {/* Health Issue */}
                    <td className="px-4 py-3 text-gray-700">
                      {b.medical_condition || "N/A"}
                    </td>

                    {/* Service */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass(
                          b.service_type,
                        )}`}
                      >
                        {b.service_type}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(b.preferred_date).toLocaleDateString()}
                    </td>

                    {/* Days */}
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                        {b.number_of_days} days
                      </span>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 text-gray-700">{b.time_slot}</td>

                    <td className="px-4 py-3">
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass(
      b.status
    )}`}
  >
    {formatStatus(b.status)}
  </span>
</td>

                    <td className="px-4 py-3">
                      {b.patient_latitude && b.patient_longitude ? (
                        <div className="flex flex-col gap-2">
                          <a
                            href={`https://www.google.com/maps?q=${b.patient_latitude},${b.patient_longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs text-center"
                          >
                            View Location
                          </a>

                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${b.patient_latitude},${b.patient_longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs text-center"
                          >
                            🚑 Navigate
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          No Location
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
  <div className="flex flex-col gap-2 min-w-[130px]">

    {/* PENDING */}
    {b.status === "PENDING" && (
      <>
        <button
          type="button"
          disabled={updatingId === b.id}
          onClick={() =>
            updateBookingStatus(b.id, "CONFIRMED")
          }
          className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 disabled:opacity-50"
        >
          {updatingId === b.id
            ? "Updating..."
            : "Accept"}
        </button>

        <button
          type="button"
          disabled={updatingId === b.id}
          onClick={() =>
            updateBookingStatus(b.id, "REJECTED")
          }
          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 disabled:opacity-50"
        >
          Reject
        </button>
      </>
    )}

    {/* CONFIRMED */}
    {b.status === "CONFIRMED" && (
      <button
        type="button"
        disabled={updatingId === b.id}
        onClick={() =>
          updateServiceStatus(b.id, "IN_PROGRESS")
        }
        className="px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-lg text-xs font-medium hover:bg-cyan-200 disabled:opacity-50"
      >
        {updatingId === b.id
          ? "Starting..."
          : "Start Service"}
      </button>
    )}

    {/* IN PROGRESS */}
    {b.status === "IN_PROGRESS" && (
      <button
        type="button"
        disabled={updatingId === b.id}
        onClick={() =>
          updateServiceStatus(b.id, "COMPLETED")
        }
        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 disabled:opacity-50"
      >
        {updatingId === b.id
          ? "Completing..."
          : "Complete"}
      </button>
    )}

    {/* FINAL STATES */}
    {["REJECTED", "CANCELLED", "COMPLETED"].includes(
      b.status
    ) && (
      <span className="text-xs text-gray-400">
        No action
      </span>
    )}

  </div>
</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
