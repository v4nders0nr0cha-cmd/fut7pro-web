"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from "react";

import Image from "next/image";

import EditorEstrelas from "./EditorEstrelas";

import { mockParticipantes } from "./mockParticipantes";

import type { Participante, ConfiguracaoRacha, AvaliacaoEstrela } from "@/types/sorteio";

import { FaCheckCircle, FaUserPlus } from "react-icons/fa";

import { rachaConfig } from "@/config/racha.config";

interface Props {
  rachaId: string; // ID do racha atual!

  config: ConfiguracaoRacha | null;

  participantes: Participante[];

  setParticipantes: Dispatch<SetStateAction<Participante[]>>;
}

function createDefaultEstrela(rachaId: string, jogadorId: string): AvaliacaoEstrela {
  return {
    id: "",
    rachaId,
    jogadorId,
    estrelas: 0,
    atualizadoEm: "",
    atualizadoPor: "",
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
    setFiltro(""); // limpa ao abrir
  }, [open]);

  const filtrados = listaDisponivel.filter((p) =>
    p.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!(e.target as HTMLElement)?.closest(".popover-atleta")) {
        onClose();
      }
    }

    if (open) document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

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
          <div className="text-xs text-center text-gray-400">Nenhum atleta disponível</div>
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
              alt={`Foto de ${p.nome}, posição: ${p.posicao}, ${rachaConfig.nome}`}
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
  rachaId,

  config,

  participantes,

  setParticipantes,
}: Props) {
  const [estrelasGlobais, setEstrelasGlobais] = useState<{ [id: string]: AvaliacaoEstrela }>({});

  const [loadingEstrelas, setLoadingEstrelas] = useState(false);

  const [popoverIndex, setPopoverIndex] = useState<number | null>(null);

  const maxParticipantes =
    config?.numTimes && config?.jogadoresPorTime ? config.numTimes * config.jogadoresPorTime : 0;

  const buildDefaultEstrela = (jogadorId: string): AvaliacaoEstrela => ({
    id: "",
    rachaId,
    jogadorId,
    estrelas: 0,
    atualizadoEm: "",
    atualizadoPor: "",
  });

  // Ao montar: busca avaliações de estrelas do backend
  useEffect(() => {
    if (!rachaId) return;

    let isMounted = true;

    const loadEstrelas = async () => {
      setLoadingEstrelas(true);
      try {
        const response = await fetch(`/api/estrelas?rachaId=${rachaId}`);
        if (!response.ok) {
          throw new Error("Falha ao carregar avaliações de estrelas");
        }

        const data: AvaliacaoEstrela[] = await response.json();
        if (!isMounted) return;

        const estrelasMap: { [id: string]: AvaliacaoEstrela } = {};
        data.forEach((avaliacao) => {
          estrelasMap[avaliacao.jogadorId] = avaliacao;
        });
        setEstrelasGlobais(estrelasMap);

        setParticipantes((prev) =>
          prev.map((participante) => ({
            ...participante,
            estrelas:
              estrelasMap[participante.id] ?? createDefaultEstrela(rachaId, participante.id),
          }))
        );
      } catch (error) {
        // Mantém estado atual em caso de falha
      } finally {
        if (isMounted) {
          setLoadingEstrelas(false);
        }
      }
    };

    loadEstrelas();

    return () => {
      isMounted = false;
    };
  }, [rachaId, setParticipantes]);

  // Inicialização automática para mensalistas, se lista estiver vazia e houver config

  useEffect(() => {
    if (participantes.length === 0 && config) {
      const selecionadosIniciais = mockParticipantes.filter((p) => p.mensalista);

      setParticipantes(selecionadosIniciais);
    }
  }, [config, participantes.length, setParticipantes]);

  function handleSelect(id: string) {
    const isSelected = participantes.some((p) => p.id === id);

    const participanteOriginal = mockParticipantes.find((p) => p.id === id);

    if (isSelected) {
      setParticipantes(participantes.filter((p) => p.id !== id));
    } else {
      if (maxParticipantes && participantes.length >= maxParticipantes) return;

      if (participanteOriginal) {
        setParticipantes([
          ...participantes,

          {
            ...participanteOriginal,

            estrelas:
              estrelasGlobais[participanteOriginal.id] ??
              createDefaultEstrela(rachaId, participanteOriginal.id),
          },
        ]);
      }
    }

    setPopoverIndex(null);
  }

  const listSelecionados = participantes;

  const atletasDisponiveis = mockParticipantes.filter(
    (p) => !participantes.some((sel) => sel.id === p.id)
  );

  const vagasRestantes = Math.max(0, maxParticipantes - participantes.length);

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
    const estrelaAtual = estrelasGlobais[jogador.id]?.estrelas ?? 0;

    // Atualiza no backend ao clicar

    const handleUpdateEstrela = async (val: number) => {
      if (!selecionado) return;

      // Atualiza otimista no front

      setEstrelasGlobais((prev) => ({
        ...prev,

        [jogador.id]: {
          ...(prev[jogador.id] || {
            id: "",

            rachaId,

            jogadorId: jogador.id,

            estrelas: 0,

            atualizadoEm: "",

            atualizadoPor: "",
          }),

          estrelas: val,

          atualizadoEm: new Date().toISOString(),
        },
      }));

      setParticipantes(
        participantes.map((p) =>
          p.id === jogador.id
            ? {
                ...p,

                estrelas: {
                  ...(p.estrelas || {
                    id: "",

                    rachaId,

                    jogadorId: jogador.id,

                    estrelas: 0,

                    atualizadoEm: "",

                    atualizadoPor: "",
                  }),

                  estrelas: val,

                  atualizadoEm: new Date().toISOString(),
                },
              }
            : p
        )
      );

      // Faz o POST/PUT para a API do backend

      await fetch(`/api/estrelas`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          rachaId,

          jogadorId: jogador.id,

          estrelas: val,
        }),
      });
    };

    return (
      <div
        className={`flex flex-col justify-between p-2 rounded-lg border relative min-h-[94px] shadow-sm gap-0.5

                    ${selecionado ? "bg-yellow-100 border-yellow-400 cursor-pointer" : "bg-zinc-800 border-zinc-700 cursor-pointer hover:border-yellow-500"}

                `}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest(".editor-estrelas")) return;

          onClick();
        }}
      >
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-row items-center gap-2 min-w-0 flex-1">
            <Image
              src={jogador.foto}
              alt={`Foto de ${jogador.nome}, ${jogador.posicao} no ${rachaConfig.nome}`}
              width={48}
              height={48}
              className="rounded-md object-cover"
            />

            <span
              className={`text-base font-bold truncate ${selecionado ? "text-black" : "text-white"}`}
            >
              {jogador.nome}
            </span>

            {jogador.mensalista && (
              <span
                className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-black rounded text-xs font-semibold"
                style={{ fontSize: "10px", lineHeight: 1.1 }}
              >
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

        {/* Linha de baixo: posição + estrelas */}

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
              onChange={handleUpdateEstrela}
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

      {/* Grid: Selecionados + Vagas Vazias */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 relative z-0">
        {listSelecionados.map((jogador) => (
          <CardJogador
            key={jogador.id}
            jogador={jogador}
            selecionado={true}
            onClick={() => handleSelect(jogador.id)}
          />
        ))}

        {/* Cards de vagas clicáveis */}

        {Array.from({ length: vagasRestantes }).map((_, idx) => {
          const isOpen = popoverIndex === idx;

          return (
            <div
              key={`vaga-vazia-${idx}`}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border border-zinc-700 bg-zinc-900 opacity-80 cursor-pointer relative min-h-[94px] hover:border-yellow-400 group transition ${isOpen ? "z-50" : "z-0"}`}
              onClick={() => setPopoverIndex(idx)}
              onKeyDown={(e) => e.key === "Enter" && setPopoverIndex(idx)}
              role="button"
              tabIndex={0}
              aria-label="Adicionar jogador"
            >
              <FaUserPlus className="text-gray-500 text-3xl mb-2 group-hover:text-yellow-400 transition" />

              <span className="text-xs text-gray-400 font-bold text-center">Vaga disponível</span>

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

      {/* Rodapé de status */}

      <div className="mt-3 text-center text-xs">
        {maxParticipantes > 0 && (
          <>
            <span>
              {`Selecionados: `}

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
              </b>

              {` / ${maxParticipantes} jogadores permitidos`}
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
