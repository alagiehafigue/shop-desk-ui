import { useMemo, useState } from "react";
import {
  HiArrowTrendingUp,
  HiOutlineArchiveBox,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
} from "react-icons/hi2";

import { useAuth } from "../features/auth/auth-context";
import { useDashboardData } from "../features/reports/use-dashboard-data";
import { getApiErrorMessage } from "../lib/error-utils";

const tabs = [
  { id: "daily", label: "Daily Sales", icon: HiArrowTrendingUp },
  { id: "weekly", label: "Weekly Sales", icon: HiOutlineClipboardDocumentList },
  { id: "products", label: "Product Performance", icon: HiOutlineArchiveBox },
  { id: "cashiers", label: "Cashier Report", icon: HiOutlineUsers },
  { id: "inventory", label: "Inventory Report", icon: HiOutlineArchiveBox },
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
  }).format(new Date(value));
}

function ReportsLockedPage({ user }) {
  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
          Reports Access
        </p>
        <h1 className="mt-3 text-2xl font-extrabold text-ink sm:text-3xl">
          Reporting is limited to admin and manager roles.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Your current role is <span className="font-semibold text-slate-800">{user?.role}</span>.
          Cashier accounts can still use sales, products, customers, and inventory pages,
          but the backend restricts report endpoints to admin and manager.
        </p>
      </div>
    </section>
  );
}

function ReportsSkeleton() {
  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
        <div className="h-[420px] animate-pulse rounded-[28px] bg-white" />
      </div>
    </section>
  );
}

function ReportsError({ message }) {
  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <div className="rounded-[28px] border border-red-100 bg-red-50 p-6 text-red-700 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em]">Reports Error</p>
        <p className="mt-3 text-base">{message}</p>
      </div>
    </section>
  );
}

function EmptyPanel({ title, description }) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
      <div>
        <p className="text-lg font-bold text-ink">{title}</p>
        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export function ReportsPage() {
  const { user } = useAuth();
  const canViewReports = ["admin", "manager"].includes(user?.role);
  const [activeTab, setActiveTab] = useState("daily");
  const {
    dailySalesQuery,
    weeklySalesQuery,
    productPerformanceQuery,
    inventoryQuery,
    cashierSalesQuery,
    isLoading,
    isError,
  } = useDashboardData({ enabled: canViewReports });

  const reportsQueries = [
    dailySalesQuery,
    weeklySalesQuery,
    productPerformanceQuery,
    inventoryQuery,
    cashierSalesQuery,
  ];

  if (!canViewReports) {
    return <ReportsLockedPage user={user} />;
  }

  if (isLoading) {
    return <ReportsSkeleton />;
  }

  if (isError) {
    const firstError = reportsQueries.find((query) => query?.error)?.error;
    return <ReportsError message={getApiErrorMessage(firstError)} />;
  }

  return (
    <ReportsContent
      activeTab={activeTab}
      cashierSales={cashierSalesQuery.data ?? []}
      dailySales={dailySalesQuery.data ?? []}
      inventory={inventoryQuery.data ?? []}
      productPerformance={productPerformanceQuery.data ?? []}
      weeklySales={weeklySalesQuery.data ?? []}
      onTabChange={setActiveTab}
    />
  );
}

function ReportsContent({
  activeTab,
  cashierSales,
  dailySales,
  inventory,
  onTabChange,
  productPerformance,
  weeklySales,
}) {
  const dailySummary = dailySales[0];
  const inventorySummary = useMemo(
    () => ({
      totalProducts: inventory.length,
      lowStockCount: inventory.filter((item) => Number(item.stock_quantity) <= 10).length,
    }),
    [inventory],
  );

  const panel = (() => {
    switch (activeTab) {
      case "daily":
        return dailySummary ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">
                Sales Summary
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Total Sales
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-ink">
                    {formatCurrency(dailySummary.total_sales)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Transactions
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-ink">
                    {dailySummary.total_transactions}
                  </p>
                </div>
              </div>
            </article>
            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">
                Report Date
              </p>
              <p className="mt-6 text-3xl font-extrabold text-ink">
                {formatDate(dailySummary.date)}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                This snapshot is pulled directly from the `sales` table for the current day.
              </p>
            </article>
          </div>
        ) : (
          <EmptyPanel
            title="No daily sales yet"
            description="Once transactions are completed today, your daily sales summary will appear here."
          />
        );

      case "weekly":
        return weeklySales.length ? (
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-extrabold text-ink">Weekly Sales Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Transactions</th>
                    <th className="px-6 py-4">Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklySales.map((row) => (
                    <tr key={row.date} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-semibold text-ink">{formatDate(row.date)}</td>
                      <td className="px-6 py-4 text-slate-600">{row.transactions}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {formatCurrency(row.sales)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyPanel
            title="No weekly sales yet"
            description="The last 7 days of sales activity will appear here once completed sales exist."
          />
        );

      case "products":
        return productPerformance.length ? (
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-extrabold text-ink">Product Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Units Sold</th>
                    <th className="px-6 py-4">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {productPerformance.map((product) => (
                    <tr key={product.id} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-semibold text-ink">{product.name}</td>
                      <td className="px-6 py-4 text-slate-600">{product.total_sold}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyPanel
            title="No product data yet"
            description="Product performance will populate when completed sales include sale items."
          />
        );

      case "inventory":
        return inventory.length ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">
                  Total Products
                </p>
                <p className="mt-3 text-3xl font-extrabold text-ink">
                  {inventorySummary.totalProducts}
                </p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">
                  Low Stock Count
                </p>
                <p className="mt-3 text-3xl font-extrabold text-amber-600">
                  {inventorySummary.lowStockCount}
                </p>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-extrabold text-ink">Inventory Report</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="px-6 py-4 font-semibold text-ink">{item.name}</td>
                        <td className="px-6 py-4 text-slate-600">{formatCurrency(item.price)}</td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {item.stock_quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <EmptyPanel
            title="No inventory data yet"
            description="Inventory records will appear once products exist in the catalog."
          />
        );

      case "cashiers":
        return cashierSales.length ? (
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-extrabold text-ink">Cashier Sales Report</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Cashier</th>
                    <th className="px-6 py-4">Transactions</th>
                    <th className="px-6 py-4">Total Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {cashierSales.map((cashier) => (
                    <tr key={cashier.id} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-semibold text-ink">{cashier.name}</td>
                      <td className="px-6 py-4 text-slate-600">{cashier.total_transactions}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {formatCurrency(cashier.total_sales)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyPanel
            title="No cashier performance data yet"
            description="Cashier sales performance will appear here once sales have been recorded for store users."
          />
        );

      default:
        return null;
    }
  })();

  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
            Reports Center
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            Explore operational performance across the store
          </h1>
          <div className="mt-6 flex flex-wrap gap-3">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`inline-flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  activeTab === id
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                type="button"
                onClick={() => onTabChange(id)}
              >
                <Icon className="shrink-0 text-lg" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {panel}
      </div>
    </section>
  );
}
