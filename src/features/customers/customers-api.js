import { apiClient } from "../../lib/api-client";

export async function fetchCustomers() {
  const { data } = await apiClient.get("/customers");
  return data;
}

export async function createCustomer(payload) {
  const { data } = await apiClient.post("/customers", payload);
  return data;
}

export async function updateCustomer({ id, payload }) {
  const { data } = await apiClient.patch(`/customers/${id}`, payload);
  return data;
}

export async function deleteCustomer(id) {
  const { data } = await apiClient.delete(`/customers/${id}`);
  return data;
}

export async function fetchCustomerSales(customerId) {
  const { data } = await apiClient.get(`/customers/${customerId}/sales`);
  return data;
}
