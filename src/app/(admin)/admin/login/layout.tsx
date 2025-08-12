import type { ReactNode } from "react";

export const metadata = {
  title: "Login do Administrador | Fut7Pro",
  description: "Acesso restrito ao painel administrativo do racha.",
  robots: "noindex,nofollow",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-zinc-950 text-white min-h-screen flex items-center justify-center">
      {children}
    </div>
  );
}
