import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Navigation, CheckCircle2 } from "lucide-react";
import { useCart } from "../../context/CartContext";
import api from "../../services/api";
import { notify } from "../../utils/notify";
const TIME_SLOTS = [
  {
    title: "Morning",
    slots: [
      "6:30 AM",
      "7:00 AM",
      "7:30 AM",
      "8:00 AM",
      "8:30 AM",
      "9:00 AM",
      "9:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
    ],
  },
  {
    title: "Afternoon",
    slots: [
      "12:00 PM",
      "12:30 PM",
      "1:00 PM",
      "1:30 PM",
      "2:00 PM",
      "2:30 PM",
      "3:00 PM",
      "3:30 PM",
      "4:00 PM",
      "4:30 PM",
      "5:00 PM",
    ],
  },
  {
    title: "Evening",
    slots: [
      "5:30 PM",
      "6:00 PM",
      "6:30 PM",
      "7:00 PM",
      "7:30 PM",
      "8:00 PM",
      "8:30 PM",
      "9:00 PM",
    ],
  },
];

function getDates() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : null,
      day: d.getDate(),
      month: months[d.getMonth()],
      weekday: days[d.getDay()],

      dbDate: d.toISOString().split("T")[0], // YYYY-MM-DD
    };
  });
}

export default function Booking() {
  const { items, subtotal } = useCart();
  const navigate = useNavigate();
  const dates = getDates();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    age: "",
    phone: "",
  });
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [mapCoords, setMapCoords] = useState({ lat: 28.6139, lng: 77.209 });
  const [locating, setLocating] = useState(false);
  const [locDetected, setLocDetected] = useState(false);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (items.length === 0)
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
        <h1 className="font-display font-bold text-[#0F172A] text-lg sm:text-xl mb-2">
          No tests selected
        </h1>
        <Link
          to="/client/search"
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl px-6 py-3 text-sm inline-block mt-3 transition"
        >
          Browse Tests
        </Link>
      </div>
    );

  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "name":
        if (!value.trim()) {
          error = "Name is required";
        } else if (!/^[A-Za-z ]+$/.test(value)) {
          error = "Only alphabets are allowed";
        } else if (value.trim().length < 3) {
          error = "Minimum 3 characters required";
        }
        break;

      case "age":
        if (!value) {
          error = "Age is required";
        } else if (isNaN(value) || value < 1 || value > 120) {
          error = "Age must be between 1 and 120";
        }
        break;

      case "phone":
        if (!value) {
          error = "Mobile number is required";
        } else if (!/^[6-9]\d{9}$/.test(value)) {
          error = "Enter a valid 10 digit mobile number";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));

    return error === "";
  };

  function detectLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setMapCoords({ lat, lng });
        setLocDetected(true);
        setLocating(false);
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        )
          .then((r) => r.json())
          .then((d) => {
            if (d.display_name) setAddress(d.display_name);
          })
          .catch(() => setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`));
      },
      () => setLocating(false),
    );
  }
  const canConfirm =
    name.trim() &&
    age.trim() &&
    phone.trim() &&
    address.trim() &&
    selectedSlot &&
    !errors.name &&
    !errors.age &&
    !errors.phone;

  const dateLabel = `${dates[selectedDate].label || dates[selectedDate].weekday} ${dates[selectedDate].day} ${dates[selectedDate].month}`;

  const handleConfirm = async () => {
      const isNameValid = validateField("name", name);
  const isAgeValid = validateField("age", age);
  const isPhoneValid = validateField("phone", phone);

  if (!isNameValid || !isAgeValid || !isPhoneValid || !address.trim() || !selectedSlot) {
    return;
  }
    if (!canConfirm) return;

    try {
      setSubmitting(true);

      const payload = {
        patientName: name,
        age,
        gender,
        phone,
        address,
        latitude: mapCoords.lat,
        longitude: mapCoords.lng,
        bookingDate: dates[selectedDate].dbDate,
        bookingTime: selectedSlot,
        tests: items.map((item) => item.id),
      };

      // STEP 1 - Create Booking

      const bookingRes = await api.post("/patient/lab-bookings", payload);

      if (!bookingRes.data.success) {
        throw new Error("Booking failed");
      }

      const bookingId = bookingRes.data.bookingId;
      const bookingDbId = bookingRes.data.bookingDbId;
      const amount = bookingRes.data.amount;

      // STEP 2 - Create Razorpay Order

      const orderRes = await api.post("/razorpay/lab/payments/create-order", {
        booking_id: bookingDbId,
      });

      if (!orderRes.data.success) {
        throw new Error("Order creation failed");
      }

      const order = orderRes.data.data;

      // STEP 3 - Open Razorpay

      const options = {
        key: order.razorpay_key,

        amount: order.amount,

        currency: order.currency,

        name: "YoDoctor",

        description: "Lab Test Booking",

        order_id: order.order_id,

        prefill: {
          name,
          contact: phone,
        },

        theme: {
          color: "#2563EB",
        },

        handler: async function (response) {
          try {
            const verifyRes = await api.post("/razorpay/lab/payments/verify", {
              booking_id: bookingDbId,

              razorpay_order_id: response.razorpay_order_id,

              razorpay_payment_id: response.razorpay_payment_id,

              razorpay_signature: response.razorpay_signature,
            });

            if (!verifyRes.data.success) {
              throw new Error(
                verifyRes.data.message || "Payment verification failed",
              );
            }

            navigate("/client/confirmation", {
              state: {
                bookingId,
                amount,
                patient: {
                  name,
                  age,
                  gender,
                  phone,
                },
                address,
                slot: `${dates[selectedDate].dbDate} ${selectedSlot}`,
                coords: mapCoords,
                tests: items,
              },
            });
          } catch (err) {
            console.log(err);

            notify.error(
              err?.response?.data?.message || "Payment verification failed",
            );
          }
        },

        modal: {
          ondismiss: function () {
            setSubmitting(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.log("Payment Failed:", response.error);

        notify.error(response.error.description || "Payment Failed");

        setSubmitting(false);
      });

      razorpay.open();
    } catch (error) {
      console.log(error);

      notify.error(
        error?.response?.data?.message || error.message || "Booking failed",
      );

      setSubmitting(false);
    }
  };

  // shared input style
  const inputCls =
    "w-full border-2 border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition bg-white";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-28 sm:pb-32">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-[#64748B] mb-4 sm:mb-5 hover:text-[#0F172A]"
      >
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="font-display font-bold text-[#0F172A] text-xl sm:text-2xl mb-1">
        Book a Slot
      </h1>
      <p className="text-[#64748B] text-xs sm:text-sm mb-5 sm:mb-6">
        {items.length} test{items.length > 1 ? "s" : ""} selected · ₹{subtotal}{" "}
        total
      </p>

      {/* ── Patient Details ── */}
      <div className="bg-white border-2 border-[#E2E8F0] rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5">
        <h2 className="font-display font-bold text-[#0F172A] flex items-center gap-2 mb-4 text-sm sm:text-base">
          <span className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shrink-0">
            1
          </span>
          Patient Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[#64748B] block mb-1.5">
              Full Name *
            </label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                validateField("name", e.target.value);
              }}
              className={inputCls}
            />

            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-[#64748B] block mb-1.5">
              Age *
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                validateField("age", e.target.value);
              }}
              className={inputCls}
            />

            {errors.age && (
              <p className="text-red-500 text-xs mt-1">{errors.age}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-[#64748B] block mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                setPhone(value);
                validateField("phone", value);
              }}
              className={inputCls}
            />

            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-[#64748B] block mb-1.5">
              Gender
            </label>
            <div className="flex gap-2">
              {["Male", "Female", "Other"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 text-xs sm:text-sm font-bold rounded-xl py-2 sm:py-2.5 border-2 transition ${
                    gender === g
                      ? "bg-[#2563EB] text-white border-[#2563EB]"
                      : "bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Address + Map ── */}
      <div className="bg-white border-2 border-[#E2E8F0] rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5">
        <h2 className="font-display font-bold text-[#0F172A] flex items-center gap-2 mb-4 text-sm sm:text-base">
          <span className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shrink-0">
            2
          </span>
          Sample Pickup Address
        </h2>

        {/* Google Map */}
        <div className="rounded-xl overflow-hidden border-2 border-[#E2E8F0] h-36 sm:h-44 md:h-48 mb-4">
          <iframe
            title="Pickup Location"
            src={`https://maps.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}&z=15&output=embed`}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <button
          onClick={detectLocation}
          disabled={locating}
          className={`w-full flex items-center justify-center gap-2 font-bold rounded-xl py-2.5 sm:py-3 text-sm transition mb-4 ${
            locDetected
              ? "bg-[#22C55E] text-white cursor-default"
              : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white disabled:opacity-70"
          }`}
        >
          {locDetected ? <CheckCircle2 size={16} /> : <Navigation size={15} />}
          {locating
            ? "Detecting your location…"
            : locDetected
              ? "Location Detected"
              : "Use My Current Location"}
        </button>

        <label className="text-xs font-bold text-[#64748B] block mb-1.5">
          Full Address *
        </label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          placeholder="House No., Building, Street, Area, City, Pincode"
          className="w-full border-2 border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] resize-none transition bg-white"
        />
        {address && (
          <div className="flex items-start gap-2 bg-[#CCFBF1] border border-[#14B8A6] rounded-xl px-3 py-2.5 mt-3 text-xs text-[#0F766E] font-semibold">
            <CheckCircle2
              size={15}
              className="mt-0.5 shrink-0 text-[#14B8A6]"
            />
            Our team will collect your sample from this address at your chosen
            time.
          </div>
        )}
      </div>

      {/* ── Date & Slot ── */}
      <div className="bg-white border-2 border-[#E2E8F0] rounded-2xl p-4 sm:p-5">
        <h2 className="font-display font-bold text-[#0F172A] flex items-center gap-2 mb-4 text-sm sm:text-base">
          <span className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shrink-0">
            3
          </span>
          Select Date &amp; Time
        </h2>

        <p className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-2">
          Preferred Date
        </p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {dates.map((d, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDate(idx)}
              className={`shrink-0 flex flex-col items-center rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 border-2 transition min-w-[58px] sm:min-w-[64px] ${
                selectedDate === idx
                  ? "bg-[#2563EB] text-white border-[#2563EB]"
                  : "bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]"
              }`}
            >
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide">
                {d.label || d.weekday}
              </span>
              <span className="font-display font-extrabold text-lg sm:text-xl leading-tight">
                {d.day}
              </span>
              <span className="text-[9px] sm:text-[10px] font-medium">
                {d.month}
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-2">
          Preferred Time Slot
        </p>

        <div className="space-y-5">
          {TIME_SLOTS.map((group) => (
            <div key={group.title}>
              <h4 className="font-semibold text-[#0F172A] mb-3">
                {group.title}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {group.slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`text-xs sm:text-sm font-bold rounded-xl py-2 sm:py-2.5 border-2 transition ${
                      selectedSlot === slot
                        ? "bg-[#2563EB] text-white border-[#2563EB]"
                        : "bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedSlot && (
          <div className="mt-4 bg-[#EEF2FF] border border-[#2563EB] rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#2563EB]">
            ✓ Slot selected: {dateLabel} at {selectedSlot}
          </div>
        )}
      </div>
      <button
        onClick={handleConfirm}
        disabled={!canConfirm || submitting}
        className={`font-bold rounded-xl px-5 sm:px-8 py-2.5 sm:py-3 mt-10 text-xs sm:text-sm transition shrink-0 whitespace-nowrap ${
          canConfirm
            ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
        }`}
      >
        {submitting ? "Booking..." : "Pay & Confirm →"}
      </button>
    </div>
  );
}
