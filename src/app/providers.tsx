// src/app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import type { ComponentProps, ReactNode } from "react";
import { PerfilProvider } from "@/components/atletas/PerfilContext";
import { RachaProvider } from "@/context/RachaContext";

export type AppSession = ComponentProps<typeof SessionProvider>["session"];

export function Providers({
  children,
  initialTenantSlug,
  session,
}: {
  children: ReactNode;
  initialTenantSlug?: string | null;
  session?: AppSession;
}) {
  return (
    <SessionProvider session={session} refetchInterval={0} refetchOnWindowFocus={false}>
      <RachaProvider initialTenantSlug={initialTenantSlug}>
        <PerfilProvider>{children}</PerfilProvider>
      </RachaProvider>
    </SessionProvider>
  );
}
