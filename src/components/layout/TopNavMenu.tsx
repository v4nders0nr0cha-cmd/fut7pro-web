"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, BarChart, Medal, User, Info } from "lucide-react";

// Novo ícone de "Partidas"
const PartidasIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`mr-2 text-yellow-400 ${props.className || ""}`}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 3.3l1.35-.95a8 8 0 0 1 4.38 3.34l-.39 1.34l-1.35.46L13 6.7zm-3.35-.95L11 5.3v1.4L7.01 9.49l-1.35-.46l-.39-1.34a8.1 8.1 0 0 1 4.38-3.34M7.08 17.11l-1.14.1A7.94 7.94 0 0 1 4 12c0-.12.01-.23.02-.35l1-.73l1.38.48l1.46 4.34zm7.42 2.48c-.79.26-1.63.41-2.5.41s-1.71-.15-2.5-.41l-.69-1.49l.64-1.1h5.11l.64 1.11zM14.27 15H9.73l-1.35-4.02L12 8.44l3.63 2.54zm3.79 2.21l-1.14-.1l-.79-1.37l1.46-4.34l1.39-.47l1 .73c.01.11.02.22.02.34c0 1.99-.73 3.81-1.94 5.21" />
  </svg>
);

const iconProps = {
  className: "mr-2 text-yellow-400",
};

const pages = [
  {
    href: "/partidas",
    label: "Partidas",
    icon: <PartidasIcon {...iconProps} />,
  },
  {
    href: "/estatisticas",
    label: "Estatísticas",
    icon: <BarChart size={20} className="mr-2 text-yellow-400" />,
  },
  {
    href: "/os-campeoes",
    label: "Campeões",
    icon: <Medal size={20} className="mr-2 text-yellow-400" />,
  },
  {
    href: "/grandes-torneios",
    label: "Grandes Torneios",
    icon: <Trophy size={20} className="mr-2 text-yellow-400" />,
  },
  {
    href: "/atletas",
    label: "Atletas",
    icon: <User size={20} className="mr-2 text-yellow-400" />,
  },
  {
    href: "/sobre-nos",
    label: "Sobre Nós",
    icon: <Info size={20} className="mr-2 text-yellow-400" />,
  },
];

export default function TopNavMenu() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="z-40 flex w-full animate-slide-down select-none justify-center border-b border-[#232323] bg-[#181818]">
      <ul className="flex gap-6 py-3 md:gap-12">
        {pages.map(({ href, label, icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(href + "/");

          return (
            <li key={href} className="relative">
              <Link
                href={href}
                className={`flex items-center px-2 transition-all duration-300 ${
                  isActive
                    ? "font-extrabold text-yellow-400"
                    : "font-semibold text-zinc-200 hover:text-yellow-400"
                }`}
                tabIndex={0}
                aria-current={isActive ? "page" : undefined}
              >
                {icon}
                <span className="text-base uppercase">{label}</span>
              </Link>
              {isActive && (
                <span className="absolute -bottom-1 left-0 h-[2px] w-full animate-pulse rounded bg-yellow-400" />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
