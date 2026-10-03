import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser, getToken } from "../api";

export default function ProtectedRoute({ allowedRole }) {
  const token = getToken();
  const user = getCurrentUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return (
      <Navigate
        to={
          user.role === "farmer"
            ? "/farmer-dashboard"
            : "/buyer-dashboard"
        }
        replace
      />
    );
  }

  return <Outlet />;
}
