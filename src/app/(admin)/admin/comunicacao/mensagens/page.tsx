"use client";

import { useMemo, useState } from "react";
import Head from "next/head";
import { FaEnvelopeOpenText, FaEnvelope, FaReply, FaSearch } from "react-icons/fa";
import type { MensagemContato } from "@/types/mensagem";
import { useContactMessages } from "@/hooks/useContactMessages";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "Data indispon\u00edvel";
  }
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MensagensAdminPage() {
  const [search, setSearch] = useState("");
  const { mensagens, isLoading, isError, error } = useContactMessages({ limit: 150 });

  const mensagensFiltradas: MensagemContato[] = useMemo(() => {
    if (!search.trim()) {
      return mensagens;
    }
    const term = search.trim().toLowerCase();
    return mensagens.filter(
      (msg) =>
        msg.nome.toLowerCase().includes(term) ||
        msg.email.toLowerCase().includes(term) ||
        msg.assunto.toLowerCase().includes(term) ||
        msg.mensagem.toLowerCase().includes(term)
    );
  }, [mensagens, search]);

  return (
    <>
      <Head>
        <title>Mensagens Recebidas | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Visualize e responda as mensagens enviadas pelos atletas e pelo SuperAdmin no painel administrativo do Fut7Pro."
        />
        <meta
          name="keywords"
          content="fut7, mensagens, painel admin, comunica\u00e7\u00e3o, SaaS"
        />
      </Head>
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8 flex flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">Mensagens Recebidas</h1>
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500" />
            <input
              type="search"
              placeholder="Filtrar por nome, assunto ou e-mail"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-white">Carregando...</div>
        ) : isError ? (
          <div className="text-red-400">
            {error || "Falha ao carregar mensagens. Tente novamente em instantes."}
          </div>
        ) : mensagensFiltradas.length === 0 ? (
          <div className="text-neutral-400">
            {mensagens.length === 0
              ? "Nenhuma mensagem recebida ainda."
              : "Nenhuma mensagem encontrada para o filtro aplicado."}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {mensagensFiltradas.map((msg) => (
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
                    {formatDate(msg.dataEnvio)}
                  </span>
                </div>
                <div className="text-white mb-1">
                  <b>De:</b> {msg.nome} ({msg.email}
                  {msg.telefone ? ` | ${msg.telefone}` : ""})
                </div>
                <div className="text-white mb-3 whitespace-pre-wrap">{msg.mensagem}</div>
                <button
                  className="text-yellow-400 flex items-center gap-2 hover:underline"
                  onClick={() =>
                    window.open(
                      `mailto:${msg.email}?subject=${encodeURIComponent(msg.assunto)}`,
                      "_blank"
                    )
                  }
                >
                  <FaReply aria-hidden /> Responder
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
