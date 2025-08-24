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

export const ModalNovaNotificacao: FC<ModalNovaNotificacaoProps> = ({
  onClose,
}) => {
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
      <div className="w-full max-w-md rounded-xl bg-zinc-900 p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-yellow-400">
          Nova Notificação
        </h2>
        <textarea
          className="mb-3 h-24 w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-zinc-100"
          placeholder="Digite a mensagem..."
          maxLength={200}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
        />
        <select
          className="mb-4 w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-zinc-100"
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
          className="mb-4 w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-zinc-100"
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
            className="rounded bg-zinc-800 px-4 py-2 text-zinc-100 transition hover:bg-zinc-700"
            disabled={enviando}
          >
            Cancelar
          </button>
          <button
            onClick={handleEnviar}
            className="rounded bg-yellow-400 px-4 py-2 font-bold text-zinc-900 transition hover:bg-yellow-300 disabled:opacity-60"
            disabled={!mensagem || enviando}
          >
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
};
