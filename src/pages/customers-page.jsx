import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HiMagnifyingGlass,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineUserGroup,
} from "react-icons/hi2";

import { getApiErrorMessage } from "../lib/error-utils";
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from "../features/customers/customers-api";
import {
  useCustomerSales,
  useCustomersData,
} from "../features/customers/use-customers-data";

const initialFormValues = {
  name: "",
  email: "",
  phone: "",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function formatDate(value) {
  if (!value) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function CustomerFormModal({
  mode,
  values,
  errorMessage,
  isPending,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
      <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
              Customer Form
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-ink">
              {mode === "create" ? "Add new customer" : "Update customer"}
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
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-600">
              Full name
            </span>
            <input
              required
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
              name="name"
              value={values.name}
              onChange={onChange}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                Email
              </span>
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                name="email"
                type="email"
                value={values.email}
                onChange={onChange}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                Phone
              </span>
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                name="phone"
                value={values.phone}
                onChange={onChange}
              />
            </label>
          </div>

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
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create customer"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomerSalesModal({ customer, onClose }) {
  const salesQuery = useCustomerSales(customer?.id);
  const sales = salesQuery.data ?? [];

  if (!customer) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
      <div className="w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
              Customer History
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-ink">{customer.name}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Loyalty points: {customer.loyalty_points ?? 0}
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

        <div className="mt-6 rounded-[24px] border border-slate-200">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-lg font-bold text-ink">Sales history</h3>
          </div>

          {salesQuery.isLoading ? (
            <div className="space-y-3 px-5 py-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : salesQuery.isError ? (
            <div className="px-5 py-5 text-red-700">
              {getApiErrorMessage(salesQuery.error)}
            </div>
          ) : sales.length ? (
            <div className="divide-y divide-slate-100">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <p className="font-semibold text-ink">{sale.id}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(sale.created_at)}
                    </p>
                  </div>
                  <p className="text-lg font-extrabold text-ink">
                    {formatCurrency(sale.total_amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <p className="text-lg font-bold text-ink">No purchases yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Sales linked to this customer will appear here automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CustomersPage() {
  const queryClient = useQueryClient();
  const { customersQuery, isLoading } = useCustomersData();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [historyCustomer, setHistoryCustomer] = useState(null);
  const [formValues, setFormValues] = useState(initialFormValues);

  const customers = customersQuery.data ?? [];

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["customers", "list"] }),
  });

  const updateMutation = useMutation({
    mutationFn: updateCustomer,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["customers", "list"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["customers", "list"] }),
  });

  const visibleCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return customers;
    }

    return customers.filter((customer) => {
      const values = [customer.name, customer.email, customer.phone]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return values.some((value) => value.includes(term));
    });
  }, [customers, searchTerm]);

  const mutationError =
    createMutation.error ?? updateMutation.error ?? deleteMutation.error;

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedCustomer(null);
    setFormValues(initialFormValues);
    createMutation.reset();
    updateMutation.reset();
  };

  const openEditModal = (customer) => {
    setModalMode("edit");
    setSelectedCustomer(customer);
    setFormValues({
      name: customer.name ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
    });
    createMutation.reset();
    updateMutation.reset();
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedCustomer(null);
    setFormValues(initialFormValues);
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
    };

    if (values.email.trim()) {
      payload.email = values.email.trim();
    }

    if (values.phone.trim()) {
      payload.phone = values.phone.trim();
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
      id: selectedCustomer.id,
      payload,
    });
    closeModal();
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(`Delete "${customer.name}" from customers?`);

    if (!confirmed) {
      return;
    }

    await deleteMutation.mutateAsync(customer.id);
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
                    Customer Management
                  </p>
                  <h1 className="mt-2 text-3xl font-extrabold text-ink">
                    Keep customer records organized and useful
                  </h1>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-brand-500 focus-within:bg-white sm:w-[320px]">
                    <HiMagnifyingGlass className="mr-3 text-xl text-slate-400" />
                    <input
                      className="h-12 w-full border-none bg-transparent outline-none"
                      placeholder="Search customers"
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </label>

                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
                    type="button"
                    onClick={openCreateModal}
                  >
                    <HiOutlinePlus className="text-lg" />
                    Add customer
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-extrabold text-ink">Customer list</h2>
              </div>

              {customersQuery.isError ? (
                <div className="px-6 py-6 text-red-700">
                  {getApiErrorMessage(customersQuery.error)}
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
              ) : visibleCustomers.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Loyalty</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleCustomers.map((customer) => (
                        <tr key={customer.id} className="border-t border-slate-100">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-ink">{customer.name}</p>
                              <p className="mt-1 text-sm text-slate-500">{customer.id}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {customer.email || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {customer.phone || "N/A"}
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-700">
                            {customer.loyalty_points ?? 0} pts
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded-2xl bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200"
                                type="button"
                                onClick={() => setHistoryCustomer(customer)}
                              >
                                <HiOutlineEye className="text-lg" />
                              </button>
                              <button
                                className="rounded-2xl bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200"
                                type="button"
                                onClick={() => openEditModal(customer)}
                              >
                                <HiOutlinePencilSquare className="text-lg" />
                              </button>
                              <button
                                className="rounded-2xl bg-red-50 p-3 text-red-600 transition hover:bg-red-100"
                                type="button"
                                onClick={() => handleDelete(customer)}
                              >
                                <HiOutlineTrash className="text-lg" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-lg font-bold text-ink">No matching customers</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Try a different search term or create a new customer record.
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
                    Customer Snapshot
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold text-ink">
                    {customers.length} customer{customers.length === 1 ? "" : "s"}
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <HiOutlineUserGroup className="text-2xl" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                    With email
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-ink">
                    {customers.filter((customer) => customer.email).length}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                    Loyalty members
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-ink">
                    {customers.filter((customer) => Number(customer.loyalty_points) > 0).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
                  Top Loyalty Accounts
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-ink">
                  Customers earning repeat value
                </h2>
              </div>

              {customers.length ? (
                <div className="mt-6 space-y-3">
                  {[...customers]
                    .sort(
                      (a, b) =>
                        Number(b.loyalty_points ?? 0) - Number(a.loyalty_points ?? 0),
                    )
                    .slice(0, 5)
                    .map((customer, index) => (
                      <div
                        key={customer.id}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-extrabold text-slate-700 shadow-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-bold text-ink">{customer.name}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {customer.email || customer.phone || "No contact details"}
                            </p>
                          </div>
                        </div>
                        <p className="text-right text-sm font-bold text-brand-600">
                          {customer.loyalty_points ?? 0} pts
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                  <p className="text-lg font-bold text-ink">No customers yet</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Add your first customer to start tracking purchase history and loyalty.
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
        <CustomerFormModal
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

      {historyCustomer ? (
        <CustomerSalesModal
          customer={historyCustomer}
          onClose={() => setHistoryCustomer(null)}
        />
      ) : null}
    </>
  );
}
