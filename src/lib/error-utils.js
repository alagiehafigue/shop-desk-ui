export function getApiErrorMessage(error) {
  return (
    error?.response?.data?.message ??
    error?.message ??
    "Something went wrong. Please try again."
  );
}
