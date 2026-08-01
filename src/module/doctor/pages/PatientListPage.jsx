import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { FaSearch } from "react-icons/fa";

const STATUS_STYLE = {
  PENDING:     "bg-amber-50 text-amber-600 border-amber-200",
  ACCEPTED:    "bg-[#ecfeff] text-[#0e7490] border-[rgba(14,116,144,0.2)]",
  IN_PROGRESS: "bg-orange-50 text-orange-500 border-orange-200",
  COMPLETED:   "bg-emerald-50 text-emerald-600 border-emerald-200",
  CANCELLED:   "bg-red-50 text-red-500 border-red-200",
  REJECTED:    "bg-red-50 text-red-500 border-red-200",
  SKIPPED:     "bg-yellow-50 text-yellow-600 border-yellow-200",
};

const getInitials = (name) => {
  if (!name) return "?";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const STATUS_OPTIONS = ["All", "PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "REJECTED", "SKIPPED"];

const PatientListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        const res = await api.get("/doctor/appointments/history", { params: { filter: "today" } });
        setPatients(
          (res.data.appointments || []).map((a) => ({
            id: a.id,
            name: a.patientName || a.familyMemberName || "Walk-in Patient",
            status: a.status,
            slot: a.appointment_slot,
            token: a.token_number,
            date: a.appointment_date,
          }))
        );
      } catch (err) { console.error("Failed to load patients", err); }
      finally { setLoading(false); }
    };
    loadPatients();
  }, []);

  const filtered = useMemo(() =>
    patients.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterStatus === "All" || p.status === filterStatus)
    ), [patients, searchQuery, filterStatus]);

  return (
    <div
      className="font-dm min-h-screen bg-[#f5f3ef] px-4 sm:px-6 py-10"
      style={{ backgroundImage: "radial-gradient(ellipse at 10% 5%, rgba(14,116,144,0.05) 0%, transparent 50%)" }}
    >
      <div className="max-w-5xl mx-auto">

        <div className="animate-fade-up mb-8">
          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#0e7490] mb-1">Doctor Portal</p>
          <h1 className="font-playfair text-[clamp(24px,3.5vw,36px)] font-bold text-[#1c2b33] leading-tight m-0">
            Today's Patients
          </h1>
          <p className="font-dm text-[13px] text-[#6b7f8a] mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        <div className="animate-fade-up [animation-delay:0.07s] flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2.5 flex-1 px-3.5 py-[11px] rounded-[12px] border border-black/[0.08] bg-white focus-within:border-[#0e7490] focus-within:ring-2 focus-within:ring-[rgba(14,116,144,0.12)] transition-all"
            style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
            <FaSearch className="text-[#0e7490] opacity-60 flex-shrink-0 text-[13px]" />
            <input type="text" placeholder="Search patient name…"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="font-dm flex-1 bg-transparent border-none outline-none text-[14px] text-[#1c2b33] placeholder-[#c4cdd4]" />
          </div>
          <div className="flex items-center gap-2.5 px-3.5 py-[11px] rounded-[12px] border border-black/[0.08] bg-white focus-within:border-[#0e7490] transition-all"
            style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="font-dm bg-transparent border-none outline-none text-[14px] text-[#1c2b33] cursor-pointer appearance-none pr-2">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === "All" ? "All Statuses" : s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-9 h-9 border-4 border-[rgba(14,116,144,0.2)] border-t-[#0e7490] rounded-full animate-spin" />
            <p className="font-dm text-[13px] text-[#6b7f8a]">Loading patients…</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-4xl opacity-30">👤</span>
            <p className="font-dm text-[14px] text-[#6b7f8a]">
              {patients.length === 0 ? "No appointments scheduled for today" : "No patients match your search"}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <>
            <div className="animate-fade-up [animation-delay:0.13s] hidden md:block bg-white border border-black/[0.07] rounded-[18px] overflow-hidden"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/[0.06]">
                    {["Patient", "Token", "Slot", "Status", "Action"].map((h) => (
                      <th key={h} className="font-dm text-[10px] font-semibold tracking-widest uppercase text-[#6b7f8a] px-5 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-[#fafaf8] transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#0e7490] text-white flex items-center justify-center font-playfair font-bold text-[13px] flex-shrink-0">
                            {getInitials(p.name)}
                          </div>
                          <span className="font-dm font-semibold text-[14px] text-[#1c2b33]">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-dm text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#ecfeff] text-[#0e7490] border border-[rgba(14,116,144,0.15)]">
                          #{p.token || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-dm text-[13px] text-[#6b7f8a]">
                        {p.slot ? p.slot.charAt(0) + p.slot.slice(1).toLowerCase() : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-dm text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full border ${STATUS_STYLE[p.status] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
                          {p.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {p.status === "COMPLETED" && (
                          <button onClick={() => navigate(`/doctordashboard/prescription/${p.id}`)}
                            className="font-dm text-[12px] font-semibold text-[#0e7490] bg-[#ecfeff] hover:bg-cyan-100 px-4 py-1.5 rounded-full border border-[rgba(14,116,144,0.18)] cursor-pointer transition">
                            Prescription
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3 animate-fade-up [animation-delay:0.13s]">
              {filtered.map((p) => (
                <div key={p.id} className="bg-white border border-black/[0.07] rounded-[16px] p-5"
                  style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#0e7490] text-white flex items-center justify-center font-playfair font-bold text-[14px] flex-shrink-0">
                      {getInitials(p.name)}
                    </div>
                    <p className="font-dm font-semibold text-[14px] text-[#1c2b33]">{p.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="font-dm text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#ecfeff] text-[#0e7490] border border-[rgba(14,116,144,0.15)]">#{p.token || "—"}</span>
                    <span className="font-dm text-[11px] text-[#6b7f8a]">{p.slot ? p.slot.charAt(0) + p.slot.slice(1).toLowerCase() : "—"}</span>
                    <span className={`font-dm text-[10px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[p.status] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
                      {p.status.replace("_", " ")}
                    </span>
                    {p.status === "COMPLETED" && (
                      <button onClick={() => navigate(`/doctordashboard/prescription/${p.id}`)}
                        className="font-dm text-[11px] font-semibold text-[#0e7490] bg-[#ecfeff] px-3 py-1 rounded-full border border-[rgba(14,116,144,0.18)] cursor-pointer">
                        Prescription
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientListPage;