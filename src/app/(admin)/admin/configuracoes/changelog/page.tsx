"use client";

import Head from "next/head";
import {
  FaHistory,
  FaCheckCircle,
  FaBug,
  FaStar,
  FaMinusCircle,
  FaQuestionCircle,
} from "react-icons/fa";

type Mudanca = {
  data: string;
  versao: string;
  itens: {
    tipo: "novidade" | "correcao" | "ajuste" | "removido";
    descricao: string;
  }[];
};

const changelog: Mudanca[] = [
  {
    data: "16/07/2025",
    versao: "2.4.0",
    itens: [
      {
        tipo: "novidade",
        descricao: "Adicionada integração de domínio próprio (white label) para planos Enterprise.",
      },
      { tipo: "ajuste", descricao: "Sidebar e menus atualizados para melhor usabilidade mobile." },
      {
        tipo: "correcao",
        descricao: "Correção de bug nos relatórios de engajamento exportados em PDF.",
      },
    ],
  },
  {
    data: "02/07/2025",
    versao: "2.3.2",
    itens: [
      { tipo: "novidade", descricao: "Página de Enquetes disponível para administradores." },
      { tipo: "ajuste", descricao: "Melhoria de responsividade em telas menores." },
      { tipo: "removido", descricao: "Removido botão antigo de exportação em CSV." },
    ],
  },
  {
    data: "15/06/2025",
    versao: "2.2.0",
    itens: [
      { tipo: "novidade", descricao: "Novo painel de backup manual e restauração de dados." },
      {
        tipo: "correcao",
        descricao: "Ajuste no cadastro de mensalistas para impedir nomes duplicados.",
      },
    ],
  },
];

function getBadge(tipo: string) {
  switch (tipo) {
    case "novidade":
      return (
        <span className="bg-green-700 text-green-200 px-2 py-0.5 rounded flex items-center gap-1 text-xs">
          <FaStar /> Novidade
        </span>
      );
    case "correcao":
      return (
        <span className="bg-blue-700 text-blue-200 px-2 py-0.5 rounded flex items-center gap-1 text-xs">
          <FaBug /> Correção
        </span>
      );
    case "ajuste":
      return (
        <span className="bg-yellow-800 text-yellow-200 px-2 py-0.5 rounded flex items-center gap-1 text-xs">
          <FaCheckCircle /> Ajuste
        </span>
      );
    case "removido":
      return (
        <span className="bg-red-700 text-red-200 px-2 py-0.5 rounded flex items-center gap-1 text-xs">
          <FaMinusCircle /> Removido
        </span>
      );
    default:
      return null;
  }
}

export default function ChangelogPage() {
  return (
    <>
      <Head>
        <title>Histórico de Mudanças | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Veja todas as novidades, correções e melhorias aplicadas no Fut7Pro para o seu racha."
        />
        <meta name="keywords" content="Fut7, changelog, histórico, novidades, SaaS, admin" />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <FaHistory /> Histórico de Mudanças
        </h1>
        <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow animate-fadeIn text-sm">
          <b className="text-yellow-300">Fique por dentro das evoluções do Fut7Pro!</b>
          <br />
          Veja todas as novidades, correções, atualizações e melhorias aplicadas no sistema para o
          seu racha.
          <span className="text-gray-300 block mt-1">
            Transparência total: sempre que lançarmos algo novo, será registrado aqui.
          </span>
        </div>

        {/* Cards de changelog */}
        <div className="space-y-8 mb-8">
          {changelog.map((ver) => (
            <div
              key={ver.versao}
              className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700 animate-fadeIn"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                <span className="font-bold text-yellow-300 text-lg flex items-center gap-2">
                  Versão {ver.versao}
                </span>
                <span className="text-xs text-gray-400">{ver.data}</span>
              </div>
              <ul className="mt-1 space-y-2">
                {ver.itens.map((item, idx) => (
                  <li key={idx} className="flex gap-2 items-center">
                    {getBadge(item.tipo)}
                    <span className="text-gray-200 text-sm">{item.descricao}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700">
          <div className="font-bold text-yellow-300 mb-2 flex items-center gap-1">
            <FaQuestionCircle className="text-base" />
            Dúvidas Frequentes
          </div>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>
              <b>Como sou avisado das novidades?</b> Sempre que algo novo for lançado, aparecerá um
              aviso ou badge no painel.
            </li>
            <li>
              <b>Consigo ver o histórico por usuário?</b> Use Administração &gt; Logs/Admin para
              mudanças administrativas do seu próprio grupo.
            </li>
            <li>
              <b>Suporte:</b>{" "}
              <a href="/admin/comunicacao/suporte" className="underline text-yellow-400">
                Abrir chamado
              </a>
            </li>
          </ul>
        </div>
      </div>
      <style>{`
                .animate-fadeIn { animation: fadeIn 0.3s; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(14px); }
                    to { opacity: 1; transform: none; }
                }
            `}</style>
    </>
  );
}
