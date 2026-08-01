import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SectionTitle = ({ gradient, icon, title }) => (
  <div className="flex items-center gap-3">
    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}>
      {icon}
    </div>
    <span className="text-[13px] font-semibold tracking-tight text-slate-800 font-[family-name:var(--font-dm)]">
      {title}
    </span>
  </div>
);

const STATUS_CONFIG = {
  pending: {
    gradient: "from-amber-400 to-orange-500",
    bgLight:  "bg-amber-50/60 border-amber-200",
    label:    "Under Review",
    labelColor: "text-amber-600",
    icon: (
      <div className="w-16 h-16 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
    ),
    title:   "Your registration is under review",
    message: "Our admin team is carefully reviewing your submitted documents and credentials. You'll be notified once a decision is made.",
    sectionGradient: "from-amber-400 to-orange-500",
    sectionTitle: "Approval Pending",
  },
  approved: {
    gradient: "from-emerald-500 to-green-600",
    bgLight:  "bg-emerald-50/60 border-emerald-200",
    label:    "Approved",
    labelColor: "text-emerald-600",
    icon: (
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7"/>
        </svg>
      </div>
    ),
    title:   "You're approved!",
    message: "Congratulations! Your registration has been approved. You will be redirected to your Doctor Dashboard shortly.",
    sectionGradient: "from-emerald-500 to-green-600",
    sectionTitle: "Registration Approved",
  },
  rejected: {
    gradient: "from-red-500 to-rose-600",
    bgLight:  "bg-red-50/60 border-red-200",
    label:    "Not Approved",
    labelColor: "text-red-600",
    icon: (
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </div>
    ),
    title:   "Registration not approved",
    message: "Unfortunately, your registration was not approved at this time. Please contact our support team for more details and assistance.",
    sectionGradient: "from-red-500 to-rose-600",
    sectionTitle: "Registration Rejected",
  },
};

/* ══════════════════════════════════════════ */
const ApprovalStatusPage = () => {
  const [status, setStatus]   = useState("pending");
  const navigate              = useNavigate();
  const config                = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  useEffect(() => {
    const fetchApprovalStatus = async () => {
      try {
        const doctor = JSON.parse(localStorage.getItem("loggedInDoctor"));
        if (!doctor?.doctorId) return;

        const res = await api.get("/doctors", {
          params: { doctorId: doctor.doctorId },
        });

        if (res.data.length > 0) {
          setStatus(res.data[0].status || "pending");
          if (res.data[0].status === "approved") {
            setTimeout(() => navigate("/doctordashboard"), 2000);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchApprovalStatus();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-10 py-10">

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-violet-100/30 blur-3xl" />
      </div>

      <div className="w-full max-w-lg animate-[var(--animate-fade-up)]">

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/60 backdrop-blur-xl">

          <div className="border-b border-slate-100 px-6 sm:px-8 pt-7 pb-7">
            <SectionTitle
              gradient={config.sectionGradient}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              }
              title={config.sectionTitle}
            />

            <div className={`mt-5 rounded-xl border-2 ${config.bgLight} px-6 py-7 flex flex-col items-center text-center gap-4`}>

              {config.icon}

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.labelColor} bg-white border border-current/20 font-[family-name:var(--font-dm)]`}>
                {config.label}
              </span>

              <p className="text-base font-semibold text-slate-800 font-[family-name:var(--font-dm)]">
                {config.title}
              </p>

              <p className="text-sm text-slate-500 leading-relaxed font-[family-name:var(--font-dm)] max-w-sm">
                {config.message}
              </p>

              <div className="flex items-center gap-2 mt-2">
                {["Submitted", "Under Review", "Decision"].map((step, i) => {
                  const isDone =
                    (status === "pending"  && i < 2) ||
                    (status === "approved" && i <= 2) ||
                    (status === "rejected" && i <= 2);
                  const isCurrent = status === "pending" && i === 1;
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                          ${isDone
                            ? status === "rejected" && i === 2
                              ? "bg-red-500 text-white"
                              : "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-400"}`}>
                          {isDone && !(status === "rejected" && i === 2) ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round">
                              <path d="M5 13l4 4L19 7"/>
                            </svg>
                          ) : status === "rejected" && i === 2 ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round">
                              <path d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          ) : (
                            <span>{i + 1}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-[family-name:var(--font-dm)] whitespace-nowrap">
                          {step}
                        </span>
                      </div>
                      {i < 2 && (
                        <div className={`w-10 h-0.5 mb-4 rounded-full transition-all ${isDone ? "bg-blue-400" : "bg-slate-200"}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="px-6 sm:px-8 pt-5 pb-7">
            <div className="flex items-center gap-3">

              <button
                onClick={() => navigate("/doctorloginpage")}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 tracking-wide font-[family-name:var(--font-dm)] border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 active:scale-[0.99]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Home
              </button>

              <button
                onClick={() => window.open("mailto:founder@yodoctor.in")}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white tracking-wide font-[family-name:var(--font-dm)] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-200 active:scale-[0.99]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Contact Support
              </button>

            </div>
          </div>

        </div>

        <p className="mt-3.5 text-center text-xs text-slate-400 font-[family-name:var(--font-dm)]">
          Your data is encrypted and stored securely.
        </p>

      </div>
    </div>
  );
};

export default ApprovalStatusPage;