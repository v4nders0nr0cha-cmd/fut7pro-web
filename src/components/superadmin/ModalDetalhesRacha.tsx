"use client";

import { FaInfoCircle, FaLock, FaHistory } from "react-icons/fa";
import { format } from "date-fns";

interface RachaDetalhes {
  nome: string;
  owner?: { nome: string };
  plano?: { nome: string };
  status: string;
  ativo: boolean;
  criadoEm: string;
  ultimoLogBloqueio?: {
    detalhes: string;
    criadoEm: string;
  };
  logs?: Array<{
    acao: string;
    criadoEm: string;
  }>;
}

interface ModalDetalhesRachaProps {
  racha: RachaDetalhes;
  onClose: () => void;
}

export default function ModalDetalhesRacha({
  racha,
  onClose,
}: ModalDetalhesRachaProps) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="mx-auto w-full max-w-lg rounded-xl bg-zinc-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 flex items-center gap-2 text-xl font-bold">
          <FaInfoCircle className="text-yellow-400" /> {racha.nome}
        </h3>
        <div className="mb-2 flex flex-col gap-1 text-zinc-200">
          <span>
            <b>Presidente:</b> {racha.owner?.nome || "N/A"}
          </span>
          <span>
            <b>Plano:</b> {racha.plano?.nome || "N/A"}
          </span>
          <span>
            <b>Status:</b>{" "}
            <span
              className={`rounded-full px-2 py-1 text-xs font-bold ${racha.status === "BLOQUEADO" ? "bg-red-900 text-red-200" : "bg-green-900 text-green-200"}`}
            >
              {racha.status}
            </span>
          </span>
          <span>
            <b>Ativo:</b> {racha.ativo ? "Sim" : "Não"}
          </span>
          <span>
            <b>Criado em:</b> {format(new Date(racha.criadoEm), "dd/MM/yyyy")}
          </span>
        </div>
        {racha.status === "BLOQUEADO" && (
          <div className="mt-2 flex flex-col rounded bg-red-900 bg-opacity-50 p-2">
            <span className="mb-1 flex items-center gap-1 font-bold text-red-300">
              <FaLock /> Motivo do Bloqueio:
            </span>
            <span className="text-sm text-red-100">
              {racha?.ultimoLogBloqueio?.detalhes || "Pagamento em atraso"}
            </span>
            <span className="mt-1 text-xs text-zinc-300">
              Desde:{" "}
              {racha?.ultimoLogBloqueio?.criadoEm
                ? format(
                    new Date(racha.ultimoLogBloqueio.criadoEm),
                    "dd/MM/yyyy HH:mm",
                  )
                : "--"}
            </span>
            <button
              className="mt-2 rounded bg-green-700 px-4 py-1 text-white hover:bg-green-800"
              onClick={() =>
                alert("Função de desbloquear manualmente (ação auditada)")
              }
            >
              Desbloquear manualmente
            </button>
          </div>
        )}
        <div className="mb-3 mt-2">
          <h4 className="mb-1 flex items-center gap-1 font-bold text-zinc-300">
            <FaHistory /> Histórico resumido:
          </h4>
          <ul className="space-y-1 text-xs text-zinc-400">
            {racha.logs?.map((h, i: number) => (
              <li key={i}>
                • {h.acao}{" "}
                <span className="text-zinc-600">
                  ({format(new Date(h.criadoEm), "dd/MM/yyyy HH:mm")})
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="flex-1 rounded bg-zinc-700 px-4 py-2 text-white hover:bg-zinc-900"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
