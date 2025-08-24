import { useState, useCallback } from "react";

export interface ApiState {
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isSuccess: boolean;
}

export interface ApiStateActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: boolean) => void;
  reset: () => void;
  handleAsync: <T>(asyncFn: () => Promise<T>) => Promise<T | null>;
}

export function useApiState(): ApiState & ApiStateActions {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setIsError(false);
      setErrorState(null);
      setIsSuccess(false);
    }
  }, []);

  const setError = useCallback((errorMessage: string | null) => {
    setIsError(!!errorMessage);
    setErrorState(errorMessage);
    setIsLoading(false);
    setIsSuccess(false);
  }, []);

  const setSuccess = useCallback((success: boolean) => {
    setIsSuccess(success);
    setIsLoading(false);
    setIsError(false);
    setErrorState(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsError(false);
    setErrorState(null);
    setIsSuccess(false);
  }, []);

  const handleAsync = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      try {
        const result = await asyncFn();
        setSuccess(true);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        return null;
      }
    },
    [setLoading, setError, setSuccess],
  );

  return {
    isLoading,
    isError,
    error,
    isSuccess,
    setLoading,
    setError,
    setSuccess,
    reset,
    handleAsync,
  };
}
