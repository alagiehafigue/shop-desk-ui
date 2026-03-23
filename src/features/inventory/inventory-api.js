import { apiClient } from "../../lib/api-client";

export async function fetchLowStockProducts() {
  const { data } = await apiClient.get("/inventory/low-stock");
  return data;
}

export async function restockProduct(payload) {
  const { data } = await apiClient.post("/inventory/restock", payload);
  return data;
}

export async function adjustStock(payload) {
  const { data } = await apiClient.post("/inventory/adjust", payload);
  return data;
}

export async function fetchInventoryLogs(productId) {
  const { data } = await apiClient.get(`/inventory/logs/${productId}`);
  return data;
}
