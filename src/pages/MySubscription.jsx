import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/notify";
const MySubscription = () => {
  const navigate = useNavigate();
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [page, setPage] = useState("subscription");

  const [subscription, setSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const nextBillingDate =
    subscription?.next_billing_date || subscription?.nextBillingDate || null;

  const loadData = async () => {
    try {
      setLoading(true);

      const [subRes, billRes] = await Promise.all([
        api.get("/razorpay/subscriptions/active"),
        api.get("/razorpay/billing/history"),
      ]);

      setSubscription(subRes?.data?.data?.subscription || null);

      setBillingHistory(billRes?.data?.data?.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const cancelSubscription = async () => {
    try {
      if (!subscription?.id) return;

      await api.post(`/razorpay/subscriptions/${subscription.id}/cancel`);

      await loadData();

      setCancelConfirm(false);
    } catch (err) {
      console.error(err);
      notify("Failed to cancel subscription", "error");
    }
  };

  const upgradeSubscription = async () => {
    try {
      if (!subscription?.id) return;

      navigate("/payment", {
        state: {
          isUpgrade: true,
          subscriptionId: subscription.id,
        },
      });

    } catch (err) {
      console.error(err);
      notify(err?.response?.data?.message || "Upgrade failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  /* ── SUCCESS PAGE ────────────────────────────────────────────── */
  if (page === "success") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-5 font-sans"
        style={{ background: "#F8FAFC" }}
      >
        <div
          className="w-full max-w-2xl bg-white rounded-3xl p-12 text-center"
          style={{
            border: "1px solid #E2E8F0",
            boxShadow: "0 8px 40px rgba(15,23,42,0.10)",
          }}
        >
          {/* Icon */}
          <div
            className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center text-5xl font-bold"
            style={{ background: "#f0fdf4", color: "#22C55E" }}
          >
            ✓
          </div>

          <h1
            className="text-4xl font-extrabold mb-4"
            style={{ color: "#0F172A" }}
          >
            Subscription Activated!
          </h1>
          <p
            className="text-lg leading-relaxed mb-10"
            style={{ color: "#64748B" }}
          >
            Welcome to MediCare Pro Premium. Your healthcare platform is ready.
          </p>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: "PLAN", value: "Premium" },
              { label: "STATUS", value: "● Active", chip: true },
              { label: "SUBSCRIPTION ID", value: "SUB-8U6HNB5D" },
              { label: "NEXT BILLING", value: "13 Jun 2026" },
            ].map(({ label, value, chip }) => (
              <div
                key={label}
                className="rounded-2xl p-5 text-left"
                style={{ border: "1px solid #E2E8F0" }}
              >
                <p
                  className="text-xs font-bold mb-2 tracking-widest"
                  style={{ color: "#94A3B8" }}
                >
                  {label}
                </p>
                {chip ? (
                  <span
                    className="px-4 py-1.5 rounded-full text-sm font-bold"
                    style={{ background: "#f0fdf4", color: "#22C55E" }}
                  >
                    {value}
                  </span>
                ) : (
                  <p
                    className="text-xl font-extrabold"
                    style={{ color: "#0F172A" }}
                  >
                    {value}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setPage("subscription")}
              className="flex-1 text-white rounded-2xl py-4 text-lg font-bold transition-colors"
              style={{ background: "#2563EB" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#1D4ED8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#2563EB")
              }
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => setPage("subscription")}
              className="flex-1 rounded-2xl py-4 text-lg font-bold transition-colors"
              style={{
                background: "#fff",
                color: "#0F172A",
                border: "1px solid #E2E8F0",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#F8FAFC")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              Manage Subscription
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── FAILED PAGE ─────────────────────────────────────────────── */
  if (page === "failed") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-5 font-sans"
        style={{ background: "#F8FAFC" }}
      >
        <div
          className="w-full max-w-md bg-white rounded-3xl p-10 text-center"
          style={{
            border: "1px solid #E2E8F0",
            boxShadow: "0 8px 40px rgba(15,23,42,0.10)",
          }}
        >
          <div
            className="w-20 h-20 rounded-full mx-auto mb-7 flex items-center justify-center text-4xl font-bold"
            style={{ background: "#fff1f1", color: "#EF4444" }}
          >
            ✕
          </div>

          <h1
            className="text-3xl font-extrabold mb-3"
            style={{ color: "#0F172A" }}
          >
            Payment Failed
          </h1>
          <p
            className="text-base leading-relaxed mb-7"
            style={{ color: "#64748B" }}
          >
            We couldn't process your payment. Your card was declined or there
            was a network issue.
          </p>

          <div
            className="rounded-xl p-5 text-left mb-7"
            style={{
              background: "#fff1f1",
              border: "1px solid #fecaca",
            }}
          >
            <p className="text-sm font-bold mb-2" style={{ color: "#991b1b" }}>
              Error Details
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#EF4444" }}>
              Transaction declined by issuing bank. Error code:
              PAYMENT_DECLINED_003
            </p>
          </div>

          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setPage("subscription")}
              className="flex-1 text-white rounded-xl py-4 text-base font-bold transition-colors"
              style={{ background: "#2563EB" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#1D4ED8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#2563EB")
              }
            >
              Retry Payment
            </button>
            <button
              onClick={() => setPage("subscription")}
              className="flex-1 rounded-xl py-4 text-base font-bold transition-colors"
              style={{
                background: "#fff",
                color: "#0F172A",
                border: "1px solid #E2E8F0",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#F8FAFC")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              Go Back
            </button>
          </div>

          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Need help?{" "}
            <span className="font-bold" style={{ color: "#2563EB" }}>
              support@medicare.pro
            </span>
          </p>
        </div>
      </div>
    );
  }

  /* ── MAIN PAGE ───────────────────────────────────────────────── */
  return (
    <div
      className="max-w-5xl mx-auto px-5 py-10 pb-20 font-sans min-h-screen"
      style={{ background: "#F8FAFC" }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-4xl font-extrabold mb-2"
          style={{ color: "#0F172A" }}
        >
          My Subscription
        </h1>
        <p className="text-sm" style={{ color: "#64748B" }}>
          Manage your plan, billing, and payment details.
        </p>
      </div>

      {/* Plan Banner */}
      <div
        className="rounded-2xl p-7 text-white relative overflow-hidden mb-6"
        style={{
          background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)",
        }}
      >
        {/* decorative circles */}
        <div
          className="absolute -top-10 -right-10 w-52 h-52 rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <div
          className="absolute -bottom-12 -left-8 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />

        <div className="relative flex justify-between items-start flex-wrap gap-4">
          <div>
            <p
              className="text-xs font-bold tracking-widest mb-2"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              CURRENT PLAN
            </p>
            <h2 className="text-5xl font-extrabold mb-2 text-white">
              {subscription?.plan_name || subscription?.planName || "No Plan"}
            </h2>
            <p
              className="text-base"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              {subscription?.billing_cycle || subscription?.billing || "-"}
            </p>

            <p className="text-sm text-white mt-2">
              Next Billing:{" "}
              {nextBillingDate
                ? new Date(nextBillingDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "-"}
            </p>
          </div>
          <span
            className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap text-white"
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          >
            ● {subscription?.status || "inactive"}
          </span>
        </div>

        {subscription?.upgrade_status === "scheduled" && (
          <div className="mt-5 bg-white/10 rounded-xl p-4">
            <p className="text-xs font-bold tracking-widest text-white/70">
              UPCOMING PLAN
            </p>

            <p className="text-xl font-bold text-white">
              {subscription.scheduled_plan_name}
            </p>

            <p className="text-sm text-white/80 mt-1">
              Starts On:{" "}
              {new Date(
                subscription.scheduled_activation_date,
              ).toLocaleDateString("en-IN")}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        {/* Upgrade */}
        <button
          onClick={upgradeSubscription}
          className="text-white rounded-xl px-6 py-3.5 text-sm font-bold transition-colors"
          style={{ background: "#2563EB" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1D4ED8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2563EB")}
        >
          ⬆ Upgrade plan
        </button>
      </div>

      {/* Billing Table */}
      <div
        className="bg-white rounded-2xl p-7 overflow-x-auto"
        style={{
          border: "1px solid #E2E8F0",
          boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
        }}
      >
        <h2
          className="text-2xl font-extrabold mb-6"
          style={{ color: "#0F172A" }}
        >
          Billing History
        </h2>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["INVOICE ID", "DATE", "PLAN", "AMOUNT", "STATUS"].map(
                (head) => (
                  <th
                    key={head}
                    className="text-left px-3 py-4 text-xs font-bold tracking-widest"
                    style={{
                      color: "#94A3B8",
                      borderBottom: "1px solid #E2E8F0",
                    }}
                  >
                    {head}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {billingHistory.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  No billing history found
                </td>
              </tr>
            ) : (
              billingHistory.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F8FAFC")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    className="px-3 py-4 font-bold font-mono text-sm"
                    style={{
                      color: "#0F172A",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    {row.id}
                  </td>
                  <td
                    className="px-3 py-4 text-sm"
                    style={{
                      color: "#64748B",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    {new Date(row.paid_at || row.created_at).toLocaleDateString(
                      "en-IN",
                    )}
                  </td>
                  <td
                    className="px-3 py-4 text-sm"
                    style={{
                      color: "#64748B",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    {row.plan_name}
                  </td>
                  <td
                    className="px-3 py-4 text-sm font-bold"
                    style={{
                      color: "#0F172A",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    ₹{Number(row.amount || 0).toLocaleString("en-IN")}
                  </td>
                  <td
                    className="px-3 py-4"
                    style={{ borderBottom: "1px solid #F1F5F9" }}
                  >
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: "#f0fdf4", color: "#22C55E" }}
                    >
                      ● {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MySubscription;
