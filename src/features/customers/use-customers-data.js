import { useQuery } from "@tanstack/react-query";

import { fetchCustomers, fetchCustomerSales } from "./customers-api";

export function useCustomersData() {
  const customersQuery = useQuery({
    queryKey: ["customers", "list"],
    queryFn: fetchCustomers,
  });

  return {
    customersQuery,
    isLoading: customersQuery.isLoading,
  };
}

export function useCustomerSales(customerId) {
  return useQuery({
    queryKey: ["customers", "sales", customerId],
    queryFn: () => fetchCustomerSales(customerId),
    enabled: Boolean(customerId),
  });
}
