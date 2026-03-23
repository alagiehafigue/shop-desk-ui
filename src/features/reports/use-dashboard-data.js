import { useQueries } from "@tanstack/react-query";

import {
  fetchCashierSalesReport,
  fetchDailySalesReport,
  fetchInventoryReport,
  fetchProductPerformanceReport,
  fetchWeeklySalesReport,
} from "./reports-api";

export function useDashboardData({ enabled }) {
  const results = useQueries({
    queries: [
      {
        queryKey: ["reports", "daily-sales"],
        queryFn: fetchDailySalesReport,
        enabled,
      },
      {
        queryKey: ["reports", "weekly-sales"],
        queryFn: fetchWeeklySalesReport,
        enabled,
      },
      {
        queryKey: ["reports", "product-performance"],
        queryFn: fetchProductPerformanceReport,
        enabled,
      },
      {
        queryKey: ["reports", "inventory"],
        queryFn: fetchInventoryReport,
        enabled,
      },
      {
        queryKey: ["reports", "cashier-sales"],
        queryFn: fetchCashierSalesReport,
        enabled,
      },
    ],
  });

  const [
    dailySalesQuery,
    weeklySalesQuery,
    productPerformanceQuery,
    inventoryQuery,
    cashierSalesQuery,
  ] =
    results;

  return {
    dailySalesQuery,
    weeklySalesQuery,
    productPerformanceQuery,
    inventoryQuery,
    cashierSalesQuery,
    isLoading: results.some((query) => query.isLoading),
    isFetching: results.some((query) => query.isFetching),
    isError: results.some((query) => query.isError),
  };
}
