import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HiMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineClipboardDocumentList,
  HiOutlineExclamationTriangle,
  HiOutlinePlus,
  HiOutlineScale,
} from "react-icons/hi2";

import { getApiErrorMessage } from "../lib/error-utils";
import { useInventoryData, useInventoryLogs } from "../features/inventory/use-inventory-data";
import { adjustStock, restockProduct } from "../features/inventory/inventory-api";

function formatDate(value) {
  if (!value) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function InventoryActionModal({
  mode,
  product,
  values,
  errorMessage,
  isPending,
  onChange,
  onClose,
  onSubmit,
}) {
  if (!product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
      <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
              Inventory Action
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-ink">
              {mode === "restock" ? "Restock product" : "Adjust stock"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{product.name}</p>
          </div>
          <button
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-600">
              Quantity
            </span>
            <input
              required
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
              name="quantity"
              step="1"
              type="number"
              value={values.quantity}
              onChange={onChange}
            />
          </label>

          {mode === "adjust" ? (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                Reason
              </span>
              <input
                required
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                name="reason"
                value={values.reason}
                onChange={onChange}
              />
            </label>
          ) : null}

          {errorMessage ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              className="rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isPending}
              type="submit"
            >
              {isPending
                ? mode === "restock"
                  ? "Restocking..."
                  : "Saving..."
                : mode === "restock"
                  ? "Confirm restock"
                  : "Apply adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InventoryLogsModal({ product, onClose }) {
  const logsQuery = useInventoryLogs(product?.id);
  const logs = logsQuery.data ?? [];

  if (!product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
      <div className="w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
              Inventory Logs
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-ink">{product.name}</h2>
          </div>
          <button
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-lg font-bold text-ink">Movement history</h3>
          </div>

          {logsQuery.isLoading ? (
            <div className="space-y-3 px-5 py-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : logsQuery.isError ? (
            <div className="px-5 py-5 text-red-700">
              {getApiErrorMessage(logsQuery.error)}
            </div>
          ) : logs.length ? (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-semibold capitalize text-ink">{log.change_type}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatDate(log.created_at)}</p>
                  </div>
                  <p className={`text-lg font-extrabold ${Number(log.quantity) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {Number(log.quantity) >= 0 ? "+" : ""}
                    {log.quantity}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <p className="text-lg font-bold text-ink">No stock movements yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Restocks and adjustments for this product will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InventoryPage() {
  const queryClient = useQueryClient();
  const { productsQuery, lowStockQuery, isLoading } = useInventoryData();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeProduct, setActiveProduct] = useState(null);
  const [actionMode, setActionMode] = useState(null);
  const [logsProduct, setLogsProduct] = useState(null);
  const [formValues, setFormValues] = useState({ quantity: "", reason: "" });

  const products = productsQuery.data ?? [];
  const lowStockProducts = lowStockQuery.data ?? [];

  const restockMutation = useMutation({
    mutationFn: restockProduct,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "low-stock"] }),
        activeProduct
          ? queryClient.invalidateQueries({ queryKey: ["inventory", "logs", activeProduct.id] })
          : Promise.resolve(),
        queryClient.invalidateQueries({ queryKey: ["reports", "inventory"] }),
      ]);
    },
  });

  const adjustMutation = useMutation({
    mutationFn: adjustStock,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "low-stock"] }),
        activeProduct
          ? queryClient.invalidateQueries({ queryKey: ["inventory", "logs", activeProduct.id] })
          : Promise.resolve(),
        queryClient.invalidateQueries({ queryKey: ["reports", "inventory"] }),
      ]);
    },
  });

  const visibleProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return products;
    }

    return products.filter((product) => {
      const values = [product.name, product.category, product.barcode]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return values.some((value) => value.includes(term));
    });
  }, [products, searchTerm]);

  const mutationError = restockMutation.error ?? adjustMutation.error;

  const openActionModal = (mode, product) => {
    setActionMode(mode);
    setActiveProduct(product);
    setFormValues({ quantity: "", reason: "" });
    restockMutation.reset();
    adjustMutation.reset();
  };

  const closeActionModal = () => {
    setActionMode(null);
    setActiveProduct(null);
    setFormValues({ quantity: "", reason: "" });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleActionSubmit = async (event) => {
    event.preventDefault();

    if (!activeProduct) {
      return;
    }

    if (actionMode === "restock") {
      await restockMutation.mutateAsync({
        product_id: activeProduct.id,
        quantity: Number(formValues.quantity),
      });
      closeActionModal();
      return;
    }

    await adjustMutation.mutateAsync({
      product_id: activeProduct.id,
      quantity: Number(formValues.quantity),
      reason: formValues.reason.trim(),
    });
    closeActionModal();
  };

  return (
    <>
      <section className="p-6 lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
                    Inventory Management
                  </p>
                  <h1 className="mt-2 text-3xl font-extrabold text-ink">
                    Monitor stock and record inventory changes
                  </h1>
                </div>

                <label className="flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-brand-500 focus-within:bg-white sm:w-[320px]">
                  <HiMagnifyingGlass className="mr-3 text-xl text-slate-400" />
                  <input
                    className="h-12 w-full border-none bg-transparent outline-none"
                    placeholder="Search inventory"
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-extrabold text-ink">Stock overview</h2>
              </div>

              {productsQuery.isError ? (
                <div className="px-6 py-6 text-red-700">
                  {getApiErrorMessage(productsQuery.error)}
                </div>
              ) : isLoading ? (
                <div className="space-y-3 px-6 py-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              ) : visibleProducts.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Barcode</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleProducts.map((product) => {
                        const stock = Number(product.stock_quantity ?? 0);
                        const badgeClass =
                          stock <= 0
                            ? "bg-red-50 text-red-600"
                            : stock <= 10
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600";

                        return (
                          <tr key={product.id} className="border-t border-slate-100">
                            <td className="px-6 py-4">
                              <p className="font-bold text-ink">{product.name}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {product.category || "General"}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {product.barcode || "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`rounded-2xl px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] ${badgeClass}`}>
                                {stock}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                  type="button"
                                  onClick={() => openActionModal("restock", product)}
                                >
                                  <HiOutlinePlus className="text-base" />
                                  Restock
                                </button>
                                <button
                                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-blue-100"
                                  type="button"
                                  onClick={() => openActionModal("adjust", product)}
                                >
                                  <HiOutlineScale className="text-base" />
                                  Adjust
                                </button>
                                <button
                                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                                  type="button"
                                  onClick={() => setLogsProduct(product)}
                                >
                                  <HiOutlineClipboardDocumentList className="text-base" />
                                  Logs
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-lg font-bold text-ink">No matching inventory items</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Try a different search term to find a product.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
                    Inventory Snapshot
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold text-ink">
                    {products.length} tracked item{products.length === 1 ? "" : "s"}
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <HiOutlineArrowPath className="text-2xl" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                    Low stock items
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-amber-600">
                    {lowStockProducts.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                    Out of stock
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-red-600">
                    {products.filter((product) => Number(product.stock_quantity ?? 0) <= 0).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
                  Attention Needed
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-ink">
                  Low stock watchlist
                </h2>
              </div>

              {lowStockQuery.isError ? (
                <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {getApiErrorMessage(lowStockQuery.error)}
                </div>
              ) : lowStockProducts.length ? (
                <div className="mt-6 space-y-3">
                  {lowStockProducts.slice(0, 6).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                          <HiOutlineExclamationTriangle className="text-xl" />
                        </div>
                        <div>
                          <p className="font-bold text-ink">{product.name}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            Stock needs review
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-extrabold text-amber-600">
                        {product.stock_quantity}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                  <p className="text-lg font-bold text-ink">Inventory is stable</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    No products are currently at or below the low-stock threshold.
                  </p>
                </div>
              )}
            </div>

            {mutationError ? (
              <div className="rounded-[28px] border border-red-100 bg-red-50 p-5 text-sm text-red-700">
                {getApiErrorMessage(mutationError)}
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      {actionMode ? (
        <InventoryActionModal
          errorMessage={
            restockMutation.error || adjustMutation.error
              ? getApiErrorMessage(restockMutation.error ?? adjustMutation.error)
              : null
          }
          isPending={restockMutation.isPending || adjustMutation.isPending}
          mode={actionMode}
          product={activeProduct}
          values={formValues}
          onChange={handleFormChange}
          onClose={closeActionModal}
          onSubmit={handleActionSubmit}
        />
      ) : null}

      {logsProduct ? (
        <InventoryLogsModal
          product={logsProduct}
          onClose={() => setLogsProduct(null)}
        />
      ) : null}
    </>
  );
}
