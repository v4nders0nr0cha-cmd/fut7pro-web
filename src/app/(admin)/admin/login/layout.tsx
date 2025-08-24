import type { ReactNode } from "react";

export const metadata = {
  title: "Login do Administrador | Fut7Pro",
  description: "Acesso restrito ao painel administrativo do racha.",
  robots: "noindex,nofollow",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      {children}
    </div>
  );
}
