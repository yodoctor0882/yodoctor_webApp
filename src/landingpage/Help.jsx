

import { useEffect, useRef, useState } from "react";
import SEO from "../components/SEO";
import { Helmet } from "react-helmet-async";

/* ─── Icon helper ─── */
const Icon = ({ d, size = 20, color = "currentColor", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  search:   "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  start:    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z",
  book:     "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  video:    "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",
  payment:  "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  doc:      "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  tech:     "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  privacy:  "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  support:  "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
  faq:      "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  chevron:  "M19 9l-7 7-7-7",
  chevronR: "M9 5l7 7-7 7",
  chat:     "M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z",
  phone:    "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  mail:     "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  close:    "M6 18L18 6M6 6l12 12",
};

/* ─── Sidebar nav items ─── */
const NAV_ITEMS = [
  { id: "getting-started",         label: "Getting Started",          icon: "start"   },
  { id: "booking-appointments",    label: "Booking Appointments",     icon: "book"    },
  // { id: "online-video-consultation", label: "Video Consultation",     icon: "video"   },
  { id: "payments-refunds",        label: "Payments & Refunds",       icon: "payment" },
  { id: "prescriptions-reports",   label: "Prescriptions & Reports",  icon: "doc"     },
  { id: "technical-issues",        label: "Technical Issues",         icon: "tech"    },
  { id: "privacy-security",        label: "Privacy & Security",       icon: "privacy" },
  { id: "contact-support",         label: "Contact & Support",        icon: "support" },
  { id: "faqs",                    label: "FAQs",                     icon: "faq"     },
];

/* ─── All article data ─── */
const ARTICLES = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "start",
    desc: "Quick overview of the platform and how to begin.",
    color: "#0072BC",
    details: [
      { q: "What does our platform do?", a: "We are a telemedicine platform where you can book appointments with doctors online and take video/phone consultations. You can also manage prescriptions, reports, and follow-ups." },
      { q: "How to create an account", a: "On the signup page, enter your email/phone → verify OTP → complete your profile (name, age, gender, optional medical history). Social sign-in (Google/Apple) may also be available." },
      { q: "Login / logout process", a: "Login using email/phone + password or OTP. Logout via Profile menu → Logout button. If OTP isn't received, use the 'Forgot password' option." },
      { q: "Supported devices & usage", a: "Website: modern browsers (Chrome/Firefox/Edge/Safari). Mobile: Android app (>= Android 8) & iOS app (>= iOS 13). For best video experience, use the latest browser or official app." },
    ],
  },
  {
    id: "booking-appointments",
    title: "Booking Appointments",
    icon: "book",
    desc: "Step-by-step guide to search doctors and book appointments.",
    color: "#0891b2",
    details: [
      { q: "How to search for doctors or specialties", a: "Use the search bar to type specialty (e.g., Dermatology, Psychiatry) or doctor name. Use filters such as experience, fees, language, rating, and availability." },
      { q: "Step-by-step appointment booking", a: "1) Choose doctor → 2) Select date & time slot → 3) Choose mode (Video/Phone/Chat) → 4) Enter reason for visit → 5) Make payment (if required) → 6) Receive confirmation email/SMS." },
      { q: "How to check doctor availability", a: "Available slots are shown; green = available, grey = unavailable. Some doctors have weekly slots or specific clinic hours." },
      { q: "Booking confirmation", a: "After booking, you'll get confirmation via email/SMS and notification in the app. It also appears under 'My Appointments'." },
      { q: "How to reschedule or cancel an appointment", a: "Go to My Appointments → Select appointment → Reschedule/Cancel. Refunds follow our cancellation policy." },
      { q: "Appointment reminders", a: "Automatic reminders via SMS/Email/Push notifications (24 hours and 1 hour before). Ensure notifications are enabled." },
    ],
  },
  // {
  //   id: "online-video-consultation",
  //   title: "Video Consultation",
  //   icon: "video",
  //   desc: "Guide to join, conduct, and troubleshoot video calls.",
  //   color: "#7c3aed",
  //   details: [
  //     { q: "How to join a video consultation", a: "Go to My Appointments → Select your booked slot → Tap 'Join Video Call'. Allow camera and microphone access in your browser/app." },
  //     { q: "Internet and device requirements", a: "Stable 4G/Wi-Fi, working front camera and microphone. Recommended browsers: Chrome (latest), Edge, Safari. Avoid multiple tabs during call." },
  //     { q: "Doctor connection wait time", a: "Usually 1–5 minutes. The screen will show 'Doctor joining soon' if delayed." },
  //     { q: "If audio or video doesn't work", a: "Reload the page, check mic/camera permissions, and ensure they are 'Allowed' in settings. If the issue persists, contact support with a screenshot." },
  //     { q: "How to receive prescription after video consult", a: "Within 10–15 minutes of the consultation, a digital prescription appears in the 'My Prescriptions' section." },
  //     { q: "How to schedule follow-up consultation", a: "Doctors with 'Follow-up Available' tags offer discounted follow-up slots. You'll also receive a direct video link." },
  //   ],
  // },
  {
    id: "payments-refunds",
    title: "Payments & Refunds",
    icon: "payment",
    desc: "Everything about payment methods, failed transactions, and refund policy.",
    color: "#059669",
    details: [
      { q: "Available payment modes", a: "Credit/Debit Cards, UPI, NetBanking, Paytm, PhonePe, and Wallets are supported. All payments are processed via secure gateways." },
      { q: "What if payment fails?", a: "If the amount is deducted but booking is not confirmed, refunds are issued within 3–5 working days. Contact support for delays." },
      { q: "Refund policy", a: "Full refund if the doctor cancels. Refunds for patient cancellations depend on timing and policy." },
      { q: "How to get invoice or receipt", a: "You can download invoices from the My Payments section or via email." },
      { q: "How to apply coupons or discounts", a: "On the payment screen, enter your coupon in 'Apply Coupon' field. Valid codes apply discounts automatically." },
    ],
  },
  {
    id: "prescriptions-reports",
    title: "Prescriptions & Reports",
    icon: "doc",
    desc: "How to view, download and share your prescriptions and reports.",
    color: "#d97706",
    details: [
      { q: "When will I get my prescription?", a: "Usually within 10–15 minutes after consultation. A downloadable PDF is available in 'My Prescriptions'." },
      { q: "Where can I find old prescriptions?", a: "Go to Profile → Appointment History → My Prescriptions tab to view all past prescriptions." },
      { q: "How to access lab reports", a: "You'll be notified once your lab report is uploaded. It can be downloaded from the 'My Reports' section." },
      { q: "How long is a prescription valid?", a: "Typically valid for 30 days for general medicines; special medicines may vary per doctor's advice." },
    ],
  },
  {
    id: "technical-issues",
    title: "Technical Issues",
    icon: "tech",
    desc: "Troubleshooting login errors, lagging video, or app crashes.",
    color: "#dc2626",
    details: [
      { q: "Having login or OTP issues?", a: "Ensure stable network and resend OTP. If it continues, clear browser cache or update the app." },
      // { q: "Video lagging or disconnecting", a: "Check internet speed (minimum 1.5 Mbps). Close background apps or switch Wi-Fi/mobile data." },
      { q: "Camera or microphone not detected", a: "Go to Browser/App Settings → Permissions → Enable Camera/Mic. Then reload and test again." },
      { q: "App crashing or running slow", a: "Update to latest version and close unused apps. If still an issue, use 'Report Bug' with details." },
    ],
  },
  {
    id: "privacy-security",
    title: "Privacy & Security",
    icon: "privacy",
    desc: "How we protect your personal data and medical information.",
    color: "#0072BC",
    details: [
      { q: "Is my data safe?", a: "Yes, all data is protected with AES-256 encryption and follows HIPAA & GDPR compliance." },
      { q: "Can doctors access my medical records?", a: "Only doctors you consult with can access your relevant medical records." },
      { q: "How to delete my account?", a: "Go to Profile → Settings → Delete Account. Your data is permanently deleted within 7 days." },
    ],
  },
  {
    id: "contact-support",
    title: "Contact & Support",
    icon: "support",
    desc: "Reach our support team for any queries or urgent help.",
    color: "#0891b2",
    details: [
      { q: "How to contact customer support?", a: "Live chat (Mon–Sat, 9 AM–8 PM) or email founder@yodoctor.in or call +91-9277207339." },
      { q: "Is emergency support available?", a: "For emergencies, please call 108 or visit the nearest hospital. We do not provide emergency diagnosis." },
      { q: "How to send feedback or complaints?", a: "Use the 'Send Feedback' form at the bottom of the Help page to contact our team." },
    ],
  },
  {
    id: "faqs",
    title: "FAQs",
    icon: "faq",
    desc: "Quick answers to common questions from users.",
    color: "#7c3aed",
    details: [
      { q: "Is online consultation legal?", a: "Yes, as per India's Telemedicine Practice Guidelines 2020, online consultation is legal if done by an MCI-registered doctor." },
      { q: "Are digital prescriptions valid in pharmacies?", a: "Yes, all prescriptions are digitally signed and accepted at pharmacies." },
      { q: "When will I receive my refund?", a: "Usually within 3–7 working days, credited to the same payment method." },
      { q: "Is the app free or paid?", a: "App download and sign-up are free. Consultation charges vary by doctor's fees." },
    ],
  },
];

/* ─── Accordion Item ─── */
const AccordionItem = ({ q, a, accentColor }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        border: open ? `1.5px solid ${accentColor}22` : "1.5px solid #f1f5f9",
        background: open ? `${accentColor}06` : "#fff",
      }}
    >
      <button
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-semibold text-gray-800 leading-snug">{q}</span>
        <span
          className="flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300"
          style={{
            width: 28, height: 28,
            background: open ? accentColor : "#f1f5f9",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <Icon d={ICONS.chevron} size={14} color={open ? "#fff" : "#64748b"} strokeWidth={2.5} />
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "400px" : "0px" }}
      >
        <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
          {a}
        </p>
      </div>
    </div>
  );
};

/* ─── Article Section ─── */
const ArticleSection = ({ article }) => (
  <article id={article.id}
    className="rounded-2xl overflow-hidden mb-6"
    style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)", background: "#fff" }}
  >
    {/* Article header */}
    <div className="flex items-center gap-4 px-6 py-5"
      style={{ borderBottom: "1.5px solid #f1f5f9" }}>
      <div className="flex items-center justify-center rounded-xl flex-shrink-0"
        style={{ width: 44, height: 44, background: `${article.color}15` }}>
        <Icon d={ICONS[article.icon]} size={22} color={article.color} />
      </div>
      <div>
        <h2 className="text-base font-extrabold text-gray-900">{article.title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{article.desc}</p>
      </div>
    </div>
    {/* Accordion items */}
    <div className="p-5 space-y-3">
      {article.details.map((item, i) => (
        <AccordionItem key={i} q={item.q} a={item.a} accentColor={article.color} />
      ))}
    </div>
  </article>
);

/* ═══════════════════════════════════════════════ */
const Help = () => {
  const searchRef = useRef(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [activeId, setActiveId] = useState("getting-started");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* Scroll spy */
  useEffect(() => {
    const handleScroll = () => {
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) setActiveId(item.id);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Search */
  const handleSearch = () => {
    const q = query.trim().toLowerCase();
    if (!q) { setMessage(""); return; }
    const sections = document.querySelectorAll("article");
    let found = false;
    sections.forEach((s) => {
      if (s.innerText.toLowerCase().includes(q)) {
        s.scrollIntoView({ behavior: "smooth", block: "start" });
        found = true;
      }
    });
    setMessage(found ? "" : "No results found. Try a different keyword.");
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); setActiveId(id); }
    setMobileSidebarOpen(false);
  };

  return (
    <>
      <SEO
        title="Help Center | Yo Doctor Support & FAQs"
        description="Find help guides for booking doctor appointments, video consultations, payments, prescriptions, and troubleshooting on Yo Doctor."
        keywords="yo doctor help center, doctor appointment help, video consultation help"
        url="https://www.yodoctor.in/help"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [{ "@type": "Question", name: "How to book an appointment?", acceptedAnswer: { "@type": "Answer", text: "Choose doctor → select slot → confirm booking." } }],
        })}</script>
      </Helmet>

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden" style={{ background: "#050f24", padding: "56px 0 48px" }}>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.06 }}>
          <defs><pattern id="hdots" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="white" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#hdots)" />
        </svg>
        <div className="absolute" style={{ width: 500, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,114,188,0.2) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center mt-10">
          <div><span className=" font-extrabold uppercase tracking-widest mb-3 inline-block text-blue-800 text-lg">Yo</span> <span className="text-lg font-extrabold uppercase tracking-widest mb-3 inline-block text-green-600"> Doctor</span></div>
          <h1 className="font-black text-white mb-3" style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", letterSpacing: "-0.01em" }}>
            Help <span style={{ color: "#0072BC" }}>Center</span>
          </h1>
          <p className="text-sm mb-8" style={{ color: "rgba(180,210,255,0.7)" }}>
            Find answers, guides, and support for all your healthcare needs
          </p>

          {/* Search bar */}
          <div className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ pointerEvents: "none" }}>
                <Icon d={ICONS.search} size={16} color="#94a3b8" />
              </div>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search help e.g. 'reschedule', 'camera', 'refund'..."
                className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 outline-none"
                style={{ background: "rgba(255,255,255,0.97)", border: "none" }}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 rounded-xl text-sm font-bold text-white flex-shrink-0 transition-all duration-200"
              style={{ background: "#0072BC" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#0060a0"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#0072BC"}
            >
              Search
            </button>
          </div>
          {message && <p className="mt-3 text-xs text-red-400">{message}</p>}
          <p className="mt-3 text-xs" style={{ color: "rgba(180,210,255,0.5)" }}>
            Try: <span className="italic">reschedule</span> · <span className="italic">prescription</span> · <span className="italic">camera</span> · <span className="italic">refund</span>
          </p>
        </div>
      </div>

      {/* ── QUICK TOPIC CHIPS ── */}
      <div style={{ background: "#f8faff", borderBottom: "1.5px solid #e8eef8", padding: "16px 0" }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Jump to:</span>
          {NAV_ITEMS.map((item) => (
            <button key={item.id}
              onClick={() => scrollTo(item.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={{
                background: activeId === item.id ? "#0072BC" : "#fff",
                color: activeId === item.id ? "#fff" : "#475569",
                border: activeId === item.id ? "1.5px solid #0072BC" : "1.5px solid #e2e8f0",
              }}>
              <Icon d={ICONS[item.icon]} size={12} color={activeId === item.id ? "#fff" : "#0072BC"} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ background: "#f4f7fb", minHeight: "100vh" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="flex gap-8 items-start">

            {/* ── Sidebar (desktop) ── */}
            <aside className="hidden lg:flex flex-col gap-1 sticky top-24 w-64 flex-shrink-0">
              <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
                <div className="px-4 py-4" style={{ borderBottom: "1.5px solid #f1f5f9" }}>
                  <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: "#0072BC" }}>Topics</p>
                </div>
                <nav className="p-2">
                  {NAV_ITEMS.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                      <button key={item.id}
                        onClick={() => scrollTo(item.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 mb-0.5"
                        style={{
                          background: isActive ? "#0072BC" : "transparent",
                          color: isActive ? "#fff" : "#475569",
                        }}
                      >
                        <span className="flex-shrink-0 flex items-center justify-center rounded-lg"
                          style={{ width: 30, height: 30, background: isActive ? "rgba(255,255,255,0.15)" : "#f1f5f9" }}>
                          <Icon d={ICONS[item.icon]} size={14} color={isActive ? "#fff" : "#0072BC"} />
                        </span>
                        <span className="text-sm font-semibold leading-tight">{item.label}</span>
                        {isActive && (
                          <span className="ml-auto">
                            <Icon d={ICONS.chevronR} size={12} color="#fff" strokeWidth={2.5} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Contact box inside sidebar */}
                <div className="m-3 rounded-xl p-4" style={{ background: "#050f24" }}>
                  <p className="text-xs font-bold text-white mb-1">Still need help?</p>
                  <p className="text-xs mb-3" style={{ color: "rgba(180,210,255,0.7)" }}>Our team is ready to assist you</p>
                  <div className="space-y-2">
                    <a href="mailto:founder@yodoctor.in" className="flex items-center gap-2 text-xs font-semibold rounded-lg px-3 py-2"
                      style={{ background: "#0072BC", color: "#fff" }}>
                      <Icon d={ICONS.mail} size={13} color="#fff" /> founder@yodoctor.in
                    </a>
                    <a href="tel:+918839003275" className="flex items-center gap-2 text-xs font-semibold rounded-lg px-3 py-2"
                      style={{ background: "rgba(255,255,255,0.08)", color: "rgba(200,220,255,0.9)" }}>
                      <Icon d={ICONS.phone} size={13} color="#7ec8f8" /> +91 9277207339
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Articles ── */}
            <main className="flex-1 min-w-0">
              {ARTICLES.map((article) => (
                <ArticleSection key={article.id} article={article} />
              ))}

              {/* Contact card at bottom */}
              <div className="rounded-2xl overflow-hidden mt-2"
                style={{ background: "#050f24", boxShadow: "0 2px 20px rgba(0,0,0,0.1)" }}>
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center rounded-2xl mx-auto mb-4"
                    style={{ width: 56, height: 56, background: "rgba(0,114,188,0.3)" }}>
                    <Icon d={ICONS.chat} size={26} color="#7ec8f8" />
                  </div>
                  <h3 className="text-lg font-extrabold text-white mb-2">Couldn't find your answer?</h3>
                  <p className="text-sm mb-6" style={{ color: "rgba(180,210,255,0.7)" }}>
                    Our support team is available Mon–Sat, 9 AM – 8 PM
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <a href="mailto:founder@yodoctor.in"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                      style={{ background: "#0072BC" }}>
                      <Icon d={ICONS.mail} size={15} color="#fff" /> Email Support
                    </a>
                    <a href="tel:+91 9277207339"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                      style={{ background: "rgba(255,255,255,0.1)", color: "rgba(220,235,255,0.9)" }}>
                      <Icon d={ICONS.phone} size={15} color="#7ec8f8" /> +91 9277207339
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Help;