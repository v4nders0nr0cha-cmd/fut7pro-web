"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import EditorEstrelas from "./EditorEstrelas";
import type { Participante, ConfiguracaoRacha, AvaliacaoEstrela } from "@/types/sorteio";
import { FaCheckCircle, FaUserPlus } from "react-icons/fa";
import { rachaConfig } from "@/config/racha.config";

interface Props {
  tenantSlug: string | null | undefined;
  config: ConfiguracaoRacha | null;
  participantes: Participante[];
  setParticipantes: Dispatch<SetStateAction<Participante[]>>;
  todosJogadores: Participante[];
}

function buildEstrelaBase(
  tenantSlug: string | null | undefined,
  jogadorId: string,
  overrides?: Partial<AvaliacaoEstrela>
): AvaliacaoEstrela {
  return {
    id: `${tenantSlug ?? "local"}-${jogadorId}`,
    rachaId: tenantSlug ?? "",
    jogadorId,
    estrelas: 0,
    atualizadoEm: "",
    atualizadoPor: "",
    ...overrides,
  };
}

function PopoverSelecionarJogador({
  open,
  onClose,
  onSelecionar,
  listaDisponivel,
}: {
  open: boolean;
  onClose: () => void;
  onSelecionar: (id: string) => void;
  listaDisponivel: Participante[];
}) {
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    setFiltro("");
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!(e.target as HTMLElement)?.closest(".popover-atleta")) {
        onClose();
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  const filtrados = useMemo(
    () => listaDisponivel.filter((p) => p.nome.toLowerCase().includes(filtro.trim().toLowerCase())),
    [listaDisponivel, filtro]
  );

  if (!open) return null;

  return (
    <div className="popover-atleta absolute z-50 top-12 left-1/2 -translate-x-1/2 bg-[#202020] border border-yellow-400 rounded-lg p-3 shadow-2xl w-[240px]">
      <input
        className="w-full mb-2 p-1 rounded bg-zinc-900 text-white text-sm"
        placeholder="Buscar atleta..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        tabIndex={-1}
      />
      <div className="max-h-52 overflow-y-auto space-y-1">
        {filtrados.length === 0 && (
          <div className="text-xs text-center text-gray-400">Nenhum atleta dispon�vel</div>
        )}
        {filtrados.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-yellow-100 hover:text-black transition"
            onClick={() => {
              onSelecionar(p.id);
              onClose();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSelecionar(p.id);
                onClose();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Selecionar ${p.nome}`}
          >
            <Image
              src={p.foto}
              alt={`Foto de ${p.nome}, posi��o: ${p.posicao}, ${rachaConfig.nome}`}
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="flex-1 truncate text-sm">{p.nome}</span>
            <span className="text-xs text-yellow-600 font-bold">{p.posicao}</span>
          </div>
        ))}
      </div>
      <button
        className="mt-2 block mx-auto px-4 py-1 text-xs text-yellow-500 border border-yellow-400 rounded hover:bg-yellow-400 hover:text-black transition"
        onClick={onClose}
        tabIndex={-1}
      >
        Cancelar
      </button>
    </div>
  );
}

export default function ParticipantesRacha({
  tenantSlug,
  config,
  participantes,
  setParticipantes,
  todosJogadores,
}: Props) {
  const [estrelasGlobais, setEstrelasGlobais] = useState<Record<string, AvaliacaoEstrela>>({});
  const [loadingEstrelas, setLoadingEstrelas] = useState(false);
  const [popoverIndex, setPopoverIndex] = useState<number | null>(null);

  const storageKey =
    tenantSlug && tenantSlug.length > 0 ? `fut7pro_sorteio_estrelas_${tenantSlug}` : null;

  const maxParticipantes =
    config?.numTimes && config?.jogadoresPorTime ? config.numTimes * config.jogadoresPorTime : 0;

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!storageKey) {
      setEstrelasGlobais({});
      return;
    }

    setLoadingEstrelas(true);
    try {
      const raw = window.localStorage.getItem(storageKey);
      const stored =
        raw && raw.length > 0
          ? (JSON.parse(raw) as Record<string, AvaliacaoEstrela>)
          : ({} as Record<string, AvaliacaoEstrela>);

      setEstrelasGlobais(stored);
      setParticipantes((prev) =>
        prev.map((p) => ({
          ...p,
          estrelas:
            stored[p.id] ??
            buildEstrelaBase(tenantSlug, p.id, {
              estrelas: stored[p.id]?.estrelas ?? p.estrelas?.estrelas ?? 0,
              atualizadoEm: stored[p.id]?.atualizadoEm ?? p.estrelas?.atualizadoEm ?? "",
              atualizadoPor: stored[p.id]?.atualizadoPor ?? p.estrelas?.atualizadoPor ?? "",
            }),
        }))
      );
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.log("Falha ao carregar estrelas locais:", error);
      }
      setEstrelasGlobais({});
    } finally {
      setLoadingEstrelas(false);
    }
  }, [storageKey, setParticipantes, tenantSlug]);

  const atletasDisponiveis = useMemo(() => {
    const selecionadosIds = new Set(participantes.map((p) => p.id));
    return todosJogadores
      .filter((j) => !selecionadosIds.has(j.id))
      .map((j) => ({
        ...j,
        estrelas:
          estrelasGlobais[j.id] ??
          j.estrelas ??
          buildEstrelaBase(tenantSlug, j.id, { estrelas: j.estrelas?.estrelas ?? 0 }),
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [todosJogadores, participantes, estrelasGlobais, tenantSlug]);

  const vagasRestantes = Math.max(0, maxParticipantes - participantes.length);

  const updateEstrela = (jogadorId: string, valor: number) => {
    const updated = buildEstrelaBase(tenantSlug, jogadorId, {
      ...estrelasGlobais[jogadorId],
      estrelas: valor,
      atualizadoEm: new Date().toISOString(),
    });

    setEstrelasGlobais((prev) => {
      const merged = { ...prev, [jogadorId]: updated };
      if (storageKey && typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, JSON.stringify(merged));
      }
      return merged;
    });

    setParticipantes((prev) =>
      prev.map((p) =>
        p.id === jogadorId
          ? {
              ...p,
              estrelas: {
                ...(p.estrelas ?? buildEstrelaBase(tenantSlug, jogadorId)),
                estrelas: valor,
                atualizadoEm: updated.atualizadoEm,
              },
            }
          : p
      )
    );
  };

  const handleSelect = (id: string) => {
    const isSelected = participantes.some((p) => p.id === id);
    const participanteOriginal = todosJogadores.find((p) => p.id === id);

    if (isSelected) {
      setParticipantes(participantes.filter((p) => p.id !== id));
    } else if (participanteOriginal) {
      if (maxParticipantes && participantes.length >= maxParticipantes) return;
      const estrela = estrelasGlobais[id] ?? participanteOriginal.estrelas;
      setParticipantes([
        ...participantes,
        {
          ...participanteOriginal,
          estrelas:
            estrela ??
            buildEstrelaBase(tenantSlug, participanteOriginal.id, {
              estrelas: estrela?.estrelas ?? participanteOriginal.estrelas?.estrelas ?? 0,
            }),
        },
      ]);
    }
    setPopoverIndex(null);
  };

  const listSelecionados = participantes.map((p) => ({
    ...p,
    estrelas:
      p.estrelas ??
      estrelasGlobais[p.id] ??
      buildEstrelaBase(tenantSlug, p.id, { estrelas: p.estrelas?.estrelas ?? 0 }),
  }));

  function CardJogador({
    jogador,
    selecionado,
    onClick,
    children,
  }: {
    jogador: Participante;
    selecionado?: boolean;
    onClick: () => void;
    children?: React.ReactNode;
  }) {
    const estrelaAtual = estrelasGlobais[jogador.id]?.estrelas ?? jogador.estrelas?.estrelas ?? 0;

    return (
      <div
        className={`flex flex-col justify-between p-2 rounded-lg border relative min-h-[94px] shadow-sm gap-0.5 ${
          selecionado
            ? "bg-yellow-100 border-yellow-400 cursor-pointer"
            : "bg-zinc-800 border-zinc-700 cursor-pointer hover:border-yellow-500"
        }`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Image
              src={jogador.foto}
              alt={`Foto de ${jogador.nome}, posi��o: ${jogador.posicao}, ${rachaConfig.nome}`}
              width={40}
              height={40}
              className="rounded-full object-cover border border-yellow-300"
            />
            <span
              className={`text-base font-bold truncate ${selecionado ? "text-black" : "text-white"}`}
            >
              {jogador.nome}
            </span>
            {jogador.mensalista && (
              <span className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-black rounded text-xs font-semibold">
                Mensalista
              </span>
            )}
          </div>
          <div className="flex items-center">
            {selecionado ? (
              <FaCheckCircle
                className="text-green-500 text-lg drop-shadow mt-1"
                title="Selecionado"
              />
            ) : (
              children
            )}
          </div>
        </div>
        <div className="flex flex-row items-center justify-between w-full mt-1">
          <span
            className={`text-xs font-bold uppercase ${selecionado ? "text-yellow-600" : "text-yellow-400"}`}
            style={{ letterSpacing: 0, minWidth: "32px" }}
          >
            {jogador.posicao}
          </span>
          <div className="editor-estrelas flex items-center justify-center w-full min-w-[110px] max-w-[120px] mx-2">
            <EditorEstrelas
              value={estrelaAtual}
              onChange={(val) => updateEstrela(jogador.id, val)}
              disabled={!selecionado || loadingEstrelas}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-[#202020] rounded-xl p-4 mb-6 w-full">
      <h2 className="text-lg font-bold text-yellow-400 mb-2 text-center">
        Selecione os Participantes do Dia
      </h2>
      {todosJogadores.length === 0 ? (
        <div className="text-center text-sm text-gray-400 py-6">
          Nenhum atleta encontrado para este racha. Cadastre jogadores no painel para utiliz�-los no
          sorteio.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 relative z-0">
          {listSelecionados.map((jogador) => (
            <CardJogador
              key={jogador.id}
              jogador={jogador}
              selecionado
              onClick={() => handleSelect(jogador.id)}
            />
          ))}

          {Array.from({ length: vagasRestantes }).map((_, idx) => {
            const isOpen = popoverIndex === idx;
            return (
              <div
                key={`vaga-vazia-${idx}`}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border border-zinc-700 bg-zinc-900 opacity-80 cursor-pointer relative min-h-[94px] hover:border-yellow-400 group transition ${
                  isOpen ? "z-50" : "z-0"
                }`}
                onClick={() => setPopoverIndex(idx)}
                onKeyDown={(e) => e.key === "Enter" && setPopoverIndex(idx)}
                role="button"
                tabIndex={0}
                aria-label="Adicionar jogador"
              >
                <FaUserPlus className="text-gray-500 text-3xl mb-2 group-hover:text-yellow-400 transition" />
                <span className="text-xs text-gray-400 font-bold text-center">Vaga dispon�vel</span>
                <PopoverSelecionarJogador
                  open={isOpen}
                  onClose={() => setPopoverIndex(null)}
                  onSelecionar={handleSelect}
                  listaDisponivel={atletasDisponiveis}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 text-center text-xs">
        {maxParticipantes > 0 && (
          <>
            <span>
              Selecionados:{" "}
              <b
                className={
                  participantes.length === maxParticipantes
                    ? "text-green-400"
                    : participantes.length > maxParticipantes
                      ? "text-red-400"
                      : "text-yellow-300"
                }
              >
                {participantes.length}
              </b>{" "}
              / {maxParticipantes} jogadores permitidos
            </span>
            {participantes.length > maxParticipantes && (
              <span className="block text-red-400 mt-1">
                Limite ultrapassado! Desmarque algum jogador.
              </span>
            )}
            {participantes.length < maxParticipantes && (
              <span className="block text-yellow-300 mt-1">
                Selecione mais {maxParticipantes - participantes.length} jogador
                {maxParticipantes - participantes.length > 1 ? "es" : ""}.
              </span>
            )}
            {participantes.length === maxParticipantes && (
              <span className="block text-green-400 mt-1 font-bold">
                Limite perfeito! Pronto para sortear.
              </span>
            )}
          </>
        )}
      </div>
    </section>
  );
}
