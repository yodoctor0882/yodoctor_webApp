import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminHomeCareBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/patient/getbookhomecare");
      setBookings(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = bookings.filter(
    (b) =>
      b.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.service_type?.toLowerCase().includes(search.toLowerCase()) ||
      b.contact_number?.includes(search),
  );

  const avgDays = filtered.length
    ? (
        filtered.reduce((s, b) => s + b.number_of_days, 0) / filtered.length
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
                  "Location",
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
                  <td colSpan="7" className="text-center py-5 text-gray-400">
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
