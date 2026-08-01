import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { notify } from "../../../utils/notify";
import { UserPlus } from "lucide-react";
import FamilyService from "../../../services/FamilyService";

const ConfirmModal = ({ text, onYes, onNo }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={onNo}
    />
    <div
      className="relative bg-white rounded-2xl w-full max-w-sm mx-4 p-6 z-10 animate-[scaleIn_0.25s_cubic-bezier(0.34,1.56,0.64,1)_both]"
      style={{
        boxShadow: "0 20px 60px rgba(12,30,58,0.2)",
        border: "1px solid rgba(12,30,58,0.08)",
      }}
    >
      <h3 className="font-[family-name:var(--font-playfair)] text-[17px] font-bold text-[#0c1e3a] mb-2">
        Confirm Action
      </h3>
      <p className="font-[family-name:var(--font-dm)] text-[14px] text-[#64748b] mb-6">
        {text}
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onNo}
          className="font-[family-name:var(--font-dm)] font-semibold text-[13px] px-5 py-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-[#f0f4f8]"
          style={{
            color: "#64748b",
            background: "#f8fafc",
            border: "1px solid rgba(12,30,58,0.1)",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onYes}
          className="font-[family-name:var(--font-dm)] font-bold text-[13px] px-5 py-2 rounded-xl text-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg,#0086C3,#00b4d8)",
            boxShadow: "0 4px 12px rgba(0,134,195,0.35)",
          }}
        >
          Yes, Update
        </button>
      </div>
    </div>
  </div>
);

const AddFamilyPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [familyMember, setFamilyMember] = useState({
    fullName: "",
    gender: "",
    dob: "",
    heightCm: "",
    weightKg: "",
    bloodGroup: "",
    relation: "",
  });

  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    const fetchMember = async () => {
      try {
        const data = await FamilyService.getById(id);
        setFamilyMember({
          ...data,
          dob: data.dob ? data.dob.split("T")[0] : "",
        });
      } catch {
        notify.error("Failed to load family member");
      }
    };
    fetchMember();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFamilyMember((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!familyMember.fullName.trim()) newErrors.fullName = "Required";
    if (!familyMember.gender) newErrors.gender = "Required";
    if (!familyMember.dob) newErrors.dob = "Required";
    if (!familyMember.relation) newErrors.relation = "Required";
    if (!familyMember.heightCm || Number(familyMember.heightCm) <= 0)
      newErrors.heightCm = "Valid height required";
    if (!familyMember.weightKg || Number(familyMember.weightKg) <= 0)
      newErrors.weightKg = "Valid weight required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (isEdit) {
      setShowUpdateConfirm(true);
      return;
    }
    try {
      setLoading(true);
      await FamilyService.create(familyMember);
      notify.success("Family member added successfully!");
      navigate(-1);
    } catch {
      notify.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  const submitUpdate = async () => {
    try {
      setLoading(true);
      await FamilyService.update(id, familyMember);
      notify.success("Family member updated successfully!");
      navigate(-1);
    } catch {
      notify.error("Action failed");
    } finally {
      setLoading(false);
      setShowUpdateConfirm(false);
    }
  };

  const inputCls = (field) =>
    `w-full mt-1.5 px-4 py-2.5 rounded-xl font-[family-name:var(--font-dm)] text-[14px] text-[#0c1e3a] outline-none transition-all duration-200 ${
      errors[field]
        ? "border-2 border-red-400 bg-red-50"
        : "border border-[rgba(12,30,58,0.12)] bg-white focus:border-[#0086C3] focus:border-2"
    }`;

  const labelCls =
    "text-[12px] font-semibold uppercase tracking-wider  block";

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 flex justify-center"
      style={{ background: "#f0f4f8" }}
    >
      <div className="w-full max-w-2xl animate-[fadeUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
        <button
          onClick={() => navigate(-1)}
          className="font-[family-name:var(--font-dm)] text-[13px] font-semibold mb-5 flex items-center gap-1.5 cursor-pointer transition-all duration-200 hover:-translate-x-1"
          style={{ color: "#0086C3", background: "none", border: "none" }}
        >
          ← Back
        </button>

        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            boxShadow: "0 4px 32px rgba(12,30,58,0.1)",
            border: "1px solid rgba(12,30,58,0.06)",
          }}
        >
          <div
            className="px-7 py-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#2563EB,#14B8A6)",
            }}
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="relative flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <UserPlus size={18} color="white" />
              </div>
              <div>
                <h1 className="text-[20px] font-bold text-white leading-tight">
                  {isEdit ? "Update Member" : "Add Family Member"}
                </h1>
                <p className="text-[14px] text-white/90 mt-0.5">
                  {isEdit
                    ? "Edit the details below"
                    : "Fill in the details to add a new member"}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="px-7 py-6 grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            <div className="sm:col-span-1">
              <label className={labelCls}>
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                name="fullName"
                value={familyMember.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                className={inputCls("fullName")}
              />
              {errors.fullName && (
                <p className="text-red-400 text-[11px] mt-1 font-[family-name:var(--font-dm)]">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>
                Gender <span className="text-red-400">*</span>
              </label>
              <select
                name="gender"
                value={familyMember.gender}
                onChange={handleChange}
                className={inputCls("gender")}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-400 text-[11px] mt-1 font-[family-name:var(--font-dm)]">
                  {errors.gender}
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>
                Relation <span className="text-red-400">*</span>
              </label>
              <select
                name="relation"
                value={familyMember.relation}
                onChange={handleChange}
                className={inputCls("relation")}
              >
                <option value="">Select Relation</option>
                {[
                  "FATHER",
                  "MOTHER",
                  "SPOUSE",
                  "SON",
                  "DAUGHTER",
                  "BROTHER",
                  "SISTER",
                  "OTHER",
                ].map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              {errors.relation && (
                <p className="text-red-400 text-[11px] mt-1 font-[family-name:var(--font-dm)]">
                  {errors.relation}
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>
                Blood Group (optional) <span className="text-red-400">*</span>
              </label>
              <select
                name="bloodGroup"
                value={familyMember.bloodGroup}
                onChange={handleChange}
                className={inputCls("bloodGroup")}
              >
                <option value="">Select</option>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                  (bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ),
                )}
              </select>
              {errors.bloodGroup && (
                <p className="text-red-400 text-[11px] mt-1 font-[family-name:var(--font-dm)]">
                  {errors.bloodGroup}
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>
                Height (cm) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="heightCm"
                value={familyMember.heightCm}
                onChange={handleChange}
                placeholder="e.g. 170"
                className={inputCls("heightCm")}
              />
              {errors.heightCm && (
                <p className="text-red-400 text-[11px] mt-1 font-[family-name:var(--font-dm)]">
                  {errors.heightCm}
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>
                Weight (kg) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="weightKg"
                value={familyMember.weightKg}
                onChange={handleChange}
                placeholder="e.g. 65"
                className={inputCls("weightKg")}
              />
              {errors.weightKg && (
                <p className="text-red-400 text-[11px] mt-1 font-[family-name:var(--font-dm)]">
                  {errors.weightKg}
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>
                Date of Birth <span className="text-red-400">*</span>
              </label>
              <input
                type={familyMember.dob ? "date" : "text"}
                placeholder="Date of Birth"
                name="dob"
                value={familyMember.dob || ""}
                onMouseDown={(e) => {
                  e.target.type = "date";
                  setTimeout(() => e.target.showPicker?.(), 0);
                }}
                onTouchStart={(e) => {
                  e.target.type = "date";
                  setTimeout(() => e.target.showPicker?.(), 0);
                }}
                onBlur={(e) => {
                  if (!familyMember.dob) e.target.type = "text";
                }}
                onChange={handleChange}
                className={inputCls("dob")}
                style={{ colorScheme: "light" }}
                max={new Date().toISOString().split("T")[0]}
              />
              {errors.dob && (
                <p className="text-red-400 text-[11px] mt-1 font-[family-name:var(--font-dm)]">
                  {errors.dob}
                </p>
              )}
            </div>

            <div
              className="sm:col-span-2 h-px"
              style={{ background: "rgba(12,30,58,0.07)" }}
            />

            <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="font-[family-name:var(--font-dm)] font-semibold text-[14px] px-6 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:bg-[#f0f4f8]"
                style={{
                  color: "#64748b",
                  background: "#f8fafc",
                  border: "1px solid rgba(12,30,58,0.1)",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="font-[family-name:var(--font-dm)] font-bold text-[14px] px-6 py-2.5 rounded-xl text-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg,#0086C3,#00b4d8)",
                  boxShadow: "0 4px 14px rgba(0,134,195,0.35)",
                }}
                onMouseEnter={(e) =>
                  !loading &&
                  (e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(0,134,195,0.5)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 4px 14px rgba(0,134,195,0.35)")
                }
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : isEdit ? (
                  "Update Member"
                ) : (
                  "Save Member"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showUpdateConfirm && (
        <ConfirmModal
          text="Are you sure you want to update this family member?"
          onNo={() => setShowUpdateConfirm(false)}
          onYes={submitUpdate}
        />
      )}
    </div>
  );
};

export default AddFamilyPage;
