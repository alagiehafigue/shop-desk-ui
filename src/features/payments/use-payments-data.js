import { useQueries } from "@tanstack/react-query";

import {
  fetchPayments,
  fetchPaymentSummary,
  fetchPendingSales,
} from "./payments-api";

export function usePaymentsData() {
  const [paymentsQuery, summaryQuery, pendingSalesQuery] = useQueries({
    queries: [
      {
        queryKey: ["payments", "list"],
        queryFn: fetchPayments,
      },
      {
        queryKey: ["payments", "summary"],
        queryFn: fetchPaymentSummary,
      },
      {
        queryKey: ["payments", "pending-sales"],
        queryFn: fetchPendingSales,
      },
    ],
  });

  return {
    paymentsQuery,
    summaryQuery,
    pendingSalesQuery,
    isLoading:
      paymentsQuery.isLoading ||
      summaryQuery.isLoading ||
      pendingSalesQuery.isLoading,
  };
}
