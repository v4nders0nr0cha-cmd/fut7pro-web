import type { ReactNode } from "react";
import CentralShell from "@/components/billing/central/CentralShell";
import { Suspense } from "react";
export const metadata = { title: "Minha assinatura | Fut7Pro" };
export default function SubscriptionLayout({ children }: { children: ReactNode }) {
  return (
    <CentralShell>
      <Suspense fallback={<p role="status">Carregando a central...</p>}>{children}</Suspense>
    </CentralShell>
  );
}
