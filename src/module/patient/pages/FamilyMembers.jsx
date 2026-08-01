import React, { useEffect, useState } from "react";
import { Users, UserPlus, Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notify } from "../../../utils/notify";
import FamilyService from "../../../services/FamilyService";

const getInitials = (name = "") =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const avatarColors = [
  ["#2563EB", "#14B8A6"],
  ["#14B8A6", "#06B6D4"],
  ["#F59E0B", "#2563EB"],
  ["#2563EB", "#06B6D4"],
  ["#22C55E", "#14B8A6"],
];

const ConfirmModal = ({ text, onYes, onNo }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onNo} />
    <div
      className="relative bg-white rounded-2xl w-full max-w-sm p-6 z-10"
      style={{
        boxShadow: "0 24px 64px rgba(15,23,42,0.18)",
        border: "1px solid #E2E8F0",
        animation: "scaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: "rgba(239,68,68,0.08)" }}
      >
        <Trash2 size={20} color="#EF4444" />
      </div>
      <h3 className="text-[17px] font-bold mb-1" style={{ color: "#0F172A" }}>
        Delete Member?
      </h3>
      <p className="text-[13px] mb-6" style={{ color: "#64748B" }}>
        {text}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onNo}
          className="flex-1 text-[13px] font-semibold py-2.5 rounded-xl cursor-pointer transition-all duration-200"
          style={{
            color: "#64748B",
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onYes}
          className="flex-1 text-[13px] font-bold py-2.5 rounded-xl text-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg,#EF4444,#dc2626)",
            boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
          }}
        >
          Delete
        </button>
      </div>
    </div>
    <style>{`@keyframes scaleIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
  </div>
);

export default function FamilyMembers() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [deleteMemberId, setDeleteMemberId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await FamilyService.getAll();
      setMembers(data);
      localStorage.setItem(
        "familyMembers",
        JSON.stringify(data.map((m) => ({ id: m.id, name: m.fullName, age: m.age })))
      );
    } catch {
      notify.error("Failed to load family members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleDelete = async () => {
    try {
      await FamilyService.remove(deleteMemberId);
      const updated = members.filter((m) => m.id !== deleteMemberId);
      setMembers(updated);
      localStorage.setItem(
        "familyMembers",
        JSON.stringify(updated.map((m) => ({ id: m.id, name: m.fullName, age: m.age })))
      );
      notify.success("Family member deleted");
    } catch (err) {
      notify.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteMemberId(null);
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8" style={{ background: "#F8FAFC" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .row-hover:hover { background: #EEF2FF !important; }
        .btn-primary { background: #2563EB; }
        .btn-primary:hover { background: #1D4ED8; transform: translateY(-1px); }
        .btn-teal { background: #14B8A6; }
        .btn-teal:hover { background: #0F766E; }
        .icon-btn-edit:hover { background: rgba(37,99,235,0.1) !important; }
        .icon-btn-delete:hover { background: rgba(239,68,68,0.1) !important; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 fade-up">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
            Family Members
          </h1>
          <p className="text-[16px] font-medium mt-0.5" style={{ color: "#64748B" }}>
            Add and manage profiles for everyone in your household
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-md font-semibold"
            style={{ color: "#22C55E", background: "rgba(34,197,94,0.1)" }}
          >
            <Users size={14} />
            {members.length} Members Active
          </div>

          <button
            onClick={() => navigate("/client/addfamilypage")}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-md font-bold text-white cursor-pointer transition-all duration-200"
            style={{ boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}
          >
            <UserPlus size={14} /> Add Member
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-9 h-9 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: "#2563EB", borderTopColor: "transparent" }}
            />
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Loading family members…
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && members.length === 0 && (
        <div
          className="bg-white rounded-2xl py-16 flex flex-col items-center gap-3 fade-up"
          style={{ boxShadow: "0 2px 16px rgba(15,23,42,0.07)", border: "1px solid #E2E8F0" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1"
            style={{ background: "#EEF2FF" }}
          >
            <Users size={30} color="#2563EB" />
          </div>
          <p className="text-lg font-bold" style={{ color: "#0F172A" }}>
            No family members yet
          </p>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Add family members to book appointments for them
          </p>
          <button
            onClick={() => navigate("/client/addfamilypage")}
            className="btn-primary mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all duration-200"
            style={{ boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}
          >
            <UserPlus size={14} /> Add First Member
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && members.length > 0 && (
        <div
          className="bg-white rounded-2xl overflow-hidden fade-up"
          style={{ boxShadow: "0 2px 20px rgba(15,23,42,0.07)", border: "1px solid #E2E8F0" }}
        >
          {/* Table header label */}
          <div className="px-6 py-4" style={{ borderBottom: "1px solid #E2E8F0" }}>
            <h2 className="text-lg font-bold" style={{ color: "#0F172A" }}>
              Existing Members
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="hidden md:table-header-group" style={{ background: "#F8FAFC" }}>
                <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                  {["Member Name", "Relation", "Gender", "Age", "Blood Group", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-sm font-semibold uppercase tracking-wider"
                      style={{ color: "#64748B" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {members.map((member, idx) => {
                  const [c1, c2] = avatarColors[idx % avatarColors.length];
                  return (
                    <React.Fragment key={member.id}>
                      {/* Desktop row */}
                      <tr
                        className="hidden md:table-row row-hover transition-colors duration-150"
                        style={{ borderBottom: "1px solid #E2E8F0" }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-md font-bold text-white flex-shrink-0"
                              style={{ background: `linear-gradient(135deg,${c1},${c2})` }}
                            >
                              {getInitials(member.fullName)}
                            </div>
                            <div>
                              <p className="text-lg font-semibold" style={{ color: "#0F172A" }}>
                                {member.fullName}
                              </p>
                              <p className="text-sm" style={{ color: "#94A3B8" }}>
                                Last visit: {member.lastVisit || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className="text-sm font-semibold px-3 py-1 rounded-full"
                            style={{ color: c1, background: `${c1}18` }}
                          >
                            {member.relation}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-md" style={{ color: "#64748B" }}>
                          {member.gender?.charAt(0) + member.gender?.slice(1).toLowerCase()}
                        </td>

                        <td className="px-6 py-4 text-md font-semibold" style={{ color: "#0F172A" }}>
                          {member.age} yrs
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className="text-md font-bold px-3 py-1 rounded-full"
                            style={{ color: "#EF4444", background: "rgba(239,68,68,0.08)" }}
                          >
                            {member.bloodGroup || "—"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => navigate(`/client/edit-family/${member.id}`)}
                              className="icon-btn-edit w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200"
                              style={{ background: "transparent" }}
                              title="Edit"
                            >
                              <Pencil size={18} color="#2563EB" />
                            </button>
                            <button
                              onClick={() => setDeleteMemberId(member.id)}
                              className="icon-btn-delete w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200"
                              style={{ background: "transparent" }}
                              title="Delete"
                            >
                              <Trash2 size={18} color="#EF4444" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Mobile card row */}
                      <tr
                        className="md:hidden"
                        style={{ borderBottom: "1px solid #E2E8F0" }}
                      >
                        <td colSpan="6" className="px-4 py-4">
                          <div className="flex items-start gap-3">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
                              style={{ background: `linear-gradient(135deg,${c1},${c2})` }}
                            >
                              {getInitials(member.fullName)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-[14px] font-semibold" style={{ color: "#0F172A" }}>
                                    {member.fullName}
                                  </p>
                                  <span
                                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-1 inline-block"
                                    style={{ color: c1, background: `${c1}18` }}
                                  >
                                    {member.relation}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => navigate(`/client/edit-family/${member.id}`)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                                    style={{ background: "rgba(37,99,235,0.08)" }}
                                  >
                                    <Pencil size={14} color="#2563EB" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteMemberId(member.id)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                                    style={{ background: "rgba(239,68,68,0.08)" }}
                                  >
                                    <Trash2 size={14} color="#EF4444" />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2 mt-3">
                                {[
                                  {
                                    label: "Gender",
                                    value: member.gender?.charAt(0) + member.gender?.slice(1).toLowerCase(),
                                  },
                                  { label: "Age", value: `${member.age} yrs` },
                                  { label: "Blood", value: member.bloodGroup, red: true },
                                ].map((item) => (
                                  <div key={item.label}>
                                    <p
                                      className="text-[10px] uppercase tracking-wider font-semibold"
                                      style={{ color: "#94A3B8" }}
                                    >
                                      {item.label}
                                    </p>
                                    <p
                                      className="text-[13px] font-bold mt-0.5"
                                      style={{ color: item.red ? "#EF4444" : "#0F172A" }}
                                    >
                                      {item.value || "—"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteMemberId && (
        <ConfirmModal
          text="This action cannot be undone. The family member will be permanently removed."
          onNo={() => setDeleteMemberId(null)}
          onYes={handleDelete}
        />
      )}
    </div>
  );
}