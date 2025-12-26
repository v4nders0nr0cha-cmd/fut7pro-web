"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MdDashboard, MdPerson, MdSettings, MdPeopleAlt, MdPalette } from "react-icons/md";
import { FaPiggyBank, FaRegBell, FaTrophy, FaFutbol, FaExternalLinkAlt } from "react-icons/fa";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useMe } from "@/hooks/useMe";
import { useBranding } from "@/hooks/useBranding";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";

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
      { label: "Histórico", href: "/admin/partidas" },
      { label: "Próximos Rachas", href: "/admin/partidas/proximos-rachas" },
      { label: "Time Campeão do Dia", href: "/admin/partidas/time-campeao-do-dia" },
      { label: "Times do Dia", href: "/admin/partidas/times-do-dia" },
      { label: "Criar Times", href: "/admin/partidas/criar-times" },
      { label: "Sorteio Inteligente", href: "/admin/partidas/sorteio-inteligente" },
      { label: "Criar Partidas", href: "/admin/partidas/criar" },
    ],
  },
  {
    label: "Jogadores",
    icon: MdPerson,
    children: [
      { label: "Listar/Cadastrar", href: "/admin/jogadores/listar-cadastrar" },
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
      { label: "Editar Páginas", href: "/admin/personalizacao/editar-paginas" },
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
      { label: "Segurança & Privacidade", href: "/admin/configuracoes/seguranca" },
      { label: "Backup & Recuperação", href: "/admin/configuracoes/backup" },
      { label: "Histórico de Mudanças", href: "/admin/configuracoes/changelog" },
      { label: "Cancelar Conta", href: "/admin/configuracoes/cancelar-conta" },
      { label: "Sair", href: "/logout" },
    ],
  },
];

interface SidebarProps {
  mobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile = false, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState<string | null>(null);
  const { data: session } = useSession();
  const { me } = useMe();
  const { tenantSlug } = useRacha();
  const resolvedSlug = useMemo(() => {
    const sessionSlug = (session?.user as { tenantSlug?: string | null } | undefined)?.tenantSlug;
    return me?.tenant?.tenantSlug || sessionSlug || tenantSlug || rachaConfig.slug;
  }, [me?.tenant?.tenantSlug, session?.user, tenantSlug]);
  const { nome, logo } = useBranding({ scope: "admin", slug: resolvedSlug });
  const sitePublicoUrl = `${APP_PUBLIC_URL}/${encodeURIComponent(resolvedSlug)}`;

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
    <aside className={wrapperClass} role="navigation" aria-label="Menu administrativo">
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
          <span className="font-bold text-xl text-yellow-400">{nome}</span>
        </div>
        {mobile && (
          <button onClick={onClose} aria-label="Fechar menu">
            <span className="text-white text-2xl">×</span>
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 px-4 pb-4">
          {menu.map((item) =>
            item.children ? (
              <li key={item.label}>
                <button
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg hover:bg-[#232323] transition ${open === item.label ? "bg-[#232323]" : ""}`}
                  onClick={() => handleToggle(item.label)}
                  aria-expanded={open === item.label}
                >
                  <item.icon className="text-yellow-400 text-lg mr-3" />
                  <span className="flex-1 font-semibold">{item.label}</span>
                  <span
                    className={`transition-transform transform duration-200 ${open === item.label ? "rotate-90" : ""}`}
                  >
                    ▶
                  </span>
                </button>
                {open === item.label && (
                  <ul className="ml-6 mt-1 space-y-1 border-l border-yellow-700 pl-3">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={`block px-2 py-1 rounded text-sm hover:bg-[#222] transition ${pathname.startsWith(child.href) ? "bg-[#232323] text-yellow-300" : "text-gray-200"}`}
                          onClick={onClose}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg hover:bg-[#232323] transition ${pathname === item.href ? "bg-[#232323] text-yellow-300" : "text-gray-200"}`}
                  onClick={onClose}
                >
                  <item.icon className="text-yellow-400 text-lg mr-3" />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              </li>
            )
          )}
        </ul>
        <div className="px-4 mt-3">
          <div className="bg-[#1a1a1a] border border-yellow-500 rounded-lg p-3 flex items-center justify-between hover:bg-[#222] transition shadow">
            <a
              href={sitePublicoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-bold text-yellow-300"
              title="Abrir site público do seu racha"
            >
              Ver o Site
              <FaExternalLinkAlt className="text-yellow-400 ml-1" />
            </a>
          </div>
          <div className="text-xs text-gray-400 mt-1 pl-1">
            Atualizações podem levar até 15 minutos para aparecer no site público.
          </div>
        </div>
      </nav>
    </aside>
  );
}
