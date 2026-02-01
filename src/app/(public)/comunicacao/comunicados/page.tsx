"use client";

import Head from "next/head";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notificacao } from "@/types/notificacao";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const isComunicado = (notif: Notificacao) => {
  const rawType = (notif.type || notif.tipo || "").toString().toLowerCase();
  const meta = (notif.metadata || {}) as Record<string, unknown>;
  const templateId = (notif.templateId || (meta.templateId as string | undefined) || "")
    .toString()
    .toLowerCase();
  const category = (meta.category || meta.categoria || "").toString().toLowerCase();

  if (rawType.includes("comunicado")) return true;
  if (templateId.includes("official-communication") || templateId.includes("system-release"))
    return true;
  if (category.includes("comunic")) return true;
  return false;
};

const resolveAuthor = (notif: Notificacao) => {
  const meta = (notif.metadata || {}) as Record<string, unknown>;
  return (
    (notif.remetente as string) ||
    (meta.nomeResponsavel as string) ||
    (meta.autor as string) ||
    "Administracao"
  );
};

export default function ComunicadosPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { publicHref } = usePublicLinks();
  const { notificacoes, isLoading, isError, error } = useNotifications({
    enabled: isAuthenticated,
  });

  const comunicados = useMemo(() => notificacoes.filter(isComunicado), [notificacoes]);

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
          <h1 className="text-2xl font-bold text-brand mb-2">Comunicados Oficiais</h1>
          <p className="text-gray-300 mb-4">Entre para acessar os comunicados do seu racha.</p>
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

  return (
    <>
      <Head>
        <title>Comunicados | Fut7Pro</title>
        <meta
          name="description"
          content="Veja comunicados e avisos oficiais publicados pela administração do seu racha."
        />
      </Head>
      <main className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto px-4">
        <h1 className="text-xl font-bold text-zinc-100 mb-4">Comunicados Oficiais</h1>
        <ul className="space-y-4">
          {isLoading ? (
            <li className="text-zinc-400 text-center">Carregando...</li>
          ) : isError ? (
            <li className="text-red-400 text-center">
              Falha ao carregar comunicados.
              {error && <div className="text-xs text-red-300 mt-2">{String(error)}</div>}
            </li>
          ) : comunicados.length === 0 ? (
            <li className="text-zinc-400 text-center">Nenhum comunicado ativo.</li>
          ) : (
            comunicados.map((comunicado) => {
              const dataLabel = comunicado.data
                ? new Date(comunicado.data).toLocaleDateString("pt-BR")
                : "";
              const title = comunicado.titulo || comunicado.title || "Comunicado";
              const message = comunicado.mensagem || comunicado.message || "";
              const author = resolveAuthor(comunicado);

              return (
                <li
                  key={comunicado.id}
                  className="bg-zinc-800 rounded-lg p-4 text-zinc-100 border-l-4 border-brand"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-brand-soft">{title}</span>
                    <span className="text-xs text-gray-400">{dataLabel}</span>
                  </div>
                  <div className="mt-1">{message}</div>
                  <div className="text-xs text-gray-400 mt-2">
                    Publicado por <span className="font-semibold">{author}</span>
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
