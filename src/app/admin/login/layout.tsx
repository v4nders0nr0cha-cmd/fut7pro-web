import type { ReactNode } from "react";

export const metadata = {
  title: "Login do Administrador | Fut7Pro",
  description: "Acesso restrito ao painel administrativo do racha.",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
