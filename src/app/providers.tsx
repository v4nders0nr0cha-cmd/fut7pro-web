// src/app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { PerfilProvider } from "@/components/atletas/PerfilContext";
import { RachaProvider } from "@/context/RachaContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <RachaProvider>
        <PerfilProvider>{children}</PerfilProvider>
      </RachaProvider>
    </SessionProvider>
  );
}
