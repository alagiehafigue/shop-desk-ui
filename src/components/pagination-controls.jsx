export function PaginationControls({
  currentPage,
  itemLabel = "items",
  onPageChange,
  pageSize,
  totalItems,
  totalPages,
}) {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing {startItem}-{endItem} of {totalItems} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <button
          className="rounded-xl bg-slate-100 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          disabled={currentPage <= 1}
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        <span className="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="rounded-xl bg-slate-100 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          disabled={currentPage >= totalPages}
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
