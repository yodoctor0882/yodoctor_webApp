import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  FlaskConical,
  ShieldCheck,
  Home as HomeIcon,
  CheckCircle2,
  Plus,
  Check,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function TestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTest();
  }, [id]);

  const fetchTest = async () => {
    try {
      const res = await api.get(`/patient/lab/tests/${id}`);

      setItem(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (!item)
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
        <div className="text-5xl sm:text-6xl mb-4">😕</div>
        <h1 className="font-display font-bold text-[#0F172A] text-lg sm:text-xl mb-2">
          Test not found
        </h1>
        <Link
          to="/search"
          className="text-[#2563EB] font-semibold text-sm hover:underline"
        >
          ← Back to Search
        </Link>
      </div>
    );

  const inCart = isInCart(item.id);
  const discount =
    item.mrp > 0 ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-28 sm:pb-32 ">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-[#64748B] mb-4 sm:mb-5 hover:text-[#0F172A] "
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Hero image */}
      <div className="h-44 sm:h-56 md:h-64 rounded-2xl overflow-hidden mb-5 sm:mb-6 relative shadow-card">
       <img
  src={
    item.image?.startsWith("http")
      ? item.image
      : `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}${
          item.image.startsWith("/") ? "" : "/"
        }${item.image}`
  }
  alt={item.name}
  className="w-full h-full object-cover"
/>
        <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
        <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-5 right-4 sm:right-5">
          <span className="bg-blue-100 text-blue-700 text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-1 rounded-full">
            {item.tier}
          </span>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 md:p-6 shadow-card">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="font-display font-bold text-[#0F172A] text-lg sm:text-xl md:text-2xl leading-snug">
            {item.name}
          </h1>
          <span className="bg-[#22C55E]/10 text-[#22C55E] text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
            {discount}% OFF
          </span>
        </div>
        <p className="text-[#64748B] text-sm mb-4">{item.tagline}</p>

        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-[#64748B] mb-5">
          <span className="flex items-center gap-1.5 bg-[#F8FAFC] rounded-full px-2.5 sm:px-3 py-1.5">
            <FlaskConical size={14} className="text-[#2563EB] shrink-0" />
            {item.parameters} Parameters
          </span>
          <span className="flex items-center gap-1.5 bg-[#F8FAFC] rounded-full px-2.5 sm:px-3 py-1.5">
            <Clock size={14} className="text-[#2563EB] shrink-0" />
            Reports in {item.report_time}
          </span>
          <span className="flex items-center gap-1.5 bg-[#F8FAFC] rounded-full px-2.5 sm:px-3 py-1.5">
            <HomeIcon size={14} className="text-[#2563EB] shrink-0" />
            Free Home Pickup
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-5 flex-wrap">
          <span className="font-display font-extrabold text-[#0F172A] text-2xl sm:text-3xl">
            ₹{Number(item.price).toFixed(0)}
          </span>
          <span className="text-[#94A3B8] text-sm sm:text-base line-through">
            ₹{Number(item.mrp).toFixed(0)}
          </span>
          <span className="text-[#22C55E] text-sm font-semibold">
            Save ₹{item.mrp - item.price}
          </span>
        </div>

        {/* Info chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-6">
          {[
            { icon: <ShieldCheck size={18} />, label: "NABL Certified Labs" },
            { icon: <HomeIcon size={18} />, label: "Free Home Sample Pickup" },
            { icon: <Clock size={18} />, label: item.fasting },
          ].map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-2 bg-[#EEF2FF] rounded-xl px-3 py-2.5 text-xs font-medium text-[#0F172A]"
            >
              <span className="text-[#2563EB] shrink-0">{c.icon}</span>
              {c.label}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="font-display font-bold text-[#0F172A] mb-2 text-base sm:text-lg">
            About This Test
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            {item.description}
          </p>
        </div>

        <div>
          <h2 className="font-display font-bold text-[#0F172A] mb-3 text-base sm:text-lg">
            Includes {item.includes?.length || 0} Test
            {(item.includes?.length || 0) > 1 ? "s" : ""}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {item.includes?.map((inc) => (
              <li
                key={inc.include_name}
                className="flex items-center gap-2 text-sm text-[#0F172A] bg-[#F8FAFC] rounded-xl px-3 py-2.5"
              >
                <CheckCircle2 size={14} className="text-[#22C55E] shrink-0" />
                {inc.include_name}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => addItem(item)}
            disabled={inCart}
            className={`text-xs sm:text-sm font-semibold rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1.5 border-2 transition whitespace-nowrap ${inCart ? "bg-[#22C55E] text-white border-[#22C55E] cursor-default" : "bg-white text-[#2563EB] border-[#2563EB] hover:bg-[#EEF2FF]"}`}
          >
            {inCart ? <Check size={15} /> : <Plus size={15} />}
            <span className="hidden xs:inline">
              {inCart ? "Added" : "Add to Cart"}
            </span>
          </button>
          <button
            onClick={() => {
              addItem(item);
              navigate("/client/cart");
            }}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 transition whitespace-nowrap"
          >
            Book Now
          </button>
        </div>
      </div>

    </div>
  );
}
