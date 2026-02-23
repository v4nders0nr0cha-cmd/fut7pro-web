"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  FaTachometerAlt,
  FaFutbol,
  FaUsers,
  FaIdBadge,
  FaMoneyBillWave,
  FaCogs,
  FaListAlt,
  FaBell,
  FaLifeRing,
  FaUserSlash,
  FaBullhorn,
} from "react-icons/fa";
import Image from "next/image";
import { useBranding } from "@/hooks/useBranding";

type MenuItem = {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const sections: Array<{ title: string; items: MenuItem[] }> = [
  {
    title: "Core",
    items: [
      { label: "Dashboard", href: "/superadmin/dashboard", icon: FaTachometerAlt },
      { label: "Rachas/SaaS", href: "/superadmin/rachas", icon: FaFutbol },
      { label: "Admins", href: "/superadmin/admins", icon: FaUsers },
      { label: "Contas Globais", href: "/superadmin/contas", icon: FaIdBadge },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { label: "Financeiro", href: "/superadmin/financeiro", icon: FaMoneyBillWave },
      { label: "Planos", href: "/superadmin/planos", icon: FaListAlt },
    ],
  },
  {
    title: "Operação",
    items: [
      { label: "Suporte", href: "/superadmin/suporte", icon: FaLifeRing },
      { label: "Cancelamentos", href: "/superadmin/cancelamentos", icon: FaUserSlash },
      { label: "Notificações", href: "/superadmin/notificacoes", icon: FaBell },
    ],
  },
  {
    title: "Marketing",
    items: [{ label: "Embaixadores", href: "/superadmin/embaixadores", icon: FaBullhorn }],
  },
  {
    title: "Sistema",
    items: [{ label: "Config", href: "/superadmin/config", icon: FaCogs }],
  },
];

export default function Sidebar() {
  const pathname = usePathname() || "";
  const { nome, logo } = useBranding({ scope: "superadmin" });
  const brandName = nome || "Fut7Pro";
  const brandLogo = logo || "/images/logos/logo_fut7pro.png";

  return (
    <aside className="hidden lg:flex flex-col bg-[#141414] border-r border-zinc-800 w-[250px] min-h-screen px-0 pt-0">
      <div className="flex items-center justify-start gap-2 px-6 py-6">
        <Image
          src={brandLogo}
          alt={`Logo ${brandName}`}
          width={44}
          height={44}
          className="rounded-full bg-black"
          priority
        />
        <span className="ml-2 text-lg font-extrabold text-yellow-400">Painel SuperAdmin</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-2 mt-2">
        {sections.map((section) => (
          <div key={section.title} className="mb-3">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              {section.title}
            </p>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all text-base 
                    ${
                      isActive
                        ? "bg-yellow-400 text-black shadow-md"
                        : "text-zinc-300 hover:bg-yellow-900/50 hover:text-yellow-300"
                    }
                  `}
                >
                  <item.icon size={20} className={isActive ? "text-black" : "text-yellow-400"} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="flex flex-col items-center py-5">
        <span className="text-xs text-zinc-600">
          © {new Date().getFullYear()} {brandName}
        </span>
      </div>
    </aside>
  );
}
