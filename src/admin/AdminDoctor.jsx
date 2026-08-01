import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/notify";

const BASE_URL = import.meta.env.VITE_API_URL || "";
const PAGE_SIZE = 9;

const getDoctorImageUrl = (profile_image) => {
  if (!profile_image) return null;
  if (profile_image.startsWith("http")) return profile_image;
  return `${BASE_URL}/${profile_image}`.replace(/([^:])\/\//g, "$1/");
};

const STATUS = {
  PENDING: {
    label: "Pending",
    cls: "bg-amber-50  text-amber-600  border-amber-200",
  },
  APPROVED: {
    label: "Approved",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    cls: "bg-red-50    text-red-600    border-red-200",
  },
};

/* ── Stat Card ── */
const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 px-6 py-5 flex items-center gap-5 shadow-sm">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-3xl font-bold text-slate-800 font-[family-name:var(--font-dm)] leading-none">
        {value}
      </p>
      <p className="text-sm text-slate-400 font-[family-name:var(--font-dm)] mt-1">
        {label}
      </p>
    </div>
  </div>
);

/* ── Doctor Card ── */
const DoctorCard = ({
  d,
  onView,
  onAction,
  activeMenu,
  setActiveMenu,
  imageError,
  setImageError,
}) => {
  const st = STATUS[d.status] || STATUS.PENDING;
  const initials = d.doctorName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 relative">
      {/* Status badge */}
      <span
        className={`absolute top-5 right-5 text-xs font-bold px-3 py-1.5 rounded-full border font-[family-name:var(--font-dm)] ${st.cls}`}
      >
        {st.label}
      </span>

      <span
        className={`absolute top-16 right-5 text-xs font-bold px-3 py-1 rounded-full border ${
          d.subscription_status === "active"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-red-700 border-red-200"
        }`}
      >
        {d.subscription_status === "active" ? "Paid" : "Unpaid"}
      </span>

      <div className="flex gap-4 pr-24">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
          {d.profile_image && !imageError[d.id] ? (
            <img
              src={getDoctorImageUrl(d.profile_image)}
              alt={d.doctorName}
              className="w-full h-full object-cover"
              onError={() =>
                setImageError((prev) => ({ ...prev, [d.id]: true }))
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-500 bg-slate-100">
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-slate-800 truncate font-[family-name:var(--font-dm)]">
            {d.doctorName}
          </p>
          <p className="text-sm font-semibold text-blue-600 mt-0.5 font-[family-name:var(--font-dm)]">
            {d.specialization}
          </p>
          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-400 font-[family-name:var(--font-dm)]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {d.city}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400 font-[family-name:var(--font-dm)]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              {d.experience_years || "5"}y exp
            </span>
            <span className="flex items-center gap-1 text-xs text-amber-500 font-[family-name:var(--font-dm)]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="#f59e0b"
                stroke="#f59e0b"
                strokeWidth={1}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {d.rating || "4.9"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-5">
        <button
          onClick={() => onView(d.id)}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200 font-[family-name:var(--font-dm)]"
        >
          View Details
        </button>

        {d.status === "PENDING" && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(activeMenu === d.id ? null : d.id);
              }}
              className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {activeMenu === d.id && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-13 w-52 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
              >
                <button
                  onClick={() => {
                    onAction("APPROVE", d);
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-emerald-600 hover:bg-emerald-50 transition font-[family-name:var(--font-dm)]"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Approve Doctor
                </button>
                <div className="border-t border-slate-100" />
                <button
                  onClick={() => {
                    onAction("REJECT", d);
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-red-500 hover:bg-red-50 transition font-[family-name:var(--font-dm)]"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject Doctor
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Docs Not Verified Modal ── */
const DocsNotVerifiedModal = ({
  doctor,
  unverifiedCount,
  onClose,
  onGoVerify,
  navigate,
}) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm shadow-2xl">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth={2.5}
          strokeLinecap="round"
        >
          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-slate-800 text-center font-[family-name:var(--font-dm)] mb-2">
        Documents Not Verified
      </h3>
      <p className="text-sm text-slate-400 text-center font-[family-name:var(--font-dm)] mb-2">
        <span className="font-semibold text-slate-600">
          {doctor?.doctorName}
        </span>{" "}
        <span className="font-bold text-amber-600">
          {unverifiedCount} document(s)
        </span>{" "}
        are pending.
      </p>
      <p className="text-sm text-slate-400 text-center font-[family-name:var(--font-dm)] mb-7">
        Please verify the All documents
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-[family-name:var(--font-dm)]"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onClose();
            navigate(`/admin/doctorsdetails/${doctor?.id}`);
          }}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 transition font-[family-name:var(--font-dm)]"
        >
          Verify Docs
        </button>
      </div>
    </div>
  </div>
);

/* ── Confirm Modal ── */
const ConfirmModal = ({ type, doctor, onCancel, onConfirm, processing }) => {
  const isApprove = type === "APPROVE";
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm shadow-2xl animate-[var(--animate-scale-in)]">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${isApprove ? "bg-emerald-50" : "bg-red-50"}`}
        >
          {isApprove ? (
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth={2.5}
              strokeLinecap="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth={2.5}
              strokeLinecap="round"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-800 text-center font-[family-name:var(--font-dm)] mb-2">
          {isApprove ? "Approve Doctor?" : "Reject Doctor?"}
        </h3>
        <p className="text-sm text-slate-400 text-center font-[family-name:var(--font-dm)] mb-7">
          Are you sure you want to {isApprove ? "approve" : "reject"}{" "}
          <span className="font-semibold text-slate-600">
            {doctor?.doctorName}
          </span>
          ?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-[family-name:var(--font-dm)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={processing}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60 font-[family-name:var(--font-dm)]
              ${isApprove ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"}`}
          >
            {processing
              ? "Processing..."
              : isApprove
                ? "Yes, Approve"
                : "Yes, Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════ */
const AdminDoctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState(false);
  const [imageError, setImageError] = useState({});
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeMenu, setActiveMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingDocs, setCheckingDocs] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "",
    doctor: null,
  });
  const [docsWarningModal, setDocsWarningModal] = useState({
    open: false,
    doctor: null,
    unverifiedCount: 0,
    pendingAction: null,
  });
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        api.get("/admin/doctors?status=PENDING"),
        api.get("/admin/doctors?status=APPROVED"),
        api.get("/admin/doctors?status=REJECTED"),
      ]);
      const p = pendingRes.data?.doctors || [];
      const a = approvedRes.data?.doctors || [];
      const r = rejectedRes.data?.doctors || [];
      setDoctors([...p, ...a, ...r]);
      setStats({ pending: p.length, approved: a.length, rejected: r.length });
    } catch (err) {
      console.error(err);
      notify.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handler = () => setActiveMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  /* ── Document check before showing confirm modal ── */
  const handleAction = async (type, doctor) => {
    if (!doctor?.id) return;

    setCheckingDocs(true);
    try {
      const res = await api.get(`/admin/doctors/${doctor.id}/documents`);
      const documents = res.data?.documents || [];

      if (documents.length === 0) {
        setDocsWarningModal({
          open: true,
          doctor,
          unverifiedCount: 0,
          pendingAction: type,
        });
        return;
      }

      const unverifiedDocs = documents.filter((doc) => doc.verified === 0);

      if (unverifiedDocs.length > 0) {
        setDocsWarningModal({
          open: true,
          doctor,
          unverifiedCount: unverifiedDocs.length,
          pendingAction: type,
        });
        return;
      }

      setConfirmModal({ open: true, type, doctor });
    } catch (err) {
      console.error(err);
      notify.error("Could not fetch documents. Please try again.");
    } finally {
      setCheckingDocs(false);
    }
  };

  const handleConfirmAction = async () => {
    const { type, doctor } = confirmModal;
    if (!doctor?.id) {
      notify.error("Invalid doctor");
      return;
    }
    try {
      setProcessing(true);
      const status = type === "APPROVE" ? "APPROVED" : "REJECTED";
      await api.put(`/admin/doctors/${doctor.id}/status`, {
        status,
        reason:
          status === "APPROVED" ? "Approved by admin" : "Rejected by admin",
      });
      notify.success(`Doctor ${status.toLowerCase()} successfully`);
      setConfirmModal({ open: false, type: "", doctor: null });
      loadData();
    } catch (err) {
      notify.error(err.response?.data?.message || "Failed to update");
    } finally {
      setProcessing(false);
    }
  };

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((d) => {
        const matchSearch =
          d?.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
          d?.city?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "ALL" || d.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [doctors, search, statusFilter],
  );

  const visibleDoctors = filteredDoctors.slice(0, visibleCount);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-[family-name:var(--font-dm)]">
            Loading doctors...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-10 py-8">
      {/* Checking docs overlay */}
      {checkingDocs && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl border border-slate-200 px-8 py-6 shadow-xl flex items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="text-sm font-semibold text-slate-600 font-[family-name:var(--font-dm)]">
              Checking documents...
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-[family-name:var(--font-dm)]">
            Doctors Management
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-[family-name:var(--font-dm)]">
            Review and manage doctor registrations
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition font-[family-name:var(--font-dm)] self-start sm:self-auto shadow-sm"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
          >
            <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Doctors"
          value={stats.pending + stats.approved + stats.rejected}
          color="bg-blue-50"
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Pending Review"
          value={stats.pending}
          color="bg-amber-50"
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          }
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          color="bg-emerald-50"
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth={2.5}
              strokeLinecap="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          }
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          color="bg-red-50"
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth={2.5}
              strokeLinecap="round"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        />
      </div>

      {/* Search + Filter */}
      <div className="flex justify-between flex-col sm:flex-row gap-3 mb-7">
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition font-[family-name:var(--font-dm)]"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setVisibleCount(PAGE_SIZE);
              }}
              className={[
                "px-4 py-2.5 rounded-xl text-sm font-bold border transition font-[family-name:var(--font-dm)]",
                statusFilter === s
                  ? s === "PENDING"
                    ? "bg-amber-500 text-white border-amber-500"
                    : s === "APPROVED"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : s === "REJECTED"
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300",
              ].join(" ")}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              {s === "PENDING" && stats.pending ? ` (${stats.pending})` : ""}
              {s === "APPROVED" && stats.approved ? ` (${stats.approved})` : ""}
              {s === "REJECTED" && stats.rejected ? ` (${stats.rejected})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {visibleDoctors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeLinecap="round"
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-500 font-[family-name:var(--font-dm)]">
            No doctors found
          </p>
          <p className="text-sm text-slate-400 font-[family-name:var(--font-dm)]">
            Try changing the search or filter
          </p>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {visibleDoctors.map((d) => (
          <DoctorCard
            key={d.id}
            d={d}
            onView={(id) => navigate(`/admin/doctorsdetails/${id}`)}
            onAction={(type, doc) => handleAction(type, doc)}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            imageError={imageError}
            setImageError={setImageError}
          />
        ))}
      </div>

      {/* Load More */}
      {visibleCount < filteredDoctors.length && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
            className="px-7 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm font-[family-name:var(--font-dm)]"
          >
            Load more · {filteredDoctors.length - visibleCount} remaining
          </button>
        </div>
      )}

      {/* Docs Not Verified Warning Modal */}
      {docsWarningModal.open && (
        <DocsNotVerifiedModal
          doctor={docsWarningModal.doctor}
          unverifiedCount={docsWarningModal.unverifiedCount}
          onClose={() =>
            setDocsWarningModal({
              open: false,
              doctor: null,
              unverifiedCount: 0,
              pendingAction: null,
            })
          }
          navigate={navigate}
        />
      )}

      {/* Confirm Modal */}
      {confirmModal.open && (
        <ConfirmModal
          type={confirmModal.type}
          doctor={confirmModal.doctor}
          processing={processing}
          onCancel={() =>
            setConfirmModal({ open: false, type: "", doctor: null })
          }
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
};

export default AdminDoctor;
