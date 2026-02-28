import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login SuperAdmin | Fut7Pro",
  description: "Acesso restrito ao painel global do Fut7Pro.",
  robots: { index: false, follow: false, nocache: true },
};

export default function SuperAdminLoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-zinc-950 text-white min-h-screen flex items-center justify-center">
      {children}
    </div>
  );
}
