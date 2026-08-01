import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { notify } from "../../../utils/notify";

const AddPrescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isUpdate, setIsUpdate] = useState(false);

  /* ================= LOAD EXISTING PRESCRIPTION ================= */
  useEffect(() => {
    const loadPrescription = async () => {
      setFetchLoading(true);
      try {
        const res = await api.get(`/doctor/prescription/${id}`);
        if (res.data) {
          setMedicines(res.data.medicines || "");
          setInstructions(res.data.instructions || "");
          setIsUpdate(true);
        }
      } catch {
        console.log("No previous prescription");
      } finally {
        setFetchLoading(false);
      }
    };
    loadPrescription();
  }, [id]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!medicines.trim() && !instructions.trim()) {
      notify.info("Please add medicines or instructions");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post(`/doctor/appointments/${id}/prescription`, {
        medicines,
        instructions,
      });
      notify.success(res.data?.message || "Prescription saved successfully");
      navigate("/doctordashboard/livequeue");
    } catch (error) {
      console.error(error);
      notify.error("Failed to save prescription");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING STATE ================= */
  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#64748B] text-sm font-medium">
            Loading prescription...
          </p>
        </div>
      </div>
    );
  }

  /* ================= MAIN UI ================= */
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 flex items-start justify-center">
      <div className="w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">

        {/* ── Header ── */}
        <div className="flex items-center gap-4 pb-5 mb-5 border-b border-[#E2E8F0]">
          <div className="w-11 h-11 bg-[#EEF2FF] rounded-xl flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-[#2563EB]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-3-3v6M4 6h16M4 10h4m-4 4h4m-4 4h16"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[#0F172A]">
              {isUpdate ? "Update Prescription" : "Add Prescription"}
            </h2>
            <p className="text-[#64748B] text-sm mt-0.5">
              {isUpdate
                ? "Edit the existing prescription details below"
                : "Fill in medicines and instructions for the patient"}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-[#EEF2FF] text-[#2563EB] text-xs font-semibold px-3 py-1 rounded-full border border-indigo-200">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isUpdate ? "bg-[#14B8A6]" : "bg-[#2563EB]"
              }`}
            />
            {isUpdate ? "Update" : "New"}
          </span>
        </div>

        {/* ── Info Banner ── */}
        <div className="flex items-start gap-3 bg-[#EEF2FF] border border-indigo-200 rounded-xl px-4 py-3 mb-6">
          <svg
            className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 8h.01M12 12v4" />
          </svg>
          <p className="text-[#1e40af] text-sm leading-relaxed">
            At least one field — medicines or instructions — must be filled before saving.
          </p>
        </div>

        {/* ── Medicines Field ── */}
        <div className="mb-5">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#0F172A] mb-2">
            <svg
              className="w-4 h-4 text-[#2563EB]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
              />
            </svg>
            Medicines
          </label>
          <textarea
            value={medicines}
            onChange={(e) => setMedicines(e.target.value)}
            placeholder={`e.g. Paracetamol 500mg — twice daily after meals\nCetirizine 10mg — once at night`}
            rows={5}
            className="w-full border-[1.5px] border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] bg-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 resize-none transition-all"
          />
          <p className="text-xs text-[#64748B] mt-1.5 flex items-center gap-1">
            <svg
              className="w-3 h-3 text-[#94A3B8]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8h.01M12 12v4" />
            </svg>
            List each medicine on a new line
          </p>
        </div>

        {/* ── Instructions Field ── */}
        <div className="mb-7">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#0F172A] mb-2">
            <svg
              className="w-4 h-4 text-[#2563EB]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Take medicines after food. Drink plenty of water. Avoid cold beverages. Rest for 2 days."
            rows={4}
            className="w-full border-[1.5px] border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] bg-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 resize-none transition-all"
          />
          <p className="text-xs text-[#64748B] mt-1.5 flex items-center gap-1">
            <svg
              className="w-3 h-3 text-[#94A3B8]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8h.01M12 12v4" />
            </svg>
            Add dietary or lifestyle instructions for the patient
          </p>
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-[#E2E8F0] mb-6" />

        {/* ── Actions ── */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 border-[1.5px] border-[#E2E8F0] rounded-lg text-sm font-medium text-[#64748B] bg-white hover:bg-[#F8FAFC] hover:border-[#94A3B8] hover:text-[#0F172A] transition-all cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all ${
              loading
                ? "bg-[#2563EB]/60 cursor-not-allowed"
                : "bg-[#2563EB] hover:bg-[#1D4ED8] cursor-pointer active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 3v4H8M12 17v-6"
                  />
                </svg>
                {isUpdate ? "Update Prescription" : "Save Prescription"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPrescription;