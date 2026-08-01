import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaHome, FaUsers, FaCalendarCheck, FaSignOutAlt } from "react-icons/fa";
import LogoutModal from "../LogoutModal";

const AdminLayout = () => {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("loggedInUser"));

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");

    window.dispatchEvent(new Event("userLogout"));

    setIsLogoutModalOpen(false);
    navigate("/"); // ✅ make sure "/" route exists
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium ${
      isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
          <p className="text-xs text-gray-500 mt-1">Healthcare Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/admin/dashboard" className={linkClass}>
            <FaHome /> Dashboard
          </NavLink>

          <NavLink to="/admin/patients" className={linkClass}>
            <FaUsers /> Patients
          </NavLink>

          <NavLink to="/admin/appointments" className={linkClass}>
            <FaCalendarCheck /> Appointments
          </NavLink>

          <div className="border-t">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* ================= MAIN AREA ================= */}
      <div className="flex-1 flex flex-col">
        {/* ===== TOP BAR ===== */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Admin Dashboard
          </h2>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{admin?.email || "Admin"}</p>
              <p className="text-xs text-gray-500">ADMIN</p>
            </div>

            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>

        {/* ===== PAGE CONTENT ===== */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* ================= LOGOUT MODAL ================= */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default AdminLayout;
