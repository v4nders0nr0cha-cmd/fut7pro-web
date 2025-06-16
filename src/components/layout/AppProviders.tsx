"use client";

import { SessionProvider } from "next-auth/react";
import ClientLayout from "./ClientLayout";
import type { ReactNode } from "react";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ClientLayout>{children}</ClientLayout>
    </SessionProvider>
  );
}
