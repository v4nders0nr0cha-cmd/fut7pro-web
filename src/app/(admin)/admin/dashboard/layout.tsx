import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Dashboard do Racha | Painel Admin - Fut7Pro",
  description:
    "Visão geral do racha com métricas, ações rápidas e atalhos operacionais no painel administrativo.",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
