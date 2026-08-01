import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const QRRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const doctorId = searchParams.get("doctorId");
    const token = localStorage.getItem("token");

    // ❌ Invalid QR
    if (!doctorId) {
      navigate("/login");
      return;
    }

    // ❌ Not logged in
    if (!token) {
      navigate(`/login?redirect=/appointment/${doctorId}`);
      return;
    }

    // ✅ Logged in
  navigate(`/client/bookappointmentpage/${doctorId}`);

  }, [navigate, searchParams]);

  return <h3>Redirecting...</h3>;
};

export default QRRedirect;