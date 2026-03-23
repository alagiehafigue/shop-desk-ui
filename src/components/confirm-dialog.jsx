export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone = "danger",
  isPending = false,
  onCancel,
  onConfirm,
}) {
  const confirmClassName =
    confirmTone === "primary"
      ? "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-slate-300"
      : "bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 sm:py-8">
      <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl sm:p-6">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
          Confirmation
        </p>
        <h2 className="mt-3 text-2xl font-extrabold leading-tight text-ink">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
            type="button"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={`rounded-2xl px-5 py-3 font-semibold transition disabled:cursor-not-allowed ${confirmClassName}`}
            disabled={isPending}
            type="button"
            onClick={onConfirm}
          >
            {isPending ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
