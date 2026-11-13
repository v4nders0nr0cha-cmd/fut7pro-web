"use client";

import { useState } from "react";
import { FaLock, FaHistory } from "react-icons/fa";
import { format } from "date-fns";
import { getRachaTheme } from "@/config/rachaThemes";
import { showFut7Toast } from "@/components/ui/feedback";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";

interface RachaDetalhes {
  id: string;
  nome: string;
  presidente?: string | null;
  plano?: string | null;
  status: string;
  ativo?: boolean;
  criadoEm?: string | null;
  themeKey?: string | null;
  ultimoLogBloqueio?: {
    detalhes?: string | null;
    criadoEm?: string | null;
  } | null;
  historico?: Array<{
    acao: string;
    criadoEm?: string | null;
  }>;
}

interface ModalDetalhesRachaProps {
  racha: RachaDetalhes;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function ModalDetalhesRacha({ racha, onClose, onRefresh }: ModalDetalhesRachaProps) {
  const [isUnblocking, setIsUnblocking] = useState(false);

  const statusClass =
    racha.status === "BLOQUEADO"
      ? "bg-red-900 text-red-200"
      : racha.status === "TRIAL"
        ? "bg-yellow-900 text-yellow-200"
        : racha.status === "TRIAL_EXPIRADO" || racha.status === "SEM_CONVERSAO"
          ? "bg-amber-900 text-amber-100"
          : racha.status === "INADIMPLENTE" || racha.status === "INADIMPLENTE_COM_HISTORICO"
            ? "bg-red-800 text-red-200"
            : "bg-green-900 text-green-200";

  const plano =
    racha.plano ||
    (racha.status === "TRIAL" || racha.status === "TRIAL_EXPIRADO" ? "Trial" : "Plano n/d");
  const criadoEm = racha.criadoEm ? format(new Date(racha.criadoEm), "dd/MM/yyyy") : "--";
  const ativo =
    racha.ativo ??
    (racha.status === "ATIVO" ||
      racha.status === "TRIAL" ||
      racha.status === "INADIMPLENTE_COM_HISTORICO");
  const themeLabel = getRachaTheme(racha.themeKey ?? undefined).name;

  async function handleUnblock() {
    if (isUnblocking) return;
    setIsUnblocking(true);
    try {
      const resp = await fetch(`/api/superadmin/tenants/${racha.id}/unblock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: "Desbloqueio manual pelo superadmin",
          confirmed: true,
        }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Erro ao desbloquear");
      }
      onRefresh?.();
      onClose();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Falha ao desbloquear.";
      showFut7Toast({
        tone: "error",
        title: "Falha ao desbloquear racha",
        message,
      });
    } finally {
      setIsUnblocking(false);
    }
  }

  return (
    <Fut7DialogBase
      open
      title={racha.nome}
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="col-span-2 rounded-xl border border-white/15 px-5 py-2.5 font-semibold text-white hover:bg-white/10"
        >
          Fechar
        </button>
      }
    >
      <div className="flex flex-col gap-1 mb-2 text-zinc-200">
        <span>
          <b>Presidente:</b> {racha.presidente || "N/A"}
        </span>
        <span>
          <b>Plano:</b> {plano}
        </span>
        <span>
          <b>Status:</b>{" "}
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusClass}`}>
            {racha.status}
          </span>
        </span>
        <span>
          <b>Ativo:</b> {ativo ? "Sim" : "Não"}
        </span>
        <span>
          <b>Tema:</b> {themeLabel}
        </span>
        <span>
          <b>Criado em:</b> {criadoEm}
        </span>
      </div>
      {racha.status === "BLOQUEADO" && (
        <div className="bg-red-900 bg-opacity-50 p-2 rounded mt-2 flex flex-col">
          <span className="font-bold text-red-300 mb-1 flex items-center gap-1">
            <FaLock /> Motivo do Bloqueio:
          </span>
          <span className="text-red-100 text-sm">
            {racha?.ultimoLogBloqueio?.detalhes || "Pagamento em atraso"}
          </span>
          <span className="text-xs text-zinc-300 mt-1">
            Desde:{" "}
            {racha?.ultimoLogBloqueio?.criadoEm
              ? format(new Date(racha.ultimoLogBloqueio.criadoEm), "dd/MM/yyyy HH:mm")
              : "--"}
          </span>
          <button
            className="mt-2 bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleUnblock}
            disabled={isUnblocking}
          >
            {isUnblocking ? "Desbloqueando..." : "Desbloquear manualmente"}
          </button>
        </div>
      )}
      <div className="mb-3 mt-2">
        <h4 className="font-bold text-zinc-300 mb-1 flex items-center gap-1">
          <FaHistory /> Histórico resumido:
        </h4>
        <ul className="text-xs text-zinc-400 space-y-1">
          {racha.historico?.map((h, i: number) => (
            <li key={i}>
              • {h.acao}{" "}
              <span className="text-zinc-600">
                {h.criadoEm ? `(${format(new Date(h.criadoEm), "dd/MM/yyyy HH:mm")})` : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Fut7DialogBase>
  );
}
