import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "./auth-context";

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist">
        <div className="rounded-full border-4 border-slate-200 border-t-brand-500 h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
