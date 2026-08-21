import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import SEO from "../components/SEO";
import landingImage from "../assets/images/landingimg.webp";
import labTesting from "../assets/images/lab-test.png";
import medicineDelivery from "../assets/images/medicine_delivery.png";
import homecareservices from "../assets/images/home_care_services.png";
import image1 from "../assets/images/image1.png";
import image2 from "../assets/images/image2.png";
import qrBooking from "../assets/images/qr-booking.png";
import onlineBooking from "../assets/images/online-booking.png";
import certificate from "../assets/images/certificate.png";

const LandingPage = () => {
  const navigate = useNavigate();
  const { language, lang } = useLanguage();
  const t = lang[language];
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDoctors();
  }, []);
  const fetchDoctors = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/doctor/alldoctors`,
      );
      const data = await response.json();
      setDoctors(data?.doctors || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const raw =
      localStorage.getItem("loggedInUser") ||
      sessionStorage.getItem("loggedInUser");

    if (token && raw) {
      try {
        const user = JSON.parse(raw);
        if (user.role === "ADMIN")
          navigate("/admin/dashboard", { replace: true });
        else if (user.role === "PATIENT")
          navigate("/client/dashboard", { replace: true });
        else if (user.role === "DOCTOR")
          navigate("/doctordashboard", { replace: true });
      } catch {
        // corrupt data — ignore
      }
    }
  }, [navigate]);
  const heroCards = [

     {
      img: onlineBooking,
      label: t.onlinebooking || "Online Booking",
      sub: "Book from anywhere",
      link: "/clientloginpage?redirect=/client/book-appointment",
      tag: "ONLINE",
      tagBg: "bg-indigo-500",
      accentColor: "#6366F1",
    },
    {
      img: qrBooking,
      label: t.Qrcode || "QR Booking",
      sub: "Scan & Book Instantly",
      link: "/clientloginpage?redirect=/client/book-appointment?autoScan=true",
      tag: "FAST",
      tagBg: "bg-cyan-500",
      accentColor: "#00D4FF",
    },
   
    {
      img: certificate,
      label: t.Certificate || "Video Consult",
      sub: "Consult from home",
      link: "/clientloginpage?redirect=/client/certificatedoctors",
      tag: "VIDEO",
      tagBg: "bg-pink-500",
      accentColor: "#ec4899",
    },
     {
      img: labTesting,
      label: t.labTest || "Lab Tests",
      sub: "Sample Pickup at Your Door",
      link: "/clientloginpage?redirect=/client/lab-tests",
      tagBg: "bg-sky-500",
      tag: "HOME",
      accentColor: "#0099ee",
    },
   
    {
      img: homecareservices,
      label: t.booknurse || "Book Nurse",
      sub: "Care at your home",
      link: "/clientloginpage?redirect=/client/home-service-booking",
      tag: "HOME CARE",
      tagBg: "bg-green-500",
      accentColor: "#22c55e",
    },
    {
      img: medicineDelivery,
      label: t.medicine || "24/7 Medicines",
      sub: "Essentials at your doorstep",
      link: "/medicine",
      tagBg: "bg-amber-500",
      tag: "24 / 7",
      accentColor: "#f5a623",
    },
  ];

  return (
    <>
      <SEO
        title="Yo Doctor | Book Doctor Appointments Online"
        description="Book appointments with trusted doctors easily using our healthcare platform."
        keywords="doctor appointment, hospital, clinic booking"
        url="https://www.yodoctor.in/"
      />

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#060f1e 0%,#0c1e3a 45%,#0a3055 100%)",
        }}
      >
        {/* ── HERO INNER ── */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 px-6 sm:px-10 lg:px-20 pt-14 pb-8 flex-1">
          {/* LEFT */}
          <div className="w-full md:max-w-[560px] flex flex-col items-center md:items-start text-center md:text-left">
            {/* badge */}
            <div
              className="mt-10 animate-[fadeUp_0.6s_cubic-bezier(0.22,1,0.36,1)_both] inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest"
              style={{
                background: "rgba(0,182,216,0.12)",
                border: "1px solid rgba(0,182,216,0.3)",
                color: "#5dd8f5",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-[pulseDot_2s_infinite]" />
              Your Official Doctor
            </div>

            {/* title */}
            <h1
              className="animate-[fadeUp_0.7s_0.08s_cubic-bezier(0.22,1,0.36,1)_both] font-[family-name:var(--font-playfair)] text-white font-extrabold leading-[1.08] mb-5"
              style={{ fontSize: "clamp(36px,4.5vw,64px)" }}
            >
              {t.heroTitleLine1}
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#00d4ff 0%,#2ecc71 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t.heroTitleLine2}
              </span>
            </h1>

            {/* subtitle */}
            <p
              className="animate-[fadeUp_0.7s_0.14s_cubic-bezier(0.22,1,0.36,1)_both] text-[17px] leading-relaxed mb-9"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {t.heroSubtitle}{" "}
              <strong className="font-semibold" style={{ color: "#5dd8f5" }}>
                Yo Doctor
              </strong>
              .
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button
                onClick={() => navigate("/clientloginpage")}
                className="px-9 py-3.5 rounded-full font-[family-name:var(--font-dm)] font-bold text-[16px] text-white bg-green-600 cursor-pointer transition-all duration-300 hover:-translate-y-1"
              >
                {t.forPatient}
              </button>

              <button
                onClick={() => navigate("/doctorloginpage")}
                className="px-9 py-3.5 rounded-full font-[family-name:var(--font-dm)] font-bold text-[16px] text-white cursor-pointer transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
                style={{
                  background: "transparent",
                  border: "1.5px solid rgba(93,216,245,0.45)",
                }}
              >
                {t.forDoctor}
              </button>
            </div>
          </div>

          {/* RIGHT — doctor image */}
          <div className="hidden md:flex relative w-[600px] h-[400px] mt-10">
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              pagination={{ clickable: true }}
              loop={true}
              className="w-full h-full"
            >
              {Array.isArray(doctors) &&
                doctors.map((doctor) => (
                  <SwiperSlide key={doctor._id}>
                    <div
                      className="relative w-full h-full rounded-[32px] overflow-hidden border"
                      style={{
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.03)",
                        backdropFilter: "blur(20px)",
                      }}
                    >
                      <div className="w-full h-[60%] relative">
                        {doctor.profile_image ? (
                          <img
                            src={doctor.profile_image}
                            alt={doctor.doctorName || "Doctor"}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling.style.display =
                                "flex";
                            }}
                            className="w-full h-full object-cover"
                          />
                        ) : null}

                        {/* Fallback */}
                        <div
                          className={`absolute inset-0 bg-[#10213d] items-center justify-center ${
                            doctor.profile_image ? "hidden" : "flex"
                          }`}
                        >
                          <div className="w-28 h-28 rounded-full bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                            <span className="text-5xl font-bold text-cyan-300">
                              {doctor.doctorName
                                ?.replace(/^dr\.?\s*/i, "")
                                ?.trim()
                                ?.charAt(0)
                                ?.toUpperCase() || "D"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 text-white">
                        <h2 className="text-2xl font-bold">
                          {doctor.doctorName}
                        </h2>

                        <p className="text-cyan-300 mt-1">
                          {doctor.specialization}
                        </p>

                        <div className="flex justify-between mt-4 text-sm">
                          <span>⭐ {doctor.rating}</span>
                          <span> Doctor Of The Month 🏆</span>
                        </div>
                        <div className="flex justify-between mt-4 text-sm">
                          <span>{doctor.experience_years} Years Exp.</span>
                        </div>

                        <div className="mt-4 inline-block px-4 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-semibold"></div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
            </Swiper>
          </div>
        </div>

        {/* ── SERVICES SECTION ── */}
        <div className="relative z-10 px-6 sm:px-10 lg:px-20 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 md:gap-10 mb-5 px-10 sm:px-0">
              {heroCards.map((card, i) => (
                <Link
                  key={i}
                  to={card.link}
                  className="group relative rounded-[16px] sm:rounded-[28px] p-4 sm:p-7 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl min-h-[160px] sm:min-h-[300px] md:min-h-[380px]"
                  style={{ background: card.accentColor }}
                >
                  {/* TEXT */}
                  <div>
                    <h2 className="text-white font-bold text-[15px] sm:text-[24px] md:text-[28px] leading-tight mb-1">
                      {card.label}
                    </h2>
                    {card.sub && (
                      <p className="text-white/80 text-[18px] sm:text-[14px] md:text-[18px]">
                        {card.sub}
                      </p>
                    )}
                  </div>

                  {/* IMAGE */}
                  <img
                    src={card.img}
                    alt={card.label}
                    className="absolute bottom-0 right-0 w-[40%] sm:w-[55%] object-contain pointer-events-none select-none"
                  />

                  {/* ARROW BUTTON */}
                  <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden md:flex justify-center items-center  py-16">
          <div className="w-full max-w-6xl h-[600px]">
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              pagination={{ clickable: true }}
              loop={true}
              className="w-full  rounded-4xl overflow-hidden "
            >
              <SwiperSlide className="flex items-center justify-center">
                <img
                  src={image1}
                  alt="YoDoctor Banner"
                  className="w-full h-full object-contain"
                />
              </SwiperSlide>

              <SwiperSlide className="flex items-center justify-center">
                <img
                  src={image2}
                  alt="YoDoctor Banner"
                  className="w-full h-full object-contain"
                />
              </SwiperSlide>
            </Swiper>
          </div>
        </div>

        <style>{`
          @keyframes cardFloat {
            from { transform: translateY(0px); }
            to   { transform: translateY(-8px); }
          }
        `}</style>
      </section>
    </>
  );
};

export default LandingPage;
