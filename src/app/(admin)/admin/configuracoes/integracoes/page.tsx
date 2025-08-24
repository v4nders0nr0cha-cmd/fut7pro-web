"use client";

import Head from "next/head";
import { useState } from "react";
import {
  FaPuzzlePiece,
  FaGoogle,
  FaWhatsapp,
  FaLink,
  FaLock,
} from "react-icons/fa";

type Plano = "free" | "essencial" | "premium" | "enterprise";
const PLANO_ATUAL: Plano = "essencial"; // Troque para "enterprise" para simular liberado

export default function IntegracoesPage() {
  // Exemplo: se liberar, só mudar PLANO_ATUAL para "enterprise"
  const liberado = PLANO_ATUAL === "enterprise";

  return (
    <>
      <Head>
        <title>Integrações & Automação | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Disponível apenas para clientes Enterprise White Label. Conecte seu racha do Fut7Pro a Google Analytics, WhatsApp, API etc."
        />
        <meta
          name="keywords"
          content="Fut7, integrações, API, Google Analytics, WhatsApp, webhook, Zapier, SaaS, white label, enterprise"
        />
      </Head>
      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold text-yellow-400 md:text-3xl">
          <FaPuzzlePiece /> Integrações & Automação
        </h1>
        <div className="animate-fadeIn mb-6 rounded-lg border-l-4 border-yellow-400 bg-[#232323] p-4 text-sm shadow">
          <b className="text-yellow-300">
            Exclusivo para plano Enterprise White Label!
          </b>
          <br />
          Esta área permite integrar o seu próprio racha a ferramentas como{" "}
          <b>Google Analytics</b>, <b>WhatsApp API</b>, <b>Webhooks</b> e outras
          plataformas.
          <br />
          <span className="text-gray-300">
            <b>
              Disponível apenas para rachas com plano Enterprise White Label.
            </b>
            Solicite o upgrade com nosso suporte caso deseje liberar integrações
            avançadas, automações e coleta de dados externos para o seu grupo.
          </span>
        </div>

        {/* Cards de integração - bloqueados para outros planos */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <CardIntegracao
            icone={<FaGoogle className="text-xl text-yellow-400" />}
            nome="Google Analytics"
            status={liberado ? "Liberado" : "Bloqueado"}
            descricao="Acompanhe estatísticas de acesso do seu próprio domínio, só no plano Enterprise."
            liberado={liberado}
          />
          <CardIntegracao
            icone={<FaWhatsapp className="text-xl text-green-400" />}
            nome="WhatsApp API"
            status={liberado ? "Liberado" : "Bloqueado"}
            descricao="Envie notificações do seu racha diretamente por WhatsApp usando sua própria API."
            liberado={liberado}
          />
          <CardIntegracao
            icone={<FaLink className="text-xl text-yellow-400" />}
            nome="Webhooks/API"
            status={liberado ? "Liberado" : "Bloqueado"}
            descricao="Receba eventos do seu racha (jogadores, partidas, pagamentos) direto no seu sistema."
            liberado={liberado}
          />
        </div>

        {!liberado && (
          <div className="mt-6 rounded-lg border-l-4 border-yellow-400 bg-[#232323] p-4 shadow">
            <div className="mb-1 flex items-center gap-2 font-bold text-yellow-300">
              <FaLock className="text-lg" />
              Funcionalidade exclusiva para Enterprise White Label
            </div>
            <div className="text-sm text-gray-300">
              Quer integrar seu racha a outras ferramentas ou liberar
              automações? Fale com nosso time e conheça as vantagens do{" "}
              <b>Enterprise White Label</b>.
              <br />
              <a
                href="mailto:suporte@fut7pro.com.br?subject=Quero%20ativar%20o%20Enterprise%20White%20Label"
                className="font-bold text-yellow-400 underline"
              >
                Falar com o suporte
              </a>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-lg border border-yellow-700 bg-[#232323] p-5 shadow">
          <div className="mb-2 font-bold text-yellow-300">
            Dúvidas Frequentes
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <b>Posso integrar com meus sistemas?</b> Apenas no Enterprise
              White Label. Outros planos têm integração interna limitada.
            </li>
            <li>
              <b>Quais integrações são suportadas?</b> Google Analytics,
              WhatsApp API, Webhooks/API. Consulte o suporte para necessidades
              específicas.
            </li>
            <li>
              <b>Como contratar?</b> Solicite pelo e-mail ou chamado de suporte.
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

function CardIntegracao({
  icone,
  nome,
  status,
  descricao,
  liberado,
}: {
  icone: React.ReactNode;
  nome: string;
  status: string;
  descricao: string;
  liberado: boolean;
}) {
  return (
    <div
      className={`rounded-lg border-l-4 bg-[#232323] p-5 shadow ${liberado ? "border-green-500" : "border-yellow-700"} animate-fadeIn flex flex-col gap-2 opacity-100`}
    >
      <div className="flex items-center gap-2">
        {icone}
        <span className="text-lg font-bold text-yellow-300">{nome}</span>
        <span
          className={`ml-auto rounded px-2 py-0.5 text-xs ${
            liberado
              ? "bg-green-700 text-green-200"
              : "bg-yellow-800 text-yellow-200"
          }`}
        >
          {status}
        </span>
      </div>
      <div className="text-sm text-gray-200">{descricao}</div>
      {!liberado && (
        <div className="mt-2 text-xs text-yellow-400">
          <FaLock className="mr-1 inline" /> Disponível apenas para Enterprise
          White Label.
        </div>
      )}
      {liberado && (
        <div className="mt-3">
          {/* Exemplo de área de integração real */}
          <span className="text-xs text-gray-400">
            Configuração da integração será exibida aqui quando habilitado.
          </span>
        </div>
      )}
    </div>
  );
}
