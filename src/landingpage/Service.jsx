import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";

import onlinebookingImg from "../assets/images/online_appointment_booking.webp";
import VideoconsultationImg from "../assets/images/video_consultation_telemedicine.webp";
import inclinicConsultationImg from "../assets/images/in_clinic_consultation.webp";
import doctorprofilesImg from "../assets/images/doctor_profiles.webp";
import specialitiesdepartmentsImg from "../assets/images/specialities_departments.webp";
import treatmentofferedImg from "../assets/images/treatment_offered.webp";
import viewlabreportImg from "../assets/images/view_lab_report.webp";
import prescriptionmanagementImg from "../assets/images/prescription_management.webp";
import healthpackageImg from "../assets/images/health_package.webp";
import homecareserviceImg from "../assets/images/home_care_service.webp";
import SEO from "../components/SEO";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import banner1 from "../assets/images/onlinebookappointment.png";
import banner2 from "../assets/images/medical_certificate.png";
import banner3 from "../assets/images/labtest.png";
import banner4 from "../assets/images/homecare_services.png";

const Icon = ({ d, size = 18, color = "#0072BC" }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke={color}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  video:
    "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",
  clinic:
    "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  doctor:
    "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  heart:
    "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  shield:
    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  lab: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  doc: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  check:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  search: "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  appt: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  consult:
    "M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z",
  care: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  verified:
    "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  privacy:
    "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  support:
    "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
  price:
    "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  rating:
    "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
};

/* ── Service Card ─────────────────────────────────────── */
const ServiceCard = ({ img, title, desc, iconKey, expanded, onToggle }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex flex-col w-full h-full bg-white rounded-2xl overflow-hidden"
      style={{
        boxShadow: hovered
          ? "0 20px 48px rgba(0,114,188,0.16)"
          : "0 2px 16px rgba(0,0,0,0.07)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "box-shadow 0.3s, transform 0.3s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 160 }}>
        <img
          src={img}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover"
          style={{
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.5s",
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2 justify-between">
        <h3
          className="font-bold text-base leading-snug"
          style={{
            color: hovered ? "#0072BC" : "#1a2e44",
            transition: "color 0.2s",
          }}
        >
          {title}
        </h3>

        <p
          className="text-sm text-gray-600 leading-relaxed flex-1 overflow-hidden transition-all duration-300"
          style={{
            maxHeight: expanded ? "500px" : "96px",
          }}
        >
          {desc}
        </p>

        {desc.length > 80 && (
          <button
            onClick={onToggle}
            className="flex items-center gap-1 text-xs font-bold mt-1 w-fit"
            style={{ color: "#0072BC" }}
          >
            {expanded ? "Show Less" : "Read More"}
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Process Steps ────────────────────────────────────── */
const processSteps = [
  {
    num: "01",
    iconKey: "search",
    title: "Find a Doctor",
    desc: "Browse verified doctor profiles by speciality, location, or availability. Read reviews and choose the right doctor for your needs.",
  },
  {
    num: "02",
    iconKey: "appt",
    title: "Book Appointment",
    desc: "Schedule an in-clinic visit or video consultation instantly. Pick a time slot that suits you — no waiting in queues.",
  },
  {
    num: "03",
    iconKey: "consult",
    title: "Consult & Diagnose",
    desc: "Get professional medical advice, diagnosis, and prescriptions from certified doctors — from the comfort of your home or clinic.",
  },
  {
    num: "04",
    iconKey: "care",
    title: "Follow-up Care",
    desc: "Access your lab reports, prescriptions, and health packages anytime. Avail home care services and stay on track with your health.",
  },
];

/* ── Why Choose Data ──────────────────────────────────── */
const whyChoose = [
  {
    iconKey: "verified",
    title: "Verified Doctors",
    desc: "All doctors on Yo Doctor are thoroughly verified with valid credentials and years of experience.",
  },
  {
    iconKey: "clock",
    title: "24/7 Availability",
    desc: "Book appointments anytime — our platform is available round the clock for your convenience.",
  },
  {
    iconKey: "privacy",
    title: "Data Privacy",
    desc: "Your health records and personal data are encrypted and kept completely confidential.",
  },
  {
    iconKey: "support",
    title: "Dedicated Support",
    desc: "Our support team is always ready to assist you with bookings, reports, or any query you have.",
  },
  {
    iconKey: "price",
    title: "Transparent Pricing",
    desc: "No hidden charges. See consultation fees upfront and choose plans that fit your budget.",
  },
  {
    iconKey: "rating",
    title: "Trusted by Patients",
    desc: "Thousands of patients trust Yo Doctor for reliable, high-quality healthcare services every day.",
  },
];

/* ── Why Card ─────────────────────────────────────────── */
const WhyCard = ({ iconKey, title, desc }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex flex-col gap-3 p-5 rounded-2xl transition-all duration-300 cursor-default"
      style={{
        background: hovered ? "#0072BC" : "#f4f7fb",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 16px 40px rgba(0,114,188,0.2)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: "100%",
          height: 3,
          borderRadius: 2,
          background: hovered ? "rgba(255,255,255,0.3)" : "#0072BC",
          marginBottom: 4,
        }}
      />
      <div
        className="flex items-center justify-center rounded-xl"
        style={{
          width: 48,
          height: 48,
          background: hovered
            ? "rgba(255,255,255,0.15)"
            : "rgba(0,114,188,0.1)",
          flexShrink: 0,
        }}
      >
        <Icon
          d={ICONS[iconKey]}
          size={22}
          color={hovered ? "#fff" : "#0072BC"}
        />
      </div>
      <h3
        className="font-bold text-base leading-snug"
        style={{
          color: hovered ? "#ffffff" : "#1a2e44",
          transition: "color 0.2s",
        }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{
          color: hovered ? "rgba(220,235,255,0.9)" : "#4b5563",
          transition: "color 0.2s",
        }}
      >
        {desc}
      </p>
    </div>
  );
};

/* ══════════════════════════════════════════════════════ */
const Service = () => {
  const { language, lang } = useLanguage();
  const t = lang[language];
  const [expandedCard, setExpandedCard] = useState(null);

  const services = [
    {
      img: onlinebookingImg,
      title: t.online_booking_title,
      desc: t.online_booking_desc,
      iconKey: "calendar",
    },
    {
      img: inclinicConsultationImg,
      title: t.clinic_consult_title,
      desc: t.clinic_consult_desc,
      iconKey: "clinic",
    },
    {
      img: doctorprofilesImg,
      title: t.doctor_profile_title,
      desc: t.doctor_profile_desc,
      iconKey: "doctor",
    },
    {
      img: specialitiesdepartmentsImg,
      title: t.specialties_title,
      desc: t.specialties_desc,
      iconKey: "heart",
    },
    {
      img: treatmentofferedImg,
      title: t.treatment_title,
      desc: t.treatment_desc,
      iconKey: "shield",
    },
    {
      img: viewlabreportImg,
      title: t.lab_report_title,
      desc: t.lab_report_desc,
      iconKey: "lab",
    },
    {
      img: prescriptionmanagementImg,
      title: t.prescription_title,
      desc: t.prescription_desc,
      iconKey: "doc",
    },
    {
      img: homecareserviceImg,
      title: t.home_care_title,
      desc: t.home_care_desc,
      iconKey: "home",
    },
  ];

  return (
    <>
      <SEO
        title="Healthcare Services | Yo Doctor"
        description="Explore healthcare services like online doctor appointment booking, video consultation, in-clinic consultation, lab reports, prescriptions, and home care services."
        keywords="online doctor booking, video consultation, clinic consultation, health packages, home care services"
        url="https://www.yodoctor.in/services"
      />

{/* ── Hero Image Slider ──────────────────────────────── */}
<div className="relative w-full overflow-hidden bg-[#eaeef4] ">
  <Swiper
    modules={[Autoplay, Pagination]}
    spaceBetween={0}
    slidesPerView={1}
    loop={true}
    autoplay={{
      delay: 3500,
      disableOnInteraction: false,
    }}
    pagination={{
      clickable: true,
    }}
    className="max-w-7xl mx-auto mt-18 rounded-2xl"
  >
    {/* Slide 1 */}
    <SwiperSlide>
     <div className=" mx-auto">
        <img
          src={banner1}
          alt="YoDoctor Healthcare Services"
          className="block w-full h-[280px] sm:h-[320px] md:h-[380px] lg:h-[430px] "
        />
      </div>
    </SwiperSlide>

    {/* Slide 2 */}
    <SwiperSlide>
      <div className="w-full">
        <img
          src={banner2}
          alt="YoDoctor Healthcare Services"
          className="block w-full h-[280px] sm:h-[320px] md:h-[380px] lg:h-[430px]"
        />
      </div>
    </SwiperSlide>

    {/* Slide 3 */}
    <SwiperSlide>
      <div className="w-full">
        <img
          src={banner3}
          alt="YoDoctor Healthcare Services"
          className="block w-full h-[280px] sm:h-[320px] md:h-[380px] lg:h-[430px]"
        />
      </div>
    </SwiperSlide>

    {/* Slide 4 */}
    <SwiperSlide>
      <div className="w-full">
        <img
          src={banner4}
          alt="YoDoctor Healthcare Services"
          className="block w-full h-[280px] sm:h-[320px] md:h-[380px] lg:h-[430px]"
        />
      </div>
    </SwiperSlide>
  </Swiper>
</div>

      {/* ── Services Grid ────────────────────────────── */}
      <section style={{ background: "#eef3fb", padding: "56px 0 72px" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12">
          {/* Section header */}
          <div className="flex items-stretch gap-4 mb-8 sm:mb-10">
            <div
              style={{
                width: 4,
                background: "#0072BC",
                borderRadius: 4,
                flexShrink: 0,
              }}
            />
            <div>
              <p
                className="text-xs font-extrabold uppercase tracking-widest mb-0.5"
                style={{ color: "#0072BC" }}
              >
                What We Offer
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
                Explore Our Healthcare Services
              </h2>
            </div>
          </div>

          {/*
            Mobile  : 1 col
            sm(640) : 2 cols
            md(768) : 2 cols
            lg(1024): 3 cols
            xl(1280): 4 cols
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 items-stretch">
            {services.map((s, i) => (
              <ServiceCard
                key={i}
                {...s}
                expanded={expandedCard === i}
                onToggle={() => setExpandedCard(expandedCard === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section style={{ background: "#f8faff", padding: "64px 0 72px" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12">
          <div className="text-center mb-10 sm:mb-14">
            <p
              className="font-extrabold uppercase tracking-widest mb-2 text-sm"
              style={{ color: "#0072BC" }}
            >
              How It Works
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
              Our Simple Healthcare Process
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed px-2">
              Getting quality healthcare has never been easier. Follow these
              four steps to connect with the right doctor.
            </p>
          </div>

          {/*
            Mobile  : 1 col (stacked cards, no connector line)
            md(768) : 2 cols
            lg(1024): 4 cols (with connector line)
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 relative">
            {/* Horizontal connector line — desktop only */}
            <div
              className="hidden lg:block absolute h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, #0072BC44, #0072BC44, transparent)",
                top: 52,
                left: "6%",
                right: "6%",
              }}
            />

            {processSteps.map((step, i) => (
              <div
                key={i}
                className="relative flex flex-col rounded-2xl p-5 sm:p-6"
                style={{
                  background: "#ffffff",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                }}
              >
                <span
                  className="font-black mb-3 leading-none select-none"
                  style={{
                    fontSize: "2rem",
                    color: "rgba(0,0,0,0.1)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {step.num}
                </span>
                <div
                  className="flex items-center justify-center rounded-xl mb-4"
                  style={{
                    width: 48,
                    height: 48,
                    background: "rgba(0,114,200,0.08)",
                    flexShrink: 0,
                  }}
                >
                  <Icon d={ICONS[step.iconKey]} size={22} color="#0072BC" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900">
                  {step.title}
                </h3>
                <div
                  style={{
                    width: 28,
                    height: 2,
                    background: "#0072BC",
                    borderRadius: 2,
                    marginBottom: 10,
                  }}
                />
                <p className="text-sm leading-relaxed text-gray-600">
                  {step.desc}
                </p>

                {/* Arrow connector — desktop only, not last */}
                {i < processSteps.length - 1 && (
                  <div
                    className="hidden lg:flex absolute -right-3 top-12 w-6 h-6 rounded-full items-center justify-center z-10"
                    style={{ background: "#0072BC" }}
                  >
                    <svg
                      width="10"
                      height="10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#fff"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose ───────────────────────────────── */}
      <section style={{ background: "#ffffff", padding: "64px 0 80px" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12">
          <div className="text-center mb-10 sm:mb-14">
            <p
              className="font-extrabold uppercase tracking-widest mb-2 text-sm"
              style={{ color: "#0072BC" }}
            >
              Our Strengths
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
              Why Choose <span className="text-blue-500 ">Yo</span>{" "}
              <span className="text-green-500"> Doctor</span> ?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed px-2">
              We combine technology and compassion to deliver healthcare that
              puts patients first.
            </p>
          </div>

          {/*
            Mobile  : 1 col
            sm(640) : 2 cols
            lg(1024): 3 cols
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-8">
            {whyChoose.map((item, i) => (
              <WhyCard key={i} {...item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Service;
