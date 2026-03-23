import { useMutation } from "@tanstack/react-query";

import { loginRequest } from "./auth-api";
import { getApiErrorMessage } from "../../lib/error-utils";

export function useLogin() {
  return useMutation({
    mutationFn: loginRequest,
    meta: {
      getErrorMessage: getApiErrorMessage,
    },
  });
}
