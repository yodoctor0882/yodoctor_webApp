import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  MapPin,
  Clock,
  User,
  Home,
  Phone,
  ClipboardList,
} from "lucide-react";
import { useEffect } from "react";
import { useCart } from "../../context/CartContext";

export default function Confirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {clearCart } = useCart();

  useEffect(() => {
    if (!state) {
      navigate("/client/dashboard");
    }
  }, [state, navigate]);

  if (!state) return null;
  console.log("STATE =", state);

  const {
    bookingId,
    amount,
    patient,
    address,
    slot,
    coords,
    tests = [],
  } = state;

  const mapSrc = coords
    ? `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-DEFAULT to-teal-DEFAULT p-6 sm:p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-black">
            <CheckCircle2 size={34} />
          </div>

          <h1 className="font-bold text-2xl mb-2 text-black">
            Booking Confirmed!
          </h1>

          <p className=" text-black">
            Your sample collection has been scheduled successfully.
          </p>

          <div className="mt-4 flex flex-col gap-2 items-center">
            <div className="bg-white/20 rounded-full px-4 py-2 text-sm font-semibold">
              Booking ID: {bookingId}
            </div>

            <div className="bg-green-500 rounded-full px-4 py-2 text-sm font-semibold">
              Payment Status: Paid
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Patient */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 flex gap-3">
              <User className="text-blue-600 mt-1" size={20} />

              <div>
                <p className="text-xs text-slate-500">Patient Details</p>

                <p className="font-semibold">{patient?.name}</p>

                <p className="text-sm text-slate-600">
                  {patient?.age} Years • {patient?.gender}
                </p>

                <p className="text-sm text-slate-600">{patient?.phone}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 flex gap-3">
              <Clock className="text-blue-600 mt-1" size={20} />

              <div>
                <p className="text-xs text-slate-500">Collection Slot</p>

                <p className="font-semibold">{slot}</p>

                <p className="text-sm text-slate-600">Home Sample Collection</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex gap-3 mb-3">
              <MapPin className="text-blue-600 mt-1" size={20} />

              <div>
                <p className="text-xs text-slate-500">Pickup Address</p>

                <p className="font-medium">{address}</p>
              </div>
            </div>

            {mapSrc && (
              <div className="h-40 overflow-hidden rounded-xl border">
                <iframe
                  title="Location"
                  src={mapSrc}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            )}
          </div>

          {/* Tests */}
          <div>
            <h2 className="font-bold text-lg mb-3">Tests Booked</h2>

            <div className="space-y-2">
             {tests.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b pb-2"
                >
                  <span>{item.name}</span>
                  

                  <span className="font-semibold">₹{item.price}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-4 pt-3 border-t font-bold text-lg">
              <span>Total Paid</span>
              <span>₹{amount}</span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold mb-2">What happens next?</h3>

            <ul className="text-sm text-slate-600 space-y-2">
              <li>✓ SMS confirmation will be sent shortly</li>
              <li>✓ Phlebotomist will call before arrival</li>
              <li>✓ Sample collection at your home</li>
              <li>✓ Report available after processing</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="grid md:grid-cols-3 gap-3">
            <button
              onClick={() => {
                clearCart();
                navigate("/client/dashboard");
              }}
              className="bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home size={18} />
              Dashboard
            </button>

            <button
              onClick={() => navigate("/client/mylabbookings")}
              className="border-2 border-green-600 text-green-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <ClipboardList size={18} />
              My Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
