import { NavLink, Outlet } from "react-router-dom";
import {
  HiOutlineArchive,
  HiOutlineChartBar,
  HiOutlineCreditCard,
  HiOutlineLogout,
  HiOutlinePresentationChartLine,
  HiOutlineShoppingCart,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { HiOutlineArrowPath } from "react-icons/hi2";
import { HiBars3 } from "react-icons/hi2";
import { PiStorefrontBold } from "react-icons/pi";

import { useAuth } from "../features/auth/auth-context";

const navItems = [
  { label: "Dashboard", to: "/app/dashboard", icon: HiOutlineChartBar },
  { label: "Sales", to: "/app/sales", icon: HiOutlineShoppingCart },
  { label: "Products", to: "/app/products", icon: HiOutlineArchive },
  { label: "Inventory", to: "/app/inventory", icon: HiOutlineArrowPath },
  { label: "Customers", to: "/app/customers", icon: HiOutlineUserGroup },
  { label: "Reports", to: "/app/reports", icon: HiOutlinePresentationChartLine },
  { label: "Payments", to: "/app/payments", icon: HiOutlineCreditCard },
];

export function AppShell() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
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

          <nav className="mt-10 space-y-2">
            {navItems.map(({ icon: Icon, label, to }) => (
              <NavLink
                key={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive ? "bg-white text-brand-700" : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`
                }
                to={to}
              >
                <Icon className="text-lg" />
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            className="mt-auto flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-white/10 hover:text-white"
            type="button"
            onClick={signOut}
          >
            <HiOutlineLogout className="text-lg" />
            Sign out
          </button>
        </aside>

        <main className="flex-1">
          <header className="border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 lg:hidden">
                  <HiBars3 className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
                    Back Office
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold text-ink">
                    Welcome back, {user?.name ?? "Operator"}
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
                  Account
                </p>
                <p className="text-sm font-semibold text-slate-700">{user?.email}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  {user?.role}
                </p>
              </div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
