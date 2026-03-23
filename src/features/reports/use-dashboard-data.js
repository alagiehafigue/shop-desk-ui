import { useQueries } from "@tanstack/react-query";

import {
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
    ],
  });

  const [dailySalesQuery, weeklySalesQuery, productPerformanceQuery, inventoryQuery] =
    results;

  return {
    dailySalesQuery,
    weeklySalesQuery,
    productPerformanceQuery,
    inventoryQuery,
    isLoading: results.some((query) => query.isLoading),
    isFetching: results.some((query) => query.isFetching),
    isError: results.some((query) => query.isError),
  };
}
