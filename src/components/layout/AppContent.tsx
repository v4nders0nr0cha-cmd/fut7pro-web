"use client";

// Não use LayoutClient aqui!
// O layout global já controla o wrapper/layout.
// Este componente serve apenas como passthrough ou lógica de página, sem duplicar layout.

export default function AppContent({ children }: { children: React.ReactNode }) {
  // Se quiser lógica condicional para children, faça aqui,
  // mas nunca envolva com LayoutClient.
  return <>{children}</>;
}
