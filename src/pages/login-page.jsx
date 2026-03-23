import { HiMiniChartBarSquare, HiMiniCube, HiMiniUserGroup } from "react-icons/hi2";

import { LoginForm } from "../features/auth/components/login-form";

const highlights = [
  {
    title: "Sales visibility",
    description: "Monitor transactions, staff activity, and top-performing products in one place.",
    icon: HiMiniChartBarSquare,
  },
  {
    title: "Inventory control",
    description: "Stay ahead of low-stock alerts and keep item counts aligned with real store activity.",
    icon: HiMiniCube,
  },
  {
    title: "Customer records",
    description: "Track shopper history, loyalty points, and repeat purchases without the spreadsheet chaos.",
    icon: HiMiniUserGroup,
  },
];

export function LoginPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-login-glow">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-10">
        <section className="order-2 lg:order-1">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-brand-600">
            Retail Operations
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
            The control room for your modern store.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            ShopDesk gives your team a calmer way to manage checkout, stock,
            customers, and reporting from one connected workspace.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3 lg:mt-10">
            {highlights.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-[24px] border border-white/60 bg-white/70 p-5 shadow-lg shadow-slate-200/60 backdrop-blur sm:p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon className="text-2xl" />
                </div>
                <h2 className="text-lg font-extrabold text-ink">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="order-1 w-full lg:order-2 lg:justify-self-end">
          <LoginForm />
        </section>
      </div>
    </div>
  );
}
