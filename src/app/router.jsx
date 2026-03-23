import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppShell } from "../layouts/app-shell";
import { LoginPage } from "../pages/login-page";
import { DashboardPage } from "../pages/dashboard-page";
import { FeaturePlaceholderPage } from "../pages/feature-placeholder-page";
import { SalesPage } from "../pages/sales-page";
import { ProductsPage } from "../pages/products-page";
import { CustomersPage } from "../pages/customers-page";
import { InventoryPage } from "../pages/inventory-page";
import { ReportsPage } from "../pages/reports-page";
import { PaymentsPage } from "../pages/payments-page";
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
        element: <CustomersPage />,
      },
      {
        path: "inventory",
        element: <InventoryPage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
      },
      {
        path: "payments",
        element: <PaymentsPage />,
      },
    ],
  },
]);
