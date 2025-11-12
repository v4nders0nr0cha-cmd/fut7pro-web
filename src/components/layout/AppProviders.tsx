"use client";

import { SessionProvider } from "next-auth/react";
import LayoutClient from "./LayoutClient";
import type { ReactNode } from "react";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LayoutClient>{children}</LayoutClient>
    </SessionProvider>
  );
}
