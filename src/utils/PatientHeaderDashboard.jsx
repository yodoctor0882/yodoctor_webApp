import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaBell, FaSignOutAlt, FaShoppingCart } from "react-icons/fa";
import { useImage } from "../context/ImageContext";
import CartPage from "../views/labtest/CartPage";
import { useSocket } from "../context/SocketContext";
import { useCart } from "../context/CartContext";

import { notify } from "../utils/notify";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
} from "../services/notificationService";
import { getProfileImageApi } from "../services/PatientProfileImageApi";

const getStoredUser = () => {
  const raw = localStorage.getItem("loggedInUser");
  if (!raw || raw === "undefined") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const PatientHeaderDashboard = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items = [] } = useCart();
  const { socket, connected } = useSocket();

  const [loggedInUser, setLoggedInUser] = useState(getStoredUser);
  const { patientImage } = useImage();

  const profileImage = patientImage || DEFAULT_AVATAR;
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const syncUser = () => setLoggedInUser(getStoredUser());
    window.addEventListener("storage", syncUser);
    window.addEventListener("userLogin", syncUser);
    window.addEventListener("userLogout", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("userLogin", syncUser);
      window.removeEventListener("userLogout", syncUser);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        dropdownRef.current?.contains(e.target) ||
        notificationRef.current?.contains(e.target)
      )
        return;
      setProfileOpen(false);
      setNotificationOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUnread = async () => {
    try {
      const res = await getUnreadNotificationCount();
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnread();
  }, []);

  useEffect(() => {
    if (!socket || !connected) return;

    const handleNotification = (payload) => {
      setNotifications((prev) => {
        const exists = prev.some(
          (item) =>
            item.id === payload.id ||
            (item.title === payload.title &&
              item.message === payload.message &&
              item.appointmentId === payload.appointmentId),
        );

        if (exists) return prev;

        return [payload, ...prev];
      });

      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, connected]);

  const handleNotificationClick = async (id) => {
    try {
      await markNotificationRead(id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigate = (path) => {
    setProfileOpen(false);
    setNotificationOpen(false);
    navigate(path);
  };

  if (!loggedInUser) return null;

  return (
    <nav
      className={`fixed top-0 z-50 h-20 bg-white border-b border-gray-200 transition-all duration-300
      ${isSidebarOpen ? "md:left-64 md:w-[calc(100%-16rem)]" : "md:left-24 md:w-[calc(100%-6rem)]"}
      left-0 w-full`}
    >
      <div className="h-full px-4 flex items-center">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-xl text-gray-700 mr-4"
        >
          <FaBars />
        </button>

        {/* Center */}
        <div className="flex-1 flex justify-center items-center gap-4">
          <img src="/images/logo.webp" alt="logo" className="h-8 md:hidden" />
          {location.pathname === "/client/dashboard" && (
            <button
              onClick={() => handleNavigate("/client/book-appointment")}
              className="hidden md:flex px-6 py-2 rounded-full bg-gradient-to-br from-[#2277f7] to-[#52abd4] text-white text-md font-medium"
            >
              Book Appointment
            </button>
          )}
          {location.pathname === "/client/dashboard" && (
            <button
              onClick={() => handleNavigate("/client/lab-tests")}
              className="hidden md:flex px-6 py-2 rounded-full bg-gradient-to-br from-[#2277f7] to-[#52abd4] text-white text-md font-medium"
            >
              Book Labt Test
            </button>
          )}
          {location.pathname === "/client/dashboard" && (
            <button
              onClick={() => handleNavigate("/client/certificatedoctors")}
              className="hidden md:flex px-6 py-2 rounded-full bg-gradient-to-br from-[#2277f7] to-[#52abd4] text-white text-md font-medium"
            >
              Apply Certificate
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => navigate("/client/cart")}
            className="relative p-2 rounded-full hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
          >
            <FaShoppingCart className="text-2xl" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                {items.length}
              </span>
            )}
          </button>
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setNotificationOpen((p) => !p);
                setProfileOpen(false);
              }}
              className="relative text-2xl text-gray-700 hover:text-blue-600"
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div
                className="
      fixed sm:absolute
      top-20 sm:top-auto sm:mt-3
      right-2 sm:right-0
      w-[calc(100vw-1rem)] sm:w-80
      max-w-sm
      bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50
    "
              >
                <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {notifications.length}
                  </span>
                </div>
                <ul className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <li className="px-4 py-6 text-center text-gray-500 text-sm">
                      🔔 No notifications
                    </li>
                  ) : (
                    notifications.map((note) => (
                      <li
                        key={note.id}
                        onClick={() => handleNotificationClick(note.id)}
                        className={`flex gap-3 px-4 py-3 border-b hover:bg-cyan-50 cursor-pointer transition ${
                          !note.is_read
                            ? "bg-cyan-50 border-l-4 border-cyan-500"
                            : ""
                        }`}
                      >
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-cyan-100 text-cyan-600 text-lg">
                          🔔
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm ${!note.is_read ? "font-semibold" : ""}`}
                          >
                            {note.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {note.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(note.created_at).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setNotificationOpen(false);
              navigate("/client/profile");
            }}
            className="p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
            title="My Profile"
          >
            <img
              src={profileImage}
              alt="Profile"
              className="w-12 h-12 rounded-full border object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_AVATAR;
              }}
            />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default PatientHeaderDashboard;
