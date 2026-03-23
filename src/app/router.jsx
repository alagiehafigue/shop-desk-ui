import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppShell } from "../layouts/app-shell";
import { LoginPage } from "../pages/login-page";
import { DashboardPage } from "../pages/dashboard-page";
import { FeaturePlaceholderPage } from "../pages/feature-placeholder-page";
import { SalesPage } from "../pages/sales-page";
import { ProductsPage } from "../pages/products-page";
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
        element: <SalesPage />,
      },
      {
        path: "products",
        element: <ProductsPage />,
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
