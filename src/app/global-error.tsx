"use client";

import * as Sentry from "@sentry/nextjs";
import type React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Reporta no Sentry (não quebra sem DSN)
  try {
    Sentry.captureException(error);
  } catch {}

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl shadow-lg p-6 border">
          <h2 className="text-lg font-semibold mb-2">Ops! Algo deu errado.</h2>
          <p className="text-sm text-gray-600 mb-4">
            Tente novamente. Se o erro persistir, nossa equipe será notificada.
          </p>

          {process.env.NODE_ENV === "development" ? (
            <pre className="text-xs overflow-auto bg-gray-50 border p-3 rounded">
              {String(error?.stack || error?.message)}
            </pre>
          ) : null}

          <button
            onClick={() => reset()}
            className="mt-4 inline-flex items-center rounded-xl px-4 py-2 border text-sm"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
