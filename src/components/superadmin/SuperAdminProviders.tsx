"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function SuperAdminProviders({ children }: { children: ReactNode }) {
  return <SessionProvider basePath="/api/superadmin-auth">{children}</SessionProvider>;
}
