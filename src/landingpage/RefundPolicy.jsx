import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Receipt,
  Wallet,
  ShieldCheck,
  Menu,
  ChevronDown,
  Info,
  CalendarX,
  UserX,
  FlaskConical,
  AlertTriangle,
  Copy,
  Clock,
  Ban,
  LifeBuoy,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Brand color system (as supplied)                                   */
/*  Primary Blue      #2563EB -> blue-600 / hover blue-700             */
/*  Secondary Teal     #14B8A6 -> teal-500 / hover teal-700             */
/*  Dark Text          #0F172A -> slate-900                            */
/*  Main Background    #F8FAFC -> slate-50                             */
/*  Card Background    #FFFFFF -> white                                */
/*  Light Section Bg   #EEF2FF -> indigo-50                            */
/*  Success #22C55E green-500 · Warning #F59E0B amber-500               */
/*  Error   #EF4444 red-500   · Info    #06B6D4 cyan-500                */
/*  Border  #E2E8F0 slate-200 · Light Text #64748B slate-500            */
/*  Placeholder #94A3B8 slate-400                                       */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Small shared bits                                                   */
/* ------------------------------------------------------------------ */

const Dot = () => (
  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
);

const Bullets = ({ items }) => (
  <ul className="mb-4 flex flex-col gap-2">
    {items.map((item, i) => (
      <li
        key={i}
        className="flex items-start gap-3 leading-relaxed text-slate-500"
      >
        <Dot />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const Stamp = ({ children, tone = "error" }) => {
  const tones = {
    error: "border-red-500 text-red-600",
    success: "border-green-500 text-green-600",
    warning: "border-amber-500 text-amber-600",
  };
  return (
    <span
      className={`inline-block shrink-0 rounded-md border-2 px-2 py-0.5 text-[11px] font-black uppercase tracking-widest ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const Callout = ({ children, tone = "warning" }) => {
  const tones = {
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-green-200 bg-green-50 text-green-800",
  };
  return (
    <div
      className={`mt-2 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold ${tones[tone]}`}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Content model                                                      */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  {
    id: "introduction",
    icon: Info,
    title: "Introduction",
    body: (
      <p className="leading-relaxed text-slate-500">
        Yodoctor is committed to providing quality, reliable healthcare
        services. We follow a clear and transparent refund policy so you always
        know what to expect when a booking, order, or payment doesn't go as
        planned. This policy explains when refunds apply, how they are
        processed, and what services are non-refundable.
      </p>
    ),
  },
  {
    id: "appointment-cancellation",
    icon: CalendarX,
    title: "Appointment Cancellation",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          You may cancel a scheduled appointment before your consultation
          begins. Whether a refund applies depends on:
        </p>
        <Bullets
          items={[
            "How far in advance the appointment is cancelled",
            "Whether the doctor has already confirmed the appointment",
            "The type of consultation booked (video, in-clinic, chat)",
          ]}
        />
        <Callout tone="error">
          <Stamp tone="error">No refund</Stamp>
          <span>
            Once the doctor has started the consultation, the fee is not
            refundable.
          </span>
        </Callout>
      </>
    ),
  },
  {
    id: "doctor-cancellation",
    icon: UserX,
    title: "Doctor Cancellation",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          If a doctor cancels or is unable to attend a confirmed appointment,
          you can choose between:
        </p>
        <Bullets
          items={[
            "A full refund of the consultation fee, or",
            "Rescheduling to another available slot at no extra cost",
          ]}
        />
        <Callout tone="success">
          <Stamp tone="success">Your choice</Stamp>
          <span>
            The decision is entirely yours — refund or reschedule, no penalty
            either way.
          </span>
        </Callout>
      </>
    ),
  },
  {
    id: "lab-test-refunds",
    icon: FlaskConical,
    title: "Lab Test Refunds",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          Refunds for lab test bookings are available only when:
        </p>
        <Bullets
          items={[
            "Your sample has not yet been collected, or",
            "The booking is cancelled before processing begins",
          ]}
        />
        <Callout tone="error">
          <Stamp tone="error">No refund</Stamp>
          <span>
            Once a sample has been collected, the booking is closed for refund.
          </span>
        </Callout>
      </>
    ),
  },
  {
    id: "payment-failures",
    icon: AlertTriangle,
    title: "Payment Failures",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          If an amount is deducted from your account but your booking or order
          is not confirmed, the amount is automatically refunded to your
          original payment method.
        </p>
        <p className="leading-relaxed text-slate-500">
          If you don't see the refund within the timelines listed below, please
          contact our support team with your transaction details.
        </p>
      </>
    ),
  },
  {
    id: "duplicate-payments",
    icon: Copy,
    title: "Duplicate Payments",
    body: (
      <p className="leading-relaxed text-slate-500">
        If you accidentally make more than one payment for the same booking, the
        extra amount will be refunded once we've verified the duplicate
        transaction against your booking history.
      </p>
    ),
  },
  {
    id: "refund-processing-time",
    icon: Clock,
    title: "Refund Processing Time",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          Approved refunds are always issued back to the original payment method
          used for the transaction. Estimated timelines are:
        </p>
        <div
          role="table"
          aria-label="Refund processing timelines by payment method"
          className="overflow-hidden rounded-xl border border-slate-200"
        >
          <div
            role="row"
            className="grid grid-cols-[1fr_auto] gap-4 bg-indigo-50 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-500"
          >
            <span role="columnheader">Payment method</span>
            <span role="columnheader">Estimated time</span>
          </div>
          <div className="divide-y divide-slate-200">
            {[
              ["UPI", "2–5 business days"],
              ["Credit / Debit Card", "5–10 business days"],
              ["Net Banking", "5–10 business days"],
              ["Wallets", "2–5 business days"],
            ].map(([method, time]) => (
              <div
                role="row"
                key={method}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3"
              >
                <span role="cell" className="font-medium text-slate-700">
                  {method}
                </span>
                <span
                  role="cell"
                  className="whitespace-nowrap rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600"
                >
                  {time}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-400">
          Actual crediting time may vary depending on your bank or payment
          provider's own processing schedule.
        </p>
      </>
    ),
  },
  {
    id: "non-refundable-services",
    icon: Ban,
    title: "Non-Refundable Services",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          The following are not eligible for a refund once completed:
        </p>
        <ul className="flex flex-col gap-2.5">
          {[
            "Completed consultations",
            "Downloaded digital prescriptions or reports",
            "Medical certificates already issued",
            "Services that have already been rendered",
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <Stamp tone="error">Void</Stamp>
              <span className="text-slate-500">{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "contact-support",
    icon: LifeBuoy,
    title: "Contact Support",
    body: (
      <>
        <p className="mb-4 leading-relaxed text-slate-500">
          Need help with a refund? Our support team is ready to assist.
        </p>
        <ul className="flex flex-col gap-3">
          <li className="flex items-center gap-2.5">
            <Mail size={16} className="shrink-0 text-blue-600" />
            <a
              href="mailto:founder@yodoctor.in"
              className="font-semibold text-blue-600 hover:underline"
            >
              founder@yodoctor.in
            </a>
          </li>
          <li className="flex items-center gap-2.5">
            <Phone size={16} className="shrink-0 text-blue-600" />
            <span className="font-semibold text-slate-700">+91-9277207339</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Globe size={16} className="shrink-0 text-blue-600" />
            <a
              href="https://yodoctor.in"
              className="font-semibold text-blue-600 hover:underline"
            >
              yodoctor.in
            </a>
          </li>
          <li className="flex items-center gap-2.5">
            <MapPin size={16} className="shrink-0 text-blue-600" />
            <span className="font-semibold text-slate-700">
              Rise Nagar Nigam, Jhansi, Uttar Pradesh 284001
            </span>
          </li>
        </ul>
      </>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function RefundPolicy() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const sectionRefs = useRef({});
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current && observerRef.current.disconnect();
  }, []);

  const scrollToSection = useCallback((id) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileTocOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-700 antialiased">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-teal-500 mt-4">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          aria-hidden="true"
        >
          <div className="absolute -left-10 -top-10 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 sm:py-20">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg">
            <Receipt className="text-white" size={30} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Refund Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-blue-50 sm:text-lg">
            Learn how refunds, cancellations, and payment disputes are handled
            at Yodoctor.
          </p>
          <p className="mx-auto mt-3 text-sm font-medium text-blue-100/90">
            Yodoctor — Levesque Private Limited &nbsp;|&nbsp; Last Updated: July
            2026
          </p>
        </div>
      </section>

      {/* ---------------- Mobile TOC accordion trigger ---------------- */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white lg:hidden">
        <button
          onClick={() => setMobileTocOpen((v) => !v)}
          aria-expanded={mobileTocOpen}
          aria-controls="mobile-toc"
          className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 text-sm font-semibold text-slate-700"
        >
          <span className="flex items-center gap-2">
            <Menu size={16} className="text-blue-600" />
            Table of Contents
          </span>
          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform ${mobileTocOpen ? "rotate-180" : ""}`}
          />
        </button>
        {mobileTocOpen && (
          <nav id="mobile-toc" className="max-h-72 overflow-y-auto px-5 pb-4">
            <ul className="grid grid-cols-1 gap-1">
              {SECTIONS.map(({ id, title, icon: Icon }) => (
                <li key={id}>
                  <button
                    onClick={() => scrollToSection(id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                      activeId === id
                        ? "bg-indigo-50 font-semibold text-blue-600"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={15} />
                    {title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* ---------------- Main content ---------------- */}
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          {/* Desktop sticky TOC */}
          <aside className="hidden lg:block">
            <nav
              aria-label="Refund policy sections"
              className="sticky top-24 max-h-[75vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="mb-2 border-b border-slate-200 px-2 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                On this page
              </p>
              <ul className="flex flex-col gap-1">
                {SECTIONS.map(({ id, title, icon: Icon }) => {
                  const active = activeId === id;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => scrollToSection(id)}
                        aria-current={active ? "true" : undefined}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-all duration-200 ${
                          active
                            ? "bg-indigo-50 font-semibold text-blue-600 shadow-sm"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        <Icon
                          size={16}
                          className={
                            active ? "text-blue-600" : "text-slate-400"
                          }
                        />
                        {title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Policy content */}
          <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-md sm:p-2">
            <div className="flex flex-col divide-y divide-slate-200">
              {SECTIONS.map(({ id, title, icon: Icon, body }, i) => (
                <section
                  key={id}
                  id={id}
                  ref={(el) => (sectionRefs.current[id] = el)}
                  tabIndex={-1}
                  aria-labelledby={`${id}-heading`}
                  className="scroll-mt-24 rounded-2xl px-4 py-8 transition-colors duration-200 hover:bg-slate-50 sm:px-8"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-indigo-50 text-blue-600">
                      <Icon size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2
                        id={`${id}-heading`}
                        className="flex items-baseline gap-2 text-xl font-extrabold text-slate-900 sm:text-2xl"
                      >
                        <span className="text-sm font-bold text-blue-600">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {title}
                      </h2>
                      <div className="mt-3 text-[15px]">{body}</div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------- Still have questions card ---------------- */}
        <div className="mt-10 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 p-8 text-center shadow-lg sm:p-10">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Wallet className="text-white" size={22} />
          </div>
          <h3 className="text-2xl font-extrabold text-white">
            Still have questions?
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-blue-50">
            Our support team can help track a refund or resolve a payment issue
            — reach out any time at{" "}
            <a
              href="mailto:founder@yodoctor.in"
              className="font-semibold underline"
            >
              founder@yodoctor.in
            </a>
            .
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:founder@yodoctor.in"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-blue-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <LifeBuoy size={16} /> Contact Support
            </a>
            <a
              href="/help"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-white/20"
            >
              <FileText size={16} /> Visit Help Center
            </a>
          </div>
        </div>

        {/* ---------------- Footer note ---------------- */}
        <p className="mt-8 text-center text-sm text-slate-400">
          Yodoctor is operated by Levesque Private Limited. This policy may be
          updated periodically.
        </p>
      </main>
    </div>
  );
}
