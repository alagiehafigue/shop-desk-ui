import { Navigate } from "react-router-dom";

import { useAuth } from "./auth-context";

export function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}
