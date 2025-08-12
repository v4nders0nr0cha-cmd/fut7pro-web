import type { ReactNode } from "react";

export const metadata = {
  title: "Login SuperAdmin | Fut7Pro",
  description: "Acesso restrito ao painel global do Fut7Pro.",
  robots: "noindex,nofollow",
};

export default function SuperAdminLoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-zinc-950 text-white min-h-screen flex items-center justify-center">
      {children}
    </div>
  );
}
