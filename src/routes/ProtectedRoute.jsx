import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const raw = localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");

  let user = null;
  try {
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/clientloginpage" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "PATIENT") {
      return <Navigate to="/client/dashboard" replace />;
    } else if (user.role === "DOCTOR") {
      return <Navigate to="/doctordashboard/dashboard" replace />;
    } else if (user.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/clientloginpage" replace />;
  }

  return children;
};

export default ProtectedRoute;