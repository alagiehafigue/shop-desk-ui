import { apiClient } from "../../lib/api-client";

export async function loginRequest(payload) {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get("/auth/me");
  return data.user;
}

export async function logoutRequest() {
  const { data } = await apiClient.post("/auth/logout");
  return data;
}

export async function fetchUsers() {
  const { data } = await apiClient.get("/auth/users");
  return data;
}

export async function registerUserRequest(payload) {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
}
