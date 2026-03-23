import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HiMagnifyingGlass,
  HiOutlineBanknotes,
  HiOutlineCreditCard,
  HiOutlineTrash,
  HiOutlineUser,
} from "react-icons/hi2";

import { usePosData } from "../features/sales/use-pos-data";
import {
  createSale,
  fetchReceipt,
  processPayment,
} from "../features/sales/sales-api";
import { getApiErrorMessage } from "../lib/error-utils";

const paymentOptions = [
  { label: "Cash", value: "cash", icon: HiOutlineBanknotes },
  { label: "Mobile Money", value: "momo", icon: HiOutlineCreditCard },
  { label: "Card", value: "card", icon: HiOutlineCreditCard },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function ProductGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-44 animate-pulse rounded-[24px] border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

function ReceiptModal({ receipt, paymentResult, onClose }) {
  if (!receipt || !paymentResult) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
      <div className="max-h-full w-full max-w-2xl overflow-auto rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
              Payment Successful
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-ink">{receipt.store}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Transaction ID: {receipt.transaction_id}
            </p>
          </div>
          <button
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 rounded-[24px] bg-slate-50 p-5 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Cashier
            </p>
            <p className="mt-2 font-bold text-ink">{receipt.cashier ?? "Unknown"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Payment Method
            </p>
            <p className="mt-2 font-bold uppercase text-ink">{receipt.payment_method}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Amount Paid
            </p>
            <p className="mt-2 font-bold text-ink">{formatCurrency(paymentResult.amount_paid)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Change
            </p>
            <p className="mt-2 font-bold text-ink">{formatCurrency(paymentResult.change)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-lg font-bold text-ink">Receipt Items</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {receipt.items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-ink">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.quantity} x {formatCurrency(item.price)}
                  </p>
                </div>
                <p className="font-bold text-slate-700">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3 rounded-[24px] bg-slate-50 p-5">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Discount</span>
            <span>{formatCurrency(receipt.discount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Tax</span>
            <span>{formatCurrency(receipt.tax)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-extrabold text-ink">
            <span>Total</span>
            <span>{formatCurrency(receipt.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SalesPage() {
  const queryClient = useQueryClient();
  const { productsQuery, customersQuery, isLoading } = usePosData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [tax, setTax] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  const products = productsQuery.data ?? [];
  const customers = customersQuery.data ?? [];

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

  const cartRows = useMemo(() => {
    return cartItems.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      const unitPrice = Number(product?.price ?? 0);
      const subtotal = unitPrice * item.quantity;

      return {
        ...item,
        product,
        unitPrice,
        subtotal,
      };
    });
  }, [cartItems, products]);

  const subtotal = cartRows.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = Number(tax || 0);
  const discountAmount = Number(discount || 0);
  const total = Math.max(subtotal + taxAmount - discountAmount, 0);
  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) ?? null;

  const saleMutation = useMutation({
    mutationFn: createSale,
  });

  const paymentMutation = useMutation({
    mutationFn: processPayment,
  });

  const addToCart = (product) => {
    if (Number(product.stock_quantity) <= 0) {
      return;
    }

    setCartItems((current) => {
      const existingItem = current.find((item) => item.productId === product.id);

      if (existingItem) {
        return current.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  Number(product.stock_quantity),
                ),
              }
            : item,
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (productId, nextQuantity) => {
    const product = products.find((item) => item.id === productId);
    const normalizedQuantity = Number(nextQuantity);

    if (!product || Number.isNaN(normalizedQuantity)) {
      return;
    }

    if (normalizedQuantity <= 0) {
      setCartItems((current) => current.filter((item) => item.productId !== productId));
      return;
    }

    setCartItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.min(normalizedQuantity, Number(product.stock_quantity)),
            }
          : item,
      ),
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((current) => current.filter((item) => item.productId !== productId));
  };

  const clearSaleState = () => {
    setCartItems([]);
    setSelectedCustomerId("");
    setTax("0");
    setDiscount("0");
    setPaymentMethod("cash");
    setAmountPaid("");
  };

  const handleCheckout = async () => {
    const sale = await saleMutation.mutateAsync({
      customer_id: selectedCustomerId || null,
      tax: taxAmount,
      discount: discountAmount,
      items: cartItems.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
    });

    const payment = await paymentMutation.mutateAsync({
      sale_id: sale.id,
      method: paymentMethod,
      amount_paid: Number(amountPaid),
    });

    const nextReceipt = await fetchReceipt(sale.id);

    setReceipt(nextReceipt);
    setPaymentResult(payment);
    clearSaleState();

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["products", "list"] }),
      queryClient.invalidateQueries({ queryKey: ["reports", "daily-sales"] }),
      queryClient.invalidateQueries({ queryKey: ["reports", "weekly-sales"] }),
      queryClient.invalidateQueries({ queryKey: ["reports", "product-performance"] }),
      queryClient.invalidateQueries({ queryKey: ["reports", "inventory"] }),
    ]);
  };

  const mutationError = saleMutation.error ?? paymentMutation.error;

  return (
    <>
      <section className="p-6 lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
                    POS Sales
                  </p>
                  <h1 className="mt-2 text-3xl font-extrabold text-ink">
                    Create a live sale and process payment
                  </h1>
                </div>

                <label className="flex w-full max-w-md items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-brand-500 focus-within:bg-white lg:w-[360px]">
                  <HiMagnifyingGlass className="mr-3 text-xl text-slate-400" />
                  <input
                    className="h-12 w-full border-none bg-transparent outline-none"
                    placeholder="Search products by name, category, or barcode"
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </label>
              </div>
            </div>

            {productsQuery.isError ? (
              <div className="rounded-[28px] border border-red-100 bg-red-50 p-6 text-red-700">
                {getApiErrorMessage(productsQuery.error)}
              </div>
            ) : isLoading ? (
              <ProductGridSkeleton />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => {
                  const isOutOfStock = Number(product.stock_quantity) <= 0;

                  return (
                    <article
                      key={product.id}
                      className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                            {product.category || "General"}
                          </p>
                          <h2 className="mt-2 text-xl font-extrabold text-ink">
                            {product.name}
                          </h2>
                        </div>
                        <div
                          className={`rounded-2xl px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] ${
                            isOutOfStock
                              ? "bg-red-50 text-red-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {isOutOfStock ? "Out" : `${product.stock_quantity} in stock`}
                        </div>
                      </div>

                      <div className="mt-5">
                        <p className="text-2xl font-extrabold text-brand-700">
                          {formatCurrency(product.price)}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Barcode: {product.barcode || "Not available"}
                        </p>
                      </div>

                      <button
                        className="mt-6 flex w-full items-center justify-center rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        disabled={isOutOfStock}
                        type="button"
                        onClick={() => addToCart(product)}
                      >
                        Add to cart
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
                    Cart
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold text-ink">
                    {cartRows.length} item{cartRows.length === 1 ? "" : "s"}
                  </h2>
                </div>
                <button
                  className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!cartRows.length}
                  type="button"
                  onClick={clearSaleState}
                >
                  Clear
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {cartRows.length ? (
                  cartRows.map((item) => (
                    <div
                      key={item.productId}
                      className="rounded-[24px] border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-ink">{item.product?.name}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatCurrency(item.unitPrice)} each
                          </p>
                        </div>
                        <button
                          className="rounded-xl bg-white p-2 text-slate-400 transition hover:text-red-500"
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <HiOutlineTrash className="text-lg" />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4">
                        <input
                          className="h-11 w-24 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-brand-500"
                          min="1"
                          type="number"
                          value={item.quantity}
                          onChange={(event) =>
                            updateQuantity(item.productId, event.target.value)
                          }
                        />
                        <p className="text-lg font-extrabold text-ink">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                    <p className="text-lg font-bold text-ink">Your cart is empty</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Add products from the catalog to begin a sale.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
                  Checkout
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-ink">
                  Finalize transaction
                </h2>
              </div>

              <div className="mt-6 space-y-5">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <HiOutlineUser className="text-base" />
                    Customer
                  </span>
                  <select
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                    value={selectedCustomerId}
                    onChange={(event) => setSelectedCustomerId(event.target.value)}
                  >
                    <option value="">Walk-in customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                        {customer.phone ? ` - ${customer.phone}` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedCustomer ? (
                  <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    Loyalty points balance: {selectedCustomer.loyalty_points ?? 0}
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-600">
                      Tax
                    </span>
                    <input
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                      min="0"
                      step="0.01"
                      type="number"
                      value={tax}
                      onChange={(event) => setTax(event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-600">
                      Discount
                    </span>
                    <input
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                      min="0"
                      step="0.01"
                      type="number"
                      value={discount}
                      onChange={(event) => setDiscount(event.target.value)}
                    />
                  </label>
                </div>

                <div>
                  <span className="mb-3 block text-sm font-semibold text-slate-600">
                    Payment method
                  </span>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {paymentOptions.map(({ label, value, icon: Icon }) => (
                      <button
                        key={value}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${
                          paymentMethod === value
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                        type="button"
                        onClick={() => setPaymentMethod(value)}
                      >
                        <Icon className="text-xl" />
                        <p className="mt-3 font-bold">{label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">
                    Amount paid
                  </span>
                  <input
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                    min="0"
                    step="0.01"
                    type="number"
                    value={amountPaid}
                    onChange={(event) => setAmountPaid(event.target.value)}
                  />
                </label>

                <div className="space-y-3 rounded-[24px] bg-slate-50 p-5">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Tax</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Discount</span>
                    <span>{formatCurrency(discountAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xl font-extrabold text-ink">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                {mutationError ? (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {getApiErrorMessage(mutationError)}
                  </div>
                ) : null}

                <button
                  className="flex h-14 w-full items-center justify-center rounded-2xl bg-brand-600 px-4 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={
                    !cartRows.length ||
                    !amountPaid ||
                    Number(amountPaid) < total ||
                    saleMutation.isPending ||
                    paymentMutation.isPending
                  }
                  type="button"
                  onClick={handleCheckout}
                >
                  {saleMutation.isPending || paymentMutation.isPending
                    ? "Processing sale..."
                    : "Complete checkout"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <ReceiptModal
        paymentResult={paymentResult}
        receipt={receipt}
        onClose={() => {
          setReceipt(null);
          setPaymentResult(null);
        }}
      />
    </>
  );
}
