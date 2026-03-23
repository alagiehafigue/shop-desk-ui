import { apiClient } from "../../lib/api-client";

export async function fetchProducts() {
  const { data } = await apiClient.get("/products");
  return data;
}

export async function fetchCustomers() {
  const { data } = await apiClient.get("/customers");
  return data;
}

export async function createSale(payload) {
  const { data } = await apiClient.post("/sales", payload);
  return data;
}

export async function processPayment(payload) {
  const { data } = await apiClient.post("/payments/pay", payload);
  return data;
}

export async function fetchReceipt(saleId) {
  const { data } = await apiClient.get(`/sales/${saleId}/receipt`);
  return data;
}
