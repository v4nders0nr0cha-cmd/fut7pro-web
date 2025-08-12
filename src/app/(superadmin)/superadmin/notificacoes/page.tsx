"use client";

import React, { useState } from "react";
import Head from "next/head";
import { FaEye, FaCopy, FaTrash, FaRedo, FaPlus } from "react-icons/fa";
import { mockNotificacoes } from "@/components/lists/mockNotificacoes";
import { ModalNovaNotificacao } from "@/components/superadmin/ModalNovaNotificacao";
import { ModalNotificacaoPreview } from "@/components/superadmin/ModalNotificacaoPreview";
import type { Notificacao, NotificacaoTipo } from "@/types/notificacao";

const tiposNotificacao: NotificacaoTipo[] = [
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
  const [busca, setBusca] = useState<string>("");
  const [status, setStatus] = useState<string>("todos");
  const [destino, setDestino] = useState<string>("todos");
  const [tipo, setTipo] = useState<string>("todos");
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [notificacaoPreview, setNotificacaoPreview] = useState<Notificacao | null>(null);

  const notificacoesFiltradas = mockNotificacoes.filter((n: Notificacao) => {
    const buscaLower = busca.toLowerCase();
    return (
      (busca === "" || n.mensagem.toLowerCase().includes(buscaLower)) &&
      (status === "todos" || n.status === status) &&
      (destino === "todos" || n.destino === destino) &&
      (tipo === "todos" || n.tipo === tipo)
    );
  });

  return (
    <>
      <Head>
        <title>Notificações e Mensagens em Massa – Fut7Pro SuperAdmin</title>
        <meta
          name="description"
          content="Controle e envie notificações para todos os administradores dos rachas cadastrados no Fut7Pro. Ferramenta profissional de comunicação em massa para SaaS."
        />
        <meta
          name="keywords"
          content="notificações, mensagens em massa, SaaS, comunicação, admins, Fut7Pro"
        />
      </Head>
      <div className="px-4 py-6 md:px-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
            Notificações e Mensagens em Massa
          </h1>
          <button
            className="flex items-center gap-2 bg-yellow-400 text-zinc-900 font-semibold px-4 py-2 rounded-xl hover:bg-yellow-300 transition"
            onClick={() => setModalAberto(true)}
            aria-label="Nova Notificação"
          >
            <FaPlus /> Nova Notificação
          </button>
        </div>

        {/* Filtros */}
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
            <option value="Todos">Todos Admins</option>
            <option value="Rachas Mensal">Presidentes Ativos</option>
            <option value="Novos Admin">Novos</option>
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

        {/* Lista de Notificações */}
        <div className="overflow-x-auto rounded-xl shadow-lg bg-zinc-900">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3">Mensagem</th>
                <th className="px-2 py-3">Tipo</th>
                <th className="px-2 py-3">Data/Hora</th>
                <th className="px-2 py-3">Destino</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Enviado por</th>
                <th className="px-2 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {notificacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-zinc-500">
                    Nenhuma notificação encontrada.
                  </td>
                </tr>
              ) : (
                notificacoesFiltradas.map((n: Notificacao, i: number) => (
                  <tr key={n.id} className="hover:bg-zinc-800">
                    <td className="px-4 py-3 max-w-xs truncate">
                      <button
                        onClick={() => setNotificacaoPreview(n)}
                        className="hover:underline text-yellow-400"
                      >
                        {n.mensagem}
                      </button>
                    </td>
                    <td className="px-2 py-3">{n.tipo}</td>
                    <td className="px-2 py-3">{n.data}</td>
                    <td className="px-2 py-3">{n.destino}</td>
                    <td
                      className={`px-2 py-3 font-bold ${
                        n.status === "enviado"
                          ? "text-green-400"
                          : n.status === "erro"
                            ? "text-red-400"
                            : "text-yellow-300"
                      }`}
                    >
                      {n.status.charAt(0).toUpperCase() + n.status.slice(1)}
                    </td>
                    <td className="px-2 py-3">{n.enviadoPor}</td>
                    <td className="px-2 py-3 flex gap-2">
                      <button
                        onClick={() => setNotificacaoPreview(n)}
                        aria-label="Ver mensagem"
                        title="Ver mensagem"
                      >
                        <FaEye />
                      </button>
                      <button aria-label="Duplicar" title="Duplicar">
                        <FaCopy />
                      </button>
                      <button aria-label="Reenviar" title="Reenviar">
                        <FaRedo />
                      </button>
                      <button aria-label="Excluir" title="Excluir" className="text-red-500">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de Preview/Nova Notificação */}
        {modalAberto && <ModalNovaNotificacao onClose={() => setModalAberto(false)} />}
        {notificacaoPreview && (
          <ModalNotificacaoPreview
            notificacao={notificacaoPreview}
            onClose={() => setNotificacaoPreview(null)}
          />
        )}
      </div>
    </>
  );
}
