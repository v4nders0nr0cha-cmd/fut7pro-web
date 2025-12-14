import Link from "next/link";
import { useBranding } from "@/hooks/useBranding";

const buildLinks = (nome: string) => [
  {
    href: "/superadmin/faq",
    label: `FAQ ${nome}`,
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
    description: "Fale direto com nossa equipe pelo WhatsApp, Email ou Telegram.",
  },
];

export default function FaqQuickLinks() {
  const { nome, brandText } = useBranding({ scope: "superadmin" });
  const resolvedNome = brandText(nome || "Fut7Pro");

  return (
    <div className="mt-2 flex flex-wrap gap-3">
      {buildLinks(resolvedNome).map((link) => (
        <Link
          href={link.href}
          key={link.href}
          className="flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 w-full md:w-60 hover:border-yellow-400 hover:scale-105 transition"
        >
          <span className="font-bold text-yellow-400 mb-1">{link.label}</span>
          <span className="text-xs text-zinc-300">{brandText(link.description)}</span>
        </Link>
      ))}
    </div>
  );
}
