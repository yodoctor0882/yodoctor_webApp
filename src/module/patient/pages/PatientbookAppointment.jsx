import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import QrScanner from "qr-scanner";
import Typewriter from "typewriter-effect";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { notify } from "../../../utils/notify";
import {
  getCities,
  getDiseases,
  getDoctorNames,
} from "../../../services/patientService";
import { getDoctorById } from "../../../services/patientService";

import {
  FaSearch,
  FaMapMarkerAlt,
  FaQrcode,
  FaBaby,
  FaHeartbeat,
  FaBrain,
} from "react-icons/fa";
import { GiTooth } from "react-icons/gi";

/* ================= HELPER ================= */
function extractDoctorId(scannedData) {
  if (!scannedData) return null;
  const cleanData = scannedData.trim();
  try {
    const url = new URL(cleanData);
    return url.searchParams.get("doctorId");
  } catch {
    try {
      const url = new URL(cleanData, window.location.origin);
      return url.searchParams.get("doctorId");
    } catch {
      return null;
    }
  }
}

const PatientbookAppointment = () => {
  const webcamRef = useRef(null);
  const qrScannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const locationRef = useRef();
  const diseaseRef = useRef();

  const [scanning, setScanning] = useState(false);
  const [datas, setDatas] = useState("");

  const [cityQuery, setCityQuery] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cities, setCities] = useState([]);

  const [diseaseQuery, setDiseaseQuery] = useState("");
  const [showDiseaseDropdown, setShowDiseaseDropdown] = useState(false);
  const [diseases, setDiseases] = useState([]);
  const [doctorNames, setDoctorNames] = useState([]);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const autoScan = params.get("autoScan");
  const [loadingCities, setLoadingCities] = useState(false);

  const navigate = useNavigate();

const validateQRAndNavigate = async (doctorId) => {
  try {
    console.log("🔍 SCANNED DOCTOR ID:", doctorId);

    const res = await getDoctorById(doctorId);

    console.log("🔍 FULL API RESPONSE:", res);
    console.log("🔍 RESPONSE DATA:", res.data);

    const doctor = res.data.doctor || res.data;

    console.log("🔍 DOCTOR DATA:", doctor);
    console.log(
      "🔍 hasActiveSubscription:",
      doctor?.hasActiveSubscription,
    );
    console.log(
      "🔍 hasActiveSubscription TYPE:",
      typeof doctor?.hasActiveSubscription,
    );

    // Doctor subscription inactive
    if (!doctor?.hasActiveSubscription) {
      console.log("❌ SUBSCRIPTION INACTIVE CONDITION RUNNING");

      notify.info("This doctor is currently unavailable for appointments");
      return;
    }

    console.log("✅ SUBSCRIPTION ACTIVE — NAVIGATING");

    navigate(
      `/client/bookappointmentpage/${doctorId}?fromQR=true`
    );
  } catch (err) {
    console.error("❌ QR doctor validation failed:", err);
    console.error("❌ Backend response:", err.response?.data);
    console.error("❌ Status:", err.response?.status);

    notify.info(
      err.response?.data?.message ||
        "This doctor is currently unavailable for appointments"
    );
  }
};

  useEffect(() => {
    if (autoScan === "true") {
      setScanning(true);
    }
  }, [autoScan]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [diseaseRes, doctorRes] = await Promise.all([
          getDiseases(),
          getDoctorNames(),
        ]);
        setDiseases(diseaseRes.data.data || []);
        setDoctorNames(doctorRes.data.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, []);

  const fetchCities = async (query) => {
    try {
      setLoadingCities(true);
      const res = await getCities(query);
      setCities(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCities(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchCities(cityQuery);
    }, 300);

    return () => clearTimeout(delay);
  }, [cityQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowCityDropdown(false);
      }
      if (diseaseRef.current && !diseaseRef.current.contains(e.target)) {
        setShowDiseaseDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = cities;

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const combinedSearch = (() => {
    const seen = new Set();
    return [...diseases, ...doctorNames].filter((d) => {
      if (!d.name || seen.has(d.name)) return false;
      seen.add(d.name);
      return true;
    });
  })();

  const filteredDiseases = combinedSearch.filter((d) =>
    d.name?.toLowerCase().includes(diseaseQuery.toLowerCase()),
  );

  const handleCitySelect = (city) => {
    setCityQuery(city.city);
    setShowCityDropdown(false);
  };

  const handleDiseaseSelect = (disease) => {
    setDiseaseQuery(disease.name);
    setShowDiseaseDropdown(false);
  };

  const handleSearch = () => {
    navigate(
      `/client/cards?city=${encodeURIComponent(
        cityQuery,
      )}&search=${encodeURIComponent(diseaseQuery)}`,
    );
  };

  useEffect(() => {
    if (!scanning) return;
    if (qrScannerRef.current) return;

    let cancelled = false;

    const startScanner = () => {
      if (cancelled) return;

      const video = webcamRef.current?.video;
      if (!video) {
        setTimeout(startScanner, 200);
        return;
      }

      const scanner = new QrScanner(
        video,
        (result) => {
          scanner.stop();
          qrScannerRef.current = null;
          setScanning(false);
          setDatas(result.data);

          const doctorId = extractDoctorId(result.data);

          if (!doctorId) {
            notify.info("Invalid QR code");
            return;
          }

          // subscription check → uske baad navigate
          validateQRAndNavigate(doctorId);
        },
        { returnDetailedScanResult: true },
      );

      qrScannerRef.current = scanner;
      scanner.start();
    };

    startScanner();

    return () => {
      cancelled = true;
      qrScannerRef.current?.stop();
      qrScannerRef.current = null;
    };
  }, [scanning, navigate]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });
      const doctorId = extractDoctorId(result.data);
      setDatas(result.data);
      if (!doctorId) {
        notify.info("Invalid QR code");
        return;
      }

      await validateQRAndNavigate(doctorId);
    } catch {
      notify.info("Could not read QR code from image");
    }
  };

  return (
    <>
      <section className="relative z-0 w-full min-h-screen flex flex-col items-center justify-center text-white overflow-hidden px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#cfeeff] to-[#e9f8ff]">
        <div
          className="absolute inset-0 w-full bg-cover bg-center z-[-1]"
          style={{ backgroundImage: "url(/images/hero.png)" }}
        />

        <div className="text-center space-y-6 w-full max-w-4xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Your Doctor Your health
          </h1>

          <h5 className="text-2xl sm:text-3xl lg:text-5xl font-bold flex justify-center items-center gap-2">
            Search For,
            <span className="text-red-600">
              <Typewriter
                options={{
                  strings: ["Clinics", "Doctors", "Diseases"],
                  autoStart: true,
                  loop: true,
                  delay: 75,
                  deleteSpeed: 50,
                }}
              />
            </span>
          </h5>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-0.5 mt-6">
            <div ref={locationRef} className="relative w-full sm:w-68">
              <div className="flex items-center bg-white text-black px-4 py-2 rounded-lg outline-none">
                <FaMapMarkerAlt className="mr-2 text-blue-600" />
                <input
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowCityDropdown(true)}
                  placeholder="Location"
                  className="outline-none bg-transparent w-full"
                />
              </div>
              {showCityDropdown && (
                <ul className="absolute w-full bg-white border mt-1 shadow z-20 max-h-40 overflow-y-auto rounded-lg">
                  {loadingCities ? (
                    // 🔄 Loading state
                    <li className="px-4 py-3 flex justify-center">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </li>
                  ) : filteredCities.length > 0 ? (
                    // ✅ Data list
                    filteredCities.map((city, index) => (
                      <li
                        key={index}
                        onClick={() => handleCitySelect(city)}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-black"
                      >
                        <div className="font-medium">{city.city}</div>
                        <div className="text-xs text-gray-500">
                          {city.address || city.landmark}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-gray-500 text-center">
                      No results found
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div className="flex w-full sm:w-auto">
              <div ref={diseaseRef} className="relative w-full sm:w-64">
                <div className="flex items-center bg-white text-black px-4 py-2 rounded-l-lg">
                  <FaSearch className="mr-2 text-blue-600" />
                  <input
                    value={diseaseQuery}
                    onChange={(e) => setDiseaseQuery(e.target.value)}
                    onFocus={() => setShowDiseaseDropdown(true)}
                    placeholder="Search diseases, doctors, clinics..."
                    className="outline-none bg-transparent w-full"
                  />
                </div>
                {showDiseaseDropdown && (
                  <ul className="absolute w-full bg-white border mt-1 shadow z-20 max-h-40 overflow-y-auto rounded-lg">
                    {filteredDiseases.length > 0 ? (
                      filteredDiseases.map((disease, index) => (
                        <li
                          key={`${disease.name}-${index}`}
                          onClick={() => handleDiseaseSelect(disease)}
                          className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-black flex justify-between"
                        >
                          {disease.name}
                          <span className="text-xs text-gray-400">
                            {doctorNames.some((d) => d.name === disease.name)
                              ? "Doctor"
                              : "Speciality"}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-gray-500">
                        No results found
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <div className="flex items-center bg-green-700 px-4 py-2 rounded-r-lg">
                <button
                  className="text-white font-semibold cursor-pointer"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center gap-3 py-6">
            <p className="text-gray-100 font-semibold text-xl sm:text-3xl">
              OR
            </p>
            <h2 className="text-base sm:text-lg font-bold">Scan any QR code</h2>

            <div
              onClick={() => {
                if (!scanning) {
                  setDatas("");
                  setScanning(true);
                }
              }}
              className="flex items-center justify-center p-4 bg-gray-100 rounded-full w-16 h-16 shadow-md hover:scale-105 transition cursor-pointer"
            >
              <FaQrcode size={40} color="green" />
            </div>

            {scanning && (
              <div className="mt-2 bg-white p-4 rounded-xl shadow-lg flex flex-col items-center gap-3">
                <Webcam
                  ref={webcamRef}
                  videoConstraints={{ facingMode: "environment" }}
                  className="rounded-lg w-72 h-72 object-cover"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      qrScannerRef.current?.stop();
                      qrScannerRef.current = null;
                      setScanning(false);
                    }}
                    className="px-4 py-1.5 bg-red-500 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="px-4 py-1.5 bg-blue-500 text-white rounded-lg"
                  >
                    Upload from Gallery
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {datas && (
              <p className="text-green-600 mt-3 font-semibold break-all">
                ✅ QR Code: {datas}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 text-white text-sm md:text-lg mt-4">
            <span className="font-semibold text-gray-200">
              Trending Specialities:
            </span>
            <FaBrain /> Neurologist |<FaHeartbeat /> Cardiologist |
            <FaBaby /> Child Specialist |<GiTooth /> Dental Care
          </div>
        </div>
      </section>
      {/* 
      <section className="bg-[#f5f6fa] py-16 px-6 md:px-20 min-h-screen">
        <div className="flex flex-col md:flex-row justify-around items-center gap-10">
          <div className="text-center md:text-left max-w-lg">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 leading-snug">
              Your privacy and safety
            </h2>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              is always our priority.
            </h2>
            <ul className="space-y-3 text-gray-600 mb-8">
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-green-500 text-lg">✔</span>
                Advanced data encryption & secure access
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-green-500 text-lg">✔</span>
                Trusted by doctors & healthcare partners
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-green-500 text-lg">✔</span>
                Compliant with global healthcare standards
              </li>
            </ul>
            <button className="bg-green-500 text-white px-6 py-2 rounded font-medium hover:bg-green-600 cursor-pointer">
              Learn how we protect you
            </button>
          </div>

          <div className="flex justify-center md:w-1/2">
            <img
              src="/images/security-healthcare.webp"
              alt="Healthcare Security Illustration"
              className="w-64 sm:w-80 md:w-96"
            />
          </div>
        </div>

        <div className="mt-16 flex flex-wrap justify-center items-center gap-10 text-center">
          {[
            { src: "/images/secure-server.webp", text: "Secure Cloud Servers" },
            {
              src: "/images/trusted-doctors.webp",
              text: "Verified Medical Experts",
            },
            {
              src: "/images/privacy-shield.webp",
              text: "Strong Privacy Protection",
            },
            { src: "/images/support.webp", text: "24×7 Customer Support" },
          ].map((item, i) => (
            <div key={i}>
              <img
                src={item.src}
                alt={item.text}
                className="mx-auto w-12 h-12 sm:w-14 sm:h-14 mb-2"
              />
              <p className="text-gray-800 text-sm font-medium">{item.text}</p>
            </div>
          ))}
        </div>
      </section> */}
    </>
  );
};

export default PatientbookAppointment;
