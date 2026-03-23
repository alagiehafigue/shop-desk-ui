import { Link } from "react-router-dom";

export function FeaturePlaceholderPage({ title, description }) {
  return (
    <section className="p-6 lg:p-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
          Next Slice
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-ink">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{description}</p>
        <Link
          className="mt-6 inline-flex rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
          to="/app/dashboard"
        >
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}
