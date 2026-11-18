"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import { resumeGuideHref } from "@/lib/admin-guide-navigation";
import { GUIDE_ACCESS_USED, notifyGuideAccess } from "@/lib/admin-guide-access";

export default function AdminGuideMobileAccess() {
  const { guide } = useAdminGuide();
  const pathname = usePathname();
  if (!guide || guide.activationProgress.complete) return null;
  return (
    <Link
      id="admin-guide-mobile-link"
      href={resumeGuideHref(guide.tenant.slug)}
      prefetch={false}
      replace={pathname === "/admin/dashboard"}
      aria-label="Abrir Guia Interativo"
      title="Guia Interativo"
      onClick={() =>
        notifyGuideAccess(GUIDE_ACCESS_USED, {
          tenantId: guide.tenant.id,
          membershipId: guide.administrator.membershipId,
        })
      }
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-yellow-300 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 lg:hidden"
    >
      <BookOpen size={21} strokeWidth={1.75} aria-hidden="true" />
    </Link>
  );
}
