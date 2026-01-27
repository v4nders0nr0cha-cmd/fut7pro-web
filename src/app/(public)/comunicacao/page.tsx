"use client";
import Head from "next/head";
import Link from "next/link";
import {
  FaRegBell,
  FaCommentDots,
  FaClipboardList,
  FaLightbulb,
  FaQuestionCircle,
  FaHeadset,
} from "react-icons/fa";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const items = [
  {
    label: "Notificações",
    href: "/comunicacao/notificacoes",
    icon: <FaRegBell className="text-brand" size={22} />,
    description: "Alertas importantes sobre jogos, times e novidades do racha.",
  },
  {
    label: "Mensagens do Admin",
    href: "/comunicacao/mensagens",
    icon: <FaCommentDots className="text-brand" size={22} />,
    description: "Mensagens diretas enviadas pela administração do racha.",
  },
  {
    label: "Comunicados",
    href: "/comunicacao/comunicados",
    icon: <FaClipboardList className="text-brand" size={22} />,
    description: "Comunicados gerais, regras e avisos oficiais do racha.",
  },
  {
    label: "Sugestões",
    href: "/comunicacao/sugestoes",
    icon: <FaLightbulb className="text-brand" size={22} />,
    description: "Envie ideias e sugestões para melhorar o racha.",
  },
  {
    label: "Enquetes",
    href: "/comunicacao/enquetes",
    icon: <FaClipboardList className="text-brand" size={22} />,
    description: "Participe das enquetes e ajude nas decisões do grupo.",
  },
  {
    label: "Ajuda",
    href: "/comunicacao/ajuda",
    icon: <FaQuestionCircle className="text-brand" size={22} />,
    description: "Dúvidas frequentes, tutoriais e como utilizar a plataforma.",
  },
];

export default function ComunicacaoPage() {
  const { publicHref } = usePublicLinks();

  return (
    <>
      <Head>
        <title>Comunicação | Central de Avisos e Mensagens | Fut7Pro</title>
        <meta
          name="description"
          content="Central de comunicação do Fut7Pro: notificações, mensagens do admin, comunicados, sugestões, enquetes, ajuda e suporte do racha."
        />
        <meta
          name="keywords"
          content="fut7, comunicação, notificações, mensagens, comunicados, enquetes, suporte, racha, futebol 7"
        />
      </Head>
      <h1 className="text-3xl font-bold text-brand text-center mt-8 mb-6">
        Central de Comunicação
      </h1>
      <p className="text-center text-sm text-gray-300 mb-10 max-w-2xl mx-auto">
        Acesse todas as notificações, mensagens, comunicados, sugestões, enquetes e suporte do racha
        em um só lugar. Fique por dentro de tudo que acontece no Fut7Pro!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {items.map((item) => (
          <Link
            href={publicHref(item.href)}
            key={item.href}
            className="group bg-zinc-900 rounded-xl p-5 shadow hover:shadow-yellow-400 transition-all border border-zinc-800 hover:border-brand flex flex-col gap-2 items-start cursor-pointer min-h-[138px]"
          >
            <div className="flex items-center gap-3 mb-1">
              {item.icon}
              <span className="font-bold text-base text-brand-soft group-hover:text-brand">
                {item.label}
              </span>
            </div>
            <p className="text-gray-400 text-xs">{item.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
