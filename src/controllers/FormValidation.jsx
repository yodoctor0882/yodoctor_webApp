// ✅ Validation for Client Login Form
export const validateLoginForm = ({ identifier, password }) => {
  const errors = {};

  if (!identifier) {
    errors.identifier = "Phone number or email is required";
  } else {
    const isEmail = /\S+@\S+\.\S+/.test(identifier);
    const isPhone = /^[6-9]\d{9}$/.test(identifier);

    if (!isEmail && !isPhone) {
      errors.identifier = "Enter valid phone number or email";
    }
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return errors;
};


// validation for client RegisterForm
export const validateRegisterForm = (formData) => {
  const errors = {};

  // Full Name
  if (!formData.fullName?.trim()) {
    errors.fullName = "Full name is required.";
  }

  // Phone
  if (!formData.phone?.trim()) {
    errors.phone = "Mobile number is required";
  } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
    errors.phone = "Mobile number must be 10 digits";
  }

  // Email
  if (!formData.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
    errors.email = "Enter a valid email address.";
  }

  // Password
  if (!formData.password) {
    errors.password = "Password is required.";
  } else if (formData.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (
    !/[A-Z]/.test(formData.password) ||
    !/[a-z]/.test(formData.password) ||
    !/[0-9]/.test(formData.password) ||
    !/[!@#$%^&*]/.test(formData.password)
  ) {
    errors.password =
      "Password must contain uppercase, lowercase, number & special character.";
  }

  // Confirm Password
  if (!formData.confirmPassword) {
    errors.confirmPassword = "Confirm password is required.";
  } else if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  // Gender
  if (!formData.gender) {
    errors.gender = "Gender is required.";
  }

  // DOB
  if (!formData.dob) {
    errors.dob = "Date of birth is required.";
  }

  return errors;
};

// validation for DoctorLogin
export const validateDoctorLogin = (values) => {
  const errors = {};

  if (!values.identifier) {
    errors.identifier = "Email or mobile number is required";
  }

  if (!values.password) {
    errors.password = "Password is required";
  }

  return errors;
};


// // validation for DoctorRegistration

export const validateStep1 = (data) => {
  const errors = {};

  const fullName = data.fullName?.trim() || "";
  const email = data.email?.trim() || "";
  const mobile = data.mobile?.trim() || "";
  const gender = data.gender || "";
  const languages = data.languages || [];
  const bio = data.bio?.trim() || "";
  const password = data.password || "";
  const confirmPassword = data.confirmPassword || "";

  const wordCount =
    bio === "" ? 0 : bio.split(/\s+/).filter(Boolean).length;

  /* ================= FULL NAME ================= */

  if (!fullName) {
    errors.fullName = "Full name is required";
  } else if (fullName.length < 3) {
    errors.fullName = "Full name must be at least 3 characters";
  } else if (!/^[a-zA-Z.\s]+$/.test(fullName)) {
    errors.fullName = "Full name can only contain letters and spaces";
  }

  /* ================= EMAIL ================= */

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!email) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(email)) {
    errors.email = "Enter a valid email address";
  }

  /* ================= MOBILE ================= */

  if (!mobile) {
    errors.mobile = "Mobile number is required";
  } else if (!/^[6-9]\d{9}$/.test(mobile)) {
    errors.mobile =
      "Enter valid 10-digit Indian mobile number";
  }

  /* ================= GENDER ================= */

  if (!gender) {
    errors.gender = "Gender is required";
  }

  /* ================= LANGUAGES ================= */

  // if (!languages || languages.length === 0) {
  //   errors.languages = "Select at least one language";
  // }

  /* ================= BIO ================= */

  if (!bio) {
    errors.bio = "Bio is required";
  } else if (wordCount < 30) {
    errors.bio = "Minimum 30 words required";
  } else if (wordCount > 100) {
    errors.bio = "Maximum 100 words allowed";
  }

  /* ================= PASSWORD ================= */

  if (!password) {
    errors.password = "Password is required";
  } else {
    if (password.length < 8) {
      errors.password =
        "Password must be at least 8 characters";
    } else if (password.length > 20) {
      errors.password =
        "Password cannot exceed 20 characters";
    } else if (!/[A-Z]/.test(password)) {
      errors.password =
        "Must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      errors.password =
        "Must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(password)) {
      errors.password =
        "Must contain at least one number";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.password =
        "Must contain at least one special character";
    } else if (/\s/.test(password)) {
      errors.password =
        "Password cannot contain spaces";
    }
  }

  /* ================= CONFIRM PASSWORD ================= */

  if (!confirmPassword) {
    errors.confirmPassword =
      "Confirm password is required";
  } else if (password !== confirmPassword) {
    errors.confirmPassword =
      "Passwords do not match";
  }

  return errors;
};

export const validateStep2 = (data) => {
  const errors = {};

  const qualification = data.qualification?.trim() || "";
  const specialization = data.specialization?.trim() || "";
  const experience = data.experience?.trim() || "";
  const regNumber = data.regNumber?.trim() || "";
  const stateCouncil = data.stateCouncil?.trim() || "";
  const validTill = data.validTill || "";

  /* ================= QUALIFICATION ================= */

  if (!qualification) {
    errors.qualification = "Qualification is required";
  }

  /* ================= SPECIALIZATION ================= */

  if (!specialization) {
    errors.specialization = "Specialization is required";
  } else if (specialization.length < 3) {
    errors.specialization = "Specialization must be at least 3 characters";
  } else if (!/^[a-zA-Z\s&-]+$/.test(specialization)) {
    errors.specialization =
      "Specialization can only contain letters and spaces";
  }

  /* ================= EXPERIENCE ================= */

  if (!experience) {
    errors.experience = "Experience is required";
  } else if (!/^\d+$/.test(experience)) {
    errors.experience = "Experience must be numeric";
  } else {
    const expNum = Number(experience);

    if (expNum < 0) {
      errors.experience = "Experience cannot be negative";
    } else if (expNum > 60) {
      errors.experience = "Experience cannot exceed 60 years";
    }
  }

  /* ================= REGISTRATION NUMBER ================= */

  if (!regNumber) {
    errors.regNumber = "Registration number is required";
  } else if (regNumber.length < 5) {
    errors.regNumber = "Registration number too short";
  } else if (regNumber.length > 20) {
    errors.regNumber = "Registration number too long";
  } else if (!/^[a-zA-Z0-9-/]+$/.test(regNumber)) {
    errors.regNumber =
      "Registration number can contain letters, numbers, dash or slash only";
  }

  /* ================= STATE COUNCIL ================= */

  if (!stateCouncil) {
    errors.stateCouncil = "State council is required";
  } else if (stateCouncil.length < 3) {
    errors.stateCouncil = "State council name too short";
  } else if (!/^[a-zA-Z\s]+$/.test(stateCouncil)) {
    errors.stateCouncil =
      "State council name can contain only letters and spaces";
  }

  /* ================= VALID TILL ================= */

  if (!validTill) {
    errors.validTill = "Expiry date is required";
  } else {
    const selectedDate = new Date(validTill);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
      errors.validTill = "Invalid date selected";
    } else if (selectedDate <= currentDate) {
      errors.validTill = "Expiry date must be future date";
    }
  }

  return errors;
};

export const validateStep3 = (data) => {
  const errors = {};

  /* ================= CLINIC NAME ================= */
  if (!data.clinicName || !data.clinicName.trim()) {
    errors.clinicName = "Clinic name is required";
  } 
  else if (data.clinicName.trim().length < 3) {
    errors.clinicName = "Clinic name must be at least 3 characters";
  } 
  else if (!/^[a-zA-Z0-9\s.,&-]+$/.test(data.clinicName)) {
    errors.clinicName = "Invalid characters in clinic name";
  }

  /* ================= ADDRESS ================= */
  if (!data.address || !data.address.trim()) {
    errors.address = "Full address is required";
  } 
  else if (data.address.trim().length < 10) {
    errors.address = "Address must be at least 10 characters";
  }

  /* ================= CITY ================= */
  if (!data.city || !data.city.trim()) {
    errors.city = "City is required";
  } 
  else if (!/^[a-zA-Z\s]+$/.test(data.city)) {
    errors.city = "City must contain only letters";
  }

  /* ================= STATE ================= */
  if (!data.state || !data.state.trim()) {
    errors.state = "State is required";
  }

  /* ================= PINCODE ================= */
  if (!data.pincode) {
    errors.pincode = "Pincode is required";
  } 
  else if (!/^\d{6}$/.test(data.pincode)) {
    errors.pincode = "Pincode must be exactly 6 digits";
  }

    /* ================= LANGUAGES ================= */

  
  /* ================= LANDMARK ================= */
  if (data.landmark && data.landmark.trim().length > 0) {
    if (data.landmark.trim().length < 3) {
      errors.landmark = "Landmark must be at least 3 characters";
    }
  }

  /* ================= GOOGLE MAP LINK ================= */
  if (data.mapsLink && data.mapsLink.trim().length > 0) {
    const mapRegex = /^https?:\/\/(www\.)?google\.(com|co\.in)\/maps/;
    if (!mapRegex.test(data.mapsLink.trim())) {
      errors.mapsLink = "Enter valid Google Maps link";
    }
  }
    if (
    data.languages?.includes("Other") &&
    !data.otherLanguage?.trim()
  ) {
    errors.languages = "Please specify other language";
  }
  return errors;
};

export const validateStep4 = (data) => {
  const errors = {};

  if (!data.practiceType) {
    errors.practiceType = "Please select your practice type";
  }

  if (
    (data.practiceType === "Hospital Attached" ||
      data.practiceType === "Government Hospital") &&
    !data.hospitalName?.trim()
  ) {
    errors.hospitalName =
      "Hospital/Clinic name is required for selected practice type";
  }

  return errors;
};

export const validateStep5 = (data) => {
  const errors = {};

  /* ================= FEE ================= */
  if (!data.fee || data.fee.trim() === "") {
    errors.fee = "Consultation fee is required";
  } else if (isNaN(data.fee) || Number(data.fee) <= 0) {
    errors.fee = "Consultation fee must be a positive number";
  } else if (Number(data.fee) > 10000) {
    errors.fee = "Consultation fee seems too high";
  }

  /* ================= DURATION ================= */
  if (!data.duration) {
    errors.duration = "Please select consultation duration";
  }

  /* ================= DAYS ================= */
  if (!data.selectedDays || data.selectedDays.length === 0) {
    errors.selectedDays = "Select at least one available day";
  }

  /* ================= SLOT ENABLE CHECK ================= */
  if (!data.morningEnabled && !data.eveningEnabled) {
    errors.morningSlot = "At least one slot (Morning or Evening) must be selected";
  }

  /* ================= MORNING VALIDATION ================= */
  if (data.morningEnabled) {
    if (!data.morningStart || !data.morningEnd) {
      errors.morningSlot = "Morning start and end time are required";
    } else if (Number(data.morningEnd) <= Number(data.morningStart)) {
      errors.morningSlot = "Morning end time must be after start time";
    }
  }

  /* ================= EVENING VALIDATION ================= */
  if (data.eveningEnabled) {
    if (!data.eveningStart || !data.eveningEnd) {
      errors.eveningSlot = "Evening start and end time are required";
    } else if (Number(data.eveningEnd) <= Number(data.eveningStart)) {
      errors.eveningSlot = "Evening end time must be after start time";
    }
  }

  /* ================= OVERLAP CHECK ================= */
  if (
    data.morningEnabled &&
    data.eveningEnabled &&
    data.morningStart &&
    data.morningEnd &&
    data.eveningStart &&
    data.eveningEnd
  ) {
    const mStart = Number(data.morningStart);
    const mEnd = Number(data.morningEnd);
    const eStart = Number(data.eveningStart);
    const eEnd = Number(data.eveningEnd);

    if (eStart < mEnd && eEnd > mStart) {
      errors.eveningSlot = "Morning and Evening slots cannot overlap";
    }
  }

  return errors;
};

export const validateStep6Files = (file, type) => {
  if (!file) return "File is required";

  if (type === "profile") {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      return "Profile picture must be JPG or PNG";
    }

    if (file.size > 2 * 1024 * 1024) {
      return "Profile picture must be under 2MB";
    }
  }

  if (type === "certificate") {
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      return "Certificate must be PDF or Image";
    }
  }

  return null;
};

export const validateStep6Required = (data) => {
  const errors = {};

  if (!data.profile) {
    errors.profile = "Profile picture is required";
  }

  if (!data.certificate) {
    errors.certificate = "Medical certificate is required";
  }

  if (!data.idProof) {
    errors.idProof = "Government ID proof is required";
  }

  return errors;
};

export const validateStep7 = (checked) => {
  const errors = {};

  if (!checked.accurate) {
    errors.accurate = "You must confirm information accuracy";
  }

  if (!checked.display) {
    errors.display = "You must authorize public display";
  }

  if (!checked.privacy) {
    errors.privacy = "You must accept Privacy Policy";
  }

  if (!checked.terms) {
    errors.terms = "You must accept Terms and Policies";
  }

  return errors;
};






// Book Lab Test Validation

export const bookLabTest = (member) => {
  const errors = {};

  // Name
  if (!member.name?.trim()) {
    errors.name = "Name is required";
  } else if (!/^[A-Za-z ]+$/.test(member.name.trim())) {
    errors.name = "Name should contain only letters";
  }

  // Age
  if (!member.age) {
    errors.age = "Age is required";
  } else if (isNaN(member.age) || member.age < 1 || member.age > 120) {
    errors.age = "Please enter a valid age";
  }

  // Gender
  if (!member.gender) {
    errors.gender = "Please select gender";
  }

  // Mobile Number
  if (!member.MobileNumber?.trim()) {
    errors.MobileNumber = "Mobile number is required";
  } else if (!/^[6-9]\d{9}$/.test(member.MobileNumber)) {
    errors.MobileNumber = "Enter a valid 10-digit mobile number";
  }

  // Address
  if (!member.address?.trim()) {
    errors.address = "Address is required";
  } else if (member.address.trim().length < 10) {
    errors.address = "Please enter a complete address";
  }

  // Booking Date
  if (!member.bookingDate) {
    errors.bookingDate = "Please select a booking date";
  }

  // Booking Time
  if (!member.bookingTime) {
    errors.bookingTime = "Please select a time slot";
  }

  return errors;
};
// change password validation

export const validatePasswordFields = (fields) => {
  const { currentPassword, newPassword, confirmPassword } = fields;
  const errors = {};

  // Current password validation
  if (!currentPassword.trim()) {
    errors.currentPassword = "Current password is required";
  }

  // New password validation
  if (!newPassword.trim()) {
    errors.newPassword = "New password is required";
  } else if (newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters long";
  } else if (!/[A-Z]/.test(newPassword)) {
    errors.newPassword = "Password must include at least one uppercase letter";
  } else if (!/[a-z]/.test(newPassword)) {
    errors.newPassword = "Password must include at least one lowercase letter";
  } else if (!/[0-9]/.test(newPassword)) {
    errors.newPassword = "Password must include at least one number";
  } else if (!/[!@#$%^&*]/.test(newPassword)) {
    errors.newPassword =
      "Password must include at least one special character (!@#$%^&*)";
  }

  // Confirm password validation
  if (!confirmPassword.trim()) {
    errors.confirmPassword = "Please confirm your new password";
  } else if (confirmPassword !== newPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

export const validateStep = (
  currentStep,
  formData,
  validateFile
) => {
  const newErrors = {};

  const {
    doctor,
    purpose,
    fullName,
    dob,
    gender,
    height,
    weight,
    documents,
  } = formData;

  /* ================= STEP 1: CERTIFICATE DETAILS ================= */
  if (currentStep === 0) {
    if (!doctor) {
      newErrors.doctor = "Please select an assigned doctor.";
    }

    if (!purpose || !purpose.trim()) {
      newErrors.purpose =
        "Please select the purpose of the certificate.";
    }
  }

  /* ================= STEP 2: MEDICAL DETAILS ================= */
  if (currentStep === 1) {
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!fullName?.trim()) {
      newErrors.fullName = "Full name is required.";
    } else if (!nameRegex.test(fullName.trim())) {
      newErrors.fullName =
        "Only alphabets and spaces are allowed.";
    } else if (fullName.trim().length < 3) {
      newErrors.fullName =
        "Full name must be at least 3 characters.";
    }

    if (!dob) {
      newErrors.dob = "Date of birth is required.";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(dob);

      if (isNaN(selectedDate.getTime())) {
        newErrors.dob = "Invalid date selected.";
      } else if (selectedDate >= today) {
        newErrors.dob =
          "Date of birth must be in the past.";
      }
    }

    if (!gender) {
      newErrors.gender = "Please select gender.";
    }

    const heightValue = Number(height);
    if (!height) {
      newErrors.height = "Height is required.";
    } else if (isNaN(heightValue)) {
      newErrors.height = "Height must be a number.";
    } else if (heightValue < 30 || heightValue > 300) {
      newErrors.height =
        "Height must be between 30 and 300 cm.";
    }

    const weightValue = Number(weight);
    if (!weight) {
      newErrors.weight = "Weight is required.";
    } else if (isNaN(weightValue)) {
      newErrors.weight = "Weight must be a number.";
    } else if (weightValue < 1 || weightValue > 500) {
      newErrors.weight =
        "Weight must be between 1 and 500 kg.";
    }
  }

  /* ================= STEP 3: DOCUMENT VALIDATION ================= */
  if (currentStep === 2) {
    if (!documents.profilePhoto) {
      newErrors.profilePhoto = "Profile Photo is required.";
    } else {
      const error = validateFile(documents.profilePhoto);
      if (error) newErrors.profilePhoto = error;
    }

    if (!documents.idProof) {
      newErrors.idProof = "ID Proof is required.";
    } else {
      const error = validateFile(documents.idProof);
      if (error) newErrors.idProof = error;
    }

    if (documents.medicalReports) {
      const error = validateFile(documents.medicalReports);
      if (error) newErrors.medicalReports = error;
    }

    if (documents.prescription) {
      const error = validateFile(documents.prescription);
      if (error) newErrors.prescription = error;
    }
  }

  return newErrors;
};

// ✅ Home Care Booking Validation
export const validateHomeCareForm = (form) => {
  const e = {};

  if (!form.fullName?.trim()) {
    e.fullName = "Full name is required";
  } else if (form.fullName.length < 3) {
    e.fullName = "Minimum 3 characters required";
  } else if (!/^[a-zA-Z\s]+$/.test(form.fullName)) {
    e.fullName = "Only letters allowed";
  }

if (!form.contact?.trim()) {
  e.contact = "Mobile number is required";
} else if (!/^[6-9]\d{9}$/.test(form.contact)) {
  e.contact = "Enter valid 10-digit number";
}

  if (!form.address?.trim()) {
    e.address = "Address is required";
  }

  if (!form.service) {
    e.service = "Select service";
  }

  if (!form.condition?.trim()) {
    e.condition = "Medical condition required";
  } else if (form.condition.length < 10) {
    e.condition = "Minimum 10 characters required";
  }

  if (!form.durationType) {
    e.durationType = "Select duration";
  }

  if (!form.numDays) {
    e.numDays = "Enter number of days";
  } else if (isNaN(form.numDays) || Number(form.numDays) <= 0) {
    e.numDays = "Must be greater than 0";
  } else if (Number(form.numDays) > 365) {
    e.numDays = "Too many days";
  }

if (!form.prefDate) {
  e.prefDate = "Select date";
} else {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = new Date(form.prefDate + "T00:00:00");

  if (selected.getTime() < today.getTime()) {
    e.prefDate = "Past date not allowed";
  }
}

  if (!form.timeSlot) {
    e.timeSlot = "Select time slot";
  }

  if (form.notes && form.notes.length > 50) {
    e.notes = "Max 50 characters allowed";
  }

  return e;
};