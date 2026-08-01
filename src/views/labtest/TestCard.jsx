import { Link } from "react-router-dom";
import { Clock, FlaskConical, Plus, CheckCircle2 } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function TestCard({ item }) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(item.id);
  const discount = item.mrp
    ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border-b-blue-700 shadow-card hover:shadow-cardHover transition flex flex-col overflow-hidden">
      {/* Image */}
      <div className="h-28 sm:h-32 bg-gray-100 overflow-hidden relative ">
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
        <span
          className={`absolute top-2 left-2 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border whitespace-nowrap`}
        >
          {item.tier}
        </span>
        <span className="absolute top-2 right-2 bg-[#22C55E] text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
          {discount}% OFF
        </span>
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <Link to={`/client/test/${item.id}`}>
          <h3 className="font-display font-semibold text-[#0F172A] text-sm leading-snug hover:text-[#2563EB] transition line-clamp-2">
            {item.name}
          </h3>
        </Link>
        <p className="text-xs text-[#64748B] mt-0.5 mb-2 line-clamp-1">
          {item.tagline}
        </p>

        <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-[#64748B] mb-3 flex-wrap">
          <span className="flex items-center gap-1">
            <FlaskConical size={12} className="text-[#2563EB] shrink-0" />
            {item.parameters} Params
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-[#2563EB] shrink-0" />
            {item.report_time}
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto gap-2 flex-wrap sm:flex-nowrap">
          <div className="min-w-0">
            <span className="font-display font-bold text-[#0F172A] text-base sm:text-lg">
              ₹{Number(item.price).toFixed(0)}
            </span>
            <span className="text-[11px] sm:text-xs text-[#94A3B8] line-through ml-1 sm:ml-1.5">
             ₹{Number(item.mrp).toFixed(0)}
            </span>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Link
              to={`/client/test/${item.id}`}
              className="text-[11px] sm:text-xs font-semibold text-[#2563EB] bg-[#EEF2FF] border border-[#2563EB] rounded-lg px-2 sm:px-2.5 py-1.5 hover:bg-[#2563EB] hover:text-white transition whitespace-nowrap"
            >
              View
            </Link>
            <button
              onClick={() => addItem(item)}
              disabled={inCart}
              className={`text-[11px] sm:text-xs font-bold rounded-lg px-2 sm:px-2.5 py-1.5 flex items-center gap-1 transition whitespace-nowrap ${
                inCart
                  ? "bg-[#22C55E] text-white cursor-default"
                  : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              }`}
            >
              {inCart ? <CheckCircle2 size={13} /> : <Plus size={13} />}
              {inCart ? "Added ✓" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
