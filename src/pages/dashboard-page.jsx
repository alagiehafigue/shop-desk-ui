import {
  HiArrowTrendingUp,
  HiBanknotes,
  HiMiniExclamationTriangle,
  HiOutlineArrowPath,
  HiOutlineCube,
  HiOutlineDevicePhoneMobile,
  HiOutlineShoppingCart,
  HiOutlineUsers,
} from "react-icons/hi2";
import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { PaginationControls } from "../components/pagination-controls";
import { useAuth } from "../features/auth/auth-context";
import { useDashboardData } from "../features/reports/use-dashboard-data";
import { fetchLowStockProducts } from "../features/inventory/inventory-api";
import { fetchPendingSales } from "../features/payments/payments-api";
import { fetchCustomers, fetchProducts } from "../features/sales/sales-api";
import { getApiErrorMessage } from "../lib/error-utils";
import { paginateItems } from "../lib/pagination";

function formatCurrency(value) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount);
}

function formatCompactNumber(value) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-GH", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

function buildWeeklyChartData(rows) {
  const formatter = new Intl.DateTimeFormat("en-GH", { weekday: "short" });

  if (!rows?.length) {
    return [];
  }

  const highestValue = Math.max(
    ...rows.map((row) => Number(row.sales ?? 0)),
    1,
  );

  return rows.map((row) => {
    const sales = Number(row.sales ?? 0);

    return {
      label: formatter.format(new Date(row.date)),
      sales,
      height: Math.max((sales / highestValue) * 100, sales > 0 ? 14 : 8),
    };
  });
}

function StatCard({ title, value, subtitle, icon: Icon, tone = "blue" }) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <article className='rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-sm font-semibold text-slate-500'>{title}</p>
          <p className='mt-3 text-3xl font-extrabold tracking-tight text-ink'>
            {value}
          </p>
          <p className='mt-2 text-sm text-slate-500'>{subtitle}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClasses[tone]}`}
        >
          <Icon className='text-2xl' />
        </div>
      </div>
    </article>
  );
}

function DashboardSkeleton() {
  return (
    <section className='p-4 sm:p-6 lg:p-8'>
      <div className='grid gap-6 xl:grid-cols-[1.6fr_0.9fr]'>
        <div className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className='h-40 animate-pulse rounded-[24px] border border-slate-200 bg-white'
              />
            ))}
          </div>
          <div className='h-96 animate-pulse rounded-[28px] border border-slate-200 bg-white' />
        </div>
        <div className='space-y-6'>
          <div className='h-64 animate-pulse rounded-[28px] border border-slate-200 bg-white' />
          <div className='h-72 animate-pulse rounded-[28px] border border-slate-200 bg-white' />
        </div>
      </div>
    </section>
  );
}

function CashierDashboard({ user }) {
  const [pendingSalesPage, setPendingSalesPage] = useState(1);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [productsQuery, customersQuery, lowStockQuery, pendingSalesQuery] =
    useQueries({
      queries: [
        {
          queryKey: ["products", "list"],
          queryFn: fetchProducts,
        },
        {
          queryKey: ["customers", "list"],
          queryFn: fetchCustomers,
        },
        {
          queryKey: ["inventory", "low-stock"],
          queryFn: fetchLowStockProducts,
        },
        {
          queryKey: ["payments", "pending-sales"],
          queryFn: fetchPendingSales,
        },
      ],
    });

  const isLoading =
    productsQuery.isLoading ||
    customersQuery.isLoading ||
    lowStockQuery.isLoading ||
    pendingSalesQuery.isLoading;

  const firstError =
    productsQuery.error ??
    customersQuery.error ??
    lowStockQuery.error ??
    pendingSalesQuery.error;

  if (firstError) {
    return (
      <section className='p-6 lg:p-8'>
        <ErrorState message={getApiErrorMessage(firstError)} />
      </section>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const products = productsQuery.data ?? [];
  const customers = customersQuery.data ?? [];
  const lowStockItems = lowStockQuery.data ?? [];
  const pendingSales = pendingSalesQuery.data ?? [];
  const paginatedPendingSales = paginateItems(pendingSales, pendingSalesPage, 4);
  const paginatedLowStockItems = paginateItems(lowStockItems, lowStockPage, 4);

  return (
    <section className='p-6 lg:p-8'>
      <div className='grid gap-6 xl:grid-cols-[1.55fr_0.95fr]'>
        <div className='space-y-6'>
          <div className='rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
            <p className='text-sm font-bold uppercase tracking-[0.3em] text-brand-600'>
              Cashier Workspace
            </p>
            <h1 className='mt-3 text-2xl font-extrabold text-ink sm:text-3xl'>
              Welcome back, {user?.name}.
            </h1>
            <p className='mt-4 max-w-2xl text-base leading-7 text-slate-600'>
              This dashboard keeps your day focused on checkout, customer
              selection, and stock awareness. Use the sales screen for active
              transactions and keep an eye on products that need attention
              before they slow down the queue.
            </p>

            <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap'>
              <Link
                className='rounded-2xl bg-brand-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-brand-700'
                to='/app/sales'
              >
                Open Sales Screen
              </Link>
              <span className='rounded-2xl bg-slate-100 px-5 py-3 text-center text-sm font-semibold text-slate-600'>
                Role: Cashier
              </span>
            </div>
          </div>

          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            <StatCard
              title='Products Ready'
              value={formatCompactNumber(products.length)}
              subtitle='Items available in the POS catalog.'
              icon={HiOutlineCube}
            />
            <StatCard
              title='Known Customers'
              value={formatCompactNumber(customers.length)}
              subtitle='Saved customer records for quick lookup.'
              icon={HiOutlineUsers}
              tone='emerald'
            />
            <StatCard
              title='Low Stock Alerts'
              value={formatCompactNumber(lowStockItems.length)}
              subtitle='Products that may affect active sales.'
              icon={HiMiniExclamationTriangle}
              tone='amber'
            />
            <StatCard
              title='Pending Payments'
              value={formatCompactNumber(pendingSales.length)}
              subtitle='Sales waiting to be completed.'
              icon={HiBanknotes}
              tone='slate'
            />
          </div>

          <article className='rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
              <div>
                <p className='text-sm font-bold uppercase tracking-[0.24em] text-brand-600'>
                  Queue Snapshot
                </p>
                <h2 className='mt-2 text-2xl font-extrabold text-ink'>
                  Sales waiting for payment
                </h2>
              </div>
              <Link
                className='rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200'
                to='/app/sales'
              >
                Go to checkout
              </Link>
            </div>

            {pendingSales.length ? (
              <div className='mt-6 space-y-3'>
                {paginatedPendingSales.items.map((sale) => (
                  <div
                    key={sale.id}
                    className='flex flex-col gap-3 rounded-2xl bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'
                  >
                    <div>
                      <p className='font-bold text-ink'>
                        {sale.customer_name || "Walk-in customer"}
                      </p>
                      <p className='mt-1 text-sm text-slate-500'>{sale.id}</p>
                    </div>
                    <p className='text-lg font-extrabold text-ink'>
                      {formatCurrency(sale.total_amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className='mt-6'>
                <EmptyState
                  title='No pending payments'
                  description='All recorded sales are currently settled. New pending sales will appear here automatically.'
                />
              </div>
            )}

            <PaginationControls
              currentPage={paginatedPendingSales.currentPage}
              itemLabel='sales'
              pageSize={4}
              totalItems={paginatedPendingSales.totalItems}
              totalPages={paginatedPendingSales.totalPages}
              onPageChange={setPendingSalesPage}
            />
          </article>
        </div>

        <div className='space-y-6'>
          <article className='rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-sm font-bold uppercase tracking-[0.24em] text-brand-600'>
                  Low Stock
                </p>
                <h2 className='mt-2 text-xl font-extrabold text-ink'>
                  Items to watch during checkout
                </h2>
              </div>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600'>
                <HiOutlineArrowPath className='text-xl' />
              </div>
            </div>

            {lowStockItems.length ? (
              <div className='mt-6 space-y-3'>
                {paginatedLowStockItems.items.map((item) => (
                  <div
                    key={item.id}
                    className='flex flex-col gap-3 rounded-2xl bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'
                  >
                    <div>
                      <p className='font-bold text-ink'>{item.name}</p>
                      <p className='mt-1 text-sm text-slate-500'>
                        Restock may be needed soon
                      </p>
                    </div>
                    <div className='rounded-xl bg-white px-3 py-2 text-right shadow-sm'>
                      <p className='text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'>
                        Stock
                      </p>
                      <p className='text-lg font-extrabold text-amber-600'>
                        {item.stock_quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='mt-6'>
                <EmptyState
                  title='Inventory looks healthy'
                  description='No products are currently at or below the stock threshold.'
                />
              </div>
            )}

            <PaginationControls
              currentPage={paginatedLowStockItems.currentPage}
              itemLabel='products'
              pageSize={4}
              totalItems={paginatedLowStockItems.totalItems}
              totalPages={paginatedLowStockItems.totalPages}
              onPageChange={setLowStockPage}
            />
          </article>

          <article className='rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-sm font-bold uppercase tracking-[0.24em] text-brand-600'>
                  Accepted Payments
                </p>
                <h2 className='mt-2 text-xl font-extrabold text-ink'>
                  Checkout options at a glance
                </h2>
              </div>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-brand-600'>
                <HiOutlineDevicePhoneMobile className='text-xl' />
              </div>
            </div>

            <div className='mt-6 space-y-3'>
              {[
                "Cash for standard till payments",
                "Mobile Money for local digital checkout",
                "Card with terminal approval reference",
              ].map((item) => (
                <div
                  key={item}
                  className='rounded-2xl border border-slate-100 px-4 py-4 text-sm font-semibold text-slate-700'
                >
                  {item}
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className='flex min-h-[220px] items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center'>
      <div>
        <p className='text-lg font-bold text-ink'>{title}</p>
        <p className='mt-2 max-w-sm text-sm leading-6 text-slate-500'>
          {description}
        </p>
      </div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className='rounded-[28px] border border-red-100 bg-red-50 p-8 text-red-700'>
      <p className='text-sm font-bold uppercase tracking-[0.3em]'>
        Dashboard Error
      </p>
      <p className='mt-3 text-base'>{message}</p>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [managerLowStockPage, setManagerLowStockPage] = useState(1);
  const [topProductsPage, setTopProductsPage] = useState(1);
  const canViewReports = ["admin", "manager"].includes(user?.role);
  const {
    dailySalesQuery,
    weeklySalesQuery,
    productPerformanceQuery,
    inventoryQuery,
    isLoading,
    isError,
  } = useDashboardData({ enabled: canViewReports });

  if (!canViewReports) {
    return <CashierDashboard user={user} />;
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    const firstError =
      dailySalesQuery.error ??
      weeklySalesQuery.error ??
      productPerformanceQuery.error ??
      inventoryQuery.error;

    return (
      <section className='p-6 lg:p-8'>
        <ErrorState message={getApiErrorMessage(firstError)} />
      </section>
    );
  }

  const todaySales = dailySalesQuery.data?.[0];
  const weeklySales = weeklySalesQuery.data ?? [];
  const productPerformance = productPerformanceQuery.data ?? [];
  const inventory = inventoryQuery.data ?? [];
  const lowStockItems = inventory.filter(
    (item) => Number(item.stock_quantity) <= 10,
  );
  const topProduct = productPerformance[0];
  const weeklyChartData = buildWeeklyChartData(weeklySales);
  const paginatedLowStockItems = paginateItems(
    lowStockItems,
    managerLowStockPage,
    4,
  );
  const paginatedTopProducts = paginateItems(
    productPerformance,
    topProductsPage,
    4,
  );
  const totalWeeklySales = weeklySales.reduce(
    (sum, row) => sum + Number(row.sales ?? 0),
    0,
  );
  const totalWeeklyTransactions = weeklySales.reduce(
    (sum, row) => sum + Number(row.transactions ?? 0),
    0,
  );

  return (
    <section className='p-4 sm:p-6 lg:p-8'>
      <div className='grid gap-6 xl:grid-cols-[1.6fr_0.9fr]'>
        <div className='space-y-6'>
          <div className='grid  gap-4 md:grid-cols-2 xl:grid-cols-4'>
            <StatCard
              title="Today's Sales"
              value={formatCurrency(todaySales?.total_sales)}
              subtitle='Revenue recorded for the current day.'
              icon={HiArrowTrendingUp}
            />
            <StatCard
              title='Transactions'
              value={formatCompactNumber(todaySales?.total_transactions)}
              subtitle='Completed transactions today.'
              icon={HiOutlineShoppingCart}
              tone='emerald'
            />
            <StatCard
              title='Low Stock Alerts'
              value={formatCompactNumber(lowStockItems.length)}
              subtitle='Products at or below the stock threshold.'
              icon={HiMiniExclamationTriangle}
              tone='amber'
            />
            <StatCard
              title='Top Product'
              value={topProduct?.name ?? "No sales yet"}
              subtitle='Best-performing item by quantity sold.'
              icon={HiOutlineCube}
              tone='slate'
            />
          </div>

          <article className='rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
              <div>
                <p className='text-sm font-bold uppercase tracking-[0.24em] text-brand-600'>
                  Weekly Sales
                </p>
                <h2 className='mt-2 text-2xl font-extrabold text-ink'>
                  Sales overview for the last 7 days
                </h2>
              </div>

              <div className='w-full rounded-2xl bg-slate-50 px-4 py-3 text-left sm:w-auto sm:text-right'>
                <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>
                  7 Day Total
                </p>
                <p className='mt-1 text-xl font-extrabold text-ink'>
                  {formatCurrency(totalWeeklySales)}
                </p>
                <p className='text-sm text-slate-500'>
                  {formatCompactNumber(totalWeeklyTransactions)} transactions
                </p>
              </div>
            </div>

            {weeklyChartData.length ? (
              <div className='mt-8'>
                <div className='flex h-72 items-end gap-3 overflow-x-auto rounded-[24px] bg-slate-50 px-4 pb-4 pt-6 sm:gap-4'>
                  {weeklyChartData.map((item) => (
                    <div
                      key={item.label}
                      className='flex min-w-[56px] flex-1 flex-col items-center gap-3'
                    >
                      <div className='flex h-full w-full items-end justify-center'>
                        <div
                          className='w-full rounded-t-[18px] bg-gradient-to-t from-brand-600 to-sky-400 shadow-lg shadow-blue-200/60'
                          style={{ height: `${item.height}%` }}
                          title={`${item.label}: ${formatCurrency(item.sales)}`}
                        />
                      </div>
                      <div className='text-center'>
                        <p className='text-sm font-bold text-slate-600'>
                          {item.label}
                        </p>
                        <p className='text-xs text-slate-400'>
                          {formatCurrency(item.sales)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='mt-8'>
                <EmptyState
                  title='No weekly sales yet'
                  description='Once transactions start flowing into the sales table, this chart will populate automatically.'
                />
              </div>
            )}
          </article>
        </div>

        <div className='space-y-6'>
          <article className='rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-sm font-bold uppercase tracking-[0.24em] text-brand-600'>
                  Low Stock
                </p>
                <h2 className='mt-2 text-xl font-extrabold text-ink'>
                  Products needing attention
                </h2>
              </div>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600'>
                <HiOutlineArrowPath className='text-xl' />
              </div>
            </div>

            {lowStockItems.length ? (
              <div className='mt-6 space-y-3'>
                {paginatedLowStockItems.items.map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4'
                  >
                    <div>
                      <p className='font-bold text-ink'>{item.name}</p>
                      <p className='mt-1 text-sm text-slate-500'>
                        {formatCurrency(item.price)} current unit price
                      </p>
                    </div>
                    <div className='rounded-xl bg-white px-3 py-2 text-right shadow-sm'>
                      <p className='text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'>
                        Stock
                      </p>
                      <p className='text-lg font-extrabold text-amber-600'>
                        {item.stock_quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='mt-6'>
                <EmptyState
                  title='Inventory looks healthy'
                  description='No products are currently below the low-stock threshold.'
                />
              </div>
            )}

            <PaginationControls
              currentPage={paginatedLowStockItems.currentPage}
              itemLabel='products'
              pageSize={4}
              totalItems={paginatedLowStockItems.totalItems}
              totalPages={paginatedLowStockItems.totalPages}
              onPageChange={setManagerLowStockPage}
            />
          </article>

          <article className='rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-sm font-bold uppercase tracking-[0.24em] text-brand-600'>
                  Top Products
                </p>
                <h2 className='mt-2 text-xl font-extrabold text-ink'>
                  Best sellers by quantity
                </h2>
              </div>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-brand-600'>
                <HiOutlineUsers className='text-xl' />
              </div>
            </div>

            {productPerformance.length ? (
              <div className='mt-6 space-y-3'>
                {paginatedTopProducts.items.map((product, index) => (
                  <div
                    key={product.id}
                    className='flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-4'
                  >
                    <div className='flex items-center gap-4'>
                      <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-extrabold text-slate-700'>
                        {(paginatedTopProducts.currentPage - 1) * 4 + index + 1}
                      </div>
                      <div>
                        <p className='font-bold text-ink'>{product.name}</p>
                        <p className='mt-1 text-sm text-slate-500'>
                          {formatCompactNumber(product.total_sold)} units sold
                        </p>
                      </div>
                    </div>
                    <p className='text-right text-sm font-bold text-slate-600'>
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className='mt-6'>
                <EmptyState
                  title='No product sales yet'
                  description='Top products will appear here once your store records its first completed sales.'
                />
              </div>
            )}

            <PaginationControls
              currentPage={paginatedTopProducts.currentPage}
              itemLabel='products'
              pageSize={4}
              totalItems={paginatedTopProducts.totalItems}
              totalPages={paginatedTopProducts.totalPages}
              onPageChange={setTopProductsPage}
            />
          </article>
        </div>
      </div>
    </section>
  );
}
