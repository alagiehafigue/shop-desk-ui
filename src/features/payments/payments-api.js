import { apiClient } from "../../lib/api-client";

export async function fetchPayments() {
  const { data } = await apiClient.get("/payments");
  return data;
}

export async function fetchPaymentSummary() {
  const { data } = await apiClient.get("/payments/summary");
  return data;
}

export async function fetchPendingSales() {
  const { data } = await apiClient.get("/payments/pending-sales");
  return data;
}

export async function processPayment(payload) {
  const { data } = await apiClient.post("/payments/pay", payload);
  return data;
}
