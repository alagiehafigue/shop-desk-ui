import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppShell } from "../layouts/app-shell";
import { LoginPage } from "../pages/login-page";
import { DashboardPlaceholderPage } from "../pages/dashboard-placeholder-page";
import { RoleRoute } from "../features/auth/role-route";
import { ProtectedRoute } from "../features/auth/protected-route";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: (
          <RoleRoute allowedRoles={["admin", "manager", "cashier"]}>
            <DashboardPlaceholderPage />
          </RoleRoute>
        ),
      },
    ],
  },
]);
