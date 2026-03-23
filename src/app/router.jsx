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
import { UsersPage } from "../pages/users-page";
import { ProtectedRoute } from "../features/auth/protected-route";
import { RoleRoute } from "../features/auth/role-route";

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
        element: (
          <RoleRoute allowedRoles={["admin", "manager"]}>
            <ProductsPage />
          </RoleRoute>
        ),
      },
      {
        path: "customers",
        element: (
          <RoleRoute allowedRoles={["admin", "manager"]}>
            <CustomersPage />
          </RoleRoute>
        ),
      },
      {
        path: "inventory",
        element: (
          <RoleRoute allowedRoles={["admin", "manager"]}>
            <InventoryPage />
          </RoleRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <RoleRoute allowedRoles={["admin", "manager"]}>
            <ReportsPage />
          </RoleRoute>
        ),
      },
      {
        path: "payments",
        element: (
          <RoleRoute allowedRoles={["admin", "manager"]}>
            <PaymentsPage />
          </RoleRoute>
        ),
      },
      {
        path: "users",
        element: (
          <RoleRoute allowedRoles={["admin"]}>
            <UsersPage />
          </RoleRoute>
        ),
      },
    ],
  },
]);
