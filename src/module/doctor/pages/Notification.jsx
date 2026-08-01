import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { notify } from "../../../utils/notify"; 
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const res = await api.get("/doctor/notifications");
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error("Failed to load notifications", error);
      notify.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);


  const markAsRead = async (id) => {
    try {
      await api.put(`/doctor/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      console.error("Failed to mark as read");
    }
  };

 
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Notifications</h2>

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
          <span className="text-5xl">🔔</span>
          <p className="font-medium text-gray-500">No notifications found</p>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.is_read && markAsRead(n.id)}
            className={`border rounded-lg p-4 shadow-sm transition ${
              n.is_read
                ? "bg-white"
                : "bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">{n.title}</p>
                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
              </div>

              {!n.is_read && (
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full whitespace-nowrap">
                  New
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-2">
              {new Date(n.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};


export default Notifications;