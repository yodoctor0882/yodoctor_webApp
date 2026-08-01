import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

const mapStatus = (status) => {
  switch (status) {
    case "COMPLETED": return "Completed";
    case "REJECTED":  return "Rejected";
    case "CANCELLED": return "Cancelled";
    case "ACCEPTED":  return "In Queue";
    default:          return status;
  }
};

const BASE_URL = import.meta.env.VITE_API_URL || "";

const buildImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path}`.replace(/([^:])\/\//g, "$1/");
};

const getInitials = (name) => {
  if (!name) return "U";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return words[0][0].toUpperCase() + words[1][0].toUpperCase();
};

const STATUS_STYLE = {
  Completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Cancelled:  "bg-red-50 text-red-500 border-red-200",
  Rejected:   "bg-red-50 text-red-500 border-red-200",
  "In Queue": "bg-amber-50 text-amber-600 border-amber-200",
};

const FILTERS = [
  { key: "TODAY", label: "Today" },
  { key: "7DAYS", label: "Last 7 Days" },
  { key: "ALL",   label: "All" },
];

const STAT_CARDS = [
  { label: "Total",     value: 24, color: "text-[#1c2b33]" },
  { label: "Completed", value: 18, color: "text-emerald-600" },
  { label: "In Queue",  value: 4,  color: "text-amber-500" },
  { label: "Cancelled", value: 2,  color: "text-red-500" },
];

// ─── Avatar ───────────────────────────────────────────────────────────────────
const PatientAvatar = ({ image, name }) => {
  const url = buildImageUrl(image);
  return url ? (
    <img
      src={url}
      alt={name}
      className="w-10 h-10 rounded-full object-cover border border-black/[0.07] flex-shrink-0"
      onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-[#0e7490] text-white flex items-center justify-center font-bold text-[13px] flex-shrink-0 select-none">
      {getInitials(name)}
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`text-[13px] font-semibold tracking-wide px-3 py-1 rounded-full border whitespace-nowrap ${STATUS_STYLE[status] ?? "bg-slate-50 text-slate-500 border-slate-200"}`}>
    {status}
  </span>
);

// ─── Token Badge ──────────────────────────────────────────────────────────────
const TokenBadge = ({ token }) => (
  <span className="text-[13px] font-bold px-2.5 py-1 rounded-full bg-[#ecfeff] text-[#0e7490] border border-[rgba(14,116,144,0.15)]">
    #{token}
  </span>
);

// ─── Action Button ────────────────────────────────────────────────────────────
const ActionBtn = ({ appointment, onClick }) => {
  if (appointment.status !== "Completed") return null;
  return (
    <button
      onClick={() => onClick(appointment.id)}
      className="text-[13px] font-bold text-white bg-[#0e7490] hover:bg-[#0c5f75] active:scale-95 px-3 py-1.5 rounded-full border-none cursor-pointer transition-all duration-150 shadow-[0_2px_8px_rgba(14,116,144,0.22)] whitespace-nowrap"
    >
      {appointment.hasPrescription ? "Update Rx" : "+ Prescription"}
    </button>
  );
};

// ─── Desktop Table Row ────────────────────────────────────────────────────────
const TableRow = ({ a, onAction }) => (
  <tr className="border-b border-black/[0.04] hover:bg-[#fafaf8] transition-colors duration-100">
    <td className="px-5 py-4">
      <div className="flex items-center gap-3">
        <PatientAvatar image={a.image} name={a.patientName} />
        <div>
          <p className="font-semibold text-[16px] text-[#1c2b33] leading-tight">{a.patientName}</p>
          <p className="text-[13px] text-[#6b7f8a] mt-0.5">{a.slot}</p>
        </div>
      </div>
    </td>
    <td className="px-5 py-4 text-[15px] text-[#6b7f8a]">{a.type}</td>
    <td className="px-5 py-4"><TokenBadge token={a.token} /></td>
    <td className="px-5 py-4 text-[14px] text-[#6b7f8a] whitespace-nowrap">
      {new Date(a.date).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
    </td>
    <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
    <td className="px-5 py-4"><ActionBtn appointment={a} onClick={onAction} /></td>
  </tr>
);

// ─── Mobile Card ──────────────────────────────────────────────────────────────
const AppointmentCard = ({ a, onAction }) => (
  <div className="bg-white border border-black/[0.07] rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
    {/* Top row: avatar + name + status */}
    <div className="flex items-center justify-between gap-3 mb-4 ">
      <div className="flex items-center gap-3 min-w-0 ">
        <PatientAvatar image={a.image} name={a.patientName} />
        <div className="min-w-0">
          <p className="font-semibold text-[16px] text-[#1c2b33] truncate">{a.patientName}</p>
          <p className="text-[13px] text-[#050809]">{a.type}</p>
        </div>
      </div>
      <StatusBadge status={a.status} />
    </div>

    <div className="h-px bg-black/[0.05] mb-4" />

    {/* Info grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-[14px] mb-4">
      <div>
        <p className="text-[12px] uppercase tracking-widest text-[#9fb0b8] mb-1">Token</p>
        <TokenBadge token={a.token} />
      </div>
      <div>
        <p className="text-[13px] uppercase tracking-widest text-[#9fb0b8] mb-1">Date</p>
        <p className="text-[#1c2b33] font-medium">
          {new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
      <div>
        <p className="text-[13px] uppercase tracking-widest text-[#9fb0b8] mb-1">Slot</p>
        <p className="text-[#1c2b33] font-medium">{a.slot}</p>
      </div>
    </div>

    {/* Action */}
    {a.status === "Completed" && (
      <div className="flex justify-end pt-1">
        <ActionBtn appointment={a} onClick={onAction} />
      </div>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AppointmentHistory = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const getBackendFilter = () =>
    filter === "TODAY" ? "today" : filter === "7DAYS" ? "last7" : "all";

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/doctor/appointments/history?filter=${getBackendFilter()}`);
      setAppointments(
        (res.data.appointments || []).map((a) => ({
          id: a.id,
          token: a.token_number,
          patientName: a.familyMemberName || a.patientName || a.walk_in_patient_name || "Walk-in Patient",
          image: a.patientImage
            ? a.patientImage.startsWith("http") ? a.patientImage : `${BASE_URL}/${a.patientImage}`
            : null,
          type: a.appointment_type || "Consultation",
          date: a.appointment_date,
          slot: a.appointment_slot,
          status: mapStatus(a.status),
          hasPrescription: a.hasPrescription || false,
        }))
      );
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, [filter]);

  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    return [...appointments]
      .filter((a) => !q || a.patientName.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [appointments, search]);

  const handleAction = (id) => navigate(`/doctordashboard/prescription/${id}`);

  return (
    <div className="min-h-screen bg-[#f5f3ef] px-4 sm:px-6 lg:px-8 py-8 sm:py-10"
      style={{ backgroundImage: "radial-gradient(ellipse at 10% 5%, rgba(14,116,144,0.05) 0%, transparent 50%)" }}>
      <div className="max-w-6xl mx-auto">

        {/* ── HEADER ── */}
        <div className="animate-fade-up mb-2">
          <h1 className="font-playfair text-[clamp(22px,4vw,34px)] font-bold text-[#1c2b33] leading-tight">
            Appointment History
          </h1>
        </div>
        {/* ── FILTER + SEARCH BAR ── */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Filter pill group */}
          <div className="flex bg-white border border-black/[0.07] rounded-xl overflow-hidden flex-shrink-0">
            {FILTERS.map((f, i) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-[15px] font-semibold px-4 py-2 border-none cursor-pointer transition-all duration-150 whitespace-nowrap
                  ${i < FILTERS.length - 1 ? "border-r border-black/[0.07]" : ""}
                  ${filter === f.key
                    ? "bg-[#0e7490] text-white"
                    : "bg-transparent text-[#6b7f8a] hover:bg-[#f8f8f6] hover:text-[#1c2b33]"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#1c2b33" strokeWidth={2.5}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search patient…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-[15px] border border-black/[0.07] rounded-xl bg-white text-[#1c2b33] placeholder-[#9fb0b8] outline-none focus:border-[#0e7490]/40 focus:ring-2 focus:ring-[#0e7490]/10 transition"
            />
          </div>
        </div>

        {/* ── LOADING ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-9 h-9 border-4 border-[rgba(14,116,144,0.2)] border-t-[#0e7490] rounded-full animate-spin" />
            <p className="text-[15px] text-[#6b7f8a]">Loading history…</p>
          </div>
        )}

        {/* ── EMPTY ── */}
        {!loading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(14,116,144,0.06)] flex items-center justify-center">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#0e7490" strokeWidth={1.5} opacity={0.5}>
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2" />
              </svg>
            </div>
            <p className="text-[14px] font-semibold text-[#6b7f8a]">No appointments found</p>
            <p className="text-[12px] text-[#9fb0b8]">Try changing the filter or search term</p>
          </div>
        )}

        {!loading && sorted.length > 0 && (
          <>
            {/* ── DESKTOP TABLE (md+) ── */}
            <div className="hidden md:block bg-white border border-black/[0.07] rounded-[18px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[640px]">
                  <thead>
                    <tr className="border-b border-black/[0.06]">
                      {["Patient", "Type", "Token", "Date & Time", "Status", "Action"].map((h) => (
                        <th key={h} className="text-[14px] font-bold tracking-widest uppercase text-[#6b7f8a] px-5 py-4 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {sorted.map((a) => <TableRow key={a.id} a={a} onAction={handleAction} />)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── TABLET GRID (sm only, 2 cols) ── */}
            <div className="hidden sm:grid md:hidden grid-cols-2 gap-3">
              {sorted.map((a) => <AppointmentCard key={a.id} a={a} onAction={handleAction} />)}
            </div>

            {/* ── MOBILE STACK (below sm) ── */}
            <div className="sm:hidden flex flex-col gap-3">
              {sorted.map((a) => <AppointmentCard key={a.id} a={a} onAction={handleAction} />)}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default AppointmentHistory;