import { useState, useCallback } from 'react';

export interface PaginationState {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface UsePaginationReturn extends PaginationState {
  setPage: (page: number) => void;
  setTotalCount: (count: number) => void;
  resetPage: () => void;
  range: { from: number; to: number };
}

export function usePagination(pageSize: number = 20): UsePaginationReturn {
  const [page, setPageState] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const setPage = useCallback((p: number) => setPageState(p), []);
  const setTotalCountCb = useCallback((c: number) => setTotalCount(c), []);
  const resetPage = useCallback(() => setPageState(1), []);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return {
    page,
    pageSize,
    totalCount,
    totalPages,
    setPage,
    setTotalCount: setTotalCountCb,
    resetPage,
    range: { from, to },
  };
}
