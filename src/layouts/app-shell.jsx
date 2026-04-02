import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  HiOutlineArchive,
  HiOutlineChartBar,
  HiOutlineCreditCard,
  HiOutlineLogout,
  HiOutlinePresentationChartLine,
  HiOutlineShoppingCart,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { HiOutlineArrowPath, HiBars3, HiOutlineUserPlus } from "react-icons/hi2";
import { PiStorefrontBold } from "react-icons/pi";

import { ConfirmDialog } from "../components/confirm-dialog";
import { useAuth } from "../features/auth/auth-context";
import { canAccess } from "../features/auth/permissions";

const navItems = [
  { feature: "dashboard", label: "Dashboard", to: "/app/dashboard", icon: HiOutlineChartBar },
  { feature: "sales", label: "Sales", to: "/app/sales", icon: HiOutlineShoppingCart },
  { feature: "products", label: "Products", to: "/app/products", icon: HiOutlineArchive },
  { feature: "inventory", label: "Inventory", to: "/app/inventory", icon: HiOutlineArrowPath },
  { feature: "customers", label: "Customers", to: "/app/customers", icon: HiOutlineUserGroup },
  { feature: "reports", label: "Reports", to: "/app/reports", icon: HiOutlinePresentationChartLine },
  { feature: "payments", label: "Payments", to: "/app/payments", icon: HiOutlineCreditCard },
  { feature: "users", label: "Users", to: "/app/users", icon: HiOutlineUserPlus },
];

export function AppShell() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const visibleNavItems = navItems.filter((item) => canAccess(user, item.feature));

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  const renderNavItems = (tone = "desktop") =>
    visibleNavItems.map(({ icon: Icon, label, to }) => (
      <NavLink
        key={to}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            isActive
              ? "bg-white text-brand-700"
              : tone === "mobile"
                ? "text-slate-700 hover:bg-slate-100 hover:text-brand-700"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
          }`
        }
        to={to}
      >
        <Icon className="shrink-0 text-lg" />
        {label}
      </NavLink>
    ));

  const handleSignOut = async () => {
    await signOut();
    setIsSignOutDialogOpen(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1440px] overflow-x-hidden">
        <aside className="hidden w-72 flex-col bg-brand-900 px-6 py-8 text-white lg:flex">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-700">
              <PiStorefrontBold className="text-2xl" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-100">ShopDesk</p>
              <p className="text-lg font-bold">POS Control</p>
            </div>
          </div>

          <nav className="mt-10 space-y-2">{renderNavItems()}</nav>

          <button
            className="mt-auto flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-white/10 hover:text-white"
            type="button"
            onClick={() => setIsSignOutDialogOpen(true)}
          >
            <HiOutlineLogout className="shrink-0 text-lg" />
            Sign out
          </button>
        </aside>

        <main className="min-w-0 flex-1 overflow-x-hidden">
          <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <button
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 lg:hidden"
                  type="button"
                  onClick={() => setIsMobileNavOpen(true)}
                >
                  <HiBars3 className="shrink-0 text-xl" />
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
                    Back Office
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold text-ink sm:text-2xl">
                    Welcome back, {user?.name ?? "Operator"}
                  </h2>
                </div>
              </div>

              <div className="w-full text-left sm:w-auto sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
                  Account
                </p>
                <p className="truncate text-sm font-semibold text-slate-700">{user?.email}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  {user?.role}
                </p>
              </div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            aria-label="Close navigation"
            className="flex-1 bg-slate-950/40"
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="flex w-full max-w-xs flex-col bg-white px-5 py-6 shadow-2xl">
            <div className="flex items-center gap-3 rounded-2xl bg-brand-900 px-4 py-4 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-700">
                <PiStorefrontBold className="text-2xl" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-100">ShopDesk</p>
                <p className="truncate text-lg font-bold">POS Control</p>
              </div>
            </div>

            <nav className="mt-6 space-y-2">{renderNavItems("mobile")}</nav>

            <button
              className="mt-auto flex items-center justify-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              type="button"
              onClick={() => setIsSignOutDialogOpen(true)}
            >
              <HiOutlineLogout className="shrink-0 text-lg" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}

      {isSignOutDialogOpen ? (
        <ConfirmDialog
          cancelLabel="Stay signed in"
          confirmLabel="Yes, sign out"
          confirmTone="primary"
          description="You will be returned to the login screen and will need to sign in again to continue working."
          title="Sign out of ShopDesk?"
          onCancel={() => setIsSignOutDialogOpen(false)}
          onConfirm={handleSignOut}
        />
      ) : null}
    </div>
  );
}
