import CountUp from "react-countup";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import lab_test_yo_doctorImg from "../assets/images/lab-test_yo_doctor.webp";
import trackerImg            from "../assets/images/tracker.webp";
import labtestImg            from "../assets/images/labtest.webp";
import medicineImg           from "../assets/images/medicine-new.webp";
import careProgramImg        from "../assets/images/care-program.webp";
import phoneImg              from "../assets/images/phone-1.webp";
import homeDiagnosisImg      from "../assets/images/home-diagnosis.webp";
import teamImg               from "../assets/images/yo_doctor_team.webp";

import SEO from "../components/SEO";

const Icon = ({ d, size = 20, color = "currentColor", sw = 1.8 }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke={color}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  heart:  "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  users:  "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  globe:  "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  check:  "M5 13l4 4L19 7",
  arrow:  "M17 8l4 4m0 0l-4 4m4-4H3",
  star:   "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  zap:    "M13 10V3L4 14h7v7l9-11h-7z",
  team:   "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
};

const FALLBACK_STATS = { doctors: 100, patients: 100, labs: 10, clinics: 100 };

const getStatsFromCache = () => {
  try {
    const raw = localStorage.getItem("yo_public_stats");
    if (!raw) return FALLBACK_STATS;
    const parsed = JSON.parse(raw);
    return {
      doctors:  parsed.doctors  ?? FALLBACK_STATS.doctors,
      // labs:     parsed.labs     ?? FALLBACK_STATS.labs,
      patients: parsed.patients ?? FALLBACK_STATS.patients,
      clinics:  parsed.doctors  ?? FALLBACK_STATS.doctors,
    };
  } catch {
    return FALLBACK_STATS;
  }
};

// FIX 3: Removed `overflow-hidden` from FadeIn wrapper — it was clipping
// box shadows and the hover `-translate-y-1` effect on child cards.
const FadeIn = ({ children, delay = 0, direction = "up" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const startY = direction === "up" ? 32 : 0;
  const startX = direction === "left" ? -32 : direction === "right" ? 32 : 0;
  return (
    <div ref={ref} className="w-full" style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translate(0,0)" : `translate(${startX}px,${startY}px)`,
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

const SectionLabel = ({ text }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-6 h-0.5 bg-[#0072BC] rounded" />
    <span className="text-xs font-extrabold uppercase tracking-widest text-[#0072BC]">{text}</span>
  </div>
);

/* ─── STAT CARD ─── */
const StatCard = ({ stat }) => (
  <div className="flex flex-col items-center text-center rounded-2xl p-4 sm:p-5 md:p-7
                  bg-white/5 border border-white/10
                  transition-all duration-300 hover:-translate-y-1 cursor-default">
    <div
      className="flex items-center justify-center rounded-xl mb-3 sm:mb-4 md:mb-5
                 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
      style={{ background: `${stat.color}28` }}
    >
      <Icon d={stat.icon} size={20} color={stat.color} />
    </div>
    <div className="font-black text-white text-2xl sm:text-3xl md:text-4xl leading-none">
      <CountUp end={stat.value} duration={2.5} separator="," />
      <span className="text-yellow-400">{stat.suffix}</span>
    </div>
    <p className="text-xs sm:text-sm md:text-base font-semibold mt-2 sm:mt-3 text-blue-200/70">
      {stat.label}
    </p>
  </div>
);

/* ─── APP FEATURE CARD ─── */
const AppFeatureCard = ({ item }) => (
  <div
    className="flex flex-col gap-2 sm:gap-3 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5
               bg-white border border-[#e8eef8] shadow-sm
               transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-default"
  >
    <div
      className="rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0
                 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
      style={{ background: `${item.color}14` }}
    >
      <img
        src={item.img}
        alt={item.text}
        className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain"
        loading="lazy"
      />
    </div>
    <span className="text-md font-semibold text-gray-700 leading-snug">{item.text}</span>
  </div>
);

/* ═══════════════════════════════════════════════ */
const About = () => {
  const { language, lang } = useLanguage();
  // FIX 4: Guard against lang being undefined before accessing keys.
  const safeLang = lang && lang[language] ? language : "en";
  const t = (lang && lang[safeLang]) ?? {};
  const cachedStats = getStatsFromCache();

  const stats = [
    { value: cachedStats.doctors,  suffix: "+", label: t.doctors,  icon: ICONS.users,  color: "#0072BC" },
    { value: cachedStats.patients, suffix: "+", label: t.patients, icon: ICONS.heart,  color: "#0891b2" },
    { value: cachedStats.labs,     suffix: "+", label: t.labs,     icon: ICONS.shield, color: "#7c3aed" },
    { value: cachedStats.clinics,  suffix: "+", label: t.clinics,  icon: ICONS.globe,  color: "#059669" },
  ];

  const appFeatures = [
    { img: trackerImg,     text: t.f1, color: "#0072BC" },
    { img: labtestImg,     text: t.f3, color: "#0891b2" },
    { img: medicineImg,    text: t.f4, color: "#7c3aed" },
    { img: careProgramImg, text: t.f5, color: "#059669" },
  ];

  const checkItems = [
    "Online doctor appointments in minutes",
    "Verified & experienced healthcare professionals",
    "Home care, lab tests & medicine delivery",
  ];

  return (
    <>
      <SEO
        title="About Yo Doctor | Digital Healthcare Platform in India"
        description="Learn about Yo Doctor, a digital healthcare platform providing online doctor appointments, lab tests, medicines, and home healthcare services across India."
        keywords="about yo doctor, digital healthcare platform, online doctor appointment india"
        url="https://www.yodoctor.in/about"
      />

      {/* ── 1. HERO ── */}
      <div className="relative overflow-hidden bg-[#050f24] py-16 sm:py-20 px-4 sm:px-8 md:px-12">
        {/* dot pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none">
          <defs>
            <pattern id="adots" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#adots)" />
        </svg>
        <div className="relative z-10 text-center mt-8 sm:mt-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-1 mb-3">
            <span className="text-base sm:text-lg font-extrabold uppercase tracking-widest text-[#0072BC]">Yo</span>
            <span className="text-base sm:text-lg font-extrabold uppercase tracking-widest text-[#16a34a]">Doctor</span>
          </div>
          <h1 className="font-black text-white mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight">
            About <span className="text-[#0072BC]">Us</span>
          </h1>
          <div className="flex items-center gap-3 justify-center mb-5">
            <div className="w-10 sm:w-14 h-0.5 bg-[#0072BC] rounded" />
            <div className="w-2 h-2 rounded-full bg-[#0072BC]" />
            <div className="w-10 sm:w-14 h-0.5 bg-[#0072BC] rounded" />
          </div>
          <p className="text-lg leading-relaxed text-blue-200/70 max-w-xs sm:max-w-xl mx-auto px-2 sm:px-0">
            India's trusted digital healthcare platform — connecting patients with verified doctors, labs, and home care services.
          </p>
        </div>
      </div>

      {/* ── 2. ABOUT INTRO ── */}
      <section className="bg-[#f4f7fb] py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-8 md:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">

            {/* Image */}
            <FadeIn direction="left">
              <div className="relative w-full mt-4 md:mt-0">
                <div className="absolute inset-0 top-3 left-3 sm:top-4 sm:left-4 bg-[#0072BC]/10 rounded-2xl z-0" />
                <img
                  src={lab_test_yo_doctorImg}
                  alt="Yo Doctor digital healthcare platform"
                  loading="lazy"
                  className="relative z-10 w-full h-auto rounded-2xl shadow-xl block"
                />
              </div>
            </FadeIn>

            {/* Text */}
            <FadeIn direction="right" delay={100}>
              <div className="pt-8 sm:pt-10 md:pt-0">
                <SectionLabel text="Who We Are" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-5 leading-tight">
                  {t.about_title}
                </h2>
                <p className="text-gray-700 leading-relaxed md:text-base mb-5 sm:mb-7">
                  {t.about_desc}
                </p>
                {checkItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3 mb-3">
                    <span className="flex items-center justify-center rounded-full flex-shrink-0
                                     w-6 h-6 sm:w-7 sm:h-7 bg-[#0072BC]/10">
                      <Icon d={ICONS.check} size={12} color="#0072BC" sw={2.5} />
                    </span>
                    <span className="text-xs sm:text-sm text-gray-700 font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* ── 3. STATS ── */}
      <section className="relative overflow-hidden bg-[#050f24] py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-8 md:px-12">
        <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none">
          <defs>
            <pattern id="sdots" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sdots)" />
        </svg>

        <div className="relative z-10 max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <span className="font-extrabold uppercase tracking-[0.3em] text-yellow-400 inline-block mb-2 sm:mb-3">
                Our Impact
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">{t.stats_title}</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <FadeIn key={i} delay={i * 80}>
                <StatCard stat={stat} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. APP FEATURES ── */}
      <section className="bg-[#f4f7fb] py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-8 md:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">

            {/* Text + feature cards */}
            <FadeIn direction="left">
              <div>
                <SectionLabel text="The App" />
                <p className="text-gray-600 text-md leading-relaxed mb-2">
                  {t.belief_para}
                  <span className="font-bold text-[#0072BC]"> Yo</span>
                  <span className="font-bold text-[#00bc42]"> Doctor </span>App
                </p>
                <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 mb-5 sm:mb-8 leading-snug">
                  {t.with_app}
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  {appFeatures.map((item, i) => (
                    <AppFeatureCard key={i} item={item} />
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Phone image — hidden on mobile, visible on md+ */}
            <FadeIn direction="right" delay={120}>
              <div className="hidden md:flex justify-center items-center relative py-8 md:py-0">
                <img
                  src={phoneImg}
                  alt="Yo Doctor mobile app"
                  loading="lazy"
                  className="relative w-full max-w-[280px] lg:max-w-[380px] max-h-[72vh]
                             object-contain drop-shadow-2xl animate-[floatPhone_3.5s_ease-in-out_infinite]"
                />
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* ── 5. TECHNOLOGY ── */}
      <section className="bg-white py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-8 md:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">

            <FadeIn direction="left">
              <div>
                <SectionLabel text="Technology" />
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-5 leading-tight">
                  {t.tech_title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed mb-5 sm:mb-7">
                  {t.tech_desc}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-11 h-0.5 bg-[#0072BC] rounded" />
                  <div className="w-3.5 h-0.5 bg-yellow-400 rounded" />
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={100}>
              <div className="relative w-full mt-4 md:mt-0">
                <img
                  src={homeDiagnosisImg}
                  alt="Home diagnosis"
                  loading="lazy"
                  className="w-full h-auto rounded-2xl shadow-lg block"
                />
                <div className="absolute bottom-[-16px] sm:bottom-[-20px] left-3 sm:left-5
                                flex items-center gap-2 sm:gap-3
                                bg-[#050f24] px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl">
                  <Icon d={ICONS.zap} size={16} color="#f5c518" sw={2} />
                  <div>
                    <p className="text-white text-xs font-extrabold leading-none">AI-Powered</p>
                    <p className="text-xs mt-0.5 text-blue-200/80">Smart Diagnostics</p>
                  </div>
                </div>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* ── 6. TEAM ── */}
      <section className="bg-[#f4f7fb] py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-8 md:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">

            {/* Image */}
            <FadeIn direction="left">
              <div className="relative w-full">
                <img
                  src={teamImg}
                  alt="Yo Doctor Team"
                  loading="lazy"
                  className="w-full h-auto rounded-2xl shadow-lg block"
                />
              </div>
            </FadeIn>

            {/* Text */}
            <FadeIn direction="right" delay={100}>
              <div className="pt-8 sm:pt-10 md:pt-0">
                <SectionLabel text="Our Team" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-5 leading-tight">
                  {t.team_title}
                </h2>
                <p className="text-gray-600 text-base leading-relaxed mb-6 sm:mb-8">
                  {t.team_desc}
                </p>
                <Link
                  to="/service"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl
                             text-sm font-bold text-white bg-[#0072BC]
                             hover:bg-[#005fa3] transition-colors duration-200"
                >
                  Explore Our Services
                  <Icon d={ICONS.arrow} size={14} color="#fff" sw={2.2} />
                </Link>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      <style>{`@keyframes floatPhone{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}`}</style>
    </>
  );
};

export default About;