import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  ArrowRight,
  Shield,
  Home as HomeIcon,
  FileText,
  Star,
  Phone,
} from "lucide-react";
import TestCard from "./TestCard";
import { useEffect, useState } from "react";
import api from "../../services/api";

// ── Package card — 3 tiers, all buttons fully visible
function PackageCard({ pkg }) {
  const navigate = useNavigate();
  const discount = Math.round(((pkg.mrp - pkg.price) / pkg.mrp) * 100);

  const style = {
    essential: {
      heading: "text-[#2563EB]",
      badge: "bg-[#14B8A6] text-white",
      btn: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white",
      topBorder: "border-t-4 border-[#2563EB]",
    },
    advanced: {
      heading: "text-[#14B8A6]",
      badge: "bg-[#14B8A6] text-white",
      btn: "bg-[#14B8A6] hover:bg-[#0F766E] text-white",
      topBorder: "border-t-4 border-[#14B8A6]",
    },
    premium: {
      heading: "text-[#F59E0B]",
      badge: "bg-[#F59E0B] text-white",
      btn: "bg-[#F59E0B] hover:bg-[#D97706] text-white",
      topBorder: "border-t-4 border-[#F59E0B]",
    },
  }[pkg.tier];

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition flex flex-col overflow-hidden relative ${style.topBorder}`}
    >
      <div className="h-32 sm:h-36 overflow-hidden bg-gray-100">
        <img
          src={
            pkg.image?.startsWith("http")
              ? pkg.image
              : `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}${
                  pkg.image.startsWith("/") ? "" : "/"
                }${pkg.image}`
          }
          alt={pkg.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3
          className={`font-display font-bold text-lg sm:text-xl ${style.heading}`}
        >
          {pkg.name}
        </h3>
        <p className="text-sm text-[#64748B] mt-0.5 mb-3">{pkg.tagline}</p>
        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4 flex-wrap">
          <span className="font-display font-extrabold text-[#0F172A] text-2xl sm:text-3xl">
            ₹{Number(pkg.price).toFixed(0)}
          </span>
          <span className="text-[#94A3B8] text-sm line-through">
            ₹{Number(pkg.mrp).toFixed(0)}
          </span>
          <span className="bg-[#22C55E] text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {discount}% OFF
          </span>
        </div>

        {/* Highlights */}
        <ul className="space-y-2 mb-5 flex-1">
          <li>✔ Home Sample Collection</li>
          <li>✔ NABL Certified Labs</li>
          <li>✔ Digital Reports</li>
        </ul>

        {/* Button */}
        <button
          onClick={() => navigate(`/client/test/${pkg.id}`)}
          className={`w-full rounded-xl py-3 text-sm font-bold transition ${style.btn}`}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default function LabHome() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [tests, setTests] = useState([]);
  const topTests = tests.slice(0, 4);
  const [packages, setPackages] = useState([]);
  const mainPackages = packages.slice(0, 3);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, testRes, pkgRes] = await Promise.all([
        api.get("/patient/lab/categories"),
        api.get("/patient/lab/tests/popular"),
        api.get("/patient/lab/packages"),
      ]);

      setCategories(catRes.data.data || []);
      setTests(testRes.data.data || []);
      setPackages(pkgRes.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {/* ─────────── HERO (full-width, no side panel) ─────────── */}
      <section className="bg-gradient-to-br from-[#EEF2FF] via-[#F0F9FF] to-[#F8FAFC] py-2 sm:py-12 lg:py-16 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Hero text + image, balanced two-column on desktop */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            <div className="flex-1 w-full text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-full px-3 py-1.5 text-xs font-semibold text-[#0F172A] shadow-sm mb-4">
                <Shield size={13} className="text-[#2563EB]" />
                Trusted by 50,000+ Families
              </div>

              <h1 className="font-display font-extrabold text-[#0F172A] text-3xl sm:text-4xl md:text-5xl xl:text-6xl leading-tight">
                Book Lab Tests
                <br />
                <span className="text-[#2563EB]">from the Comfort</span>
                <br />
                <span className="text-[#2563EB]">of Home</span>
              </h1>

              <p className="text-[#64748B] text-sm sm:text-base md:text-lg mt-4 mb-6 max-w-xl mx-auto lg:mx-0">
                Accurate Reports &nbsp;·&nbsp; Affordable Prices &nbsp;·&nbsp;
                Home Sample Collection
              </p>

              {/* Search bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = e.target.elements.q.value.trim();
                  navigate(`/client/search?q=${encodeURIComponent(q)}`);
                }}
                className="flex items-center bg-white border-2 border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm focus-within:border-[#2563EB] transition w-full max-w-xl mx-auto lg:mx-0"
              >
                <Search
                  size={18}
                  className="ml-3 sm:ml-4 text-[#94A3B8] shrink-0"
                />
                <input
                  name="q"
                  type="text"
                  placeholder="Search tests, packages, checkups…"
                  className="flex-1 min-w-0 px-2.5 sm:px-3 py-3 sm:py-3.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-4 sm:px-5 py-3 sm:py-3.5 text-sm flex items-center gap-1.5 transition shrink-0"
                >
                  <Search size={15} />{" "}
                  <span className="hidden sm:inline">Search</span>
                </button>
              </form>

              {/* Trust pills */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-5">
                {[
                  {
                    icon: <HomeIcon size={13} />,
                    label: "Home Sample Collection",
                  },
                  { icon: <FileText size={13} />, label: "Accurate Reports" },
                  {
                    icon: <span className="text-xs font-bold">₹</span>,
                    label: "Affordable Prices",
                  },
                  { icon: <Star size={13} />, label: "Quick & Easy Booking" },
                ].map((t) => (
                  <span
                    key={t.label}
                    className="inline-flex items-center gap-1.5 bg-white border border-[#E2E8F0] rounded-full px-3 py-1.5 text-xs font-medium text-[#0F172A] shadow-sm"
                  >
                    <span className="text-[#2563EB]">{t.icon}</span> {t.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero image — visible from md up, scales width with viewport */}
            <div className="hidden md:block w-full md:w-full lg:w-100 xl:w-120 h-full shrink-0">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=700&q=80"
                  alt="Home sample collection"
                  className="rounded-2xl w-full h-56 md:h-64 lg:h-72 object-cover shadow-md"
                />
                <div className="absolute top-3 right-3 bg-white rounded-xl shadow px-3 py-2 text-xs font-semibold text-[#2563EB] flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#22C55E]" /> Lowest
                  Prices
                </div>
                <div className="absolute bottom-3 right-3 bg-white rounded-xl shadow px-3 py-2 text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                  <FileText size={13} className="text-[#2563EB]" /> Reports in
                  24–48 hrs
                </div>
              </div>
            </div>
          </div>

          {/* Category icon grid */}
          <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mt-8 sm:mt-10">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/client/search?category=${c.id}`}
                className="flex flex-col items-center bg-white border-2 border-[#E2E8F0] rounded-2xl p-2.5 sm:p-3 hover:border-[#2563EB] hover:bg-[#EEF2FF] transition text-center group"
              >
                <span className="text-xl sm:text-2xl mb-1">{c.icon}</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#64748B] group-hover:text-[#2563EB] leading-tight">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── PACKAGES ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
          <div>
            <h2 className="font-display font-bold text-[#0F172A] text-xl sm:text-2xl">
              Health Checkup Packages
            </h2>
            <p className="text-[#64748B] text-xs sm:text-sm mt-1">
              Comprehensive health checks at honest prices
            </p>
          </div>
          <Link
            to="/client/search?category=fullbody"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:underline shrink-0"
          >
            View All <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {mainPackages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </section>

      {/* ─────────── MOST BOOKED TESTS ─────────── */}
      <section className="bg-[#EEF2FF] py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
            <div>
              <h2 className="font-display font-bold text-[#0F172A] text-xl sm:text-2xl">
                Most Booked Tests
              </h2>
              <p className="text-[#64748B] text-xs sm:text-sm mt-1">
                Booked by thousands of families every month
              </p>
            </div>
            <Link
              to="/client/search"
              className="text-sm font-semibold text-[#2563EB] flex items-center gap-1 hover:underline shrink-0"
            >
              View All <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topTests.map((t) => (
              <TestCard key={t.id} item={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── FEATURE TILES ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[
            {
              icon: "💰",
              title: "Lowest Prices",
              desc: "No hidden charges. Transparent pricing on every test.",
            },
            {
              icon: "🏠",
              title: "Home Collection",
              desc: "Our team comes to your door, 7 days a week.",
            },
            {
              icon: "📋",
              title: "Accurate Reports",
              desc: "Precision-checked digital reports, delivered on time.",
            },
            {
              icon: "🔒",
              title: "100% Private",
              desc: "Your health data is encrypted and completely private.",
            },
          ].map((w) => (
            <div
              key={w.title}
              className="bg-white border-2 border-[#E2E8F0] rounded-2xl p-4 sm:p-5 text-center hover:border-[#2563EB] hover:shadow-md transition"
            >
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{w.icon}</div>
              <h3 className="font-display font-bold text-[#0F172A] text-sm sm:text-base mb-1">
                {w.title}
              </h3>
              <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed">
                {w.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── HELP CTA ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 sm:pb-12">
        <div className="bg-[#2563EB] rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h3 className="font-display font-bold text-white text-lg sm:text-xl mb-1">
              Not sure which test to book?
            </h3>
            <p className="text-blue-200 text-sm">
              Our advisors are available 7 days a week to guide you.
            </p>
          </div>
          <a
            href="tel:+919876543210"
            className="bg-white text-[#2563EB] font-bold rounded-xl px-5 sm:px-6 py-3 text-sm flex items-center gap-2 hover:bg-blue-50 transition shrink-0 w-full sm:w-auto justify-center"
          >
            <Phone size={16} /> Call +91 9277207339
          </a>
        </div>
      </section>
    </div>
  );
}
