"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaTachometerAlt,
  FaBuilding,
  FaUsers,
  FaMoneyCheckAlt,
  FaCogs,
  FaIdBadge,
  FaUserSlash,
} from "react-icons/fa";

const menu = [
  { label: "Dashboard", icon: FaTachometerAlt, href: "/superadmin/dashboard" },
  { label: "Rachas/SaaS", icon: FaBuilding, href: "/superadmin/rachas" },
  { label: "Admins", icon: FaUsers, href: "/superadmin/admins" },
  { label: "Contas", icon: FaIdBadge, href: "/superadmin/contas" },
  { label: "Financeiro", icon: FaMoneyCheckAlt, href: "/superadmin/financeiro" },
  { label: "Cancel.", icon: FaUserSlash, href: "/superadmin/cancelamentos" },
  { label: "Config", icon: FaCogs, href: "/superadmin/config" },
];

export default function BottomMenuSuperAdmin() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="fixed z-50 bottom-0 left-0 w-full bg-zinc-900 border-t border-zinc-800 flex justify-between items-center px-1 py-2 md:hidden">
      {menu.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center text-xs relative group min-h-[54px]"
            aria-label={item.label}
          >
            <item.icon
              size={22}
              className={`mb-0.5 transition ${isActive ? "text-brand" : "text-zinc-300 group-hover:text-brand-soft"}`}
            />
            <span
              className={`${isActive ? "text-brand font-semibold" : "text-zinc-300"} group-hover:text-brand-soft`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
