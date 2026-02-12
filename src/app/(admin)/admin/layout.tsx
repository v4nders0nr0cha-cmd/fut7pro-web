import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import AdminLayoutContent from "./AdminLayoutContent";
import ToasterProvider from "@/components/ToasterProvider";
import { authOptions } from "@/server/auth/admin-options";
import { getApiBase } from "@/lib/get-api-base";
import { getRachaTheme } from "@/config/rachaThemes";
import {
  ADMIN_ACTIVE_TENANT_COOKIE,
  LEGACY_ADMIN_ACTIVE_TENANT_COOKIE,
} from "@/lib/admin-tenant-cookie";

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
    const cookieSlug =
      cookies().get(ADMIN_ACTIVE_TENANT_COOKIE)?.value ||
      cookies().get(LEGACY_ADMIN_ACTIVE_TENANT_COOKIE)?.value;
    const tenantSlug = cookieSlug || user?.tenantSlug || null;
    const tenantId = user?.tenantId;

    if (!tenantSlug && !tenantId) {
      return getRachaTheme(null).key;
    }

    const headers: Record<string, string> = {};
    if (user?.accessToken) {
      headers.Authorization = `Bearer ${user.accessToken}`;
    }
    if (tenantSlug) {
      headers["x-tenant-slug"] = tenantSlug;
    }

    const base = getApiBase().replace(/\/+$/, "");
    const targetUrl = tenantSlug
      ? `${base}/public/${encodeURIComponent(tenantSlug)}/tenant`
      : `${base}/rachas/${encodeURIComponent(tenantId ?? "")}`;
    const res = await fetch(targetUrl, { headers, cache: "no-store" });
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
