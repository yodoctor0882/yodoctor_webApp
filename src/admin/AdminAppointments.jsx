import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { notify } from "../utils/notify";
/* ================= CONSTANTS ================= */
const PAGE_SIZE = 50;
const TABS = ["TODAY", "UPCOMING", "COMPLETED", "CANCELLED"];

/* ================= MAIN COMPONENT ================= */
const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("TODAY");
  const [page, setPage] = useState(1);

  /* ================= LOAD DATA ================= */
  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/appointments");
      setAppointments(res.data.appointments || []);
    } catch {
      notify.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  /* ================= HELPERS ================= */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  /* ================= FILTER BY TAB ================= */
  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const d = new Date(a.appointment_date);
      d.setHours(0, 0, 0, 0);

      if (tab === "TODAY") return d.getTime() === today.getTime();
      if (tab === "UPCOMING") return d > today && a.status === "CONFIRMED";
      if (tab === "COMPLETED") return a.status === "COMPLETED";
      if (tab === "CANCELLED") return a.status === "CANCELLED";
      return true;
    });
  }, [appointments, tab]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  /* ================= GROUP BY DATE ================= */
  const grouped = useMemo(() => {
    return paginated.reduce((acc, a) => {
      const dateKey = new Date(a.appointment_date).toDateString();
      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(a);
      return acc;
    }, {});
  }, [paginated]);

  /* ================= CANCEL ================= */
  const cancelAppointment = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await api.put(`/admin/appointments/${id}/cancel`);
      notify.success("Appointment cancelled");
      loadAppointments();
    } catch {
      notify.error("Cancel failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Appointments</h1>
        <span className="text-sm text-gray-500">
          Total: {appointments.length}
        </span>
      </div>

      {/* TABS */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
        {TABS.map((t) => (
          <Tab key={t} active={tab === t} onClick={() => setTab(t)}>
            {t}
          </Tab>
        ))}
      </div>

      {/* SKELETON */}
      {loading && <SkeletonList />}

      {/* EMPTY */}
      {!loading && filtered.length === 0 && (
        <p className="py-16 text-center text-gray-500">No appointments found</p>
      )}

      {/* LIST */}
      {!loading &&
        Object.entries(grouped).map(([date, list]) => (
          <div key={date} className="mb-8">
            <h3 className="text-xs sm:text-sm font-bold text-gray-500 mb-3">
              {date === today.toDateString()
                ? "Today"
                : date === tomorrow.toDateString()
                  ? "Tomorrow"
                  : date}
            </h3>

            <div className="space-y-4">
              {list.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-xl border p-4 shadow-sm
                             hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    {/* LEFT */}
                    <div className="flex gap-4">
                      <Avatar name={a.patientEmail} />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">
                          {a.patientEmail || "Unknown Patient"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          Doctor: {a.doctorName || "—"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          📅 {formatDate(a.appointment_date)}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-row sm:flex-col sm:items-end justify-between gap-3">
                      <StatusBadge status={a.status} />
                      {a.status === "CONFIRMED" && (
                        <button
                          onClick={() => cancelAppointment(a.id)}
                          className="h-8 px-3 rounded-md bg-red-600 text-white
                                     text-xs font-semibold hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="w-full sm:w-auto px-4 py-2 border rounded
              disabled:opacity-40"
          >
            Prev
          </button>

          <span className="px-4 py-2 text-sm font-semibold">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="w-full sm:w-auto px-4 py-2 border rounded
              disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

/* ================= SMALL COMPONENTS ================= */

const Tab = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 h-9 rounded-full text-sm font-semibold whitespace-nowrap
      transition ${
        active
          ? "bg-primary text-white"
          : "bg-white border text-gray-600 hover:bg-gray-50"
      }`}
  >
    {children}
  </button>
);

const StatusBadge = ({ status }) => {
  const map = {
    CONFIRMED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold ${
        map[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

const Avatar = ({ name }) => (
  <div
    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-100
    flex items-center justify-center font-bold text-gray-500"
  >
    {(name || "U").charAt(0).toUpperCase()}
  </div>
);

const SkeletonList = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-24 bg-white rounded-xl border animate-pulse" />
    ))}
  </div>
);

export default AdminAppointments;