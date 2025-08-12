"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { rachaConfig } from "@/config/racha.config";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para que a próxima renderização mostre a UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro para debugging
    console.error("ErrorBoundary capturou um erro:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Aqui você pode enviar o erro para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Implementar envio para serviço de monitoramento
    if (process.env.NODE_ENV === "development") {
      // Exemplo: enviar para Sentry, LogRocket, etc.
      console.log("Erro enviado para serviço de monitoramento:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReportError = () => {
    // Implementar relatório de erro para o usuário
    const errorReport = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // Aqui você pode implementar o envio do relatório
    if (process.env.NODE_ENV === "development") {
      console.log("Relatório de erro:", errorReport);
    }

    // Exemplo: abrir email com detalhes do erro
    const subject = encodeURIComponent(`Relatório de Erro - ${rachaConfig.nome}`);
    const body = encodeURIComponent(`
Erro encontrado no ${rachaConfig.nome}:

Mensagem: ${errorReport.message}
URL: ${errorReport.url}
Data/Hora: ${errorReport.timestamp}

Detalhes técnicos:
${errorReport.stack}

Stack do componente:
${errorReport.componentStack}
        `);

    window.open(`mailto:${rachaConfig.urls.suporte}?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback customizada
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-xl p-8 max-w-md w-full text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">Ops! Algo deu errado</h1>
            <p className="text-gray-300 mb-6">
              Encontramos um problema inesperado. Nossa equipe foi notificada e está trabalhando
              para resolver.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Tentar Novamente
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className="w-full bg-zinc-700 text-white py-3 px-6 rounded-lg hover:bg-zinc-600 transition-colors"
              >
                Voltar ao Início
              </button>

              <button
                onClick={this.handleReportError}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-500 transition-colors"
              >
                Reportar Erro
              </button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-yellow-400 cursor-pointer mb-2">
                  Detalhes do Erro (Desenvolvimento)
                </summary>
                <div className="bg-zinc-900 p-4 rounded text-xs text-gray-300 overflow-auto">
                  <div className="mb-2">
                    <strong>Mensagem:</strong> {this.state.error.message}
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
export const useErrorBoundary = () => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(event.error);
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setError(new Error(event.reason));
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return { hasError, error };
};
