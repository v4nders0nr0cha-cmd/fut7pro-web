"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaTachometerAlt,
  FaBuilding,
  FaUsers,
  FaMoneyCheckAlt,
  FaCogs,
} from "react-icons/fa";

const menu = [
  { label: "Dashboard", icon: FaTachometerAlt, href: "/superadmin/dashboard" },
  { label: "Rachas/SaaS", icon: FaBuilding, href: "/superadmin/rachas" },
  { label: "Admins", icon: FaUsers, href: "/superadmin/admins" },
  {
    label: "Financeiro",
    icon: FaMoneyCheckAlt,
    href: "/superadmin/financeiro",
  },
  { label: "Config", icon: FaCogs, href: "/superadmin/config" },
];

export default function BottomMenuSuperAdmin() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-between border-t border-zinc-800 bg-zinc-900 px-1 py-2 md:hidden">
      {menu.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group relative flex min-h-[54px] flex-1 flex-col items-center justify-center text-xs"
            aria-label={item.label}
          >
            <item.icon
              size={22}
              className={`mb-0.5 transition ${isActive ? "text-yellow-400" : "text-zinc-300 group-hover:text-yellow-300"}`}
            />
            <span
              className={`${isActive ? "font-semibold text-yellow-400" : "text-zinc-300"} group-hover:text-yellow-300`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
