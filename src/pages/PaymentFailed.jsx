import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
export default function PaymentFailed() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [xDone, setXDone] = useState(false);

  const location = useLocation();
const amount = location.state?.amount;

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setXDone(true), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff5f5] px-4 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-red-200 opacity-30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 rounded-full bg-rose-300 opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-orange-200 opacity-20 blur-2xl pointer-events-none" />

      {/* Card */}
      <div
        className={`relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-400 via-rose-500 to-orange-400" />

        <div className="px-8 pt-10 pb-8 flex flex-col items-center">
          {/* Animated X circle */}
          <div className="relative mb-7">
            {/* Outer pulse ring */}
            <div
              className={`absolute inset-0 rounded-full bg-red-100 transition-all duration-700 ${
                xDone ? "scale-125 opacity-0" : "scale-100 opacity-100"
              }`}
            />
            {/* Circle */}
            <div
              className={`w-[88px] h-[88px] rounded-full flex items-center justify-center transition-all duration-500 ${
                xDone ? "bg-red-500 shadow-lg shadow-red-200" : "bg-red-100"
              }`}
            >
              {/* X SVG with stroke animation */}
              <svg
                className="w-11 h-11"
                viewBox="0 0 44 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line
                  x1="12" y1="12" x2="32" y2="32"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="30"
                  strokeDashoffset={xDone ? "0" : "30"}
                  style={{ transition: "stroke-dashoffset 0.35s ease 0.3s" }}
                />
                <line
                  x1="32" y1="12" x2="12" y2="32"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="30"
                  strokeDashoffset={xDone ? "0" : "30"}
                  style={{ transition: "stroke-dashoffset 0.35s ease 0.5s" }}
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1
            className={`text-[1.65rem] font-extrabold text-gray-800 tracking-tight mb-2 transition-all duration-500 delay-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Payment Failed
          </h1>

          {/* Subtext */}
          <p
            className={`text-gray-400 text-[0.82rem] text-center leading-relaxed mb-7 transition-all duration-500 delay-[400ms] ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            We couldn't process your payment. <br />
            Please{" "}
            <span className="text-red-500 font-semibold">try again</span> or
            use a different method.
          </p>

          {/* Transaction Details */}
          <div
            className={`w-full rounded-2xl bg-[#fff8f8] border border-red-100 divide-y divide-red-50 mb-7 transition-all duration-500 delay-[500ms] ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <DetailRow label="Status">
              <span className="inline-flex items-center gap-1.5 text-red-500 font-semibold text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
                Failed
              </span>
            </DetailRow>
            <DetailRow label="Reason">
              <span className="text-gray-700 font-semibold text-sm">Payment Cancelled</span>
            </DetailRow>
            <DetailRow label="Amount">
              <span className="text-gray-800 font-bold text-sm tracking-wide">₹{amount || "-"}</span>
            </DetailRow>
            <DetailRow label="Date" last>
              <span className="text-gray-500 text-sm">
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </DetailRow>
          </div>

          {/* Buttons */}
          <div
            className={`w-full space-y-3 transition-all duration-500 delay-[600ms] ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <button
              onClick={() => navigate("/payment")}
              className="w-full py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white text-sm font-bold tracking-wide shadow-md shadow-red-200 transition-all duration-200"
            >
              Retry Payment
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 active:scale-[0.98] text-gray-500 text-sm font-medium tracking-wide transition-all duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Bottom note */}
        <div className="bg-[#fff8f8] border-t border-red-50 px-8 py-3.5 text-center">
          <p className="text-[0.72rem] text-gray-400">
            No amount was deducted. Need help?{" "}
            <span className="text-red-400 font-medium cursor-pointer hover:underline">
              Contact Support
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children, last }) {
  return (
    <div className={`flex justify-between items-center px-4 py-3`}>
      <span className="text-gray-400 text-sm font-normal">{label}</span>
      {children}
    </div>
  );
}