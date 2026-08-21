import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchVisitDoctors } from "../../../services/patientService";
import { validateStep } from "../../../controllers/FormValidation";
import { notify } from "../../../utils/notify";
import Select from "react-select";
import {
  uploadDocuments,
  createPaymentOrder,
  verifyPayment,
} from "../../../services/certificateService";

const certificateTypes = [
  {
    id: "medical",
    title: "Medical Fitness",
    description: "For employment or sports",
    icon: "🏥",
  },
  {
    id: "vaccination",
    title: "Vaccination",
    description: "Immunization records",
    icon: "💉",
  },
  {
    id: "disability",
    title: "Disability",
    description: "Official disability proof",
    icon: "♿",
  },
  {
    id: "second-opinion",
    title: "Second Opinion",
    description: "Expert medical review",
    icon: "🔬",
  },
  {
    id: "Discharge",
    title: "Discharge Summary",
    description: "Summary of hospital discharge",
    icon: "🏨",
  },
];

const steps = ["Type", "Medical Info", "Documents", "Review"];
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const DOC_FIELDS = [
  {
    field: "profilePhoto",
    label: "Profile Photo",
    required: true,
    accept: "image/*",
    hint: "Upload your profile picture (jpg, png)",
  },
  {
    field: "idProof",
    label: "Government ID Proof",
    required: true,
    accept: "image/*,.pdf",
    hint: "Aadhaar / PAN / Passport",
  },
  {
    field: "medicalReports",
    label: "Medical Reports",
    required: false,
    accept: "image/*,.pdf",
    hint: "Previous diagnostic reports",
  },
  {
    field: "prescription",
    label: "Prescription",
    required: false,
    accept: "image/*,.pdf",
    hint: "Doctor's prescription (if available)",
  },
];

const StepCard = ({ children }) => (
  <div
    className="bg-white rounded-2xl overflow-hidden"
    style={{
      border: "1px solid #E2E8F0",
      boxShadow: "0 2px 20px rgba(15,23,42,0.07)",
      animation: "fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both",
    }}
  >
    {/* top accent bar */}
    <div
      className="h-1 w-full"
      style={{
        background: "linear-gradient(90deg, #2563EB, #14B8A6)",
      }}
    />
    <div className="px-4 sm:px-6 py-5">{children}</div>
  </div>
);

const StepHeading = ({ children }) => (
  <h2
    className="text-base sm:text-[17px] font-bold mb-4"
    style={{ color: "#0F172A" }}
  >
    {children}
  </h2>
);

const FieldLabel = ({ children }) => (
  <label
    className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
    style={{ color: "#64748B" }}
  >
    {children}
  </label>
);

const Req = () => (
  <span style={{ color: "#EF4444" }} className="ml-0.5">
    *
  </span>
);

const FieldBox = ({ label, children }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    {children}
  </div>
);

const ErrMsg = ({ msg }) =>
  msg ? (
    <p className="text-[11px] mt-1" style={{ color: "#EF4444" }}>
      {msg}
    </p>
  ) : null;

const inputCls =
  "w-full text-[14px] rounded-xl px-4 py-2.5 sm:py-3 outline-none transition-all duration-200";

const inputStyle = {
  color: "#0F172A",
  background: "#F8FAFC",
  border: "1px solid #E2E8F0",
  fontSize: "16px",
};

const StyledInput = (props) => (
  <input
    {...props}
    className={inputCls}
    style={inputStyle}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = "#2563EB";
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)";
      e.currentTarget.style.background = "#fff";
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = "#E2E8F0";
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.background = "#F8FAFC";
      props.onBlur?.(e);
    }}
  />
);

const StyledSelect = ({ children, ...props }) => (
  <select
    {...props}
    className={inputCls}
    style={{ ...inputStyle, cursor: "pointer" }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = "#2563EB";
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)";
      e.currentTarget.style.background = "#fff";
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = "#E2E8F0";
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.background = "#F8FAFC";
    }}
  >
    {children}
  </select>
);

const StyledTextarea = (props) => (
  <textarea
    rows={3}
    {...props}
    className={`${inputCls} resize-none`}
    style={inputStyle}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = "#2563EB";
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)";
      e.currentTarget.style.background = "#fff";
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = "#E2E8F0";
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.background = "#F8FAFC";
    }}
  />
);

const ActionButtons = ({
  onBack,
  onNext,
  onCancel,
  isFirst,
  submitLabel,
  onSubmit,
  submitting,
}) => (
  <div className="flex items-center justify-between gap-3 mt-6">
    {isFirst ? (
      <button
        onClick={onCancel}
        className="text-[13px] font-semibold px-4 sm:px-5 py-2.5 rounded-xl transition-all"
        style={{
          color: "#64748B",
          border: "1px solid #E2E8F0",
          background: "transparent",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        Cancel
      </button>
    ) : (
      <button
        onClick={onBack}
        className="text-[13px] font-semibold px-4 sm:px-5 py-2.5 rounded-xl transition-all"
        style={{
          color: "#64748B",
          border: "1px solid #E2E8F0",
          background: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#F8FAFC";
          e.currentTarget.style.transform = "translateX(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.transform = "translateX(0)";
        }}
      >
        ← Back
      </button>
    )}

    {onSubmit ? (
      <button
        onClick={onSubmit}
        disabled={submitting}
        className="text-[14px] font-bold text-white px-6 sm:px-8 py-2.5 rounded-xl transition-all duration-200"
        style={
          submitting
            ? { background: "#94A3B8", cursor: "not-allowed" }
            : {
                background: "#2563EB",
                boxShadow: "0 4px 14px rgba(37,99,235,0.30)",
              }
        }
        onMouseEnter={(e) => {
          if (!submitting) {
            e.currentTarget.style.background = "#1D4ED8";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.38)";
          }
        }}
        onMouseLeave={(e) => {
          if (!submitting) {
            e.currentTarget.style.background = "#2563EB";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.30)";
          }
        }}
      >
        {submitting ? "Submitting…" : submitLabel || "✅ Submit Request"}
      </button>
    ) : (
      <button
        onClick={onNext}
        className="text-[14px] font-bold text-white px-6 sm:px-8 py-2.5 rounded-xl transition-all duration-200"
        style={{
          background: "#2563EB",
          boxShadow: "0 4px 14px rgba(37,99,235,0.30)",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#1D4ED8";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.38)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#2563EB";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.30)";
        }}
      >
        Next Step →
      </button>
    )}
  </div>
);

const FileUploadCard = ({
  field,
  label,
  required,
  accept,
  hint,
  file,
  onUpload,
  onDelete,
  error,
}) => {
  const isImage = file && file.type?.startsWith("image/");
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <FieldLabel>
          {label} {required && <Req />}
        </FieldLabel>
        {file && (
          <button
            onClick={() => onDelete(field)}
            className="text-[11px] font-semibold hover:underline"
            style={{ color: "#EF4444" }}
          >
            Remove
          </button>
        )}
      </div>

      {!file ? (
        <label
          className="flex items-center gap-4 rounded-xl px-4 sm:px-5 py-4 sm:py-5 cursor-pointer transition-all"
          style={{
            border: "2px dashed #E2E8F0",
            background: "#F8FAFC",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#2563EB";
            e.currentTarget.style.background = "#EEF2FF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#E2E8F0";
            e.currentTarget.style.background = "#F8FAFC";
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: "#EEF2FF" }}
          >
            📤
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: "#0F172A" }}>
              Click to upload
            </p>
            <p className="text-xs truncate" style={{ color: "#94A3B8" }}>
              {hint}
            </p>
          </div>
          <input
            type="file"
            accept={accept}
            onChange={(e) => onUpload(e, field)}
            className="hidden"
          />
        </label>
      ) : (
        <div
          className="flex items-center gap-3 sm:gap-4 rounded-xl px-4 sm:px-5 py-3 sm:py-4"
          style={{
            border: "2px solid #bbf7d0",
            background: "#f0fdf4",
          }}
        >
          {isImage ? (
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-xl"
              style={{ background: "#EEF2FF" }}
            >
              📄
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: "#166534" }}
            >
              {file.name}
            </p>
            <p className="text-xs" style={{ color: "#22C55E" }}>
              {(file.size / 1024).toFixed(0)} KB · Uploaded
            </p>
          </div>
          <button
            onClick={() => window.open(URL.createObjectURL(file))}
            className="text-xs font-semibold hover:underline flex-shrink-0"
            style={{ color: "#2563EB" }}
          >
            View
          </button>
        </div>
      )}

      <ErrMsg msg={error} />
    </div>
  );
};

const selectStyles = {
  control: (base, state) => ({
    ...base,
    fontSize: "15px",
    color: "#0F172A",
    borderRadius: "0.75rem",
    padding: "2px 4px",
    background: "#F8FAFC",
    border: state.isFocused ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(37,99,235,0.10)" : "none",
    transition: "all 0.2s",
    "&:hover": { borderColor: "#2563EB" },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "15px",
    background: state.isSelected
      ? "#2563EB"
      : state.isFocused
        ? "rgba(37,99,235,0.08)"
        : "#fff",
    color: state.isSelected ? "#fff" : "#0F172A",
    borderRadius: "6px",
    margin: "2px 4px",
    width: "calc(100% - 8px)",
    cursor: "pointer",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(15,23,42,0.10)",
    border: "1px solid #E2E8F0",
  }),
  singleValue: (base) => ({ ...base, color: "#0F172A", fontSize: "15px" }),
  placeholder: (base) => ({ ...base, color: "#94A3B8", fontSize: "15px" }),
  indicatorSeparator: () => ({ display: "none" }),
};

// ─── Step indicator dot & label helpers ──────────────────────────────────────

const dotClass = (i, current) => {
  if (i === current) return "text-white";
  if (i < current) return "text-[#14B8A6]";
  return "text-[#94A3B8]";
};

const dotStyle = (i, current) => {
  if (i === current)
    return {
      background: "#2563EB",
      boxShadow: "0 4px 12px rgba(37,99,235,0.30)",
    };
  if (i < current)
    return { background: "#f0fdf9", border: "1.5px solid #14B8A6" };
  return { background: "#F8FAFC", border: "1px solid #E2E8F0" };
};

const labelStyle = (i, current) => {
  if (i === current) return { color: "#2563EB" };
  if (i < current) return { color: "#14B8A6" };
  return { color: "#94A3B8" };
};

// ─── Root Component ───────────────────────────────────────────────────────────

const RequestCertificate = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const passedDoctor = location.state?.doctor || null;

  const queryParams = new URLSearchParams(location.search);
  const doctorIdFromUrl = queryParams.get("doctorId");

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctor, setDoctor] = useState(
    passedDoctor
      ? {
          ...passedDoctor,
          doctorId: passedDoctor.doctorId || passedDoctor.id,
        }
      : null,
  );
  const [doctors, setDoctors] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const [selectedType, setSelectedType] = useState("medical");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [conditions, setConditions] = useState("");
  const [medications, setMedications] = useState("");
  const [documents, setDocuments] = useState({
    profilePhoto: null,
    idProof: null,
    medicalReports: null,
    prescription: null,
  });

  const [showPaymentSummary, setShowPaymentSummary] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const isDoctorFixed = !!(passedDoctor || doctorIdFromUrl);

  const doctorOptions = doctors.map((doc) => ({
    value: doc.doctorId || doc.id,
    label: `${doc.doctorName} — ${doc.specialization}`,
  }));

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!doctors.length) return;

    if (passedDoctor) {
      const passedId = passedDoctor.doctorId || passedDoctor.id;

      const match = doctors.find(
        (d) => String(d.doctorId || d.id) === String(passedId),
      );

      setDoctor(
        match || {
          ...passedDoctor,
          doctorId: passedId,
        },
      );

      return;
    }

    if (doctorIdFromUrl) {
      const match = doctors.find(
        (d) => String(d.doctorId || d.id) === String(doctorIdFromUrl),
      );

      if (match) {
        setDoctor({
          ...match,
          doctorId: match.doctorId || match.id,
        });
      }
    }
  }, [passedDoctor, doctors, doctorIdFromUrl]);

  const fetchDoctors = async () => {
    try {
      const res = await searchVisitDoctors({
        search: "",
        city: "",
        page: 1,
        limit: 50,
      });
      setDoctors(res.data?.data?.doctors || []);
    } catch (e) {
      console.error(e);
    }
  };

  const validateFile = (file) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type))
      return "Only PDF, JPG, and PNG files are allowed.";
    if (file.size > 5 * 1024 * 1024) return "File size must be less than 5 MB.";
    return null;
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) {
      setErrors((p) => ({ ...p, [field]: err }));
      return;
    }
    setDocuments((p) => ({ ...p, [field]: file }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleDeleteDoc = (field) =>
    setDocuments((p) => ({ ...p, [field]: null }));

  const handleNext = () => {
    const formData = {
      doctor,
      purpose,
      fullName,
      dob,
      gender,
      height,
      weight,
      documents,
    };
    const errs = validateStep(currentStep, formData, validateFile);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

const openRazorpayPayment = async (paymentData) => {
  if (!window.Razorpay) {
    throw new Error(
      "Razorpay SDK is still loading. Please try again."
    );
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: paymentData.razorpayKeyId,

      amount: Math.round(
        Number(paymentData.totalAmount) * 100
      ),

      currency: paymentData.currency || "INR",

      name: "YoDoctor",

      description: "Certificate Service",

      order_id: paymentData.orderId,

      handler: async function (response) {
        try {
          const verifyRes = await verifyPayment({
            razorpay_order_id:
              response.razorpay_order_id,

            razorpay_payment_id:
              response.razorpay_payment_id,

            razorpay_signature:
              response.razorpay_signature,
          });

          if (!verifyRes.data?.success) {
            throw new Error(
              verifyRes.data?.message ||
                "Payment verification failed."
            );
          }

          resolve(verifyRes.data);
        } catch (error) {
          reject(error);
        }
      },

      modal: {
        ondismiss: () => {
          reject(
            new Error("Payment cancelled.")
          );
        },
      },

      theme: {
        color: "#0086C3",
      },
    };

    const razorpay =
      new window.Razorpay(options);

    razorpay.on(
      "payment.failed",
      (response) => {
        reject(
          new Error(
            response.error?.description ||
              "Payment failed."
          )
        );
      }
    );

    razorpay.open();
  });
};

  const handleProceedPayment = async () => {
    if (!paymentData) return;

    try {
      setIsSubmitting(true);

      const verifyResult = await openRazorpayPayment(paymentData);

      // STEP 2: GET REQUEST ID
      const requestId = verifyResult?.data?.requestId;

      if (!requestId) {
        throw new Error("Certificate request ID not received after payment.");
      }

      // STEP 3: UPLOAD DOCUMENTS
      const hasDocuments = Object.values(documents).some(
        (file) => file !== null,
      );

      if (hasDocuments) {
        const fd = new FormData();

        fd.append("request_id", requestId);

        if (documents.profilePhoto) {
          fd.append("profilePhoto", documents.profilePhoto);
        }

        if (documents.idProof) {
          fd.append("idProof", documents.idProof);
        }

        if (documents.medicalReports) {
          fd.append("medicalReports", documents.medicalReports);
        }

        if (documents.prescription) {
          fd.append("prescription", documents.prescription);
        }

        await uploadDocuments(fd);
      }

      // STEP 4: CLOSE PAYMENT POPUP
      setShowPaymentSummary(false);

      notify.success("Payment successful and certificate request submitted.");

      // STEP 5: MY CERTIFICATE
      navigate("/client/mycertificate", {
        state: {
          success: true,
          requestId,
        },
      });
    } catch (error) {
      console.error("Certificate payment error:", error);

      notify.error(
        error.response?.data?.message ||
          error.message ||
          "Payment failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        notify.error("Please login again.");
        navigate("/login");
        return;
      }

      const assignedDoctorId = doctor?.doctorId || doctor?.id;

      if (!assignedDoctorId) {
        notify.error("Please select an assigned doctor.");
        return;
      }

      notify.info("Preparing payment...");

      const orderRes = await createPaymentOrder({
        doctor_id: assignedDoctorId,
        certificate_type: selectedType,
        purpose,
        notes,

        full_name: fullName,
        dob,
        gender,
        blood_group: bloodGroup,
        height,
        weight,
        medical_conditions: conditions,
        medications,
      });

      const newPaymentData = orderRes.data?.data;

      if (!newPaymentData) {
        throw new Error("Payment order details not received.");
      }

      // STEP 2: PAYMENT SUMMARY
      console.log("Certificate Payment:", {
        doctorFee: newPaymentData.doctorFee,
        platformFee: newPaymentData.platformFee,
        totalAmount: newPaymentData.totalAmount,
      });

      setPaymentData(newPaymentData);
      setShowPaymentSummary(true);

      notify.success("Payment details prepared. Please proceed with payment.");
    } catch (error) {
      console.error("Certificate payment error:", error);

      notify.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to prepare payment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen px-3 sm:px-6 lg:px-8 py-6 sm:py-8"
      style={{ background: "#F8FAFC" }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] font-semibold mb-4 sm:mb-5 bg-transparent border-none cursor-pointer transition-transform hover:-translate-x-1"
          style={{ color: "#2563EB" }}
        >
          ← Back
        </button>

        {/* Page title */}
        <div
          className="mb-5 sm:mb-6"
          style={{ animation: "fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          <h1
            className="text-xl sm:text-2xl font-extrabold"
            style={{ color: "#0F172A" }}
          >
            Apply for Certificate
          </h1>
          {doctor && (
            <p className="text-[13px] mt-1" style={{ color: "#64748B" }}>
              Requesting from{" "}
              <span
                onClick={() =>
                  navigate(`/client/doctor-profile/${doctor.doctorId}`)
                }
                className="font-semibold cursor-pointer hover:underline"
                style={{ color: "#2563EB" }}
              >
                {doctor.doctorName}
              </span>{" "}
              — {doctor.specialization}
            </p>
          )}
        </div>

        {/* Step indicator */}
        <div
          className="bg-white rounded-2xl px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-5 flex items-center"
          style={{
            border: "1px solid #E2E8F0",
            boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
          }}
        >
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-[12px] sm:text-[14px] font-bold transition-all duration-300 ${dotClass(i, currentStep)}`}
                  style={dotStyle(i, currentStep)}
                >
                  {i < currentStep ? "✓" : i + 1}
                </div>
                <span
                  className="text-[12px] sm:text-[14px] font-semibold hidden sm:block transition-colors"
                  style={labelStyle(i, currentStep)}
                >
                  {step}
                </span>
              </div>
              {i !== steps.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-2 sm:mx-3 rounded transition-all duration-300"
                  style={{
                    background: i < currentStep ? "#14B8A6" : "#E2E8F0",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ══ STEP 1 — TYPE ══════════════════════════════════════ */}
        {currentStep === 0 && (
          <StepCard>
            <StepHeading>Step 1 — Select Certificate Type</StepHeading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
              {certificateTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className="cursor-pointer rounded-xl px-4 py-3 transition-all duration-200"
                  style={
                    selectedType === type.id
                      ? {
                          border: "1.5px solid #2563EB",
                          background: "#EEF2FF",
                          boxShadow: "0 0 0 3px rgba(37,99,235,0.10)",
                        }
                      : {
                          border: "1px solid #E2E8F0",
                          background: "#F8FAFC",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (selectedType !== type.id)
                      e.currentTarget.style.borderColor = "#94A3B8";
                  }}
                  onMouseLeave={(e) => {
                    if (selectedType !== type.id)
                      e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                >
                  <div className="text-xl mb-1">{type.icon}</div>
                  <p
                    className="text-[13px] sm:text-[16px] font-semibold"
                    style={{
                      color: selectedType === type.id ? "#2563EB" : "#0F172A",
                    }}
                  >
                    {type.title}
                  </p>
                  <p
                    className="text-[11px] sm:text-[14px] mt-0.5"
                    style={{ color: "#64748B" }}
                  >
                    {type.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Assigned Doctor */}
            <div className="mb-4">
              <FieldLabel>
                🩺 Assigned Doctor <Req />
              </FieldLabel>

              {isDoctorFixed ? (
                <div
                  className="rounded-xl px-4 py-3"
                  style={{
                    background: "#EEF6FF",
                    border: "1px solid #BFDBFE",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                      style={{
                        background: "#DBEAFE",
                        color: "#2563EB",
                      }}
                    >
                      🩺
                    </div>

                    <div className="min-w-0">
                      <p
                        className="text-[14px] sm:text-[15px] font-bold"
                        style={{ color: "#0F172A" }}
                      >
                        {doctor?.doctorName || "Assigned Doctor"}
                      </p>

                      <p
                        className="text-[12px] sm:text-[13px]"
                        style={{ color: "#64748B" }}
                      >
                        {doctor?.specialization || "Medical Specialist"}
                      </p>
                    </div>

                    <div className="ml-auto">
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          color: "#166534",
                          background: "#DCFCE7",
                        }}
                      >
                        Assigned
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <Select
                  options={doctorOptions}
                  placeholder="Search doctor..."
                  styles={selectStyles}
                  value={
                    doctor
                      ? {
                          value: doctor.doctorId || doctor.id,
                          label: `${doctor.doctorName} — ${doctor.specialization}`,
                        }
                      : null
                  }
                  onChange={(sel) => {
                    if (!sel) return;

                    const selected = doctors.find(
                      (d) => String(d.doctorId || d.id) === String(sel.value),
                    );

                    setDoctor(
                      selected
                        ? {
                            ...selected,
                            doctorId: selected.doctorId || selected.id,
                          }
                        : null,
                    );

                    setErrors((p) => ({
                      ...p,
                      doctor: "",
                    }));
                  }}
                />
              )}

              <ErrMsg msg={errors.doctor} />
            </div>

            {/* Purpose */}
            <div className="mb-4">
              <FieldLabel>
                📌 Purpose of Certificate <Req />
              </FieldLabel>
              <StyledSelect
                value={purpose}
                onChange={(e) => {
                  setPurpose(e.target.value);
                  setErrors((p) => ({ ...p, purpose: "" }));
                }}
              >
                <option value="">Select Purpose</option>
                <option value="Employment / Job">Employment / Job</option>
                <option value="Sports / Athletic activity">
                  Sports / Athletic activity
                </option>
                <option value="Travel">Travel</option>
                <option value="School / Education">School / Education</option>
                <option value="Insurance">Insurance</option>
                <option value="Legal/ Court">Legal / Court</option>
                <option value="Other">Other</option>
              </StyledSelect>
              <ErrMsg msg={errors.purpose} />
            </div>

            {/* Notes */}
            <div className="mb-2">
              <FieldLabel>📝 Additional Notes for Doctor</FieldLabel>
              <StyledTextarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific medical conditions or notes for the doctor…"
              />
            </div>

            <ActionButtons
              onCancel={() => navigate(-1)}
              onNext={handleNext}
              isFirst
            />
          </StepCard>
        )}

        {/* ══ STEP 2 — MEDICAL DETAILS ═══════════════════════════ */}
        {currentStep === 1 && (
          <StepCard>
            <StepHeading>Step 2 — Medical Details</StepHeading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <FieldBox label="👤 Full Name">
                <StyledInput
                  type="text"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <ErrMsg msg={errors.fullName} />
              </FieldBox>

              <FieldBox label="🎂 Date of Birth">
                <StyledInput
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
                <ErrMsg msg={errors.dob} />
              </FieldBox>

              <FieldBox label="⚧️ Gender">
                <StyledSelect
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </StyledSelect>
                <ErrMsg msg={errors.gender} />
              </FieldBox>

              <FieldBox label="🩸 Blood Group">
                <StyledSelect
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg}>{bg}</option>
                  ))}
                </StyledSelect>
              </FieldBox>

              <FieldBox label="📏 Height (cm)">
                <StyledInput
                  type="number"
                  placeholder="e.g. 170"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
                <ErrMsg msg={errors.height} />
              </FieldBox>

              <FieldBox label="⚖️ Weight (kg)">
                <StyledInput
                  type="number"
                  placeholder="e.g. 65"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                <ErrMsg msg={errors.weight} />
              </FieldBox>
            </div>

            <div className="mb-4">
              <FieldBox label="🏥 Known Medical Conditions">
                <StyledTextarea
                  placeholder="Diabetes, Hypertension, Asthma..."
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                />
              </FieldBox>
            </div>
            <div className="mb-6">
              <FieldBox label="💊 Current Medications">
                <StyledTextarea
                  placeholder="Metformin 500mg, Amlodipine..."
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                />
              </FieldBox>
            </div>

            <ActionButtons onBack={handleBack} onNext={handleNext} />
          </StepCard>
        )}

        {/* ══ STEP 3 — DOCUMENTS ═════════════════════════════════ */}
        {currentStep === 2 && (
          <StepCard>
            <StepHeading>Step 3 — Upload Documents</StepHeading>
            <div className="space-y-4">
              {DOC_FIELDS.map((doc) => (
                <FileUploadCard
                  key={doc.field}
                  {...doc}
                  file={documents[doc.field]}
                  error={errors[doc.field]}
                  onUpload={handleFileChange}
                  onDelete={handleDeleteDoc}
                />
              ))}
            </div>
            <ActionButtons onBack={handleBack} onNext={handleNext} />
          </StepCard>
        )}

        {/* ══ STEP 4 — REVIEW ════════════════════════════════════ */}
        {currentStep === 3 && (
          <StepCard>
            <StepHeading>Step 4 — Review &amp; Submit</StepHeading>

            {/* Summary grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-5">
              {[
                { label: "Full Name", value: fullName, icon: "👤" },
                { label: "Date of Birth", value: dob, icon: "🎂" },
                { label: "Gender", value: gender, icon: "⚧️" },
                { label: "Blood Group", value: bloodGroup, icon: "🩸" },
                {
                  label: "Certificate Type",
                  value: certificateTypes.find((c) => c.id === selectedType)
                    ?.title,
                  icon: "📋",
                },
                { label: "Purpose", value: purpose, icon: "📌" },
                {
                  label: "Doctor",
                  value: doctor?.doctorName || "Not assigned",
                  icon: "🩺",
                },
                {
                  label: "Specialization",
                  value: doctor?.specialization || "—",
                  icon: "🏥",
                },
                {
                  label: "Height",
                  value: height ? `${height} cm` : "—",
                  icon: "📏",
                },
                {
                  label: "Weight",
                  value: weight ? `${weight} kg` : "—",
                  icon: "⚖️",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl px-4 py-3"
                  style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
                >
                  <p
                    className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "#94A3B8" }}
                  >
                    {item.icon} {item.label}
                  </p>
                  <p
                    className="text-[13px] sm:text-[14px] font-semibold truncate"
                    style={{ color: "#0F172A" }}
                  >
                    {item.value || "—"}
                  </p>
                </div>
              ))}

              {notes && (
                <div
                  className="sm:col-span-2 rounded-xl px-4 py-3"
                  style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
                >
                  <p
                    className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "#94A3B8" }}
                  >
                    📝 Notes
                  </p>
                  <p
                    className="text-[13px] sm:text-[14px]"
                    style={{ color: "#0F172A" }}
                  >
                    {notes}
                  </p>
                </div>
              )}
            </div>

            {/* Uploaded documents preview */}
            {Object.values(documents).some(Boolean) && (
              <div className="mb-5">
                <h3
                  className="text-[14px] sm:text-[15px] font-bold mb-3"
                  style={{ color: "#0F172A" }}
                >
                  📄 Uploaded Documents
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {Object.entries(documents).map(([key, file]) => {
                    if (!file) return null;
                    const isImage = file.type?.startsWith("image/");
                    const labels = {
                      profilePhoto: "Profile Photo",
                      idProof: "ID Proof",
                      medicalReports: "Medical Reports",
                      prescription: "Prescription",
                    };
                    return (
                      <div
                        key={key}
                        className="rounded-xl p-3"
                        style={{
                          border: "1px solid #E2E8F0",
                          background: "#F8FAFC",
                        }}
                      >
                        <p
                          className="text-[10px] sm:text-xs font-semibold mb-2 truncate"
                          style={{ color: "#94A3B8" }}
                        >
                          {labels[key]}
                        </p>
                        {isImage ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={labels[key]}
                            className="w-full h-20 sm:h-24 object-cover rounded-lg mb-2"
                          />
                        ) : (
                          <div
                            className="flex items-center justify-center h-20 sm:h-24 rounded-lg mb-2 text-sm"
                            style={{ background: "#EEF2FF", color: "#64748B" }}
                          >
                            📄 PDF
                          </div>
                        )}
                        <button
                          onClick={() => window.open(URL.createObjectURL(file))}
                          className="text-xs font-semibold hover:underline"
                          style={{ color: "#2563EB" }}
                        >
                          View
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div
              className="rounded-xl px-4 py-3 mb-2"
              style={{
                background: "#EEF2FF",
                border: "1px solid rgba(37,99,235,0.20)",
              }}
            >
              <p
                className="text-[11px] sm:text-[12px] leading-relaxed"
                style={{ color: "#2563EB" }}
              >
                ℹ️ By submitting, you confirm that all information provided is
                accurate. The assigned doctor will review and issue the
                certificate.
              </p>
            </div>

            <ActionButtons
              onBack={handleBack}
              onSubmit={handleSubmit}
              submitting={isSubmitting}
              submitLabel="✅ Submit Request"
            />
          </StepCard>
        )}
        {/* =========================================================
    PAYMENT SUMMARY
========================================================= */}
        {/* =========================================================
    PAYMENT SUMMARY POPUP
========================================================= */}
        {showPaymentSummary && paymentData && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            style={{
              background: "rgba(15, 23, 42, 0.55)",
              backdropFilter: "blur(5px)",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowPaymentSummary(false);
              }
            }}
          >
            <div
              className="w-full max-w-md bg-white rounded-2xl overflow-hidden"
              style={{
                boxShadow: "0 25px 70px rgba(15,23,42,0.25)",
                animation: "fadeUp 0.25s ease-out",
              }}
            >
              {/* Header */}
              <div
                className="px-5 sm:px-6 py-4 flex items-center justify-between"
                style={{
                  borderBottom: "1px solid #E2E8F0",
                  background: "#FFFFFF",
                }}
              >
                <div>
                  <h2
                    className="text-lg sm:text-xl font-bold"
                    style={{ color: "#0F172A" }}
                  >
                    Payment Details
                  </h2>

                  <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                    Review your payment before proceeding
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPaymentSummary(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all"
                  style={{
                    color: "#64748B",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#F1F5F9";
                    e.currentTarget.style.color = "#0F172A";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#F8FAFC";
                    e.currentTarget.style.color = "#64748B";
                  }}
                >
                  ×
                </button>
              </div>

              {/* Payment Body */}
              <div className="px-5 sm:px-6 py-5">
                {/* Payment Type */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-sm sm:text-[15px]"
                    style={{ color: "#475569" }}
                  >
                    Payment Type
                  </span>

                  <span
                    className="text-sm sm:text-[15px] font-semibold"
                    style={{ color: "#0F172A" }}
                  >
                    Online
                  </span>
                </div>

                {/* MRP */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-sm sm:text-[15px]"
                    style={{ color: "#475569" }}
                  >
                    MRP Total
                  </span>

                  <span
                    className="text-sm sm:text-[15px] font-semibold"
                    style={{ color: "#0F172A" }}
                  >
                    ₹ {Number(paymentData.doctorFee || 0).toFixed(2)}
                  </span>
                </div>

                {/* Discount */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-sm sm:text-[15px]"
                    style={{ color: "#475569" }}
                  >
                    Discount
                  </span>

                  <span
                    className="text-sm sm:text-[15px] font-semibold"
                    style={{ color: "#16A34A" }}
                  >
                    - ₹ 0.00
                  </span>
                </div>

                {/* Platform Charges */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-sm sm:text-[15px]"
                    style={{ color: "#475569" }}
                  >
                    Platform Charges
                  </span>

                  <span
                    className="text-sm sm:text-[15px] font-semibold"
                    style={{ color: "#0F172A" }}
                  >
                    ₹ {Number(paymentData.platformFee || 0).toFixed(2)}
                  </span>
                </div>

                {/* Taxes */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-sm sm:text-[15px]"
                    style={{ color: "#475569" }}
                  >
                    Taxes
                  </span>

                  <span
                    className="text-sm sm:text-[15px] font-semibold"
                    style={{ color: "#0F172A" }}
                  >
                    ₹ {Number(paymentData.tax || 0).toFixed(2)}
                  </span>
                </div>

                {/* Divider */}
                <div
                  className="border-t my-4"
                  style={{ borderColor: "#E2E8F0" }}
                />

                {/* Total */}
                <div
                  className="rounded-xl px-4 py-3.5 mb-5"
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-base sm:text-lg font-bold"
                      style={{ color: "#0F172A" }}
                    >
                      Total Payable
                    </span>

                    <span
                      className="text-lg sm:text-xl font-bold"
                      style={{ color: "#2563EB" }}
                    >
                      ₹ {Number(paymentData.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Proceed Payment */}
                <button
                  type="button"
                  onClick={handleProceedPayment}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl text-sm sm:text-[15px] font-bold text-white transition-all"
                  style={{
                    background: isSubmitting ? "#94A3B8" : "#2563EB",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    boxShadow: isSubmitting
                      ? "none"
                      : "0 4px 14px rgba(37,99,235,0.25)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.background = "#1D4ED8";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.background = "#2563EB";
                    }
                  }}
                >
                  {isSubmitting ? "Opening Payment..." : "Proceed to Payment"}
                </button>

                {/* Secure Payment */}
                <p
                  className="text-center text-[11px] mt-3"
                  style={{ color: "#94A3B8" }}
                >
                  🔒 Secure payment powered by Razorpay
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestCertificate;
