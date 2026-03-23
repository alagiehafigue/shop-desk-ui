import { useQuery } from "@tanstack/react-query";

import { fetchLowStockProducts, fetchInventoryLogs } from "./inventory-api";
import { fetchProducts } from "../products/products-api";

export function useInventoryData() {
  const productsQuery = useQuery({
    queryKey: ["products", "list"],
    queryFn: fetchProducts,
  });

  const lowStockQuery = useQuery({
    queryKey: ["inventory", "low-stock"],
    queryFn: fetchLowStockProducts,
  });

  return {
    productsQuery,
    lowStockQuery,
    isLoading: productsQuery.isLoading || lowStockQuery.isLoading,
  };
}

export function useInventoryLogs(productId) {
  return useQuery({
    queryKey: ["inventory", "logs", productId],
    queryFn: () => fetchInventoryLogs(productId),
    enabled: Boolean(productId),
  });
}
