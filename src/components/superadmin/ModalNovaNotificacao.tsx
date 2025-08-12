"use client";

import React, { useState } from "react";
import type { FC } from "react";
import type { NotificacaoTipo } from "@/types/notificacao";

interface ModalNovaNotificacaoProps {
  onClose: () => void;
}

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

export const ModalNovaNotificacao: FC<ModalNovaNotificacaoProps> = ({ onClose }) => {
  const [mensagem, setMensagem] = useState<string>("");
  const [destino, setDestino] = useState<string>("Todos");
  const [tipo, setTipo] = useState<NotificacaoTipo>("Atualizações de Sistema");
  const [enviando, setEnviando] = useState<boolean>(false);

  function handleEnviar() {
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      onClose();
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Nova Notificação</h2>
        <textarea
          className="w-full h-24 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 mb-3 p-2"
          placeholder="Digite a mensagem..."
          maxLength={200}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
        />
        <select
          className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 mb-4 p-2"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as NotificacaoTipo)}
        >
          {tiposNotificacao.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 mb-4 p-2"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
        >
          <option value="Todos">Todos Admins</option>
          <option value="Rachas Mensal">Presidentes Ativos</option>
          <option value="Novos Admin">Novos</option>
        </select>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition"
            disabled={enviando}
          >
            Cancelar
          </button>
          <button
            onClick={handleEnviar}
            className="px-4 py-2 rounded bg-yellow-400 text-zinc-900 font-bold hover:bg-yellow-300 transition disabled:opacity-60"
            disabled={!mensagem || enviando}
          >
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
};
