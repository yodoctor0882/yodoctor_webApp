import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [doctorImage, setDoctorImageState] = useState(null);
  const [patientImage, setPatientImageState] = useState(null);

  // ==============================
  // LOAD STORED IMAGES
  // ==============================
  useEffect(() => {
    const storedDoctorImage =
      localStorage.getItem("doctorProfileImage");

    const storedPatientImage =
      localStorage.getItem("patientProfileImage");

    if (storedDoctorImage) {
      setDoctorImageState(storedDoctorImage);
    }

    if (storedPatientImage) {
      setPatientImageState(storedPatientImage);
    }
  }, []);

  // ==============================
  // DOCTOR IMAGE
  // ==============================
  const setDoctorImage = (rawUrl) => {
    if (!rawUrl) {
      localStorage.removeItem("doctorProfileImage");
      setDoctorImageState(null);
      return;
    }

    const fullUrl = `${rawUrl}${
      rawUrl.includes("?") ? "&" : "?"
    }t=${Date.now()}`;

    setDoctorImageState(fullUrl);

    // Clean URL localStorage me
    localStorage.setItem(
      "doctorProfileImage",
      rawUrl
    );
  };

  // ==============================
  // PATIENT IMAGE
  // ==============================
  const setPatientImage = (rawUrl) => {
    if (!rawUrl) {
      localStorage.removeItem("patientProfileImage");
      setPatientImageState(null);
      return;
    }

    const fullUrl = `${rawUrl}${
      rawUrl.includes("?") ? "&" : "?"
    }t=${Date.now()}`;

    setPatientImageState(fullUrl);

    // Clean URL localStorage me
    localStorage.setItem(
      "patientProfileImage",
      rawUrl
    );
  };

  return (
    <ImageContext.Provider
      value={{
        doctorImage,
        setDoctorImage,

        patientImage,
        setPatientImage,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useImage = () => useContext(ImageContext);