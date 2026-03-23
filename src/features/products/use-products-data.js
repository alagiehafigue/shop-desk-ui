import { useQueries } from "@tanstack/react-query";

import { fetchLowStockProducts, fetchProducts } from "./products-api";

export function useProductsData() {
  const [productsQuery, lowStockQuery] = useQueries({
    queries: [
      {
        queryKey: ["products", "list"],
        queryFn: fetchProducts,
      },
      {
        queryKey: ["inventory", "low-stock"],
        queryFn: fetchLowStockProducts,
      },
    ],
  });

  return {
    productsQuery,
    lowStockQuery,
    isLoading: productsQuery.isLoading || lowStockQuery.isLoading,
  };
}
