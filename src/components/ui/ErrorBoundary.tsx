// src/components/ui/ErrorBoundary.tsx
// Error Boundary para capturar erros de React

"use client";

import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });

    // Aqui você pode enviar o erro para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === "production") {
      // Exemplo: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>

            <h2 className="text-xl font-semibold text-white mb-2">Ops! Algo deu errado</h2>

            <p className="text-gray-300 mb-6">
              Encontramos um problema inesperado. Tente recarregar a página ou entre em contato
              conosco se o problema persistir.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Recarregar Página
              </button>

              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Voltar
              </button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                  Detalhes do erro (apenas em desenvolvimento)
                </summary>
                <div className="mt-2 p-3 bg-gray-700 rounded text-xs text-red-300 font-mono overflow-auto">
                  <div className="mb-2">
                    <strong>Erro:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">{this.state.error.stack}</pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar Error Boundary em componentes funcionais
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      console.error("Error caught by useErrorHandler:", error);
      // Aqui você pode enviar o erro para um serviço de monitoramento
    }
  }, [error]);

  return setError;
}

// Componente de fallback personalizado
export function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>

        <h2 className="text-xl font-semibold text-white mb-2">Erro na Aplicação</h2>

        <p className="text-gray-300 mb-6">
          {error.message || "Ocorreu um erro inesperado. Tente novamente."}
        </p>

        <button
          onClick={resetErrorBoundary}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );
}
