import React, { useEffect, useState } from "react";
import {
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUsers,
  FiUserCheck,
  FiRefreshCw,
  FiArrowRight,
  FiCalendar,
  FiBell,
  FiActivity,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const today = new Date();
  const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const defaultTo = today.toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const loadDashboard = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setDashboardData(res.data);
      localStorage.setItem(
        "yo_public_stats",
        JSON.stringify({
          doctors: res.data?.doctors?.total ?? 0,
          patients: res.data?.patients?.total ?? 0,
          labs: res.data?.labs?.total ?? 1000,
          clinics: res.data?.clinics?.total ?? 1000,
          updatedAt: Date.now(),
        })
      );
    } catch (err) {
      console.error("Dashboard load failed:", err);
    }
  };

  const loadAnalytics = async () => {
    if (!fromDate || !toDate) return;
    setAnalyticsLoading(true);
    try {
      const res = await api.get("/admin/analytics/appointments", {
        params: { from: fromDate, to: toDate },
      });
      setAnalyticsData(res.data);
    } catch (err) {
      console.error("Analytics load failed:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadDashboard(), loadAnalytics()]);
      setLoading(false);
    };
    init();
  }, []);

  const completionRate =
    analyticsData?.total > 0
      ? Math.round((analyticsData.completed / analyticsData.total) * 100)
      : 0;

  const dateLabel = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0086C3] mb-1">
              Overview
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
              <FiCalendar size={12} />
              {dateLabel}
            </p>
          </div>
          <button
            onClick={() => { loadDashboard(); loadAnalytics(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
          >
            <FiRefreshCw size={13} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-9 h-9 border-[3px] border-[#0086C3] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Platform Stats ── */}
            <section className="mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                Platform Overview
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Doctors"
                  value={dashboardData?.doctors?.total ?? "—"}
                  sub={`${dashboardData?.doctors?.pending ?? 0} pending`}
                  icon={<FiUserCheck size={16} />}
                  accent="#0086C3"
                  lightBg="#e8f4fb"
                  onClick={() => navigate("/admin/doctors")}
                />
                <StatCard
                  title="Total Patients"
                  value={dashboardData?.patients?.total ?? "—"}
                  sub="Registered users"
                  icon={<FiUsers size={16} />}
                  accent="#0ea5a0"
                  lightBg="#e6f7f7"
                   onClick={() => navigate("/admin/patients")}

                />
                <StatCard
                  title="Today's Appts"
                  value={dashboardData?.todayAppointments ?? "—"}
                  sub="Across all doctors"
                  icon={<FiActivity size={16} />}
                  accent="#7c5cbf"
                  lightBg="#f0ebfa"
                />
                <StatCard
                  title="Pending Approvals"
                  value={dashboardData?.doctors?.pending ?? "—"}
                  sub="Awaiting review"
                  icon={<FiClock size={16} />}
                  accent="#d97706"
                  lightBg="#fef3e2"
                  onClick={() => navigate("/admin/doctors?status=PENDING")}
                  urgent={dashboardData?.doctors?.pending > 0}
                />
              </div>
            </section>

            {/* ── Analytics ── */}
            <section className="mb-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Filter Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-end gap-4">
                  <div>
                    <h2 className="font-semibold text-gray-800 text-base">
                      Appointment Analytics
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Filter by date range</p>
                  </div>
                  <div className="flex flex-wrap gap-3 sm:ml-auto items-end">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">From</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#0086C3]/30 focus:border-[#0086C3] text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">To</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#0086C3]/30 focus:border-[#0086C3] text-gray-700"
                      />
                    </div>
                    <button
                      onClick={() => loadAnalytics()}
                      disabled={analyticsLoading}
                      className="px-5 py-1.5 bg-[#0086C3] hover:bg-[#006fa3] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      {analyticsLoading ? "Loading..." : "Apply"}
                    </button>
                  </div>
                </div>

                {/* Analytics Stats */}
                {analyticsData && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
                    <AnalyticCell
                      label="Total"
                      value={analyticsData.total ?? 0}
                      sub="In selected period"
                      icon={<FiTrendingUp size={15} />}
                      color="#0086C3"
                    />
                    <AnalyticCell
                      label="Completed"
                      value={analyticsData.completed ?? 0}
                      sub={`${completionRate}% rate`}
                      icon={<FiCheckCircle size={15} />}
                      color="#16a34a"
                    />
                    <AnalyticCell
                      label="Cancelled"
                      value={analyticsData.cancelled ?? 0}
                      sub="Patient or doctor"
                      icon={<FiXCircle size={15} />}
                      color="#dc2626"
                    />
                    <AnalyticCell
                      label="Pending"
                      value={analyticsData.pending ?? 0}
                      sub="Awaiting confirm"
                      icon={<FiClock size={15} />}
                      color="#d97706"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* ── Quick Actions ── */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ActionCard
                  title="Pending Approvals"
                  count={dashboardData?.doctors?.pending ?? 0}
                  description="Doctors waiting for verification"
                  onClick={() => navigate("/admin/doctors?status=PENDING")}
                  urgent={dashboardData?.doctors?.pending > 0}
                  icon={<FiClock size={16} />}
                />
                <ActionCard
                  title="All Doctors"
                  count={dashboardData?.doctors?.total ?? 0}
                  description="View and manage registered doctors"
                  onClick={() => navigate("/admin/doctors")}
                  icon={<FiUserCheck size={16} />}
                />
               
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

/* ── StatCard ── */
const StatCard = ({ title, value, sub, icon, accent, lightBg, onClick, urgent }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl p-5 border shadow-sm transition-shadow ${
      urgent ? "border-amber-200" : "border-gray-100"
    } ${onClick ? "cursor-pointer hover:shadow-md" : ""}`}
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
      style={{ background: lightBg, color: accent }}
    >
      {icon}
    </div>
    <p className="text-xs text-gray-400 font-medium">{title}</p>
    <p className="text-3xl font-bold mt-1 tracking-tight" style={{ color: accent }}>
      {value}
    </p>
    {sub && (
      <p className="text-xs text-gray-400 mt-1.5">{sub}</p>
    )}
  </div>
);

/* ── AnalyticCell ── */
const AnalyticCell = ({ label, value, sub, icon, color }) => (
  <div className="px-6 py-5">
    <div className="flex items-center gap-2 mb-3" style={{ color }}>
      {icon}
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-3xl font-bold text-gray-800 tracking-tight">{value}</p>
    <p className="text-xs text-gray-400 mt-1">{sub}</p>
  </div>
);

/* ── ActionCard ── */
const ActionCard = ({ title, count, description, onClick, urgent, icon }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl p-5 border shadow-sm cursor-pointer hover:shadow-md transition-shadow group ${
      urgent ? "border-amber-200" : "border-gray-100"
    }`}
  >
    <div className="flex items-start justify-between mb-3">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
          urgent ? "bg-amber-50 text-amber-600" : "bg-[#e8f4fb] text-[#0086C3]"
        }`}
      >
        {icon}
      </div>
      {count !== null && (
        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            urgent && count > 0
              ? "bg-amber-100 text-amber-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {count}
        </span>
      )}
    </div>
    <h4 className="font-semibold text-gray-800 text-sm mb-1">{title}</h4>
    <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
    <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-[#0086C3] group-hover:gap-2 transition-all">
      View <FiArrowRight size={12} />
    </div>
  </div>
);

export default AdminDashboard;