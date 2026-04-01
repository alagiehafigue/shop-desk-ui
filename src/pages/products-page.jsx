import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HiMagnifyingGlass,
  HiOutlineArchiveBox,
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineTrash,
} from "react-icons/hi2";

import { useAuth } from "../features/auth/auth-context";
import { useProductsData } from "../features/products/use-products-data";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "../features/products/products-api";
import { ConfirmDialog } from "../components/confirm-dialog";
import { PaginationControls } from "../components/pagination-controls";
import { getApiErrorMessage } from "../lib/error-utils";
import { paginateItems } from "../lib/pagination";

const initialFormValues = {
  name: "",
  category: "",
  barcode: "",
  price: "",
  cost_price: "",
  stock_quantity: "",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(Number(value ?? 0));
}

function generateInternalBarcode() {
  const timestamp = Date.now().toString().slice(-8);
  const randomSuffix = Math.floor(Math.random() * 9000 + 1000).toString();
  return `SD-${timestamp}${randomSuffix}`;
}

function ProductFormModal({
  mode,
  values,
  isPending,
  errorMessage,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 sm:py-8">
      <div className="max-h-full w-full max-w-3xl overflow-auto rounded-[28px] bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
              Product Form
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
              {mode === "create" ? "Add new product" : "Update product"}
            </h2>
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
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                Product name
              </span>
              <input
                required
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                name="name"
                value={values.name}
                onChange={onChange}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                Category
              </span>
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                name="category"
                value={values.category}
                onChange={onChange}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                Barcode
              </span>
              <div className="space-y-3">
                <input
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 uppercase outline-none focus:border-brand-500 focus:bg-white"
                  name="barcode"
                  placeholder="Scan or type barcode, e.g. 123456789012"
                  value={values.barcode}
                  onChange={onChange}
                />
                <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <p>Use the manufacturer barcode or generate an internal ShopDesk code.</p>
                  <button
                    className="rounded-2xl bg-slate-100 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-200"
                    type="button"
                    onClick={() =>
                      onChange({
                        target: {
                          name: "barcode",
                          value: generateInternalBarcode(),
                        },
                      })
                    }
                  >
                    Generate barcode
                  </button>
                </div>
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                Selling price
              </span>
              <input
                required
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                min="0"
                name="price"
                step="0.01"
                type="number"
                value={values.price}
                onChange={onChange}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                Cost price
              </span>
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                min="0"
                name="cost_price"
                step="0.01"
                type="number"
                value={values.cost_price}
                onChange={onChange}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                Stock quantity
              </span>
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                min="0"
                name="stock_quantity"
                step="1"
                type="number"
                value={values.stock_quantity}
                onChange={onChange}
              />
            </label>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create product"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProductsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { productsQuery, lowStockQuery, isLoading } = useProductsData();
  const [searchTerm, setSearchTerm] = useState("");
  const [catalogPage, setCatalogPage] = useState(1);
  const [modalMode, setModalMode] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [productToDelete, setProductToDelete] = useState(null);

  const canManageProducts = ["admin", "manager"].includes(user?.role);
  const products = productsQuery.data ?? [];
  const lowStockProducts = lowStockQuery.data ?? [];

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "low-stock"] }),
      ]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "low-stock"] }),
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "low-stock"] }),
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

  const mutationError =
    createMutation.error ?? updateMutation.error ?? deleteMutation.error;
  const paginatedProducts = useMemo(
    () => paginateItems(visibleProducts, catalogPage, 8),
    [catalogPage, visibleProducts],
  );

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedProductId(null);
    setFormValues(initialFormValues);
  };

  const openEditModal = (product) => {
    setModalMode("edit");
    setSelectedProductId(product.id);
    setFormValues({
      name: product.name ?? "",
      category: product.category ?? "",
      barcode: product.barcode ?? "",
      price: product.price ?? "",
      cost_price: product.cost_price ?? "",
      stock_quantity: product.stock_quantity ?? "",
    });
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedProductId(null);
    setFormValues(initialFormValues);
    createMutation.reset();
    updateMutation.reset();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const normalizePayload = (values) => {
    const payload = {
      name: values.name.trim(),
      price: Number(values.price),
    };

    if (values.category.trim()) {
      payload.category = values.category.trim();
    }

    if (values.barcode.trim()) {
      payload.barcode = values.barcode.trim();
    }

    if (values.cost_price !== "") {
      payload.cost_price = Number(values.cost_price);
    }

    if (values.stock_quantity !== "") {
      payload.stock_quantity = Number(values.stock_quantity);
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = normalizePayload(formValues);

    if (modalMode === "create") {
      await createMutation.mutateAsync(payload);
      closeModal();
      return;
    }

    await updateMutation.mutateAsync({
      id: selectedProductId,
      payload,
    });
    closeModal();
  };

  const handleDelete = async () => {
    if (!productToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(productToDelete.id);
    setProductToDelete(null);
  };

  return (
    <>
      <section className="p-4 sm:p-6 lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
                    Product Management
                  </p>
                  <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
                    Manage the catalog your store runs on
                  </h1>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-brand-500 focus-within:bg-white sm:w-[320px]">
                    <HiMagnifyingGlass className="mr-3 shrink-0 text-xl text-slate-400" />
                    <input
                      className="h-12 w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400 sm:text-base"
                      placeholder="Search products"
                      type="text"
                      value={searchTerm}
                      onChange={(event) => {
                        setSearchTerm(event.target.value);
                        setCatalogPage(1);
                      }}
                    />
                  </label>

                  {canManageProducts ? (
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
                      type="button"
                      onClick={openCreateModal}
                    >
                      <HiOutlinePlus className="shrink-0 text-lg" />
                      Add product
                    </button>
                  ) : null}
                </div>
              </div>

              {!canManageProducts ? (
                <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Your role can browse products, but only admin and manager accounts can create,
                  edit, or delete them.
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-extrabold text-ink">Catalog</h2>
              </div>

              {productsQuery.isError ? (
                <div className="px-6 py-6 text-red-700">
                  {getApiErrorMessage(productsQuery.error)}
                </div>
              ) : isLoading ? (
                <div className="space-y-3 px-6 py-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-2xl bg-slate-100"
                    />
                  ))}
                </div>
              ) : visibleProducts.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Barcode</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4">Status</th>
                        {canManageProducts ? <th className="px-6 py-4">Actions</th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.items.map((product) => {
                        const stock = Number(product.stock_quantity ?? 0);
                        const statusClass =
                          stock <= 0
                            ? "bg-red-50 text-red-600"
                            : stock <= 10
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600";
                        const statusLabel =
                          stock <= 0 ? "Out of stock" : stock <= 10 ? "Low stock" : "Healthy";

                        return (
                          <tr key={product.id} className="border-t border-slate-100">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-bold text-ink">{product.name}</p>
                                <p className="mt-1 text-sm text-slate-500">
                                  {product.category || "General"}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {product.barcode || "N/A"}
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-700">
                              {formatCurrency(product.price)}
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-700">
                              {product.stock_quantity}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`rounded-2xl px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] ${statusClass}`}>
                                {statusLabel}
                              </span>
                            </td>
                            {canManageProducts ? (
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    className="rounded-2xl bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200"
                                    type="button"
                                    onClick={() => openEditModal(product)}
                                  >
                                    <HiOutlinePencilSquare className="text-lg" />
                                  </button>
                                  <button
                                    className="rounded-2xl bg-red-50 p-3 text-red-600 transition hover:bg-red-100"
                                    type="button"
                                    onClick={() => setProductToDelete(product)}
                                  >
                                    <HiOutlineTrash className="text-lg" />
                                  </button>
                                </div>
                              </td>
                            ) : null}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-lg font-bold text-ink">No matching products</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Try a different search term or add a new product.
                  </p>
                </div>
              )}

              <PaginationControls
                currentPage={paginatedProducts.currentPage}
                itemLabel="products"
                pageSize={8}
                totalItems={paginatedProducts.totalItems}
                totalPages={paginatedProducts.totalPages}
                onPageChange={setCatalogPage}
              />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
                    Catalog Snapshot
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold text-ink">
                    {products.length} product{products.length === 1 ? "" : "s"}
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <HiOutlineArchiveBox className="text-2xl" />
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
                    Average selling price
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-ink">
                    {formatCurrency(
                      products.length
                        ? products.reduce(
                            (sum, product) => sum + Number(product.price ?? 0),
                            0,
                          ) / products.length
                        : 0,
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
                  Low Stock Watchlist
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-ink">
                  Products that need attention
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
                    className="flex flex-col gap-3 rounded-2xl bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-bold text-ink">{product.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Current stock is below threshold
                        </p>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Stock
                        </p>
                        <p className="text-lg font-extrabold text-amber-600">
                          {product.stock_quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                  <p className="text-lg font-bold text-ink">Inventory looks healthy</p>
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

      {modalMode ? (
        <ProductFormModal
          errorMessage={
            createMutation.error || updateMutation.error
              ? getApiErrorMessage(createMutation.error ?? updateMutation.error)
              : null
          }
          isPending={createMutation.isPending || updateMutation.isPending}
          mode={modalMode}
          values={formValues}
          onChange={handleChange}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      ) : null}

      {productToDelete ? (
        <ConfirmDialog
          cancelLabel="Keep product"
          confirmLabel="Delete product"
          description={`This will remove "${productToDelete.name}" from the product catalog.`}
          isPending={deleteMutation.isPending}
          title="Delete this product?"
          onCancel={() => setProductToDelete(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  );
}
