"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaTachometerAlt,
  FaFutbol,
  FaUsers,
  FaMoneyBillWave,
  FaCogs,
  FaTools,
  FaSignInAlt,
  FaBookOpen,
  FaChartLine,
  FaBullhorn,
  FaListAlt,
  FaPuzzlePiece,
  FaBell,
  FaLifeRing,
} from "react-icons/fa";
import Image from "next/image";

const menu = [
  { label: "Dashboard", href: "/superadmin/dashboard", icon: FaTachometerAlt },
  { label: "Rachas/SaaS", href: "/superadmin/rachas", icon: FaFutbol },
  { label: "Admins", href: "/superadmin/admins", icon: FaUsers },
  {
    label: "Financeiro",
    href: "/superadmin/financeiro",
    icon: FaMoneyBillWave,
  },
  { label: "Config", href: "/superadmin/config", icon: FaCogs },
  { label: "Automacoes", href: "/superadmin/automacoes", icon: FaTools },
  {
    label: "Integracoes",
    href: "/superadmin/integracoes",
    icon: FaPuzzlePiece,
  },
  { label: "Login", href: "/superadmin/login", icon: FaSignInAlt },
  { label: "Logs", href: "/superadmin/logs", icon: FaBookOpen },
  { label: "Marketing", href: "/superadmin/marketing", icon: FaBullhorn },
  {
    label: "Monitoramento",
    href: "/superadmin/monitoramento",
    icon: FaChartLine,
  },
  { label: "Notificações", href: "/superadmin/notificacoes", icon: FaBell },
  { label: "Planos", href: "/superadmin/planos", icon: FaListAlt },
  { label: "Suporte", href: "/superadmin/suporte", icon: FaLifeRing },
];

export default function Sidebar() {
  const pathname = usePathname() || "";

  return (
    <aside className="hidden min-h-screen w-[250px] flex-col border-r border-zinc-800 bg-[#141414] px-0 pt-0 lg:flex">
      <div className="flex items-center justify-start gap-2 px-6 py-6">
        <Image
          src="/images/logos/logo_fut7pro.png"
          alt="Logo Fut7Pro"
          width={44}
          height={44}
          className="rounded-full bg-black"
          priority
        />
        <span className="ml-2 text-lg font-extrabold text-yellow-400">
          Painel SuperAdmin
        </span>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-2">
        {menu.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold transition-all ${
                isActive
                  ? "bg-yellow-400 text-black shadow-md"
                  : "text-zinc-300 hover:bg-yellow-900/50 hover:text-yellow-300"
              } `}
            >
              <item.icon
                size={20}
                className={isActive ? "text-black" : "text-yellow-400"}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col items-center py-5">
        <span className="text-xs text-zinc-600">
          © {new Date().getFullYear()} Fut7Pro
        </span>
      </div>
    </aside>
  );
}
