import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  ArrowLeft,
  ShoppingCart,
  Tag,
  Clock,
  FlaskConical,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const { items, removeItem, subtotal, mrpTotal, savings } = useCart();
  const navigate = useNavigate();

  if (items.length === 0)
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-primary-light/40">
          <ShoppingCart
            size={30}
            className="text-primary-DEFAULT sm:w-9 sm:h-9"
          />
        </div>
        <h1 className="font-display font-bold text-dark text-xl sm:text-2xl mb-2">
          Your cart is empty
        </h1>
        <p className="text-muted text-sm mb-7">
          Browse our tests and add one to get started.
        </p>
        <Link
          to="/client/search"
          className="bg-primary-DEFAULT hover:bg-primary-hover text-white font-semibold rounded-xl px-7 py-3 text-sm transition inline-block shadow-card"
        >
          Browse Tests
        </Link>
      </div>
    );

  const savingsPct = Math.round((savings / mrpTotal) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-32 lg:pb-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted mb-4 sm:mb-5 hover:text-dark transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h1 className="font-display font-bold text-dark text-xl sm:text-2xl">
          My Cart{" "}
          <span className="text-muted font-normal text-base sm:text-lg">
            ({items.length} item{items.length > 1 ? "s" : ""})
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const itemSavingsPct = Math.round(
              ((item.mrp - item.price) / item.mrp) * 100,
            );
            return (
              <div
                key={item.id}
                className="group bg-white border border-border rounded-2xl p-3 sm:p-4 shadow-card hover:shadow-lg hover:border-primary-DEFAULT/30 transition-all relative overflow-hidden"
              >
                {itemSavingsPct > 0 && (
                  <span className="absolute top-0 right-0 text-[10px] sm:text-[11px] font-bold text-white bg-[#22C55E] rounded-bl-xl px-2.5 py-1">
                    {itemSavingsPct}% OFF
                  </span>
                )}
                <div className="flex gap-3 sm:gap-4">
                  <img
                    src={
                      item.image?.startsWith("http")
                        ? item.image
                        : `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}${
                            item.image.startsWith("/") ? "" : "/"
                          }${item.image}`
                    }
                    alt={item.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 bg-primary-light ring-1 ring-border"
                  />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <Link
                      to={`/client/test/${item.id}`}
                      className="font-display font-semibold text-dark text-sm sm:text-[15px] hover:text-primary-DEFAULT line-clamp-2 transition-colors pr-6"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] sm:text-xs text-muted bg-gray-50 rounded-md px-1.5 py-0.5">
                        <FlaskConical
                          size={12}
                          className="text-primary-DEFAULT"
                        />{" "}
                        {item.parameters} Parameters
                      </span>
                      <span className="flex items-center gap-1 text-[11px] sm:text-xs text-muted bg-gray-50 rounded-md px-1.5 py-0.5">
                        <Clock size={12} className="text-primary-DEFAULT" />{" "}
                        {item.reportTime}
                      </span>
                    </div>
                    <div className="mt-auto pt-2 flex items-end justify-between gap-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display font-bold text-dark text-base sm:text-lg">
                          ₹{Number(item.price).toFixed(0)}
                        </span>
                        <span className="text-[11px] sm:text-xs text-placeholder line-through">
                          ₹{Number(item.mrp).toFixed(0)}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="flex items-center gap-1 text-placeholder hover:text-error hover:bg-error/5 transition rounded-lg px-2 py-1 text-[11px] sm:text-xs font-medium shrink-0"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <Link
            to="/client/search"
            className="flex items-center justify-center gap-2 text-sm font-semibold text-primary-DEFAULT border-2 border-dashed border-primary-DEFAULT/40 rounded-2xl py-3.5 sm:py-4 hover:bg-primary-light hover:border-primary-DEFAULT transition"
          >
            <Plus size={16} /> Add More Tests
          </Link>
        </div>

        {/* Price summary */}
        <div className="bg-white border border-border rounded-2xl p-4 sm:p-5 shadow-card lg:sticky lg:top-6">
          <h2 className="font-display font-bold text-dark mb-4 text-sm sm:text-base">
            Price Summary
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted">
              <span>Total MRP</span>
              <span>₹{mrpTotal}</span>
            </div>
            <div className="flex justify-between text-[#22C55E] font-semibold">
              <span>You Save</span>
              <span>– ₹{savings}</span>
            </div>
            {savingsPct > 0 && (
              <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#22C55E] rounded-xl px-3 py-2 text-xs text-[#16A34A] font-semibold">
                <Tag size={13} className="shrink-0" /> Great deal! You're saving{" "}
                {savingsPct}% on this order.
              </div>
            )}
            <div className="border-t border-border pt-3 flex justify-between font-display font-bold text-dark text-base sm:text-lg">
              <span>Total Payable</span>
              <span>₹{subtotal}</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/client/booking")}
            className="hidden lg:block bg-blue-800 text-white font-bold rounded-xl px-6 py-3 text-sm w-full mt-6 hover:bg-blue-900 transition cursor-pointer"
          >
            Proceed to Book Slot →
          </button>
        </div>
      </div>

      {/* Sticky mobile checkout bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border p-3 sm:p-4 flex items-center gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-20">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted leading-tight">Total Payable</p>
          <p className="font-display font-bold text-dark text-base leading-tight">
            ₹{subtotal}
          </p>
        </div>
        <button
          onClick={() => navigate("/client/booking")}
          className="bg-blue-800 text-white font-bold rounded-xl px-6 py-3 text-sm hover:bg-blue-900 transition cursor-pointer shrink-0"
        >
          Book Slot →
        </button>
      </div>
    </div>
  );
}
