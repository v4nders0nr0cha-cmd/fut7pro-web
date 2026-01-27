import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { getServerSession } from "next-auth/next";
import AdminLayoutContent from "./AdminLayoutContent";
import ToasterProvider from "@/components/ToasterProvider";
import { authOptions } from "@/server/auth/admin-options";
import { getApiBase } from "@/lib/get-api-base";
import { getRachaTheme } from "@/config/rachaThemes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  robots: { index: false, follow: false, nocache: true },
};

type AdminSessionUser = {
  accessToken?: string;
  tenantId?: string;
  tenantSlug?: string | null;
};

type AdminSession = { user?: AdminSessionUser } | null;

async function resolveAdminThemeKey() {
  try {
    const session = (await getServerSession(authOptions as any)) as AdminSession;
    const user = session?.user;
    const tenantId = user?.tenantId;
    if (!tenantId) {
      return getRachaTheme(null).key;
    }

    const headers: Record<string, string> = {};
    if (user?.accessToken) {
      headers.Authorization = `Bearer ${user.accessToken}`;
    }
    if (user?.tenantSlug) {
      headers["x-tenant-slug"] = user.tenantSlug;
    }

    const base = getApiBase().replace(/\/+$/, "");
    const res = await fetch(`${base}/rachas/${encodeURIComponent(tenantId)}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      return getRachaTheme(null).key;
    }
    const data = await res.json().catch(() => null);
    return getRachaTheme(data?.themeKey ?? data?.theme_key).key;
  } catch {
    return getRachaTheme(null).key;
  }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const themeKey = await resolveAdminThemeKey();
  return (
    <div
      data-theme={themeKey}
      className={`${inter.className} bg-gradient-to-br from-[#181818] to-[#232323] text-white min-h-screen`}
    >
      <AdminLayoutContent>{children}</AdminLayoutContent>
      <ToasterProvider />
    </div>
  );
}
