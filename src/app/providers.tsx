// src/app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import type { ComponentProps, ReactNode } from "react";
import { PerfilProvider } from "@/components/atletas/PerfilContext";
import { RachaProvider } from "@/context/RachaContext";

export type AppSession = ComponentProps<typeof SessionProvider>["session"];

export function getSessionProviderKey(session?: AppSession) {
  const user = session?.user as
    | { id?: string | null; email?: string | null; accessToken?: string | null }
    | undefined;
  if (!user?.accessToken) return "anonymous";
  return `authenticated:${user.id || user.email || "account"}`;
}

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
    <SessionProvider
      key={getSessionProviderKey(session)}
      session={session}
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <RachaProvider initialTenantSlug={initialTenantSlug}>
        <PerfilProvider>{children}</PerfilProvider>
      </RachaProvider>
    </SessionProvider>
  );
}
