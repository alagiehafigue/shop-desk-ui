import { useQueries } from "@tanstack/react-query";

import { fetchCustomers, fetchProducts } from "./sales-api";

export function usePosData({ enabled = true } = {}) {
  const [productsQuery, customersQuery] = useQueries({
    queries: [
      {
        queryKey: ["products", "list"],
        queryFn: fetchProducts,
        enabled,
      },
      {
        queryKey: ["customers", "list"],
        queryFn: fetchCustomers,
        enabled,
      },
    ],
  });

  return {
    productsQuery,
    customersQuery,
    isLoading: productsQuery.isLoading || customersQuery.isLoading,
  };
}
