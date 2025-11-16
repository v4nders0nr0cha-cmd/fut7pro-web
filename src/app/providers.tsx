// src/app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { PerfilProvider } from "@/components/atletas/PerfilContext";
import { RachaProvider } from "@/context/RachaContext";
import { ThemeProvider } from "@/context/ThemeContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <RachaProvider>
        <ThemeProvider>
          <PerfilProvider>{children}</PerfilProvider>
        </ThemeProvider>
      </RachaProvider>
    </SessionProvider>
  );
}
