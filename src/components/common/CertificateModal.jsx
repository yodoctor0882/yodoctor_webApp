function Badge({ status, text }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeStyles[status] || badgeStyles.pending}`}
    >
      {text}
    </span>
  );
}

const badgeStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  warning: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  valid: "bg-emerald-100 text-emerald-800",
};

const CertificateModal = ({ cert, onClose, onDownload, role = "patient" }) => {
  if (!cert) return null;

  const fields = [
    { label: "Certificate ID", value: cert.certificate_id, mono: true },
    {
      label: "Status",
      value: cert.status || "Valid",
      badge: (cert.status || "valid").toLowerCase(),
    },
    { label: "Patient Name", value: cert.patient || "N/A" },
    { label: "Issued By", value: cert.doctor || "N/A" },
    { label: "Issue Date", value: cert.issued || cert.issued_at || "N/A" },
    { label: "Expiry Date", value: cert.expires || cert.expiry_date || "N/A" },
    { label: "Purpose", value: cert.purpose || "N/A" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden"
        style={{
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
          <span className="text-sm font-semibold text-gray-700">
            Medical Certificate
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors text-base font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {/* Header banner */}
          <div className="bg-teal-600 rounded-xl px-4 py-3 mb-4 text-center">
            <div className="text-white text-base sm:text-lg font-bold tracking-wide">
              YoDoctor System
            </div>
            <div className="text-teal-100 text-xs mt-0.5">
              Digital Medical Certificate Authority — India
            </div>
          </div>

          <div className="text-center mb-4">
            <span className="text-base font-semibold text-gray-800">
              {cert.type} Certificate
            </span>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-4">
            {fields.map(({ label, value, mono, badge }) => (
              <div key={label}>
                <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                {badge ? (
                  <Badge status={badge} text={value} />
                ) : (
                  <div
                    className={`text-sm font-medium text-gray-700 ${
                      mono ? "font-mono" : ""
                    }`}
                  >
                    {value}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-xs text-gray-500 mb-4">
            <span className="font-semibold text-gray-600">Disclaimer:</span>{" "}
            This certificate is digitally signed and tamper-proof. Verify at{" "}
            <span className="text-teal-600 font-medium">
              yodoctor.in/verify
            </span>
            .
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {role === "patient" && (
              <button
                onClick={() => cert.onDownload?.(cert.id)}
                className="flex-1 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors"
              >
                Download PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
