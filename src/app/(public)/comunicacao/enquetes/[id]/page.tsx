"use client";

import Head from "next/head";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaPoll } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notificacao } from "@/types/notificacao";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const isEnquete = (notif: Notificacao) => {
  const rawType = (notif.type || notif.tipo || "").toString().toLowerCase();
  const meta = (notif.metadata || {}) as Record<string, unknown>;
  if (rawType.includes("enquete") || rawType.includes("poll")) return true;
  if ("opcoes" in meta || "options" in meta || "pollOptions" in meta) return true;
  if ((meta.kind as string | undefined)?.toLowerCase() === "enquete") return true;
  return false;
};

const matchesId = (notif: Notificacao, id: string) => {
  const meta = (notif.metadata || {}) as Record<string, unknown>;
  const values = [
    notif.id,
    notif.referenciaId,
    meta.enqueteId as string | number | undefined,
    meta.pollId as string | number | undefined,
  ].filter(Boolean);
  return values.some((value) => String(value) === id);
};

const resolveStatus = (notif: Notificacao) => {
  const meta = (notif.metadata || {}) as Record<string, unknown>;
  const status = (meta.status || meta.situacao || "").toString().toLowerCase();
  if (status === "fechada" || status === "encerrada" || status === "closed") return "Fechada";
  if (status === "aberta" || status === "open") return "Aberta";
  return "Aberta";
};

export default function EnquetePage() {
  const params = useParams();
  const router = useRouter();
  const enqueteId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { publicHref } = usePublicLinks();
  const { notificacoes, isLoading, isError, error } = useNotifications({
    enabled: isAuthenticated,
  });

  const enquete = useMemo(() => {
    if (!enqueteId) return undefined;
    return notificacoes.find((notif) => isEnquete(notif) && matchesId(notif, enqueteId));
  }, [notificacoes, enqueteId]);

  if (authLoading) {
    return (
      <main className="max-w-xl mx-auto px-4 pt-20 pb-24">
        <div className="text-center text-gray-400">Carregando...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="max-w-xl mx-auto px-4 pt-20 pb-24">
        <div className="bg-[#1f1f23] rounded-xl p-6 text-center">
          <h1 className="text-2xl font-bold text-brand mb-2">Enquete</h1>
          <p className="text-gray-300 mb-4">Entre para acessar esta enquete.</p>
          <button
            type="button"
            onClick={() => router.push(publicHref("/login"))}
            className="bg-brand text-black font-bold px-4 py-2 rounded hover:bg-brand-strong transition"
          >
            Fazer login
          </button>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="max-w-xl mx-auto px-4 pt-20 pb-24">
        <div className="text-center text-gray-400">Carregando...</div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="max-w-xl mx-auto px-4 pt-20 pb-24">
        <div className="text-center text-red-400">
          Falha ao carregar a enquete.
          {error && <div className="text-xs text-red-300 mt-2">{String(error)}</div>}
        </div>
      </main>
    );
  }

  if (!enquete) {
    return (
      <main className="max-w-xl mx-auto px-4 pt-20 pb-24">
        <div className="text-center text-gray-400">Enquete nao encontrada.</div>
      </main>
    );
  }

  const meta = (enquete.metadata || {}) as Record<string, unknown>;
  type EnqueteOption = { texto?: string; votos?: number; text?: string; votes?: number };
  const options =
    (meta.opcoes as EnqueteOption[] | undefined) ||
    (meta.options as EnqueteOption[] | undefined) ||
    (meta.pollOptions as EnqueteOption[] | undefined) ||
    [];
  const totalVotes = Number(meta.totalVotos || meta.totalVotes || 0);
  const title = enquete.titulo || enquete.title || "Enquete";
  const description = enquete.mensagem || enquete.message || "";
  const statusLabel = resolveStatus(enquete);

  return (
    <>
      <Head>
        <title>{`Enquete | ${title}`}</title>
      </Head>
      <main className="max-w-xl mx-auto px-4 pt-20 pb-24">
        <h1 className="text-2xl font-bold text-brand mb-4 flex items-center gap-2">
          <FaPoll /> {title}
        </h1>
        {description && <div className="mb-4 text-gray-200">{description}</div>}
        <div className="text-xs text-gray-400 mb-4">Status: {statusLabel}</div>
        {options.length === 0 ? (
          <div className="text-gray-400">Aguardando opcoes da enquete.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {options.map((option, idx) => {
              const label = option.texto || option.text || `Opcao ${idx + 1}`;
              const votes = Number(option.votos ?? option.votes ?? 0);
              const percent = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;

              return (
                <div key={idx} className="flex items-center gap-2">
                  <span className="bg-[#181818] text-gray-200 rounded px-2 py-1 min-w-[80px] text-xs">
                    {label}
                  </span>
                  <div className="flex-1 bg-[#181818] rounded-full h-4 mx-2 relative">
                    <div
                      className="bg-brand h-4 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    ></div>
                    <span className="absolute left-1/2 -translate-x-1/2 top-0 text-xs text-black font-bold">
                      {percent}%
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs">{votes} votos</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-6 text-xs text-gray-500">
          Votacao via app sera habilitada quando o backend expor o fluxo de respostas.
        </div>
      </main>
    </>
  );
}
