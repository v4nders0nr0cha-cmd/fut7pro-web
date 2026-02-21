import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isSuperAdminLegacyEnabled } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SuperAdminLegacyLayout({ children }: { children: ReactNode }) {
  if (!isSuperAdminLegacyEnabled()) {
    notFound();
  }

  return <>{children}</>;
}
