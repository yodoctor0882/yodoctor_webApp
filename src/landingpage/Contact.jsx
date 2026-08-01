
import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";
import svgImg from "../assets/images/svg.webp";
import SEO from "../components/SEO";
import api from "../services/api";
import { notify } from "../utils/notify";
/* ─── SVG Icon ─── */
const Icon = ({ d, d2, size = 20, color = "currentColor", sw = 1.8 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24"
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
    {d2 && <path d={d2} />}
  </svg>
);

const ICONS = {
  pin:    { d: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z", d2: "M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },
  mail:   { d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  phone:  { d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
  clock:  { d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  send:   { d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
  check:  { d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  user:   { d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  chevD:  { d: "M19 9l-7 7-7-7" },
  map:    { d: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
};

/* ─── Floating Label Input ─── */
const FloatingInput = ({ label, required, type = "text", name, as = "input", rows = 4, children }) => {
  const [focused, setFocused] = useState(false);
  const [hasVal, setHasVal] = useState(false);
  const raised = focused || hasVal;

  const shared = {
    onFocus: () => setFocused(true),
    onBlur: (e) => { setFocused(false); setHasVal(!!e.target.value); },
    name,
    id: name,
    required,
    style: {
      width: "100%",
      padding: "22px 14px 8px",
      fontSize: 14,
      color: "#1e293b",
      background: "transparent",
      border: "none",
      outline: "none",
      resize: "none",
      lineHeight: 1.5,
    },
  };

  return (
    <div className="relative" style={{
      background: focused ? "#fff" : "#f8faff",
      border: focused ? "1.5px solid #0072BC" : "1.5px solid #e2e8f0",
      borderRadius: 12,
      boxShadow: focused ? "0 0 0 3px rgba(0,114,188,0.1)" : "none",
      transition: "all 0.2s",
      overflow: "hidden",
    }}>
      <label htmlFor={name} style={{
        position: "absolute",
        left: 14,
        top: raised ? 7 : "50%",
        transform: raised ? "none" : "translateY(-50%)",
        fontSize: raised ? 10 : 13,
        fontWeight: raised ? 700 : 400,
        color: focused ? "#0072BC" : raised ? "#94a3b8" : "#94a3b8",
        pointerEvents: "none",
        transition: "all 0.18s ease",
        textTransform: raised ? "uppercase" : "none",
        letterSpacing: raised ? "0.06em" : 0,
      }}>
        {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>

      {as === "textarea"
        ? <textarea rows={rows} {...shared} style={{ ...shared.style, paddingTop: 26, resize: "vertical" }} />
        : as === "select"
          ? <select {...shared} onChange={(e) => setHasVal(!!e.target.value)}
              style={{ ...shared.style, paddingTop: 22, cursor: "pointer", appearance: "none" }}>
              {children}
            </select>
          : <input type={type} {...shared} />
      }

      {/* Select chevron */}
      {as === "select" && (
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Icon {...ICONS.chevD} size={14} color="#94a3b8" sw={2} />
        </span>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════ */
const Contact = () => {
  const { language, lang } = useLanguage();
  const t = lang[language];
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const formData = new FormData(e.target);

  const data = {
    concern: formData.get("concern"),
    subConcern: formData.get("subConcern"),
    name: formData.get("name"),
    number: formData.get("number"),
    email: formData.get("email"),
    text: formData.get("text"),
  };

  try {
    const res = await api.post("/contact", data);

    if (res.data.success) {
      setSubmitted(true);
      e.target.reset();
    }

  } catch (err) {
    notify.error(err.response?.data?.message || "Error");
  }

  setLoading(false);
};
  return (
    <>
      <SEO
        title="Contact Yo Doctor | Customer Support & Healthcare Assistance"
        description="Contact Yo Doctor for doctor appointments, lab test bookings, medicine delivery, and healthcare support."
        keywords="contact yo doctor, healthcare support india, doctor appointment help"
        url="https://www.yodoctor.in/contact"
      />

      {/* ════════════════════════════════
          HERO — full-bleed split
      ════════════════════════════════ */}
      <div style={{ background: "#050f24", position: "relative", overflow: "hidden" }}>
        {/* dot grid */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.06 }}>
          <defs><pattern id="cg" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#cg)" />
        </svg>

        {/* Right-side blue accent shape */}
        <div className="absolute right-0 top-0 h-full" style={{
          width: "38%",
          background: "linear-gradient(135deg, rgba(0,114,188,0.18) 0%, rgba(0,114,188,0.04) 100%)",
          clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0% 100%)",
        }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-16 flex flex-col md:flex-row items-center gap-10 mt-10">
          {/* Left: hero text */}
          <div className="flex-1 text-center md:text-left">
           <div>
            <span className=" font-extrabold uppercase tracking-widest mb-3 inline-block text-[#0072BC] text-lg">
              Yo
            </span>{" "}
            <span className="text-lg font-extrabold uppercase tracking-widest mb-3 inline-block text-[#16a34a]">
              {" "}
              Doctor
            </span>
          </div>
            <h1 className="font-black text-white leading-tight mb-4"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)" }}>
              Get In<br /><span style={{ color: "#0072BC" }}>Touch</span>
            </h1>
            <div className="flex items-center gap-3 mb-5 justify-center md:justify-start">
              <div style={{ width: 48, height: 2, background: "#0072BC", borderRadius: 2 }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0072BC" }} />
              <div style={{ width: 48, height: 2, background: "#0072BC", borderRadius: 2 }} />

            </div>
            <p className="text-base mb-8" style={{ color: "rgba(180,210,255,0.72)", lineHeight: 1.85, maxWidth: 360 }}>
              Have a question, need an appointment, or just want to reach out? We're always here for you.
            </p>

            {/* Contact chips */}
            <div className="flex flex-col gap-3 items-center md:items-start">
              {[
                { icon: ICONS.phone, label: "+91 9277207339",           href: "tel:+91 9277207339",               color: "#7ec8f8" },
                { icon: ICONS.mail,  label: "founder@yodoctor.in",  href: "mailto:founder@yodoctor.in",  color: "#a5f3c0" },
                { icon: ICONS.pin,   label: "Jhansi, Uttar Pradesh",    href: "#map",                            color: "#fcd34d" },
                { icon: ICONS.clock, label: "Mon – Sat · 9 AM – 8 PM", href: null,                              color: "#c4b5fd" },
              ].map((item, i) => (
                <div key={i}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 w-full md:w-auto"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", maxWidth: 340 }}>
                  <Icon {...item.icon} size={16} color={item.color} />
                  {item.href
                    ? <a href={item.href} className="text-sm font-semibold" style={{ color: "rgba(220,235,255,0.9)", textDecoration: "none" }}>{item.label}</a>
                    : <span className="text-sm font-semibold" style={{ color: "rgba(220,235,255,0.9)" }}>{item.label}</span>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Right: illustration */}
          <div className="flex-shrink-0 hidden md:flex items-center justify-center" style={{ width: 280 }}>
            <img src={svgImg} alt="Support" loading="lazy"
              style={{ width: "100%", filter: "drop-shadow(0 20px 40px rgba(0,114,188,0.3))" }} />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          FORM SECTION
      ════════════════════════════════ */}
      <section style={{ background: "#f0f5fc", padding: "72px 0 80px" }}>
        <div className="max-w-3xl mx-auto px-6 md:px-8">

          {/* Section label */}
          <div className="text-center mb-10">
            <span className="text-base font-extrabold uppercase tracking-widest inline-block mb-2"
              style={{ color: "#0072BC", letterSpacing: "0.3em" }}>Support Request</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{t.contact_form_title}</h2>
            <p className="text-base text-gray-400 mt-2">Fill in the details below — we'll get back within 24 hours</p>
          </div>

          {/* Card */}
          <div className="rounded-3xl overflow-hidden" style={{
            background: "#fff",
            boxShadow: "0 8px 48px rgba(0,0,0,0.08)",
          }}>
            {/* Top accent bar */}
            <div style={{ height: 4, background: "linear-gradient(90deg, #0072BC 0%, #00b4d8 50%, #f5c518 100%)" }} />

            <div className="p-8 md:p-10">
              {/* Success state */}
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                  <div className="flex items-center justify-center rounded-full"
                    style={{ width: 72, height: 72, background: "#f0fdf4", border: "2px solid #bbf7d0" }}>
                    <Icon {...ICONS.check} size={34} color="#16a34a" sw={2} />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900">Request Sent!</h3>
                  <p className="text-sm text-gray-400 max-w-xs">Our support team will reach out to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)}
                    className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: "#0072BC" }}>
                    Submit Another
                  </button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Row 1 – dropdowns */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <FloatingInput label={t.choose_concern} name="concern" required as="select">
                      <option value="" />
                      <option value="healthcheck">{t.health_services}</option>
                      <option value="lab">{t.lab_booking}</option>
                      <option value="medicine">{t.medicine_purchase}</option>
                      <option value="consultation">{t.doctor_consultation}</option>
                      <option value="app">{t.app_support}</option>
                      <option value="coupons">{t.offers}</option>
                      <option value="subscription">{t.plans}</option>
                      <option value="security">{t.privacy}</option>
                    </FloatingInput>

                    <FloatingInput label={t.select_issue} name="subConcern" required as="select">
                      <option value="" />
                      <option value="order">{t.track_order}</option>
                      <option value="cancellation">{t.cancel_order}</option>
                      <option value="reschedule">{t.reschedule}</option>
                      <option value="prize">{t.reward_issue}</option>
                      <option value="app">{t.app_not_working}</option>
                      <option value="reports">{t.report_delay}</option>
                      <option value="cancel">{t.request_cancel}</option>
                    </FloatingInput>
                  </div>

                  {/* Row 2 – name + phone */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <FloatingInput label={t.full_name} name="name" required type="text" />
                    <FloatingInput label={t.mobile_number} name="number" required type="tel" />
                  </div>

                  {/* Email */}
                  <FloatingInput label={t.email_optional} name="email" type="email" />

                  {/* Message */}
                  <FloatingInput label={t.describe_issue} name="text" as="textarea" rows={4} />

                  {/* Submit */}
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200"
                    style={{ background: loading ? "#93c5e8" : "#0072BC" }}
                    onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#005fa3"; }}
                    onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#0072BC"; }}
                  >
                    {loading
                      ? <><span style={{
                          width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)",
                          borderTop: "2px solid white", borderRadius: "50%",
                          display: "inline-block", animation: "spin 0.7s linear infinite",
                        }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style> Sending…</>
                      : <><Icon {...ICONS.send} size={15} color="#fff" /> {t.submit_request}</>
                    }
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          WELLBEING + MAP
      ════════════════════════════════ */}
      <section id="map" style={{ background: "#ffffff", padding: "80px 0 96px" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12">

          {/* Top text */}
          <div className="text-center mb-14">
            <span className="text-base font-extrabold uppercase tracking-widest inline-block mb-2"
              style={{ color: "#0072BC", letterSpacing: "0.3em" }}>We Care</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">{t.wellbeing_title}</h2>
            <p className="text-base text-gray-400 max-w-xl mx-auto leading-relaxed">{t.wellbeing_desc}</p>
          </div>


          <div className="grid sm:grid-cols-3 gap-6 mb-14">
            {[
              { icon: ICONS.pin,   title: t.location, sub: "Jhansi, Uttar Pradesh",   color: "#0072BC", href: "#map" },
              { icon: ICONS.mail,  title: t.email_us, sub: "founder@yodoctor.in", color: "#7c3aed", href: "mailto:founder@yodoctor.in" },
              { icon: ICONS.phone, title: t.call_us,  sub: "+91 9277207339",           color: "#059669", href: "tel:+91 9277207339" },
            ].map((c, i) => (
              <a key={i} href={c.href}
                className="flex flex-col items-center text-center rounded-2xl py-8 px-5 transition-all duration-250"
                style={{ background: "#f8faff", border: "1.5px solid #e8eef8", textDecoration: "none" }}
                onMouseEnter={(e) => {
                  const card  = e.currentTarget;
                  card.style.background  = c.color;
                  card.style.border      = `1.5px solid ${c.color}`;
                  card.style.transform   = "translateY(-5px)";
                  card.style.boxShadow   = `0 16px 40px ${c.color}40`;

                  // icon background + icon svg color
                  const iconBox = card.querySelector(".icon-box");
                  if (iconBox) {
                    iconBox.style.background = "rgba(255,255,255,0.2)";
                    const svg = iconBox.querySelector("svg");
                    if (svg) svg.setAttribute("stroke", "#ffffff");
                  }

                  // title + subtitle text
                  const title = card.querySelector(".card-title");
                  const sub   = card.querySelector(".card-sub");
                  if (title) title.style.color = "#ffffff";
                  if (sub)   sub.style.color   = "rgba(255,255,255,0.8)";
                }}
                onMouseLeave={(e) => {
                  const card  = e.currentTarget;
                  card.style.background  = "#f8faff";
                  card.style.border      = "1.5px solid #e8eef8";
                  card.style.transform   = "translateY(0)";
                  card.style.boxShadow   = "none";

                  // icon background + icon svg color — reset
                  const iconBox = card.querySelector(".icon-box");
                  if (iconBox) {
                    iconBox.style.background = `${c.color}15`;
                    const svg = iconBox.querySelector("svg");
                    if (svg) svg.setAttribute("stroke", c.color);
                  }

                  // title + subtitle — reset
                  const title = card.querySelector(".card-title");
                  const sub   = card.querySelector(".card-sub");
                  if (title) title.style.color = "#1f2937";
                  if (sub)   sub.style.color   = "#9ca3af";
                }}
              >
                {/* Icon box */}
                <div
                  className="icon-box flex items-center justify-center rounded-2xl mb-4 transition-all duration-250"
                  style={{ width: 56, height: 56, background: `${c.color}15` }}
                >
                  <Icon {...c.icon} size={24} color={c.color} />
                </div>

                {/* Title */}
                <p className="card-title text-sm font-extrabold mb-1 transition-colors duration-250"
                  style={{ color: "#1f2937" }}>
                  {c.title}
                </p>

                {/* Subtitle */}
                <p className="card-sub text-xs transition-colors duration-250"
                  style={{ color: "#9ca3af" }}>
                  {c.sub}
                </p>
              </a>
            ))}
          </div>

          {/* Talk + Map row */}
          <div className="flex flex-col md:flex-row items-stretch gap-10">
            <div className="w-full md:flex-1 flex flex-col justify-center gap-5">
              <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-snug">
                {t.talk_doctor_title}{" "}
                <span style={{ color: "#0072BC" }}>Yo</span><span style={{ color: "#16a34a" }}>Doctor</span>
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">{t.talk_doctor_desc1}</p>
              <p className="text-base text-gray-600 leading-relaxed">{t.talk_doctor_desc2}</p>

              {/* CTA row */}
              <div className="flex flex-wrap gap-3 mt-1">
                <a href="mailto:founder@yodoctor.in"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: "#0072BC" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#005fa3"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#0072BC"}>
                  <Icon {...ICONS.mail} size={14} color="#fff" /> Email Us
                </a>
                <a href="tel:+917084630273"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: "#f0f5fc", color: "#1e293b", border: "1.5px solid #dde6f5" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0072BC55"; e.currentTarget.style.background = "#e6eff9"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#dde6f5"; e.currentTarget.style.background = "#f0f5fc"; }}>
                  <Icon {...ICONS.phone} size={14} color="#0072BC" /> Call Us
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="w-full md:flex-1 rounded-2xl overflow-hidden"
              style={{ minHeight: 320, border: "1.5px solid #e8eef8", boxShadow: "0 8px 40px rgba(0,0,0,0.07)" }}>
              <iframe
                title="Yo Doctor Location"
                src="https://www.google.com/maps?q=25.4484,78.5685&z=15&output=embed"
                width="100%" height="100%"
                style={{ border: 0, display: "block", minHeight: 320 }}
                allowFullScreen loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;