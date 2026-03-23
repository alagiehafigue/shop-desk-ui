import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppShell } from "../layouts/app-shell";
import { LoginPage } from "../pages/login-page";
import { DashboardPage } from "../pages/dashboard-page";
import { FeaturePlaceholderPage } from "../pages/feature-placeholder-page";
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
        element: <DashboardPage />,
      },
      {
        path: "sales",
        element: (
          <FeaturePlaceholderPage
            title="Sales screen is next"
            description="The dashboard is now live. The next isolated feature can be the POS sales experience, built against your existing sales and payments backend."
          />
        ),
      },
      {
        path: "products",
        element: (
          <FeaturePlaceholderPage
            title="Products page is not built yet"
            description="We have the backend module ready, and we can implement the real product management screen as the next commit-sized feature."
          />
        ),
      },
      {
        path: "customers",
        element: (
          <FeaturePlaceholderPage
            title="Customers page is not built yet"
            description="The customer routes already exist in your backend, so we can build this management page next without changing the project direction."
          />
        ),
      },
      {
        path: "payments",
        element: (
          <FeaturePlaceholderPage
            title="Payments page is not built yet"
            description="Payment workflows can be added after sales, once the checkout and transaction flow is in place."
          />
        ),
      },
    ],
  },
]);
