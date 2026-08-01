import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FaBars,
  FaHome,
  FaCalendarAlt,
  FaEdit,
  FaUsers,
  FaCalendarCheck,
  FaChartBar,
  FaUserMd,
  FaFileMedical,
  FaFlask,
  FaBoxOpen,
  FaClipboardList,
} from "react-icons/fa";
import { FiUsers } from "react-icons/fi";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tooltip, setTooltip] = useState(null);

  let loggedInUser = null;
  try {
    loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  } catch {
    loggedInUser = null;
  }

  const role = loggedInUser?.role;

  const doctorNav = [
    { key: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { key: "appointment", label: "Appointments", icon: <FaCalendarAlt /> },
    { key: "manualbooking", label: "Manual Booking", icon: <FaEdit /> },
    {
      key: "Certificaterequest",
      label: "Certificate Requests",
      icon: <FaFileMedical />,
    },
    { key: "mysubscription", label: "My Subscription", icon: <FaUsers /> },
  ];

  const patientNav = [
    { key: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { key: "family", label: "Family Members", icon: <FaUsers /> },
    {
      key: "myappointment",
      label: "Appointments History",
      icon: <FaCalendarCheck />,
    },
    {
      key: "mylabbookings",
      label: "My Lab Bookings",
      icon: <FaFlask />,
    },
    { key: "mycertificate", label: "My Certificates", icon: <FaFileMedical /> },
  ];

  const adminNav = [
    { key: "dashboard", label: "Admin Dashboard", icon: <FaChartBar /> },
    { key: "doctors", label: "Doctors", icon: <FaUserMd /> },
    { key: "patients", label: "Patients", icon: <FiUsers /> },
    { key: "contact-requests", label: "Enquiries", icon: <FaEdit /> },
    {
      key: "homecare-bookings",
      label: "Home Care Bookings",
      icon: <FaCalendarCheck />,
    },
    {
      key: "lab-test",
      label: "Lab Tests",
      icon: <FaFlask />,
    },
    {
      key: "lab-packages",
      label: "Lab Packages",
      icon: <FaBoxOpen />,
    },
    {
      key: "lab-bookings",
      label: "Lab Bookings",
      icon: <FaClipboardList />,
    },
  ];

  const navItems =
    role === "DOCTOR" ? doctorNav : role === "ADMIN" ? adminNav : patientNav;

  const getRoute = (key) => {
    if (role === "DOCTOR") {
      if (key === "dashboard") return "/doctordashboard";
      return `/doctordashboard/${key}`;
    }
    if (role === "ADMIN") {
      if (key === "dashboard") return "/admin";
      return `/admin/${key}`;
    }
    if (key === "dashboard") return "/client/dashboard";
    return `/client/${key}`;
  };

  const handleNavClick = (item) => {
    navigate(getRoute(item.key));
    if (window.innerWidth < 768) setIsOpen(false);
  };

  return (
    <>
      <aside
        className={`
          fixed top-0 left-0 h-screen flex flex-col
          overflow-y-auto overflow-x-hidden
          transition-all duration-300 ease-in-out
          z-50 md:z-40
          ${isOpen ? "w-64" : "w-24"}
        `}
        style={{ backgroundColor: "#0072BC" }}
      >
        <div
          className={`flex items-center p-5 mb-2  ${isOpen ? "justify-between bg-white border-r-2 border-gray-300" : "justify-center "}  `}
        >
          {isOpen && (
            <div className="flex items-center gap-2 select-none ">
              <img src="/images/logo.webp" alt="Yo Doctor" className="h-10" />
            </div>
          )}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="  text-2xl flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 hover:bg-white/20 flex-shrink-0"
            title={isOpen ? "Collapse sidebar " : "Expand sidebar "}
          >
            {isOpen ? (
              <FaBars className=" text-black" />
            ) : (
              <FaBars className=" text-white" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === getRoute(item.key);
            return (
              <div
                key={item.key}
                onClick={() => handleNavClick(item)}
                onMouseLeave={() => setTooltip(null)}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                  transition-all duration-200
                  ${isActive ? "text-white" : "text-blue-100 hover:text-white"}
                  ${!isOpen && "justify-center"}
                `}
                style={{
                  backgroundColor: isActive
                    ? "rgba(255,255,255,0.25)"
                    : undefined,
                }}
                onMouseOver={(e) => {
                  if (!isActive)
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.15)";
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "";
                }}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white" />
                )}

                <div className="text-2xl flex-shrink-0">{item.icon}</div>

                {isOpen && (
                  <span className="font-medium text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                )}

                {!isOpen && tooltip === item.key && (
                  <div
                    className="absolute left-16 z-50 px-3 py-1.5 rounded-lg text-sm font-medium text-white whitespace-nowrap shadow-lg pointer-events-none"
                    style={{ backgroundColor: "#005a96" }}
                  >
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
