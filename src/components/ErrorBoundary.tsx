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
    const subject = encodeURIComponent(
      `Relatório de Erro - ${rachaConfig.nome}`,
    );
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

    window.open(
      `mailto:${rachaConfig.urls.suporte}?subject=${subject}&body=${body}`,
    );
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback customizada
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-900 p-4">
          <div className="w-full max-w-md rounded-xl bg-zinc-800 p-8 text-center">
            <div className="mb-4 text-6xl text-red-500">⚠️</div>
            <h1 className="mb-4 text-2xl font-bold text-white">
              Ops! Algo deu errado
            </h1>
            <p className="mb-6 text-gray-300">
              Encontramos um problema inesperado. Nossa equipe foi notificada e
              está trabalhando para resolver.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full rounded-lg bg-yellow-500 px-6 py-3 font-bold text-black transition-colors hover:bg-yellow-400"
              >
                Tentar Novamente
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className="w-full rounded-lg bg-zinc-700 px-6 py-3 text-white transition-colors hover:bg-zinc-600"
              >
                Voltar ao Início
              </button>

              <button
                onClick={this.handleReportError}
                className="w-full rounded-lg bg-red-600 px-6 py-3 text-white transition-colors hover:bg-red-500"
              >
                Reportar Erro
              </button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="mb-2 cursor-pointer text-yellow-400">
                  Detalhes do Erro (Desenvolvimento)
                </summary>
                <div className="overflow-auto rounded bg-zinc-900 p-4 text-xs text-gray-300">
                  <div className="mb-2">
                    <strong>Mensagem:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
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
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return { hasError, error };
};
