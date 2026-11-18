"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import { resumeGuideHref } from "@/lib/admin-guide-navigation";
import { GUIDE_ACCESS_USED, notifyGuideAccess } from "@/lib/admin-guide-access";
import { BookOpen, CircleHelp, MessageCircle } from "lucide-react";
import { buildFut7ProOfficialWhatsAppUrl } from "@/config/fut7pro-contact";

const destinations = [
  {
    label: "Guia Interativo",
    description: "Prepare o grupo e conheça os recursos.",
    href: "/admin/guia-fut7pro",
    icon: BookOpen,
  },
  {
    label: "Central de Ajuda",
    description: "Consulte dúvidas e orientações.",
    href: "/admin/comunicacao/ajuda",
    icon: CircleHelp,
  },
  {
    label: "Falar pelo WhatsApp",
    description: "Converse com o suporte Fut7Pro.",
    href: buildFut7ProOfficialWhatsAppUrl("Olá! Preciso de ajuda com o Fut7Pro."),
    icon: MessageCircle,
    external: true,
  },
];

export default function AdminHelpLauncher() {
  const { guide, retry, error } = useAdminGuide();
  const pathname = usePathname();
  const guideAvailable = Boolean(guide);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  }, [open, guideAvailable]);

  return (
    <div
      ref={rootRef}
      className="fixed bottom-6 right-6 z-40 hidden lg:block"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      {open && (
        <nav
          ref={menuRef}
          id="admin-help-menu"
          aria-label="Ajuda Fut7Pro"
          className="absolute bottom-14 right-0 w-72 max-w-[calc(100vw-3rem)] rounded-xl border border-yellow-400/30 bg-[#23272F] p-2 text-white shadow-2xl"
        >
          <h2 className="px-3 py-2 text-sm font-bold text-yellow-300">Como podemos ajudar?</h2>
          {destinations.map(({ label, description, href, icon: Icon, external }) =>
            label === "Guia Interativo" && !guide ? (
              <button
                key={label}
                type="button"
                onClick={() => void retry().catch(() => undefined)}
                className="flex min-h-12 w-full items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
              >
                <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-yellow-300" />
                <span>
                  <strong className="block text-sm">{label}</strong>
                  <span className="block text-xs text-zinc-300">
                    {error ? "Não foi possível carregar. Tente novamente." : "Carregando seu guia…"}
                  </span>
                </span>
              </button>
            ) : (
              <Link
                key={label}
                href={
                  label === "Guia Interativo" && guide ? resumeGuideHref(guide.tenant.slug) : href
                }
                prefetch={label === "Guia Interativo" ? false : undefined}
                replace={label === "Guia Interativo" && pathname === "/admin/dashboard"}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                onClick={() => {
                  setOpen(false);
                  if (label === "Guia Interativo") triggerRef.current?.focus();
                  if (label === "Guia Interativo" && guide)
                    notifyGuideAccess(GUIDE_ACCESS_USED, {
                      tenantId: guide.tenant.id,
                      membershipId: guide.administrator.membershipId,
                    });
                }}
                className="flex min-h-12 items-start gap-3 rounded-lg px-3 py-2 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
              >
                <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-yellow-300" />
                <span>
                  <strong className="block text-sm">{label}</strong>
                  <span className="block text-xs text-zinc-300">{description}</span>
                </span>
              </Link>
            )
          )}
        </nav>
      )}
      <button
        ref={triggerRef}
        id="admin-help-launcher"
        type="button"
        title="Ajuda Fut7Pro"
        aria-label="Ajuda Fut7Pro"
        aria-haspopup="true"
        aria-controls="admin-help-menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-yellow-400/70 bg-zinc-900 text-xl font-bold text-yellow-300 shadow-lg hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
      >
        <span aria-hidden="true">?</span>
      </button>
    </div>
  );
}
