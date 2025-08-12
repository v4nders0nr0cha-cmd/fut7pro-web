"use client";

import Head from "next/head";
import { useState } from "react";
import { FaPuzzlePiece, FaGoogle, FaWhatsapp, FaLink, FaLock } from "react-icons/fa";

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
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <FaPuzzlePiece /> Integrações & Automação
        </h1>
        <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow animate-fadeIn text-sm">
          <b className="text-yellow-300">Exclusivo para plano Enterprise White Label!</b>
          <br />
          Esta área permite integrar o seu próprio racha a ferramentas como <b>
            Google Analytics
          </b>, <b>WhatsApp API</b>, <b>Webhooks</b> e outras plataformas.
          <br />
          <span className="text-gray-300">
            <b>Disponível apenas para rachas com plano Enterprise White Label.</b>
            Solicite o upgrade com nosso suporte caso deseje liberar integrações avançadas,
            automações e coleta de dados externos para o seu grupo.
          </span>
        </div>

        {/* Cards de integração - bloqueados para outros planos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <CardIntegracao
            icone={<FaGoogle className="text-yellow-400 text-xl" />}
            nome="Google Analytics"
            status={liberado ? "Liberado" : "Bloqueado"}
            descricao="Acompanhe estatísticas de acesso do seu próprio domínio, só no plano Enterprise."
            liberado={liberado}
          />
          <CardIntegracao
            icone={<FaWhatsapp className="text-green-400 text-xl" />}
            nome="WhatsApp API"
            status={liberado ? "Liberado" : "Bloqueado"}
            descricao="Envie notificações do seu racha diretamente por WhatsApp usando sua própria API."
            liberado={liberado}
          />
          <CardIntegracao
            icone={<FaLink className="text-yellow-400 text-xl" />}
            nome="Webhooks/API"
            status={liberado ? "Liberado" : "Bloqueado"}
            descricao="Receba eventos do seu racha (jogadores, partidas, pagamentos) direto no seu sistema."
            liberado={liberado}
          />
        </div>

        {!liberado && (
          <div className="bg-[#232323] rounded-lg p-4 shadow border-l-4 border-yellow-400 mt-6">
            <div className="flex items-center gap-2 font-bold text-yellow-300 mb-1">
              <FaLock className="text-lg" />
              Funcionalidade exclusiva para Enterprise White Label
            </div>
            <div className="text-gray-300 text-sm">
              Quer integrar seu racha a outras ferramentas ou liberar automações? Fale com nosso
              time e conheça as vantagens do <b>Enterprise White Label</b>.
              <br />
              <a
                href="mailto:suporte@fut7pro.com.br?subject=Quero%20ativar%20o%20Enterprise%20White%20Label"
                className="text-yellow-400 underline font-bold"
              >
                Falar com o suporte
              </a>
            </div>
          </div>
        )}

        <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700 mt-8">
          <div className="font-bold text-yellow-300 mb-2">Dúvidas Frequentes</div>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>
              <b>Posso integrar com meus sistemas?</b> Apenas no Enterprise White Label. Outros
              planos têm integração interna limitada.
            </li>
            <li>
              <b>Quais integrações são suportadas?</b> Google Analytics, WhatsApp API, Webhooks/API.
              Consulte o suporte para necessidades específicas.
            </li>
            <li>
              <b>Como contratar?</b> Solicite pelo e-mail ou chamado de suporte.
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
      className={`bg-[#232323] rounded-lg p-5 shadow border-l-4 ${liberado ? "border-green-500" : "border-yellow-700"} flex flex-col gap-2 animate-fadeIn opacity-100`}
    >
      <div className="flex items-center gap-2">
        {icone}
        <span className="font-bold text-yellow-300 text-lg">{nome}</span>
        <span
          className={`ml-auto text-xs px-2 py-0.5 rounded ${
            liberado ? "bg-green-700 text-green-200" : "bg-yellow-800 text-yellow-200"
          }`}
        >
          {status}
        </span>
      </div>
      <div className="text-gray-200 text-sm">{descricao}</div>
      {!liberado && (
        <div className="text-xs text-yellow-400 mt-2">
          <FaLock className="inline mr-1" /> Disponível apenas para Enterprise White Label.
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
