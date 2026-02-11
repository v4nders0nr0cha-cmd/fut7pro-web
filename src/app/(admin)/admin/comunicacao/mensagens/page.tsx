"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { FaEnvelopeOpenText, FaReply } from "react-icons/fa";

type ContactMessage = {
  id: string;
  slug?: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  createdAt?: string;
};

export default function MensagensAdminPage() {
  const [mensagens, setMensagens] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sortedMessages = useMemo(() => {
    return [...mensagens].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [mensagens]);

  useEffect(() => {
    let active = true;

    async function fetchMensagens() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/contact/messages?limit=200", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Erro ao carregar mensagens");
        }
        const data = await response.json();
        const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
        if (active) {
          setMensagens(list);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Erro ao carregar mensagens");
          setMensagens([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchMensagens();
    return () => {
      active = false;
    };
  }, []);

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
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : mensagens.length === 0 ? (
          <div className="text-neutral-400">Nenhuma mensagem recebida ainda.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedMessages.map((msg) => (
              <div
                key={msg.id}
                className="bg-neutral-900 rounded-xl p-4 shadow border border-neutral-700"
              >
                <div className="flex items-center gap-3 mb-2">
                  <FaEnvelopeOpenText className="text-zinc-400" />
                  <span className="font-semibold text-lg text-yellow-300">{msg.subject}</span>
                  <span className="ml-auto text-xs text-neutral-400">
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "--"}
                  </span>
                </div>
                <div className="text-white mb-1">
                  <b>De:</b> {msg.name} ({msg.email}
                  {msg.phone ? ` | ${msg.phone}` : ""})
                </div>
                <div className="text-white mb-3">{msg.message}</div>
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
