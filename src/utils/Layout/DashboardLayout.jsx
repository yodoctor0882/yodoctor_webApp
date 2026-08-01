


import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import PatientHeaderDashboard from "../PatientHeaderDashboard";
import DoctorHeaderDashboard from "../DoctorHeaderDashboard";
import AdminHeaderDashboard from "../AdminHeaderDashboard";
import HealthcareChatbot from "../../yodoctor_chatbot/HealthcareChatbot";

/* ================= SAFE STORAGE ================= */
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("loggedInUser"));
  } catch {
    return null;
  }
};

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loggedInUser, setLoggedInUser] = useState(getStoredUser);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Desktop & mobile sidebar states are separate
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const role = loggedInUser?.role;

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/");
  }, [navigate]);

  /* ================= USER SYNC ================= */
  useEffect(() => {
    const sync = () => setLoggedInUser(getStoredUser());
    window.addEventListener("userLogin", sync);
    window.addEventListener("userLogout", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("userLogin", sync);
      window.removeEventListener("userLogout", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  /* ================= RESPONSIVE HANDLER ================= */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // close mobile drawer when switching to desktop
      if (!mobile) setIsMobileDrawerOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= CLOSE DRAWER ON ROUTE CHANGE ================= */
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location.pathname]);

  /* ================= UNIFIED TOGGLE ================= */
  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileDrawerOpen((prev) => !prev);
    } else {
      setIsDesktopSidebarOpen((prev) => !prev);
    }
  };

  const isSidebarOpen = isMobile ? isMobileDrawerOpen : isDesktopSidebarOpen;

  /* ================= HEADER ================= */
  const renderHeader = () => {
    const props = { toggleSidebar, isSidebarOpen };
    if (role === "PATIENT") return <PatientHeaderDashboard {...props} />;
    if (role === "DOCTOR") return <DoctorHeaderDashboard {...props} />;
    if (role === "ADMIN") return <AdminHeaderDashboard {...props} />;
    return null;
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== DESKTOP SIDEBAR ===== */}
      {!isMobile && (
        <aside
          className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300
            ${isDesktopSidebarOpen ? "w-64" : "w-20"}`}
        >
          <Sidebar isOpen={isDesktopSidebarOpen} setIsOpen={setIsDesktopSidebarOpen} />
        </aside>
      )}

      {/* ===== MOBILE DRAWER ===== */}
      {isMobile && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300
              ${isMobileDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer — slides in from left */}
          <div
            className={`fixed top-0 left-0 z-50 w-64 h-screen transition-transform duration-300
              ${isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <Sidebar isOpen={true} setIsOpen={setIsMobileDrawerOpen} />
          </div>
        </>
      )}

      {/* ===== CONTENT ===== */}
      <div
        className={`transition-all duration-300
          ${!isMobile ? (isDesktopSidebarOpen ? "ml-64" : "ml-20") : "ml-0"}`}
      >
        {/* Header */}
        {renderHeader()}

        {/* Main */}
        <main className="pt-20 p-4">
          <HealthcareChatbot />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;