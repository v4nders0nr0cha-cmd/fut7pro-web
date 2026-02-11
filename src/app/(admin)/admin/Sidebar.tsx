"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MdDashboard, MdPerson, MdSettings, MdPeopleAlt, MdPalette } from "react-icons/md";
import { FaPiggyBank, FaRegBell, FaTrophy, FaFutbol, FaExternalLinkAlt } from "react-icons/fa";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useMe } from "@/hooks/useMe";
import { useBranding } from "@/hooks/useBranding";
import { useRacha } from "@/context/RachaContext";

const APP_PUBLIC_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

const menu = [
  { label: "Dashboard", icon: MdDashboard, href: "/admin/dashboard" },
  {
    label: "Partidas",
    icon: FaFutbol,
    children: [
      { label: "PRÉ-JOGO", isSection: true },
      { label: "Criar Times", href: "/admin/partidas/criar-times" },
      { label: "Criar Partidas", href: "/admin/partidas/criar" },
      { label: "Times do Dia", href: "/admin/partidas/times-do-dia" },
      { label: "Dias e Horários", href: "/admin/partidas/proximos-rachas" },
      { label: "PÓS-JOGO", isSection: true },
      { label: "Partidas e Resultados", href: "/admin/partidas" },
      { label: "Time Campeão do Dia", href: "/admin/partidas/time-campeao-do-dia" },
    ],
  },
  {
    label: "Jogadores",
    icon: MdPerson,
    children: [
      { label: "Listar/Cadastrar", href: "/admin/jogadores/listar-cadastrar" },
      { label: "Nivel dos Atletas", href: "/admin/jogadores/nivel-dos-atletas" },
      { label: "Ranking Assiduidade", href: "/admin/jogadores/ranking-assiduidade" },
      { label: "Mensalistas", href: "/admin/jogadores/mensalistas" },
    ],
  },
  { label: "Conquistas", icon: FaTrophy, href: "/admin/conquistas" },
  {
    label: "Financeiro",
    icon: FaPiggyBank,
    children: [
      { label: "Prestação de Contas", href: "/admin/financeiro/prestacao-de-contas" },
      { label: "Mensalistas", href: "/admin/financeiro/mensalistas" },
      { label: "Patrocinadores", href: "/admin/financeiro/patrocinadores" },
      { label: "Planos & Limites", href: "/admin/financeiro/planos-limites" },
    ],
  },
  {
    label: "Personalização",
    icon: MdPalette,
    children: [
      { label: "Identidade Visual", href: "/admin/personalizacao/identidade-visual" },
      { label: "Visual/Temas", href: "/admin/personalizacao/visual-temas" },
      { label: "Páginas do Sobre Nós", href: "/admin/personalizacao/editar-paginas" },
      { label: "Rodapé/Footer", href: "/admin/personalizacao/footer" },
      { label: "Redes Sociais", href: "/admin/personalizacao/redes-sociais" },
    ],
  },
  {
    label: "Administração",
    icon: MdPeopleAlt,
    children: [
      { label: "Administradores", href: "/admin/administracao/administradores" },
      { label: "Permissões", href: "/admin/administracao/permissoes" },
      { label: "Logs/Admin", href: "/admin/administracao/logs" },
      { label: "Transferir Propriedade", href: "/admin/administracao/transferir-propriedade" },
    ],
  },
  {
    label: "Comunicação",
    icon: FaRegBell,
    children: [
      { label: "Notificações", href: "/admin/comunicacao/notificacoes" },
      { label: "Comunicados", href: "/admin/comunicacao/comunicados" },
      { label: "Enquetes", href: "/admin/comunicacao/enquetes" },
      { label: "Sugestões", href: "/admin/comunicacao/sugestoes" },
      { label: "Ajuda", href: "/admin/comunicacao/ajuda" },
      { label: "Suporte", href: "/admin/comunicacao/suporte" },
    ],
  },
  {
    label: "Configurações/Extras",
    icon: MdSettings,
    children: [
      { label: "Domínio Próprio", href: "/admin/configuracoes/dominio-proprio" },
      { label: "Integrações & Automação", href: "/admin/configuracoes/integracoes" },
      { label: "Backup & Recuperação", href: "/admin/configuracoes/backup" },
      { label: "Central de Atualizações", href: "/admin/configuracoes/changelog" },
      { label: "Cancelar conta do racha", href: "/admin/configuracoes/cancelar-conta" },
    ],
  },
];

interface SidebarProps {
  mobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

function slugifyTestId(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function Sidebar({ mobile = false, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState<string | null>(null);
  const { data: session } = useSession();
  const { me } = useMe({ context: "admin" });
  const isPresidente = String(me?.membership?.role || "").toUpperCase() === "PRESIDENTE";
  const { tenantSlug } = useRacha();
  const resolvedSlug = useMemo(() => {
    const sessionSlug = (session?.user as { tenantSlug?: string | null } | undefined)?.tenantSlug;
    return me?.tenant?.tenantSlug || sessionSlug || tenantSlug || "";
  }, [me?.tenant?.tenantSlug, session?.user, tenantSlug]);
  const visibleMenu = useMemo(
    () => menu.filter((item) => item.label !== "Configurações/Extras" || isPresidente),
    [isPresidente]
  );
  const { nome, logo } = useBranding({ scope: "admin", slug: resolvedSlug });
  const sitePublicoUrl = `${APP_PUBLIC_URL}/${encodeURIComponent(resolvedSlug)}`;
  const hasPublicSlug = resolvedSlug.trim().length > 0;

  useEffect(() => {
    if (!isOpen) setOpen(null);
  }, [isOpen]);

  const handleToggle = (label: string) => {
    setOpen((prev) => (prev === label ? null : label));
  };

  const wrapperClass = mobile
    ? `fixed z-50 top-0 left-0 w-72 h-full bg-[#181818] border-r border-[#292929] transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "-translate-x-full"}`
    : "w-72 min-h-screen bg-[#181818] border-r border-[#292929] shadow-lg flex flex-col pt-[65px] pb-8 hidden md:flex z-40";

  return (
    <aside
      className={wrapperClass}
      role="navigation"
      aria-label="Menu administrativo"
      data-testid={mobile ? "admin-sidebar-mobile" : "admin-sidebar-desktop"}
    >
      <div className="px-6 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt={`Logo do ${nome} - Sistema de rachas e futebol`}
            width={42}
            height={42}
            className="rounded"
            priority
          />
          <span className="font-bold text-xl text-brand">{nome}</span>
        </div>
        {mobile && (
          <button onClick={onClose} aria-label="Fechar menu">
            <span className="text-white text-2xl">×</span>
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 px-4 pb-4">
          {visibleMenu.map((item) =>
            item.children ? (
              <li key={item.label}>
                <button
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg hover:bg-[#232323] transition ${open === item.label ? "bg-[#232323]" : ""}`}
                  onClick={() => handleToggle(item.label)}
                  aria-expanded={open === item.label}
                  data-testid={`admin-sidebar-toggle-${slugifyTestId(item.label)}`}
                >
                  <item.icon className="text-brand text-lg mr-3" />
                  <span className="flex-1 font-semibold">{item.label}</span>
                  <span
                    className={`transition-transform transform duration-200 ${open === item.label ? "rotate-90" : ""}`}
                  >
                    ▶
                  </span>
                </button>
                {open === item.label && (
                  <ul className="ml-6 mt-1 space-y-1 border-l border-brand-strong pl-3">
                    {item.children.map((child, index) => {
                      if ("href" in child) {
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={`block px-2 py-1 rounded text-sm hover:bg-[#222] transition ${pathname.startsWith(child.href) ? "bg-[#232323] text-brand-soft" : "text-gray-200"}`}
                              onClick={onClose}
                              data-testid={`admin-sidebar-link-${slugifyTestId(child.href)}`}
                              data-admin-nav-link="true"
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      }

                      return (
                        <li
                          key={`${child.label}-${index}`}
                          className="pt-2 text-[11px] font-semibold uppercase tracking-wide text-brand-soft opacity-80"
                        >
                          {child.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ) : (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg hover:bg-[#232323] transition ${pathname === item.href ? "bg-[#232323] text-brand-soft" : "text-gray-200"}`}
                  onClick={onClose}
                  data-testid={`admin-sidebar-link-${slugifyTestId(item.href)}`}
                  data-admin-nav-link="true"
                >
                  <item.icon className="text-brand text-lg mr-3" />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              </li>
            )
          )}
        </ul>
        <div className="px-4 mt-3">
          <div className="bg-[#1a1a1a] border border-brand rounded-lg p-3 flex items-center justify-between hover:bg-[#222] transition shadow">
            {hasPublicSlug ? (
              <a
                href={sitePublicoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-bold text-brand-soft"
                title="Abrir site público do seu racha"
                data-testid="admin-sidebar-view-site"
              >
                Ver o Site
                <FaExternalLinkAlt className="text-brand ml-1" />
              </a>
            ) : (
              <span
                className="font-bold text-zinc-500"
                data-testid="admin-sidebar-view-site-disabled"
              >
                Selecione um racha no Hub
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1 pl-1">
            Atualizações podem levar até 15 minutos para aparecer no site público.
          </div>
          <button
            type="button"
            className="w-full mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            data-testid="admin-sidebar-signout"
          >
            Sair da conta
          </button>
        </div>
      </nav>
    </aside>
  );
}
