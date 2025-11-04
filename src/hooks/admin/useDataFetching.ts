import { useState, useEffect, useCallback } from 'react';

interface UseDataFetchingOptions<T> {
  fetchFn: (params?: any) => Promise<{ success: boolean; data?: { data: T[]; pagination?: any }; error?: string }>;
  params?: any;
  autoFetch?: boolean;
}

export function useDataFetching<T>({ fetchFn, params, autoFetch = true }: UseDataFetchingOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ page: number; totalPages: number }>({
    page: 1,
    totalPages: 1,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFn(params);

      if (response.success && response.data) {
        setData(response.data.data ?? []);
        setPagination({
          page: response.data.pagination?.page ?? 1,
          totalPages: response.data.pagination?.totalPages ?? 1,
        });
      } else {
        setError(response.error || 'Failed to load data');
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, params]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    data,
    loading,
    error,
    pagination,
    refetch: fetchData,
    setError,
  };
}

