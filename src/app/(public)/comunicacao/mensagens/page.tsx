"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCommentDots } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { usePublicNotifications } from "@/hooks/usePublicNotifications";
import type { Notificacao } from "@/types/notificacao";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import EnquetesList from "@/components/public/EnquetesList";

const isMensagem = (notif: Notificacao) => {
  const rawType = (notif.type || notif.tipo || "").toString().toLowerCase();
  const meta = (notif.metadata || {}) as Record<string, unknown>;
  const category = (meta.category || meta.categoria || "").toString().toLowerCase();
  const templateId = (notif.templateId || (meta.templateId as string | undefined) || "")
    .toString()
    .toLowerCase();

  if (rawType.includes("mensagem") || rawType.includes("message")) return true;
  if (category.includes("mensagem") || category.includes("message")) return true;
  if (templateId.includes("direct-message") || templateId.includes("admin-message")) return true;
  return false;
};

const resolveAuthor = (notif: Notificacao) => {
  const meta = (notif.metadata || {}) as Record<string, unknown>;
  return (
    (notif.remetente as string) ||
    (meta.autor as string) ||
    (meta.nomeResponsavel as string) ||
    "Administração"
  );
};

export default function MensagensPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { publicHref } = usePublicLinks();
  const { notificacoes, isLoading, isError, error, markAsRead } = usePublicNotifications({
    enabled: isAuthenticated,
  });
  const [activeTab, setActiveTab] = useState<"mensagens" | "enquetes">("mensagens");

  const mensagens = useMemo(() => notificacoes.filter(isMensagem), [notificacoes]);

  const handleClick = async (notif: Notificacao) => {
    if (!notif.lida) {
      await markAsRead(notif.id);
    }
  };

  if (authLoading) {
    return (
      <main className="max-w-2xl mx-auto px-4 pt-20 pb-24">
        <div className="text-center text-gray-400">Carregando...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="max-w-2xl mx-auto px-4 pt-20 pb-24">
        <div className="bg-[#1f1f23] rounded-xl p-6 text-center">
          <h1 className="text-2xl font-bold text-brand mb-2">Mensagens do Admin</h1>
          <p className="text-gray-300 mb-4">Entre para ver as mensagens do seu racha.</p>
          <button
            type="button"
            onClick={() => router.push(publicHref("/entrar"))}
            className="bg-brand text-black font-bold px-4 py-2 rounded hover:bg-brand-strong transition"
          >
            Fazer login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 pt-20 pb-24">
      <h1 className="text-2xl font-bold text-brand mb-5 flex items-center gap-2">
        <FaCommentDots /> Mensagens do Admin
      </h1>
      <div className="flex gap-3 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab("mensagens")}
          className={`px-4 py-2 rounded text-sm font-semibold ${
            activeTab === "mensagens"
              ? "bg-brand text-black"
              : "bg-zinc-800 text-gray-200 hover:bg-zinc-700"
          }`}
        >
          Mensagens
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("enquetes")}
          className={`px-4 py-2 rounded text-sm font-semibold ${
            activeTab === "enquetes"
              ? "bg-brand text-black"
              : "bg-zinc-800 text-gray-200 hover:bg-zinc-700"
          }`}
        >
          Enquetes
        </button>
      </div>

      {activeTab === "mensagens" ? (
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="text-center text-gray-400">Carregando...</div>
          ) : isError ? (
            <div className="text-center text-red-400">
              Falha ao carregar mensagens.
              {error && <div className="text-xs text-red-300 mt-2">{String(error)}</div>}
            </div>
          ) : mensagens.length === 0 ? (
            <div className="text-center text-gray-400">Nenhuma mensagem encontrada.</div>
          ) : (
            mensagens.map((msg) => {
              const dataLabel = msg.data ? new Date(msg.data).toLocaleString("pt-BR") : "";
              const title = msg.assunto || msg.titulo || msg.title || "Mensagem";
              const message = msg.mensagem || msg.message || "";
              const author = resolveAuthor(msg);

              return (
                <div
                  key={msg.id}
                  className={`rounded-lg p-4 shadow border-l-4 transition cursor-pointer ${
                    msg.lida ? "bg-zinc-900 border-zinc-700 opacity-70" : "bg-zinc-900 border-brand"
                  }`}
                  onClick={() => handleClick(msg)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-brand-soft">{title}</div>
                    <span className="text-xs text-gray-400">{dataLabel}</span>
                  </div>
                  <div className="text-gray-200">{message}</div>
                  <div className="text-xs text-gray-400 mt-2">
                    Enviado por <span className="font-semibold">{author}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <EnquetesList enabled={isAuthenticated} compact />
      )}
    </main>
  );
}
