import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import {notify } from "../../../utils/notify";
const CertificateService = ({
  openFromDashboard = false,
  onClose,

  certificateEnabled: externalCertificateEnabled,
  setCertificateEnabled: externalSetCertificateEnabled,

  certificateFee: externalCertificateFee,
  setCertificateFee: externalSetCertificateFee,

  initialMode = "start",
}) => {
  const [localCertificateEnabled, setLocalCertificateEnabled] = useState(false);

  const [localCertificateFee, setLocalCertificateFee] = useState(0);

  const [localCertificateInstructions, setLocalCertificateInstructions] =
    useState("");

  const [fee, setFee] = useState("");
  const [instructions, setInstructions] = useState("");
  const [modalEnabled, setModalEnabled] = useState(false);
  const [modalMode, setModalMode] = useState(initialMode);

  const [serviceExists, setServiceExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const certificateEnabled =
    externalCertificateEnabled !== undefined
      ? externalCertificateEnabled
      : localCertificateEnabled;

  const setCertificateEnabled =
    externalSetCertificateEnabled || setLocalCertificateEnabled;

  const certificateFee =
    externalCertificateFee !== undefined
      ? externalCertificateFee
      : localCertificateFee;

  const setCertificateFee = externalSetCertificateFee || setLocalCertificateFee;

  const certificateInstructions = localCertificateInstructions;

  const setCertificateInstructions = setLocalCertificateInstructions;

  const loadCertificateService = async (mode = initialMode) => {
    try {
      setLoading(true);

      const response = await api.get("/doctor/get-certificate");

      if (!response.data?.success) {
        return;
      }

      const data = response.data.data;

      const exists = data?.id !== undefined && data?.id !== null;

      if (exists) {
        setServiceExists(true);

        const enabled = Boolean(data.enabled);
        const savedFee = Number(data.fee || 0);
        const savedInstructions = data.instructions || "";

        // Dashboard
        setCertificateEnabled(enabled);
        setCertificateFee(savedFee);
        setCertificateInstructions(savedInstructions);

        // Popup
        setModalEnabled(enabled);
        setFee(savedFee > 0 ? String(savedFee) : "");

        setInstructions(savedInstructions);

        return;
      }

      setServiceExists(false);

      setCertificateEnabled(false);
      setCertificateFee(0);
      setCertificateInstructions("");

      setFee("");
      setInstructions("");

      if (mode === "start") {
        setModalEnabled(true);
      } else {
        setModalEnabled(false);
      }
    } catch (error) {
      console.error("Get certificate service error:", error);

      notify.error(
        error.response?.data?.message || "Failed to load certificate service",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (openFromDashboard) {
      setModalMode(initialMode);
      loadCertificateService(initialMode);
    }
  }, [openFromDashboard, initialMode]);

  const closeCertificateModal = () => {
    if (onClose) {
      onClose();
    }
  };

  const toggleCertificate = async () => {
    const newEnabled = !modalEnabled;

    if (!serviceExists) {
      setModalEnabled(newEnabled);
      return;
    }

    try {
      setLoading(true);

      let currentFee = Number(fee || 0);

      if (newEnabled && currentFee <= 0) {
        const response = await api.get("/doctor/get-certificate");

        if (response.data?.success && response.data?.data) {
          const data = response.data.data;

          currentFee = Number(data.fee || 0);

          setFee(currentFee > 0 ? String(currentFee) : "");
          setInstructions(data.instructions || "");
          setServiceExists(Boolean(data.id));

          setCertificateFee(currentFee);
        }
      }

      if (newEnabled && currentFee <= 0) {
        notify.error("Please set certificate fee first.");
        return;
      }

      const response = await api.patch("/doctor/certificate/toggle", {
        enabled: newEnabled,
      });

      if (response.data?.success) {
        const data = response.data.data;

        const enabled = Boolean(data.enabled);
        const savedFee = Number(data.fee || currentFee || 0);

        // Popup
        setModalEnabled(enabled);
        setFee(savedFee > 0 ? String(savedFee) : "");

        // Dashboard
        setCertificateEnabled(enabled);
        setCertificateFee(savedFee);

        notify.success(
          response.data.message || "Certificate service updated successfully",
        );
      }
    } catch (error) {
      console.error("Toggle certificate service error:", error);

      notify.error(
        error.response?.data?.message || "Failed to update certificate service",
      );
    } finally {
      setLoading(false);
    }
  };

  const saveCertificateService = async () => {
    const numericFee = Number(fee);


    if (modalEnabled && (!numericFee || numericFee <= 0)) {
      notify.error("Please enter a valid certificate fee.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/doctor/save-certificate", {
        enabled: modalEnabled,
        fee: modalEnabled ? numericFee : 0,
        instructions: instructions?.trim() || null,
      });

      if (response.data?.success) {
        const data = response.data.data;

        setServiceExists(true);

        const enabled = Boolean(data.enabled);
        const savedFee = Number(data.fee || 0);
        const savedInstructions = data.instructions || "";

        setCertificateEnabled(enabled);
        setCertificateFee(savedFee);
        setCertificateInstructions(savedInstructions);

        setModalEnabled(enabled);
        setFee(savedFee > 0 ? String(savedFee) : "");
        setInstructions(savedInstructions);

        closeCertificateModal();

        notify.success(
          response.data.message || "Certificate service saved successfully",
        );
      }
    } catch (error) {
      console.error("Save certificate service error:", error);

      notify.error(
        error.response?.data?.message || "Failed to save certificate service",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!openFromDashboard) {
    return null;
  }
  return (
    <div
      className=" fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeCertificateModal();
        }
      }}
    >

      <div className=" w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className=" flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className=" text-lg font-semibold text-slate-800">
              {modalMode === "start"
                ? "Start Certificate Service"
                : "Configure Certificate Service"}
            </h2>

            <p className=" text-xs text-slate-500 mt-1">
              {modalMode === "start"
                ? "Configure your certificate service."
                : "Manage certificate availability and pricing."}
            </p>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={closeCertificateModal}
            className=" w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6">
          <div className=" flex items-center justify-between pb-5 border-b border-slate-100">
            <div>
              <h3 className=" text-sm font-semibold text-slate-800">
                Provide Certificate
              </h3>
              <p className=" text-xs text-slate-500 mt-1 max-w-sm">
                Allow patients to apply for certificates from your profile.
              </p>
            </div>

            {/* Toggle */}
            <button
              type="button"
              onClick={toggleCertificate}
              disabled={loading}
              aria-label="Toggle certificate service"
              className={` relative inline-flex h-7 w-12 flex-shrink-0 rounded-full transition-colors
                ${modalEnabled ? "bg-emerald-500" : "bg-slate-300"}
              `}
            >
              <span
                className={` inline-block h-5 w-5 mt-1 rounded-full bg-white shadow transition-all
                  ${modalEnabled ? "ml-6" : "ml-1"}
                `}
              />
            </button>
          </div>

          <div className="mt-6">
            <label
              htmlFor="certificateFee"
              className=" block text-sm font-semibold text-slate-800"
            >
              Certificate Fee (₹)
            </label>

            <p className=" text-xs text-slate-500 mt-1 mb-3">
              Set the amount patients need to pay for the certificate.
            </p>

            <div className="relative">
              <span className=" absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                ₹
              </span>

              <input
                id="certificateFee"
                type="number"
                value={fee}
                min="0"
                onChange={(e) => setFee(e.target.value)}
                placeholder="Enter certificate fee"
                disabled={!modalEnabled}
                className={` w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition
                  ${
                    modalEnabled
                      ? `
                        border-slate-200
                        text-slate-800
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-100
                      `
                      : `
                        border-slate-200
                        bg-slate-100
                        text-slate-400
                        cursor-not-allowed
                      `
                  }
                `}
              />
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="instructions"
              className="block text-sm font-semibold text-slate-800"
            >
              Certificate / Service Instructions{" "}
              <span className=" font-normal text-slate-400">(Optional)</span>
            </label>

            <p className="text-xs text-slate-500 mt-1 mb-3">
              Add instructions or requirements for patients.
            </p>

            <textarea
              id="instructions"
              rows="4"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Example: Patient must provide valid medical records..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 resize-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition
              "
            />
          </div>

          <div className="mt-5 flex gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <svg
              className="w-5 h-5 text-blue-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>

            <p className=" text-xs leading-5 text-blue-700">
              Patients will pay the certificate fee plus the platform fee when
              submitting an application.
            </p>
          </div>
        </div>

        <div className=" flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          {/* Cancel */}
          <button
            type="button"
            onClick={closeCertificateModal}
            className=" px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          {/* Save */}
          <button
            type="button"
            onClick={saveCertificateService}
            disabled={loading}
            className=" px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition shadow-sm"
          >
            {loading
              ? "Saving..."
              : modalMode === "start"
                ? "Start Service"
                : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateService;
