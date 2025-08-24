import type { ReactNode } from "react";

export const metadata = {
  title: "Login SuperAdmin | Fut7Pro",
  description: "Acesso restrito ao painel global do Fut7Pro.",
  robots: "noindex,nofollow",
};

export default function SuperAdminLoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      {children}
    </div>
  );
}
