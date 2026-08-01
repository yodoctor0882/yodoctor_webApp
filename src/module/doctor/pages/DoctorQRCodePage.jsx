import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { getMyQR } from "../../../services/doctorService";
import { notify } from "../../../utils/notify"; // ✅ Fix #1

const DoctorQRCodePage = () => {
  const [qrValue, setQrValue] = useState("");
  const [doctorId, setDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await getMyQR();
        setQrValue(res.data.qrUrl);
        setDoctorId(res.data.doctorId);
      } catch {
        // ✅ Fix #1 — alert ki jagah notify
        notify.error("Doctor not approved or unauthorized");
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
  }, []);

  const downloadQR = () => {
    const canvas = document.getElementById("doctor-qr");
    if (!canvas || !doctorId) return;

    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = `doctor-${doctorId}-qr.png`;
    a.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-6 rounded-xl shadow text-center">
        <h2 className="text-xl font-semibold text-teal-600 mb-3">
          Clinic Walk-In QR
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading QR...</p>
          </div>
        ) : qrValue ? (
          <div className="flex justify-center mb-4">
            <QRCodeCanvas
              id="doctor-qr"
              value={qrValue}
              size={320}
              level="H"
              includeMargin
            />
          </div>
        ) : (
          <p className="text-red-500 py-6">QR not available</p>
        )}

        <p className="text-sm text-gray-600 mb-4">
          Scan this QR to book appointment
        </p>

        <button
          onClick={downloadQR}
          disabled={!qrValue || loading}
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Download QR
        </button>
      </div>
    </div>
  );
};

export default DoctorQRCodePage;