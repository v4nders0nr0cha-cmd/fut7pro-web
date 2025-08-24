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
        descricao:
          "Adicionada integração de domínio próprio (white label) para planos Enterprise.",
      },
      {
        tipo: "ajuste",
        descricao:
          "Sidebar e menus atualizados para melhor usabilidade mobile.",
      },
      {
        tipo: "correcao",
        descricao:
          "Correção de bug nos relatórios de engajamento exportados em PDF.",
      },
    ],
  },
  {
    data: "02/07/2025",
    versao: "2.3.2",
    itens: [
      {
        tipo: "novidade",
        descricao: "Página de Enquetes disponível para administradores.",
      },
      {
        tipo: "ajuste",
        descricao: "Melhoria de responsividade em telas menores.",
      },
      {
        tipo: "removido",
        descricao: "Removido botão antigo de exportação em CSV.",
      },
    ],
  },
  {
    data: "15/06/2025",
    versao: "2.2.0",
    itens: [
      {
        tipo: "novidade",
        descricao: "Novo painel de backup manual e restauração de dados.",
      },
      {
        tipo: "correcao",
        descricao:
          "Ajuste no cadastro de mensalistas para impedir nomes duplicados.",
      },
    ],
  },
];

function getBadge(tipo: string) {
  switch (tipo) {
    case "novidade":
      return (
        <span className="flex items-center gap-1 rounded bg-green-700 px-2 py-0.5 text-xs text-green-200">
          <FaStar /> Novidade
        </span>
      );
    case "correcao":
      return (
        <span className="flex items-center gap-1 rounded bg-blue-700 px-2 py-0.5 text-xs text-blue-200">
          <FaBug /> Correção
        </span>
      );
    case "ajuste":
      return (
        <span className="flex items-center gap-1 rounded bg-yellow-800 px-2 py-0.5 text-xs text-yellow-200">
          <FaCheckCircle /> Ajuste
        </span>
      );
    case "removido":
      return (
        <span className="flex items-center gap-1 rounded bg-red-700 px-2 py-0.5 text-xs text-red-200">
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
        <meta
          name="keywords"
          content="Fut7, changelog, histórico, novidades, SaaS, admin"
        />
      </Head>
      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold text-yellow-400 md:text-3xl">
          <FaHistory /> Histórico de Mudanças
        </h1>
        <div className="animate-fadeIn mb-6 rounded-lg border-l-4 border-yellow-400 bg-[#232323] p-4 text-sm shadow">
          <b className="text-yellow-300">
            Fique por dentro das evoluções do Fut7Pro!
          </b>
          <br />
          Veja todas as novidades, correções, atualizações e melhorias aplicadas
          no sistema para o seu racha.
          <span className="mt-1 block text-gray-300">
            Transparência total: sempre que lançarmos algo novo, será registrado
            aqui.
          </span>
        </div>

        {/* Cards de changelog */}
        <div className="mb-8 space-y-8">
          {changelog.map((ver) => (
            <div
              key={ver.versao}
              className="animate-fadeIn rounded-lg border border-yellow-700 bg-[#232323] p-5 shadow"
            >
              <div className="mb-1 flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="flex items-center gap-2 text-lg font-bold text-yellow-300">
                  Versão {ver.versao}
                </span>
                <span className="text-xs text-gray-400">{ver.data}</span>
              </div>
              <ul className="mt-1 space-y-2">
                {ver.itens.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    {getBadge(item.tipo)}
                    <span className="text-sm text-gray-200">
                      {item.descricao}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="rounded-lg border border-yellow-700 bg-[#232323] p-5 shadow">
          <div className="mb-2 flex items-center gap-1 font-bold text-yellow-300">
            <FaQuestionCircle className="text-base" />
            Dúvidas Frequentes
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <b>Como sou avisado das novidades?</b> Sempre que algo novo for
              lançado, aparecerá um aviso ou badge no painel.
            </li>
            <li>
              <b>Consigo ver o histórico por usuário?</b> Use Administração &gt;
              Logs/Admin para mudanças administrativas do seu próprio grupo.
            </li>
            <li>
              <b>Suporte:</b>{" "}
              <a
                href="/admin/comunicacao/suporte"
                className="text-yellow-400 underline"
              >
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
