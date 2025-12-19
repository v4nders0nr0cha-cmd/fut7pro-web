"use client";

import Head from "next/head";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notificacao } from "@/types/notificacao";

type EnqueteItem = {
  notificacao: Notificacao;
  enqueteId?: string;
  statusLabel: string;
};

const isEnquete = (notif: Notificacao) => {
  const rawType = (notif.type || notif.tipo || "").toString().toLowerCase();
  const meta = (notif.metadata || {}) as Record<string, unknown>;
  if (rawType.includes("enquete") || rawType.includes("poll")) return true;
  if ("opcoes" in meta || "options" in meta || "pollOptions" in meta) return true;
  if ((meta.kind as string | undefined)?.toLowerCase() === "enquete") return true;
  return false;
};

const resolveEnqueteId = (notif: Notificacao) => {
  const meta = (notif.metadata || {}) as Record<string, unknown>;
  const value =
    (meta.enqueteId as string | number | undefined) ||
    (meta.pollId as string | number | undefined) ||
    (notif.referenciaId as string | undefined);
  return value ? String(value) : undefined;
};

const resolveStatus = (notif: Notificacao) => {
  const meta = (notif.metadata || {}) as Record<string, unknown>;
  const status = (meta.status || meta.situacao || "").toString().toLowerCase();
  if (status === "fechada" || status === "encerrada" || status === "closed") return "Fechada";
  if (status === "aberta" || status === "open") return "Aberta";
  return "Aberta";
};

export default function EnquetesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { notificacoes, isLoading, isError, error } = useNotifications({
    enabled: isAuthenticated,
  });

  const enquetes = useMemo<EnqueteItem[]>(() => {
    return notificacoes.filter(isEnquete).map((notif) => ({
      notificacao: notif,
      enqueteId: resolveEnqueteId(notif),
      statusLabel: resolveStatus(notif),
    }));
  }, [notificacoes]);

  if (authLoading) {
    return (
      <main className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto px-4">
        <div className="text-center text-gray-400">Carregando...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto px-4">
        <div className="bg-[#1f1f23] rounded-xl p-6 text-center">
          <h1 className="text-2xl font-bold text-yellow-400 mb-2">Enquetes</h1>
          <p className="text-gray-300 mb-4">Entre para participar das enquetes do seu racha.</p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="bg-yellow-400 text-black font-bold px-4 py-2 rounded hover:bg-yellow-500 transition"
          >
            Fazer login
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Enquetes | Fut7Pro</title>
        <meta name="description" content="Participe das enquetes do seu racha." />
      </Head>
      <main className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto w-full px-3">
        <h1 className="text-xl font-bold text-zinc-100 mb-4">Enquetes</h1>
        <ul className="space-y-6">
          {isLoading ? (
            <li className="text-center text-zinc-400">Carregando...</li>
          ) : isError ? (
            <li className="text-center text-red-400">
              Falha ao carregar enquetes.
              {error && <div className="text-xs text-red-300 mt-2">{String(error)}</div>}
            </li>
          ) : enquetes.length === 0 ? (
            <li className="text-zinc-400 text-center">Nenhuma enquete disponivel no momento.</li>
          ) : (
            enquetes.map((item) => {
              const { notificacao, enqueteId, statusLabel } = item;
              const title = notificacao.titulo || notificacao.title || "Enquete";
              const description = notificacao.mensagem || notificacao.message || "";

              return (
                <li
                  key={notificacao.id}
                  className="bg-zinc-800 rounded-lg p-4 border-l-4 border-yellow-400"
                >
                  <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
                    <span className="text-lg font-bold text-yellow-300">{title}</span>
                    <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-800 text-yellow-300">
                      {statusLabel}
                    </span>
                  </div>
                  {description && <div className="text-gray-200 mb-3">{description}</div>}
                  <div className="flex items-center gap-2">
                    {enqueteId ? (
                      <button
                        type="button"
                        onClick={() => router.push(`/comunicacao/enquetes/${enqueteId}`)}
                        className="bg-yellow-400 text-zinc-900 rounded px-3 py-1 font-semibold hover:bg-yellow-500 transition"
                      >
                        Ver detalhes
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Aguardando detalhes da enquete.</span>
                    )}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </main>
    </>
  );
}
