import api from "./api";

// Get all notifications
export const getNotifications = () =>
  api.get("/notifications");

// Get unread count
export const getUnreadNotificationCount = () =>
  api.get("/notifications/unread-count");

// Mark single notification as read
export const markNotificationRead = (id) =>
  api.put(`/notifications/${id}/read`);

// Mark all notifications as read
export const markAllNotificationsRead = () =>
  api.put("/notifications/read-all");