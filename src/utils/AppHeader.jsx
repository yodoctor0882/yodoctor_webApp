import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaGlobe } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";

const getStoredUser = () => {
  const raw = localStorage.getItem("loggedInUser");
  if (!raw || raw === "undefined") return null;

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Invalid loggedInUser JSON", err);
    localStorage.removeItem("loggedInUser");
    return null;
  }
};

const AppHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const loggedInUser = getStoredUser();
  const userRole = loggedInUser?.role;

  const { language, changeLanguage, lang } = useLanguage();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [menuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md px-6 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="md:hidden mr-2">
            {menuOpen ? (
              <FaTimes
                size={22}
                onClick={() => setMenuOpen(false)}
                className="cursor-pointer text-gray-800"
              />
            ) : (
              <FaBars
                size={22}
                onClick={() => setMenuOpen(true)}
                className="cursor-pointer text-gray-800"
              />
            )}
          </div>

          <Link to="/" className="flex items-center gap-2">
            <img src="/images/logo.webp" alt="Yo Doctor" className="h-10" />
          </Link>
        </div>

        <div className="hidden md:flex gap-8 font-medium text-[18px]">
          {[
            { name: lang[language].home, path: "/" },
            { name: lang[language].services, path: "/service" },
            { name: lang[language].about, path: "/about" },
            { name: lang[language].contact, path: "/contact" },
            { name: lang[language].help, path: "/help" },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative text-black hover:text-blue-600 transition
                ${
                  isActive
                    ? "text-blue-600 after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[#14BEF0]"
                    : ""
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => changeLanguage(language === "en" ? "hi" : "en")}
            title={language === "en" ? "Switch to Hindi" : "Switch to English"}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <FaGlobe size={24} className="text-gray-700" />
          </button>

          <a href="/yodoctor.apk" download>
            <button className="px-5 py-2 text-[18px] rounded-full bg-[#00b3ff] text-white hover:bg-[#009ee0] transition">
              {lang[language].download}
            </button>
          </a>
        </div>
      </nav>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-40 md:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <FaTimes
            size={22}
            className="cursor-pointer text-gray-700"
            onClick={() => setMenuOpen(false)}
          />
        </div>

        <ul className="flex flex-col mt-4 space-y-4 px-5 text-gray-700 font-medium">
          <Link to="/">{lang[language].home}</Link>
          <Link to="/service">{lang[language].services}</Link>
          <Link to="/about">{lang[language].about}</Link>
          <Link to="/contact">{lang[language].contact}</Link>
          <Link to="/help">{lang[language].help}</Link>
        </ul>
      </div>
    </>
  );
};

export default AppHeader;
