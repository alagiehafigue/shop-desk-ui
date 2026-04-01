export function getTotalPages(totalItems, pageSize) {
  if (!pageSize || pageSize < 1) {
    return 1;
  }

  return Math.max(1, Math.ceil(Number(totalItems ?? 0) / pageSize));
}

export function paginateItems(items, page, pageSize) {
  const list = Array.isArray(items) ? items : [];
  const totalItems = list.length;
  const totalPages = getTotalPages(totalItems, pageSize);
  const currentPage = Math.min(Math.max(Number(page ?? 1), 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    currentPage,
    items: list.slice(startIndex, startIndex + pageSize),
    totalItems,
    totalPages,
  };
}
