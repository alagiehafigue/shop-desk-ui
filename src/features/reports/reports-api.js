import { apiClient } from "../../lib/api-client";

export async function fetchDailySalesReport() {
  const { data } = await apiClient.get("/reports/daily-sales");
  return data;
}

export async function fetchWeeklySalesReport() {
  const { data } = await apiClient.get("/reports/weekly-sales");
  return data;
}

export async function fetchProductPerformanceReport() {
  const { data } = await apiClient.get("/reports/product-performance");
  return data;
}

export async function fetchInventoryReport() {
  const { data } = await apiClient.get("/reports/inventory");
  return data;
}
