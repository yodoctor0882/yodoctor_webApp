import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getDoctorById } from "../../../services/patientService";
import { notify } from "../../../utils/notify";

const QRRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const doctorId = searchParams.get("doctorId");

  useEffect(() => {
    const handleQRRedirect = async () => {
      // 1. QR me doctorId hona chahiye
      if (!doctorId) {
        notify.error("Invalid QR code");
        navigate("/", { replace: true });
        return;
      }

      try {
        // 2. Doctor validate karo
        const res = await getDoctorById(doctorId);
        const doctor = res.data.doctor || res.data;

        if (!doctor) {
          notify.error("Doctor not found");
          navigate("/", { replace: true });
          return;
        }

        // 3. Subscription validate karo
        if (!doctor.hasActiveSubscription) {
          notify.error(
            "This doctor is currently unavailable for appointments"
          );
          navigate("/", { replace: true });
          return;
        }

        // Final destination
        const appointmentPath =
          `/client/bookappointmentpage/${doctorId}?fromQR=true`;

        // 4. Login information check
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        const raw =
          localStorage.getItem("loggedInUser") ||
          sessionStorage.getItem("loggedInUser");

        let user = null;

        try {
          user = raw ? JSON.parse(raw) : null;
        } catch {
          user = null;
        }

        // 5. Already PATIENT logged in
        if (token && user?.role === "PATIENT") {
          navigate(appointmentPath, {
            replace: true,
          });
          return;
        }

        // 6. Login nahi hai
        // Login ke baad same appointment page par bhejna
        const loginUrl =
          `/clientloginpage?redirect=${encodeURIComponent(
            appointmentPath
          )}`;

        navigate(loginUrl, {
          replace: true,
        });
      } catch (err) {
        console.error("QR Redirect Error:", err);

        notify.error(
          err.response?.data?.message ||
            "This doctor is currently unavailable for appointments"
        );

        navigate("/", {
          replace: true,
        });
      }
    };

    handleQRRedirect();
  }, [doctorId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 mx-auto border-4 border-[#0086C3] border-t-transparent rounded-full animate-spin" />

        <p className="mt-4 text-gray-600 font-medium">
          Checking doctor availability...
        </p>
      </div>
    </div>
  );
};

export default QRRedirect;