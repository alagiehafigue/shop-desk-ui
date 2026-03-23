import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HiOutlineBanknotes,
  HiOutlineCreditCard,
  HiOutlineDevicePhoneMobile,
  HiOutlineReceiptPercent,
} from "react-icons/hi2";

import { getApiErrorMessage } from "../lib/error-utils";
import { processPayment } from "../features/payments/payments-api";
import { usePaymentsData } from "../features/payments/use-payments-data";

const paymentMethods = [
  {
    value: "momo",
    label: "Mobile Money",
    description: "Best fit for Ghana retail checkout.",
    icon: HiOutlineDevicePhoneMobile,
  },
  {
    value: "cash",
    label: "Cash",
    description: "Handle in-store cash and change.",
    icon: HiOutlineBanknotes,
  },
  {
    value: "card",
    label: "Card",
    description: "For POS terminal card payments.",
    icon: HiOutlineCreditCard,
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getMethodLabel(method) {
  if (method === "momo") {
    return "Mobile Money";
  }

  if (method === "card") {
    return "Card";
  }

  return "Cash";
}

function PaymentModal({
  paymentMethod,
  pendingSale,
  values,
  errorMessage,
  isPending,
  onChange,
  onClose,
  onMethodChange,
  onSubmit,
}) {
  if (!pendingSale) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
      <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
              Complete Payment
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-ink">
              Sale {pendingSale.id}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Total due: {formatCurrency(pendingSale.total_amount)}
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

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <div>
            <span className="mb-3 block text-sm font-semibold text-slate-600">
              Payment method
            </span>
            <div className="grid gap-3 sm:grid-cols-3">
              {paymentMethods.map(({ description, icon: Icon, label, value }) => (
                <button
                  key={value}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    paymentMethod === value
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                  type="button"
                  onClick={() => onMethodChange(value)}
                >
                  <Icon className="text-xl" />
                  <p className="mt-3 font-bold">{label}</p>
                  <p className="mt-1 text-xs text-slate-500">{description}</p>
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-600">
              Amount paid
            </span>
            <input
              required
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
              min="0"
              name="amount_paid"
              step="0.01"
              type="number"
              value={values.amount_paid}
              onChange={onChange}
            />
          </label>

          {paymentMethod === "momo" ? (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                Mobile Money number
              </span>
              <input
                required
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                name="payer_phone"
                placeholder="233XXXXXXXXX"
                value={values.payer_phone}
                onChange={onChange}
              />
            </label>
          ) : null}

          {paymentMethod === "card" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-600">
                  Cardholder name
                </span>
                <input
                  required
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                  name="card_holder_name"
                  placeholder="Name on card"
                  value={values.card_holder_name}
                  onChange={onChange}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">
                  Last 4 digits
                </span>
                <input
                  required
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                  maxLength={4}
                  name="card_last4"
                  placeholder="1234"
                  value={values.card_last4}
                  onChange={onChange}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">
                  Authorization code
                </span>
                <input
                  required
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                  name="card_auth_code"
                  placeholder="Terminal reference"
                  value={values.card_auth_code}
                  onChange={onChange}
                />
              </label>
            </div>
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
              {isPending ? "Processing..." : "Confirm payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PaymentsPage() {
  const queryClient = useQueryClient();
  const { paymentsQuery, pendingSalesQuery, summaryQuery, isLoading } =
    usePaymentsData();
  const [selectedSale, setSelectedSale] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [formValues, setFormValues] = useState({
    amount_paid: "",
    payer_phone: "",
    card_auth_code: "",
    card_holder_name: "",
    card_last4: "",
  });

  const payments = paymentsQuery.data ?? [];
  const pendingSales = pendingSalesQuery.data ?? [];
  const summary = summaryQuery.data ?? [];

  const paymentMutation = useMutation({
    mutationFn: processPayment,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["payments", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["payments", "summary"] }),
        queryClient.invalidateQueries({ queryKey: ["payments", "pending-sales"] }),
        queryClient.invalidateQueries({ queryKey: ["reports", "daily-sales"] }),
        queryClient.invalidateQueries({ queryKey: ["reports", "weekly-sales"] }),
        queryClient.invalidateQueries({ queryKey: ["reports", "cashier-sales"] }),
      ]);
    },
  });

  const totalPaymentsValue = useMemo(
    () =>
      summary.reduce((sum, item) => sum + Number(item.total_amount ?? 0), 0),
    [summary],
  );

  const openPaymentModal = (sale) => {
    setSelectedSale(sale);
    setPaymentMethod("momo");
    setFormValues({
      amount_paid: sale.total_amount,
      payer_phone: "",
      card_auth_code: "",
      card_holder_name: "",
      card_last4: "",
    });
    paymentMutation.reset();
  };

  const closePaymentModal = () => {
    setSelectedSale(null);
    setFormValues({
      amount_paid: "",
      payer_phone: "",
      card_auth_code: "",
      card_holder_name: "",
      card_last4: "",
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await paymentMutation.mutateAsync({
      sale_id: selectedSale.id,
      method: paymentMethod,
      amount_paid: Number(formValues.amount_paid),
      payer_phone: paymentMethod === "momo" ? formValues.payer_phone.trim() : undefined,
    });

    closePaymentModal();
  };

  return (
    <>
      <section className="p-6 lg:p-8">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
              Payments Center
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-ink">
              Keep store payments organized across cash, mobile money, and card
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              Review pending transactions, complete checkouts, and track recent payment
              activity from one place. Mobile Money stays prominent so the team can
              handle local payment behavior without losing visibility on cash and card.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">
                Recorded Payments
              </p>
              <p className="mt-3 text-3xl font-extrabold text-ink">{payments.length}</p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">
                Pending Sales
              </p>
              <p className="mt-3 text-3xl font-extrabold text-amber-600">
                {pendingSales.length}
              </p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">
                Payment Volume
              </p>
              <p className="mt-3 text-3xl font-extrabold text-ink">
                {formatCurrency(totalPaymentsValue)}
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <HiOutlineReceiptPercent className="text-2xl" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">
                      Method Summary
                    </p>
                    <h2 className="text-xl font-extrabold text-ink">
                      How customers are paying
                    </h2>
                  </div>
                </div>

                {summaryQuery.isError ? (
                  <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {getApiErrorMessage(summaryQuery.error)}
                  </div>
                ) : isLoading ? (
                  <div className="mt-6 space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                    ))}
                  </div>
                ) : summary.length ? (
                  <div className="mt-6 space-y-3">
                    {summary.map((item) => (
                      <div
                        key={item.method}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4"
                      >
                        <div>
                          <p className="font-bold text-ink">{getMethodLabel(item.method)}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.total_payments} payment{Number(item.total_payments) === 1 ? "" : "s"}
                          </p>
                        </div>
                        <p className="text-lg font-extrabold text-ink">
                          {formatCurrency(item.total_amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                    <p className="text-lg font-bold text-ink">No payment records yet</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Payment method summary will appear once pending sales are completed.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">
                  Ghana Payment Focus
                </p>
                <div className="mt-5 space-y-3">
                  {paymentMethods.map(({ description, icon: Icon, label, value }) => (
                    <div
                      key={value}
                      className={`rounded-2xl border px-4 py-4 ${
                        value === "momo"
                          ? "border-brand-200 bg-brand-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="text-xl text-brand-600" />
                        <div>
                          <p className="font-bold text-ink">{label}</p>
                          <p className="mt-1 text-sm text-slate-500">{description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <h2 className="text-xl font-extrabold text-ink">Pending Sales</h2>
                </div>

                {pendingSalesQuery.isError ? (
                  <div className="px-6 py-6 text-red-700">
                    {getApiErrorMessage(pendingSalesQuery.error)}
                  </div>
                ) : isLoading ? (
                  <div className="space-y-3 px-6 py-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                    ))}
                  </div>
                ) : pendingSales.length ? (
                  <div className="divide-y divide-slate-100">
                    {pendingSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-bold text-ink">{sale.id}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {sale.customer_name || "Walk-in customer"} • {sale.cashier_name || "Unknown cashier"}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                            {formatDate(sale.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-lg font-extrabold text-ink">
                            {formatCurrency(sale.total_amount)}
                          </p>
                          <button
                            className="rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700"
                            type="button"
                            onClick={() => openPaymentModal(sale)}
                          >
                            Take payment
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-10 text-center">
                    <p className="text-lg font-bold text-ink">No pending sales</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Sales waiting for payment will appear here automatically.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <h2 className="text-xl font-extrabold text-ink">Recent Payment Records</h2>
                </div>

                {paymentsQuery.isError ? (
                  <div className="px-6 py-6 text-red-700">
                    {getApiErrorMessage(paymentsQuery.error)}
                  </div>
                ) : isLoading ? (
                  <div className="space-y-3 px-6 py-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                    ))}
                  </div>
                ) : payments.length ? (
                  <div className="divide-y divide-slate-100">
                    {payments.slice(0, 8).map((payment) => (
                      <div
                        key={payment.id}
                        className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-bold text-ink">{getMethodLabel(payment.method)}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {payment.customer_name || "Walk-in customer"} • {payment.cashier_name || "Unknown cashier"}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                            {formatDate(payment.created_at)}
                          </p>
                        </div>
                        <p className="text-lg font-extrabold text-ink">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-10 text-center">
                    <p className="text-lg font-bold text-ink">No payments recorded yet</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Completed payments will be stored and shown here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {paymentMutation.error ? (
            <div className="rounded-[28px] border border-red-100 bg-red-50 p-5 text-sm text-red-700">
              {getApiErrorMessage(paymentMutation.error)}
            </div>
          ) : null}
        </div>
      </section>

      {selectedSale ? (
        <PaymentModal
          errorMessage={
            paymentMutation.error ? getApiErrorMessage(paymentMutation.error) : null
          }
          isPending={paymentMutation.isPending}
          paymentMethod={paymentMethod}
          pendingSale={selectedSale}
          values={formValues}
          onChange={handleChange}
          onClose={closePaymentModal}
          onMethodChange={setPaymentMethod}
          onSubmit={handleSubmit}
        />
      ) : null}
    </>
  );
}
