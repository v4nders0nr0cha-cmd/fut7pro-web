import type { ReactNode } from "react";
import type { Metadata } from "next";
import SuperAdminProviders from "@/components/superadmin/SuperAdminProviders";

export const metadata: Metadata = {
  title: "Login SuperAdmin | Fut7Pro",
  description: "Acesso restrito ao painel global do Fut7Pro.",
  robots: { index: false, follow: false, nocache: true },
};

export default function SuperAdminLoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
        style={{ backgroundImage: "url('/images/leao-de-juda-mobile.jpg')" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
        style={{ backgroundImage: "url('/images/leao-de-juda.jpg')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/70" aria-hidden />

      <div className="relative min-h-screen flex items-center justify-center px-4">
        <SuperAdminProviders>{children}</SuperAdminProviders>
      </div>
    </div>
  );
}
