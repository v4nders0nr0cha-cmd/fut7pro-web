"use client";

import { useEffect, useRef, type FC } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaChartBar,
  FaTrophy,
  FaFutbol,
  FaUsers,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";
import { useTema } from "@/hooks/useTema";
import { usePublicLinks } from "@/hooks/usePublicLinks";

type SidebarMobileProps = { open: boolean; onClose: () => void };

const links = [
  { href: "/", label: "Início", icon: FaHome },
  { href: "/partidas", label: "Partidas", icon: FaFutbol },
  { href: "/estatisticas", label: "Estatísticas", icon: FaChartBar },
  { href: "/os-campeoes", label: "Os Campeões", icon: FaTrophy },
  { href: "/grandes-torneios", label: "Grandes Torneios", icon: FaTrophy },
  { href: "/atletas", label: "Perfis dos Atletas", icon: FaUsers },
  { href: "/sobre-nos", label: "Sobre Nós", icon: FaInfoCircle },
];

const SidebarMobile: FC<SidebarMobileProps> = ({ open, onClose }) => {
  const { logo, nome } = useTema();
  const { publicHref } = usePublicLinks();
  const pathname = usePathname() ?? "";
  const closeRef = useRef<HTMLButtonElement>(null);
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const focusable = asideRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href]"
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex bg-black/70 lg:hidden">
      <button
        type="button"
        aria-label="Fechar menu ao tocar fora"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <aside
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navegação do grupo"
        className="relative flex h-full max-h-dvh w-[min(20rem,calc(100vw-3rem))] flex-col overflow-y-auto overscroll-contain bg-zinc-900 px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(5.5rem,calc(5rem+env(safe-area-inset-bottom)))] shadow-xl"
      >
        <button
          ref={closeRef}
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-lg text-zinc-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <FaTimes />
        </button>
        <div className="mb-8 mt-4 flex flex-col items-center gap-2">
          <Image
            src={logo}
            alt={`Logo ${nome}`}
            width={64}
            height={64}
            className="object-contain"
          />
          <span className="text-center text-xl font-extrabold text-brand">{nome}</span>
        </div>
        <nav aria-label="Páginas do grupo" className="flex flex-col gap-2 text-[17px]">
          {links.map(({ href, label, icon: Icon }) => {
            const resolvedHref = publicHref(href);
            const isActive =
              pathname === resolvedHref ||
              (href !== "/" && pathname.startsWith(`${resolvedHref}/`));
            return (
              <Link
                key={href}
                href={resolvedHref}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-11 items-center gap-4 rounded px-2 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${isActive ? "font-extrabold text-brand" : "text-zinc-200 hover:text-brand-soft"}`}
              >
                <Icon size={22} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
};

export default SidebarMobile;
