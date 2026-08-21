import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notify } from "../../../utils/notify";
import { useImage } from "../../../context/ImageContext";
import {
  uploadProfileImageApi,
  getProfileImageApi,
  deleteProfileImageApi,
} from "../../../services/PatientProfileImageApi";
import { PatientGetProfileApi } from "../../../services/patient/profile/PatientGetProfileApi";
import { PatientUpdateProfileApi } from "../../../services/patient/profile/PatientUpdateProfileApi";
import { FaCamera, FaTrash } from "react-icons/fa";

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const formatDateForInput = (iso) =>
  iso ? new Date(iso).toISOString().split("T")[0] : "";

function FloatingInput({ label, icon, readOnly, ...props }) {
  return (
    <div
      className={`flex items-center gap-3.5 bg-[#fafafa] border border-black/[0.07] rounded-[10px] px-[18px] py-3.5 transition-all duration-200
      ${!readOnly ? "focus-within:border-[#3d6b8e] focus-within:ring-2 focus-within:ring-[rgba(61,107,142,0.12)] focus-within:bg-white" : ""}`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0
        ${readOnly ? "bg-[#f0f0f0] text-[#8a8680]" : "bg-[#e8f0f6] text-[#3d6b8e]"}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <label className="block text-[10.5px] font-medium tracking-[0.07em] uppercase text-[#8a8680] mb-[3px]">
          {label}
        </label>
        <input
          {...props}
          readOnly={readOnly}
          className={`font-dm block w-full bg-transparent border-none outline-none text-[14.5px] font-normal leading-[1.4] placeholder-[#c5c1bc] p-0
            ${readOnly ? "text-[#8a8680] cursor-default" : "text-[#1a1814]"}`}
        />
      </div>
    </div>
  );
}

function FloatingSelect({ label, icon, ...props }) {
  return (
    <div className="flex items-center gap-3.5 bg-[#fafafa] border border-black/[0.07] rounded-[10px] px-[18px] py-3.5 transition-all duration-200 focus-within:border-[#3d6b8e] focus-within:ring-2 focus-within:ring-[rgba(61,107,142,0.12)] focus-within:bg-white">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 bg-[#e8f0f6] text-[#3d6b8e]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <label className="block text-[10.5px] font-medium tracking-[0.07em] uppercase text-[#8a8680] mb-[3px]">
          {label}
        </label>
        <select
          {...props}
          className="font-dm block w-full bg-transparent border-none outline-none text-[14.5px] text-[#1a1814] p-0 cursor-pointer appearance-none"
        >
          <option value="">Select</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
    </div>
  );
}

function ConfirmModal({ text, subtitle, onNo, onYes, danger }) {
  return (
    <div className="animate-fade-in fixed inset-0 bg-[rgba(10,8,6,0.45)] backdrop-blur-[6px] flex items-center justify-center z-[100]">
      <div
        className="animate-scale-in bg-white rounded-[20px] px-9 py-10 w-[340px] text-center"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}
      >
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-[22px] mx-auto mb-5
          ${danger ? "bg-[#fdf0ef]" : "bg-[#e8f0f6]"}`}
        >
          {danger ? "⚠️" : "✦"}
        </div>
        <h3 className="font-playfair text-[22px] font-semibold text-[#1a1814] m-0 mb-2">
          {text}
        </h3>
        {subtitle && (
          <p className="font-dm text-[13px] text-[#8a8680] m-0 mb-7">
            {subtitle}
          </p>
        )}
        <div className="flex gap-2.5 justify-center">
          <button
            onClick={onNo}
            className="font-dm px-7 py-2.5 rounded-full text-[14px] font-medium text-[#8a8680] bg-[#f0eeec] border-none cursor-pointer transition hover:bg-[#e8e5e2] hover:text-[#1a1814]"
          >
            Cancel
          </button>
          <button
            onClick={onYes}
            className={`font-dm px-7 py-2.5 rounded-full text-[14px] font-medium text-white border-none cursor-pointer transition
              ${danger ? "bg-[#c0392b] hover:bg-[#a93226]" : "bg-[#3d6b8e] hover:bg-[#2d5a7a]"}`}
            style={{
              boxShadow: danger ? "none" : "0 4px 12px rgba(61,107,142,0.12)",
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfileSection() {
  const navigate = useNavigate();
  const emptyProfile = {
    id: "",
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
  };
  const { setPatientImage } = useImage();
  const [profile, setProfile] = useState(emptyProfile);
  const [profileImage, setProfileImage] = useState(DEFAULT_AVATAR);
  const [originalProfile, setOriginalProfile] = useState(emptyProfile);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await PatientGetProfileApi();
        const data = res?.data?.data || res?.data;
        if (!data) return;
        const loaded = {
          id: data.id || "",
          name: data.fullName || "",
          email: data.email || "",
          phone: data.phone || data.mobile || "",
          gender: data.gender || "",
          dob: formatDateForInput(data.dob),
        };
        setProfile(loaded);
        setOriginalProfile(loaded);
        const imgRes = await getProfileImageApi();
        const rawUrl = imgRes?.data?.imageUrl;

        const imageUrl = rawUrl ? `${rawUrl}?t=${Date.now()}` : DEFAULT_AVATAR;

        setProfileImage(imageUrl);

        if (rawUrl) {
          setPatientImage(rawUrl); // ✅ global update
        }
      } catch (err) {
        console.error("Profile load error:", err);
        setProfileImage(DEFAULT_AVATAR);
      }
    };
    loadData();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.error("Only image files allowed");
      return;
    }

    try {
      const res = await uploadProfileImageApi(file);

      const rawUrl = res.data.imageUrl;

      // ✅ UI ke liye cache-bust
      const fullUrl = `${rawUrl}?t=${Date.now()}`;

      setProfileImage(fullUrl);
      setPatientImage(rawUrl);
      // ✅ clean URL store

      notify.success("Profile image updated");
    } catch {
      notify.error("Image update failed");
    }
  };
  const handleRemoveImage = async () => {
    try {
      await deleteProfileImageApi();
      setProfileImage(DEFAULT_AVATAR);
      setPatientImage(null);
      setShowDeleteModal(false);
      notify.success("Profile image removed");
    } catch {
      notify.error("Delete failed");
    }
  };

  const handleChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleCancel = () => setProfile(originalProfile);

  const confirmUpdateProfile = async () => {
    try {
      await PatientUpdateProfileApi({
        fullName: profile.name,
        phone: profile.phone,
        gender: profile.gender,
        dob: profile.dob,
      });
      notify.success("Profile updated successfully");
      setShowUpdateModal(false);
      setOriginalProfile(profile);
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          role: "PATIENT",
          name: profile.name,
          phone: profile.phone,
        }),
      );
    } catch {
      notify.error("Update failed");
    }
  };

  return (
    <div
      className="font-dm min-h-screen bg-[#faf8f5] flex items-start justify-center px-4 py-4"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 20% 10%, rgba(61,107,142,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(61,107,142,0.04) 0%, transparent 50%)",
      }}
    >
      <div className="animate-fade-up w-full max-w-[860px]">
        <div
          className="bg-white rounded-[24px] px-10 py-10 mb-5 relative overflow-hidden"
          style={{
            boxShadow:
              "0 12px 48px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{
              background: "linear-gradient(90deg, #3d6b8e, #6fa3c4, #3d6b8e)",
            }}
          />

          <div className="flex items-center gap-9 flex-col sm:flex-row">
            <div className="relative flex-shrink-0">
              <div
                className="w-[110px] h-[110px] rounded-full p-[3px] bg-gradient-to-br from-[#3d6b8e] to-[#a8c8de]"
                style={{ boxShadow: "0 8px 24px rgba(61,107,142,0.12)" }}
              >
                <img
                  src={profileImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_AVATAR;
                  }}
                  className="w-full h-full rounded-full object-cover border-[3px] border-white block"
                  alt="Profile"
                />
              </div>
              <label
                htmlFor="uploadImage"
                className="absolute bottom-0.5 right-0.5 w-8 h-8 bg-[#3d6b8e] hover:bg-[#2d5a7a] border-[2.5px] border-white rounded-full flex items-center justify-center cursor-pointer text-white transition-transform hover:scale-110"
              >
                <FaCamera size={12} />
              </label>
              <input
                type="file"
                accept="image/*"
                hidden
                id="uploadImage"
                onChange={handleImageChange}
              />
            </div>

            {/* Hero Text */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 bg-[#e8f0f6] text-[#3d6b8e] text-[11px] font-medium tracking-[0.08em] uppercase px-3 py-1 rounded-full mb-2.5">
                <span className="animate-pulse-dot w-1.5 h-1.5 bg-[#3d6b8e] rounded-full inline-block" />
                Active Patient
              </div>
              <h1 className="font-playfair text-[32px] font-semibold text-[#1a1814] leading-[1.1] m-0 mb-1.5 truncate">
                {profile.name || "Your Name"}
              </h1>
              <p className="font-dm text-[13px] font-light text-[#8a8680] m-0 mb-5">
                Patient ID ·{" "}
                <span className="font-medium text-[#1a1814]">
                  #{profile.id || "—"}
                </span>
              </p>
              <div className="flex gap-2.5 flex-wrap justify-center sm:justify-start">
                <label
                  htmlFor="uploadImage"
                  className="inline-flex items-center gap-1.5 px-[18px] py-2 bg-[#e8f0f6] text-[#3d6b8e] rounded-full text-[13px] font-medium cursor-pointer border-none transition hover:bg-[#d0e4f0] hover:-translate-y-px"
                >
                  <FaCamera size={11} /> Change Photo
                </label>
                {profileImage !== DEFAULT_AVATAR && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center gap-1.5 px-[18px] py-2 bg-[#fdf0ef] text-[#c0392b] rounded-full text-[13px] font-medium cursor-pointer border-none transition hover:bg-[#f9dede] hover:-translate-y-px"
                  >
                    <FaTrash size={11} /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-[24px] px-10 py-10"
          style={{
            boxShadow:
              "0 12px 48px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <h2 className="font-playfair text-[22px] font-semibold text-[#1a1814] m-0 mb-7 flex items-center gap-3">
            Personal Information
            <span className="flex-1 h-px bg-black/[0.07]" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingInput
              label="Full Name"
              icon="👤"
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
            <FloatingInput
              label="Email Address"
              icon="✉️"
              name="email"
              value={profile.email}
              readOnly
              placeholder="—"
            />
            <FloatingInput
              label="Mobile Number"
              icon="📱"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              placeholder="Enter mobile number"
            />
            <FloatingInput
              label="Date of Birth"
              icon="🗓"
              type="date"
              name="dob"
              value={profile.dob}
              onChange={handleChange}
            />
            <FloatingSelect
              label="Gender"
              icon="⚧"
              name="gender"
              value={profile.gender}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-black/[0.07] flex-col-reverse sm:flex-row">
            <button
              onClick={() => navigate(-1)}
              className="font-dm px-7 py-3 rounded-full bg-white border border-black/[0.07] text-[#8a8680] text-[14px] font-medium cursor-pointer transition hover:border-[#ccc] hover:text-[#1a1814] hover:bg-[#f5f5f5]"
            >
              Discard Changes
            </button>
            <button
              onClick={() => setShowUpdateModal(true)}
              className="font-dm px-9 py-3 rounded-full bg-[#3d6b8e] text-white text-[14px] font-medium tracking-[0.02em] cursor-pointer border-none transition hover:bg-[#2d5a7a] hover:-translate-y-px active:translate-y-0"
              style={{ boxShadow: "0 4px 12px rgba(61,107,142,0.12)" }}
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <ConfirmModal
          danger
          text="Remove profile photo?"
          subtitle="Your default avatar will be restored."
          onNo={() => setShowDeleteModal(false)}
          onYes={handleRemoveImage}
        />
      )}
      {showUpdateModal && (
        <ConfirmModal
          text="Update these changes?"
          subtitle="Your profile information will be updated."
          onNo={() => setShowUpdateModal(false)}
          onYes={confirmUpdateProfile}
        />
      )}
    </div>
  );
}
