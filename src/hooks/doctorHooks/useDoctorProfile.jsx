import { useEffect, useState } from "react";
import { notify } from "../../utils/notify";
import api from "../../services/api";
import {
  getDoctorProfile,
  updateDoctorProfile,
} from "../../services/doctor/profile/DoctorProfileApi";
import { useImage } from "../../context/ImageContext";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";


const buildImageUrl = (imagePath, bustCache = false) => {
  if (!imagePath) return DEFAULT_AVATAR;
  if (imagePath.startsWith("http")) {
    return bustCache ? `${imagePath}?t=${Date.now()}` : imagePath;
  }
  const url = `${BASE_URL}/${imagePath}`.replace(/([^:])\/\//g, "$1/");
  return bustCache ? `${url}?t=${Date.now()}` : url;
};


const INITIAL_PROFILE = {
  doctorName: "",
  gender: "",
  degree: "",
  specialization: "",
  clinicName: "",
  pincode: "",
  landmark: "",
  maps_link: "",
  languages: "",
  bio: "",
  city: "",
  state: "",
  address: "",
  consultationFee: "",
  consultation_duration: "",
  availability: "",
  availableDays: "",
  timings: "",
  experience_years: "",
  mobile: "",
  email: "",
  licenseNumber: "",
  state_council: "",
  valid_till: "",
  practice_type: "",
  hospital_name: "",
  rating: 0,

  documents: {
    profile_picture: null,
    certificate: null,
    id_proof: null,
    clinic_proof: null,
  },
};

export default function useDoctorProfile() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
const [profileImage, setProfileImage] = useState(DEFAULT_AVATAR);
  const [loading, setLoading] = useState(true);
const { setDoctorImage  } = useImage();
  /* ================= LOAD PROFILE + IMAGE ================= */
useEffect(() => {
  let isMounted = true;

  const loadProfileAndImage = async () => {
    setLoading(true);

    // =========================
    // 1. LOAD DOCTOR PROFILE
    // =========================
    try {
      const res = await getDoctorProfile();

      if (!isMounted) return;

      console.log("FULL API RESPONSE:", res.data);

      const d = res.data?.doctor;

      if (!d) {
        throw new Error("Doctor profile not found");
      }

      const clinic = d.clinic || {};

      setProfile({
        doctorName: d.doctorName || "",
        mobile: d.mobile || "",
        email: d.email || "",
        gender: d.gender || "",
        bio: d.bio || "",

        degree: d.degree || "",
        specialization: d.specialization || "",
        experience_years: d.experience_years || "",
        licenseNumber: d.licenseNumber || "",
        state_council: d.state_council || "",
        valid_till: d.valid_till || "",

        clinic_name: clinic.clinic_name || "",
        city: clinic.city || "",
        address: clinic.address || "",
        state: clinic.state || "",
        pincode: clinic.pincode || "",
        landmark: clinic.landmark || "",
        mapsLink: clinic.maps_link || clinic.mapsLink || "",

        languages: Array.isArray(clinic.languages)
          ? clinic.languages
          : [],

        practice_type: d.practice_type || "",
        hospital_name: d.hospital_name || "",

        consultationFee: d.consultationFee || "",
        consultation_duration:
          d.consultation_duration || "",

        availableDays: Array.isArray(d.availableDays)
          ? d.availableDays
          : [],

        availability: Array.isArray(d.availability)
          ? d.availability
          : [],

        rating: d.rating || 0,

        documents: d.documents || {
          profile_picture: null,
          certificate: null,
          id_proof: null,
          clinic_proof: null,
        },
      });
    } catch (err) {
      console.error("Doctor profile API failed:", err);

      if (isMounted) {
        notify.error("Failed to load doctor profile");
      }
    }

    // =========================
    // 2. LOAD PROFILE IMAGE
    // =========================
    try {
      const imgRes = await api.get(
        "/auth/getprofile-image"
      );

      if (!isMounted) return;

      if (imgRes.data?.imageUrl) {
        const rawUrl = buildImageUrl(
          imgRes.data.imageUrl,
          false
        );

        setProfileImage(rawUrl);
        setDoctorImage (rawUrl);
      } else {
        setProfileImage(DEFAULT_AVATAR);
      }
    } catch (err) {
      console.error("Profile image API failed:", err);

      if (isMounted) {
        setProfileImage(DEFAULT_AVATAR);
      }

    
    }

    if (isMounted) {
      setLoading(false);
    }
  };

  loadProfileAndImage();

  return () => {
    isMounted = false;
  };
}, []);

  /* ================= IMAGE UPLOAD ================= */
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("image", file);

      const cleanImage = profileImage?.split("?")[0];

const hasCustomImage =
  cleanImage && !cleanImage.includes("flaticon");

      const res = hasCustomImage
        ? await api.put("/auth/updateprofile-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : await api.post("/auth/upload-profile-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      const rawUrl = buildImageUrl(res.data.imageUrl, false);
      const fullUrl = `${rawUrl}?t=${Date.now()}`;

      setProfileImage(fullUrl);

      // ✅ clean URL store karo
      setDoctorImage (rawUrl);


      notify.success("Profile image updated");
    } catch (err) {
      console.error(err);
      notify.error(err?.response?.data?.message || "Image upload failed");
    }
  };

  /* ================= REMOVE IMAGE ================= */
  const removeProfileImage = async () => {
    try {
      await api.delete("/auth/deleteprofile-image");

      setProfileImage(DEFAULT_AVATAR);
      setDoctorImage (null);


      notify.success("Profile image removed");
    } catch {
      notify.error("Failed to delete profile image");
    }
  };

  /* ================= INPUT CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= SAVE PROFILE ================= */
  const saveProfile = async () => {
    try {
      const payload = {
        doctorName: profile.doctorName || null,
        degree: profile.degree || null,
        specialization: profile.specialization || null,
        bio: profile.bio || null,

        experience_years: profile.experience_years || null,
        licenseNumber: profile.licenseNumber || null,
        state_council: profile.state_council || null,
        valid_till: profile.valid_till || null,

        clinic_name: profile.clinic_name || null,
        city: profile.city || null,
        address: profile.address || null,
        state: profile.state || null,
        pincode: profile.pincode || null,
        landmark: profile.landmark || null, // ← new
        mapsLink: profile.mapsLink || null, // ← new

        languages: profile.languages || [],
        availableDays: profile.availableDays || [],

        practice_type: profile.practice_type || null,
        hospital_name: profile.hospital_name || null,

        consultationFee: profile.consultationFee || null,
        consultation_duration: profile.consultation_duration || null,

        mobile: profile.mobile || null,
        rating: profile.rating || 0,
      };

      await updateDoctorProfile(payload);
      const res = await getDoctorProfile();
      const d = res.data.doctor;
      const clinic = d.clinic || {};

      setProfile({
        doctorName: d.doctorName || "",
        mobile: d.mobile || "",
        email: d.email || "",
        gender: d.gender || "",
        bio: d.bio || "",
        degree: d.degree || "",
        specialization: d.specialization || "",
        experience_years: d.experience_years || "",
        licenseNumber: d.licenseNumber || "",
        state_council: d.state_council || "",
        valid_till: d.valid_till || "",
        clinic_name: clinic.clinic_name || "",
        city: clinic.city || "",
        address: clinic.address || "",
        state: clinic.state || "",
        pincode: clinic.pincode || "",
        landmark: clinic.landmark || "",
        mapsLink: clinic.maps_link || "",
        languages: Array.isArray(clinic.languages) ? clinic.languages : [],
        practice_type: d.practice_type || "",
        hospital_name: d.hospital_name || "",
        consultationFee: d.consultationFee || "",
        consultation_duration: d.consultation_duration || "",
        availableDays: Array.isArray(d.availableDays) ? d.availableDays : [],
        availability: Array.isArray(d.availability) ? d.availability : [],
        rating: d.rating || 0,
        documents: d.documents || {},
      });
      notify.success("Profile updated successfully");
      return true;
    } catch (err) {
      notify.error(err.response?.data?.message || "Profile update failed");
      return false;
    }
  };

  return {
    profile,
    profileImage,
    loading,
    handleImageChange,
    removeProfileImage,
    handleChange,
    saveProfile,
  };
}
