"use client";

import React, { useMemo, useState } from "react";
import Head from "next/head";
import { FaEye, FaCopy, FaTrash, FaRedo, FaPlus } from "react-icons/fa";
import { ModalNovaNotificacao } from "@/components/superadmin/ModalNovaNotificacao";
import { ModalNotificacaoPreview } from "@/components/superadmin/ModalNotificacaoPreview";
import { useSuperadminNotifications } from "@/hooks/useSuperadminNotifications";
import type { SuperadminNotification } from "@/types/superadmin";

const tiposNotificacao = [
  "Cobrança/Financeiro",
  "Renovação de Plano",
  "Upgrade de Plano",
  "Promoções e Ofertas",
  "Gamificação e Conquistas",
  "Atualizações de Sistema",
  "Onboarding/Boas-vindas",
  "Alertas de Segurança",
  "Relatórios e Desempenho",
  "Novidades/Novos Recursos",
  "Suporte/Ajuda",
  "Eventos e Torneios",
  "Parcerias e Patrocínios",
  "Avisos Institucionais",
];

export default function SuperAdminNotificacoesPage() {
  const { notificacoes, isLoading, error, refresh } = useSuperadminNotifications();
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [destino, setDestino] = useState("todos");
  const [tipo, setTipo] = useState("todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [notificacaoPreview, setNotificacaoPreview] = useState<SuperadminNotification | null>(null);

  const notificacoesFiltradas = useMemo(() => {
    const query = busca.trim().toLowerCase();
    return notificacoes.filter((n) => {
      const matchBusca =
        query.length === 0 ||
        n.mensagem.toLowerCase().includes(query) ||
        n.titulo.toLowerCase().includes(query);
      const matchStatus = status === "todos" || n.status.toLowerCase() === status.toLowerCase();
      const matchDestino = destino === "todos" || n.destino === destino;
      const matchTipo = tipo === "todos" || n.tipo === tipo;
      return matchBusca && matchStatus && matchDestino && matchTipo;
    });
  }, [notificacoes, busca, status, destino, tipo]);

  return (
    <>
      <Head>
        <title>Notificações e Mensagens em Massa - Fut7Pro SuperAdmin</title>
        <meta
          name="description"
          content="Controle e envie notificações para os administradores dos rachas cadastrados no Fut7Pro."
        />
      </Head>
      <div className="px-4 py-6 md:px-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
            Notificações e mensagens em massa
          </h1>
          <div className="flex items-center gap-3">
            {error ? (
              <span className="text-sm text-red-400">Erro ao carregar notificações</span>
            ) : null}
            <button
              className="flex items-center gap-2 bg-zinc-800 text-zinc-100 font-semibold px-4 py-2 rounded-xl hover:bg-zinc-700 transition"
              onClick={() => refresh()}
              disabled={isLoading}
            >
              <FaRedo /> Atualizar
            </button>
            <button
              className="flex items-center gap-2 bg-yellow-400 text-zinc-900 font-semibold px-4 py-2 rounded-xl hover:bg-yellow-300 transition"
              onClick={() => setModalAberto(true)}
              aria-label="Nova Notificação"
            >
              <FaPlus /> Nova notificação
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            className="w-full md:w-1/3 px-3 py-2 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 focus:outline-none"
            placeholder="Buscar mensagem..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar mensagem"
          />
          <select
            className="bg-zinc-800 text-zinc-100 rounded px-3 py-2 border border-zinc-700"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filtrar status"
          >
            <option value="todos">Status: Todos</option>
            <option value="enviado">Enviado</option>
            <option value="erro">Erro</option>
            <option value="pendente">Pendente</option>
          </select>
          <select
            className="bg-zinc-800 text-zinc-100 rounded px-3 py-2 border border-zinc-700"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            aria-label="Filtrar destino"
          >
            <option value="todos">Destino: Todos</option>
            <option value="Todos">Todos</option>
            <option value="Presidentes">Presidentes</option>
            <option value="Inadimplentes">Inadimplentes</option>
          </select>
          <select
            className="bg-zinc-800 text-zinc-100 rounded px-3 py-2 border border-zinc-700"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            aria-label="Filtrar tipo"
          >
            <option value="todos">Tipo: Todos</option>
            {tiposNotificacao.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl shadow-lg bg-zinc-900">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-950/70 text-zinc-300 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Mensagem</th>
                <th className="px-4 py-3 text-left">Destino</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Enviado por</th>
                <th className="px-4 py-3 text-left">Criado em</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-zinc-400">
                    Carregando notificações...
                  </td>
                </tr>
              ) : notificacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-zinc-400">
                    Nenhuma notificação encontrada.
                  </td>
                </tr>
              ) : (
                notificacoesFiltradas.map((notificacao) => (
                  <tr key={notificacao.id} className="hover:bg-zinc-800/70 transition-colors">
                    <td className="px-4 py-3 font-semibold">{notificacao.titulo}</td>
                    <td className="px-4 py-3 text-zinc-300">
                      {notificacao.mensagem.length > 80
                        ? `${notificacao.mensagem.slice(0, 80)}...`
                        : notificacao.mensagem}
                    </td>
                    <td className="px-4 py-3">{notificacao.destino}</td>
                    <td className="px-4 py-3">{notificacao.tipo}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full bg-green-900/60 text-green-200 text-xs font-semibold">
                        {notificacao.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{notificacao.enviadoPor}</td>
                    <td className="px-4 py-3 text-zinc-200">
                      {new Date(notificacao.criadoEm).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700"
                          onClick={() => setNotificacaoPreview(notificacao)}
                          aria-label="Visualizar notificação"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700"
                          aria-label="Duplicar"
                        >
                          <FaCopy />
                        </button>
                        <button
                          className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700"
                          aria-label="Excluir"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <ModalNovaNotificacao open={modalAberto} onClose={() => setModalAberto(false)} />
        {notificacaoPreview ? (
          <ModalNotificacaoPreview
            notificacao={notificacaoPreview as unknown as any}
            onClose={() => setNotificacaoPreview(null)}
          />
        ) : null}
      </div>
    </>
  );
}
