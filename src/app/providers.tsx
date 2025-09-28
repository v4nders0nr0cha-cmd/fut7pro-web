// src/app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { PerfilProvider } from "@/components/atletas/PerfilContext";
import { RachaProvider } from "@/context/RachaContext";
import { TenantProvider } from "@/context/TenantContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <TenantProvider>
        <RachaProvider>
          <PerfilProvider>{children}</PerfilProvider>
        </RachaProvider>
      </TenantProvider>
    </SessionProvider>
  );
}
