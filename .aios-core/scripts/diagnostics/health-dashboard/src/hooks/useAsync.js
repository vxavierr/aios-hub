import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for managing async operations with loading/error states.
 *
 * @param {Function} asyncFn - Async function to execute
 * @param {Object} options - Configuration options
 * @param {boolean} options.immediate - Execute immediately on mount (default: true)
 * @param {*} options.initialData - Initial data value (default: null)
 * @param {Function} options.onSuccess - Callback on success
 * @param {Function} options.onError - Callback on error
 * @returns {Object} { data, error, isLoading, execute, reset }
 */
export function useAsync(asyncFn, options = {}) {
  const {
    immediate = true,
    initialData = null,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(immediate);

  const isMounted = useRef(true);
  const asyncFnRef = useRef(asyncFn);

  // Keep asyncFn ref updated
  useEffect(() => {
    asyncFnRef.current = asyncFn;
  }, [asyncFn]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const execute = useCallback(async (...args) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFnRef.current(...args);

      if (isMounted.current) {
        setData(result);
        setIsLoading(false);

        if (onSuccess) {
          onSuccess(result);
        }
      }

      return result;
    } catch (err) {
      if (isMounted.current) {
        setError(err);
        setIsLoading(false);

        if (onError) {
          onError(err);
        }
      }

      throw err;
    }
  }, [onSuccess, onError]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setIsLoading(false);
  }, [initialData]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
    isError: !!error,
    isSuccess: !isLoading && !error && data !== null,
  };
}

/**
 * Hook for fetching data with automatic refetching and caching.
 */
export function useFetch(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    immediate = true,
    refetchInterval,
    onSuccess,
    onError,
  } = options;

  const fetchFn = useCallback(async () => {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }, [url, method, headers, body]);

  const result = useAsync(fetchFn, {
    immediate,
    onSuccess,
    onError,
  });

  // Auto refetch
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(() => {
        result.execute();
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [refetchInterval, result]);

  return result;
}

export default useAsync;
