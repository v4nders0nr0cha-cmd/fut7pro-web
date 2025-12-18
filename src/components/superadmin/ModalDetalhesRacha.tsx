"use client";

import { FaInfoCircle, FaLock, FaHistory } from "react-icons/fa";
import { format } from "date-fns";

interface RachaDetalhes {
  nome: string;
  presidente?: string | null;
  plano?: string | null;
  status: string;
  ativo?: boolean;
  criadoEm?: string | null;
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
}

export default function ModalDetalhesRacha({ racha, onClose }: ModalDetalhesRachaProps) {
  const statusClass =
    racha.status === "BLOQUEADO"
      ? "bg-red-900 text-red-200"
      : racha.status === "TRIAL"
        ? "bg-yellow-900 text-yellow-200"
        : racha.status === "INADIMPLENTE"
          ? "bg-red-800 text-red-200"
          : "bg-green-900 text-green-200";

  const plano = racha.plano || (racha.status === "TRIAL" ? "Trial (30 dias)" : "Plano n/d");
  const criadoEm = racha.criadoEm ? format(new Date(racha.criadoEm), "dd/MM/yyyy") : "--";
  const ativo = racha.ativo ?? (racha.status === "ATIVO" || racha.status === "TRIAL");

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-xl shadow-xl p-6 w-full max-w-lg mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <FaInfoCircle className="text-yellow-400" /> {racha.nome}
        </h3>
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
            <b>Ativo:</b> {ativo ? "Sim" : "Nao"}
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
              className="mt-2 bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800"
              onClick={() => alert("Funcao de desbloquear depende do endpoint do backend.")}
            >
              Desbloquear manualmente
            </button>
          </div>
        )}
        <div className="mb-3 mt-2">
          <h4 className="font-bold text-zinc-300 mb-1 flex items-center gap-1">
            <FaHistory /> Historico resumido:
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
        <div className="mt-3 flex gap-2 flex-wrap">
          <button
            className="bg-zinc-700 text-white px-4 py-2 rounded hover:bg-zinc-900 flex-1"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
