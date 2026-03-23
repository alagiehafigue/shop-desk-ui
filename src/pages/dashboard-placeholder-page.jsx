import { useAuth } from "../features/auth/auth-context";

export function DashboardPlaceholderPage() {
  const { user } = useAuth();

  return (
    <section className="p-6 lg:p-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
          First Slice Complete
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-ink">
          Login is connected and ready for the next page.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          You are signed in as <span className="font-semibold text-slate-800">{user?.name}</span>.
          The next step can be the real dashboard, products, customers, sales, or inventory page,
          and we can build that as the next isolated feature.
        </p>
      </div>
    </section>
  );
}
