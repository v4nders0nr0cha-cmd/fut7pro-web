import React from "react";
import Link from "next/link";
import { rachaConfig } from "@/config/racha.config";

const links = [
  {
    href: "/superadmin/faq",
    label: `FAQ ${rachaConfig.nome}`,
    description: "Perguntas frequentes sobre uso do sistema.",
  },
  {
    href: "/superadmin/ajuda/onboarding",
    label: "Guia de Onboarding",
    description: "Como ativar, configurar e lançar seu racha.",
  },
  {
    href: "/superadmin/ajuda/contato",
    label: "Contato do Suporte",
    description:
      "Fale direto com nossa equipe pelo WhatsApp, Email ou Telegram.",
  },
];

const FaqQuickLinks: React.FC = () => (
  <div className="mt-2 flex flex-wrap gap-3">
    {links.map((link) => (
      <Link
        href={link.href}
        key={link.href}
        className="flex w-full flex-col rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 transition hover:scale-105 hover:border-yellow-400 md:w-60"
      >
        <span className="mb-1 font-bold text-yellow-400">{link.label}</span>
        <span className="text-xs text-zinc-300">{link.description}</span>
      </Link>
    ))}
  </div>
);

export default FaqQuickLinks;
