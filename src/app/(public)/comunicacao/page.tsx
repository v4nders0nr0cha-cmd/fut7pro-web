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

const items = [
  {
    label: "Notificações",
    href: "/comunicacao/notificacoes",
    icon: <FaRegBell className="text-yellow-400" size={22} />,
    description: "Alertas importantes sobre jogos, times e novidades do racha.",
  },
  {
    label: "Mensagens do Admin",
    href: "/comunicacao/mensagens",
    icon: <FaCommentDots className="text-yellow-400" size={22} />,
    description: "Mensagens diretas enviadas pela administração do racha.",
  },
  {
    label: "Comunicados",
    href: "/comunicacao/comunicados",
    icon: <FaClipboardList className="text-yellow-400" size={22} />,
    description: "Comunicados gerais, regras e avisos oficiais do racha.",
  },
  {
    label: "Sugestões",
    href: "/comunicacao/sugestoes",
    icon: <FaLightbulb className="text-yellow-400" size={22} />,
    description: "Envie ideias e sugestões para melhorar o racha.",
  },
  {
    label: "Enquetes",
    href: "/comunicacao/enquetes",
    icon: <FaClipboardList className="text-yellow-400" size={22} />,
    description: "Participe das enquetes e ajude nas decisões do grupo.",
  },
  {
    label: "Ajuda",
    href: "/comunicacao/ajuda",
    icon: <FaQuestionCircle className="text-yellow-400" size={22} />,
    description: "Dúvidas frequentes, tutoriais e como utilizar a plataforma.",
  },
];

export default function ComunicacaoPage() {
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
      <h1 className="mb-6 mt-8 text-center text-3xl font-bold text-yellow-400">
        Central de Comunicação
      </h1>
      <p className="mx-auto mb-10 max-w-2xl text-center text-sm text-gray-300">
        Acesse todas as notificações, mensagens, comunicados, sugestões,
        enquetes e suporte do racha em um só lugar. Fique por dentro de tudo que
        acontece no Fut7Pro!
      </p>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            className="group flex min-h-[138px] cursor-pointer flex-col items-start gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow transition-all hover:border-yellow-400 hover:shadow-yellow-400"
          >
            <div className="mb-1 flex items-center gap-3">
              {item.icon}
              <span className="text-base font-bold text-yellow-300 group-hover:text-yellow-400">
                {item.label}
              </span>
            </div>
            <p className="text-xs text-gray-400">{item.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
