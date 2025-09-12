import type React from "react";
export const dynamic = "force-dynamic";
export const revalidate = false;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
