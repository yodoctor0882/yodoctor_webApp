import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { notify } from "../utils/notify";
import { FiSearch } from "react-icons/fi";

const BASE_URL = import.meta.env.VITE_API_URL;
const PAGE_SIZE = 9;

const getPatientName = (p) =>
  p.patientName || p.fullName || p.name || p.email?.split("@")[0] || "Unknown";

const getPatientImageUrl = (profile_image) => {
  if (!profile_image) return null;
  if (profile_image.startsWith("http")) return profile_image;
  return `${BASE_URL}${profile_image}`;
};

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [imageError, setImageError] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    patient: null,
  });

  const loadData = async () => {
    try {
      const res = await api.get("/admin/patients");
      setPatients(res.data?.patients || []);
    } catch {
      notify.error("Failed to load patients");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleBlock = async (patient) => {
    if (!patient?.id) return notify.error("Invalid patient");

    try {
      setProcessingId(patient.id);

      const endpoint = patient.is_active
        ? `/admin/patients/${patient.user_id}/block`
        : `/admin/patients/${patient.user_id}/unblock`;

      await api.put(endpoint);

      notify.success(
        patient.is_active ? "Patient blocked" : "Patient unblocked",
      );

      loadData();
    } catch (err) {
      notify.error(err.response?.data?.message || "Action failed");
    } finally {
      setProcessingId(null);
      setConfirmModal({ open: false, patient: null });
    }
  };

  const filteredPatients = useMemo(() => {
    const q = search.toLowerCase();
    return patients.filter((p) => {
      const matchesSearch =
        (getPatientName(p) || "").toLowerCase().includes(q) ||
        (p?.email || "").toLowerCase().includes(q) ||
        (p?.mobile || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ACTIVE"
            ? p.is_active
            : !p.is_active;

      return matchesSearch && matchesStatus;
    });
  }, [patients, search, statusFilter]);

  const visiblePatients = filteredPatients.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">
            Patients Management
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            View, search and manage patient access
          </p>
        </div>

        <span className="text-sm font-semibold text-[#2563EB] bg-[#EEF2FF] px-3 py-1.5 rounded-full">
          Total ({filteredPatients.length})
        </span>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center bg-white rounded-xl shadow-sm px-3 h-11 w-full sm:max-w-sm border border-[#E2E8F0] focus-within:border-[#2563EB] transition">
          <FiSearch className="text-[#94A3B8] mr-2" />
          <input
            type="text"
            placeholder="Search patient name, email or mobile"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="w-full px-2 py-3 text-sm bg-transparent focus:outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["ALL", "ACTIVE", "BLOCKED"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setVisibleCount(PAGE_SIZE);
              }}
              className={`px-4 h-10 rounded-full border text-sm font-semibold transition ${
                statusFilter === s
                  ? s === "ACTIVE"
                    ? "bg-[#22C55E] text-white border-[#22C55E]"
                    : s === "BLOCKED"
                      ? "bg-[#EF4444] text-white border-[#EF4444]"
                      : "bg-[#2563EB] text-white border-[#2563EB]"
                  : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* PATIENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {visiblePatients.map((p) => (
          <div
            key={p.id}
            className="group bg-white rounded-2xl p-5 shadow-sm border border-[#E2E8F0] hover:shadow-lg hover:-translate-y-0.5 hover:border-[#2563EB]/30 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-[#2563EB] to-[#14B8A6] flex items-center justify-center shrink-0">
                {p.profile_image && !imageError[p.id] ? (
                  <img
                    src={getPatientImageUrl(p.profile_image)}
                    alt={getPatientName(p)}
                    className="h-full w-full object-cover"
                    onError={() =>
                      setImageError((prev) => ({ ...prev, [p.id]: true }))
                    }
                  />
                ) : (
                  <span className="font-bold text-lg text-white">
                    {getPatientName(p)?.charAt(0)}
                  </span>
                )}
                
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <p className="font-bold text-lg text-[#0F172A] truncate">
                    {getPatientName(p)}
                  </p>

                  <span
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                      p.is_active
                        ? "bg-[#22C55E]/10 text-[#22C55E]"
                        : "bg-[#EF4444]/10 text-[#EF4444]"
                    }`}
                  >
                    {p.is_active ? "ACTIVE" : "BLOCKED"}
                  </span>
                </div>

                <p className="text-sm text-[#64748B] truncate">
                  {p.email || "-"} • {p.mobile || "-"}
                </p>
              </div>
            </div>

            <div className="h-px bg-[#E2E8F0] mb-4" />

            {/* ✅ Only Block / Unblock button now */}
            <button
              disabled={processingId === p.id}
              onClick={() => setConfirmModal({ open: true, patient: p })}
              className={`w-full h-10 rounded-lg font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
                p.is_active
                  ? "border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/5"
                  : "bg-[#1ab814] text-white hover:bg-[#35760f]"
              }`}
            >
              {processingId === p.id
                ? "Please wait..."
                : p.is_active
                  ? "Block"
                  : "Unblock"}
            </button>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#64748B] font-medium">No patients found</p>
          <p className="text-sm text-[#94A3B8] mt-1">
            Try adjusting your search or filter
          </p>
        </div>
      )}

      {visibleCount < filteredPatients.length && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
            className="px-6 h-10 rounded-lg border border-[#E2E8F0] bg-white font-semibold text-[#2563EB] hover:bg-[#EEF2FF] hover:border-[#2563EB] transition"
          >
            Load More
          </button>
        </div>
      )}

      {confirmModal.open && (
        <ConfirmModal
          patient={confirmModal.patient}
          onCancel={() => setConfirmModal({ open: false, patient: null })}
          onConfirm={() => toggleBlock(confirmModal.patient)}
          processing={processingId === confirmModal.patient?.id}
        />
      )}
    </div>
  );
};

export default AdminPatients;

/* ================= CONFIRM MODAL ================= */

const ConfirmModal = ({ patient, onCancel, onConfirm, processing }) => {
  const isActive = patient?.is_active;

  return (
    <div className="fixed inset-0 bg-[#0F172A]/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-[#E2E8F0]">
        <h3 className="text-lg font-semibold mb-3 text-[#0F172A]">
          {isActive ? "Block Patient" : "Unblock Patient"}
        </h3>

        <p className="mb-6 text-[#64748B]">
          Are you sure you want to {isActive ? "block" : "unblock"}{" "}
          <b className="text-[#0F172A]">{getPatientName(patient)}</b>?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 border border-[#E2E8F0] rounded-md text-[#64748B] hover:bg-[#F8FAFC] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={processing}
            onClick={onConfirm}
            className={`px-4 py-1.5 rounded-md text-white disabled:opacity-60 transition cursor-pointer ${
              isActive
                ? "bg-[#EF4444] hover:bg-[#DC2626]"
                : "bg-[#1ab814] hover:bg-[#35760f]"
            }`}
          >
            {processing ? "Processing..." : isActive ? "Block" : "Unblock"}
          </button>
        </div>
      </div>
    </div>
  );
};
