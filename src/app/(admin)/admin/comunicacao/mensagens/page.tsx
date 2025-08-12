"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import type { MensagemContato } from "@/types/mensagem";
import { FaEnvelopeOpenText, FaEnvelope, FaReply } from "react-icons/fa";

const MOCK_MENSAGENS: MensagemContato[] = [
  {
    id: "1",
    rachaId: "RACHA_ID_AQUI",
    assunto: "Sugestão de horário",
    nome: "Carlos Souza",
    email: "carlos@email.com",
    telefone: "(11) 99999-8888",
    mensagem: "Poderia adicionar mais horários de jogos na terça.",
    status: "novo",
    dataEnvio: new Date().toISOString(),
  },
  {
    id: "2",
    rachaId: "RACHA_ID_AQUI",
    assunto: "Problema no sorteio",
    nome: "Ana Clara",
    email: "ana@email.com",
    telefone: "",
    mensagem: "O sorteio travou no domingo passado.",
    status: "lido",
    dataEnvio: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function MensagensAdminPage() {
  const [mensagens, setMensagens] = useState<MensagemContato[]>([]);
  const [loading, setLoading] = useState(true);
  const rachaId = "RACHA_ID_AQUI"; // Puxe do contexto/session futuramente

  useEffect(() => {
    async function fetchMensagens() {
      setLoading(true);
      // Simule fetch da API. Troque por fetch real futuramente.
      setMensagens(MOCK_MENSAGENS); // <-- MOCK
      setLoading(false);
    }
    fetchMensagens();
  }, [rachaId]);

  return (
    <>
      <Head>
        <title>Mensagens Recebidas | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Visualize e responda as mensagens enviadas pelos atletas e pelo SuperAdmin no painel administrativo do Fut7Pro."
        />
        <meta name="keywords" content="fut7, mensagens, painel admin, comunicação, SaaS" />
      </Head>
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8 flex flex-col gap-8">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">Mensagens Recebidas</h1>
        {loading ? (
          <div className="text-white">Carregando...</div>
        ) : mensagens.length === 0 ? (
          <div className="text-neutral-400">Nenhuma mensagem recebida ainda.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {mensagens.map((msg) => (
              <div
                key={msg.id}
                className="bg-neutral-900 rounded-xl p-4 shadow border border-neutral-700"
              >
                <div className="flex items-center gap-3 mb-2">
                  {msg.status === "novo" ? (
                    <FaEnvelope className="text-yellow-400" />
                  ) : (
                    <FaEnvelopeOpenText className="text-zinc-400" />
                  )}
                  <span className="font-semibold text-lg text-yellow-300">{msg.assunto}</span>
                  <span className="ml-auto text-xs text-neutral-400">
                    {new Date(msg.dataEnvio).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <div className="text-white mb-1">
                  <b>De:</b> {msg.nome} ({msg.email}
                  {msg.telefone ? ` | ${msg.telefone}` : ""})
                </div>
                <div className="text-white mb-3">{msg.mensagem}</div>
                <button
                  className="text-yellow-400 flex items-center gap-2 hover:underline"
                  onClick={() => window.open(`mailto:${msg.email}`, "_blank")}
                >
                  <FaReply /> Responder
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
