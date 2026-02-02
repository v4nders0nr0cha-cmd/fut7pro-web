import type { ReactNode } from "react";
import PresidenteAccessBlock from "@/components/admin/PresidenteAccessBlock";
import { fetchAdminMe, isPresidenteRole } from "@/lib/admin-access";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesLayout({ children }: { children: ReactNode }) {
  const me = await fetchAdminMe();
  const isPresidente = isPresidenteRole(me?.membership?.role);

  if (!isPresidente) {
    return <PresidenteAccessBlock />;
  }

  return <>{children}</>;
}
