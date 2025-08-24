"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import EditorEstrelas from "./EditorEstrelas";
import { mockParticipantes } from "./mockParticipantes";
import type {
  Participante,
  ConfiguracaoRacha,
  AvaliacaoEstrela,
} from "@/types/sorteio";
import { FaCheckCircle, FaUserPlus } from "react-icons/fa";
import { rachaConfig } from "@/config/racha.config";

interface Props {
  rachaId: string; // ID do racha atual!
  config: ConfiguracaoRacha | null;
  participantes: Participante[];
  setParticipantes: (p: Participante[]) => void;
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
    p.nome.toLowerCase().includes(filtro.toLowerCase()),
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
    <div className="popover-atleta absolute left-1/2 top-12 z-50 w-[240px] -translate-x-1/2 rounded-lg border border-yellow-400 bg-[#202020] p-3 shadow-2xl">
      <input
        className="mb-2 w-full rounded bg-zinc-900 p-1 text-sm text-white"
        placeholder="Buscar atleta..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        tabIndex={-1}
      />
      <div className="max-h-52 space-y-1 overflow-y-auto">
        {filtrados.length === 0 && (
          <div className="text-center text-xs text-gray-400">
            Nenhum atleta disponível
          </div>
        )}
        {filtrados.map((p) => (
          <div
            key={p.id}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 transition hover:bg-yellow-100 hover:text-black"
            onClick={() => {
              onSelecionar(p.id);
              onClose();
            }}
            onKeyDown={(e) =>
              e.key === "Enter" && onSelecionar(p.id) && onClose()
            }
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
            <span className="text-xs font-bold text-yellow-600">
              {p.posicao}
            </span>
          </div>
        ))}
      </div>
      <button
        className="mx-auto mt-2 block rounded border border-yellow-400 px-4 py-1 text-xs text-yellow-500 transition hover:bg-yellow-400 hover:text-black"
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
  const [estrelasGlobais, setEstrelasGlobais] = useState<{
    [id: string]: AvaliacaoEstrela;
  }>({});
  const [loadingEstrelas, setLoadingEstrelas] = useState(false);
  const [popoverIndex, setPopoverIndex] = useState<number | null>(null);

  const maxParticipantes =
    config?.numTimes && config?.jogadoresPorTime
      ? config.numTimes * config.jogadoresPorTime
      : 0;

  // Ao montar: busca avaliações de estrelas do backend
  useEffect(() => {
    if (!rachaId) return;
    setLoadingEstrelas(true);
    fetch(`/api/estrelas?rachaId=${rachaId}`)
      .then((res) => res.json())
      .then((data: AvaliacaoEstrela[]) => {
        // Monta o objeto para acesso rápido
        const estrelasMap: { [id: string]: AvaliacaoEstrela } = {};
        data.forEach((a) => {
          estrelasMap[a.jogadorId] = a;
        });
        setEstrelasGlobais(estrelasMap);

        // Atualiza lista dos participantes já existentes
        setParticipantes(
          participantes.map((p) => ({
            ...p,
            estrelas: estrelasMap[p.id] ?? {
              id: "",
              rachaId,
              jogadorId: p.id,
              estrelas: 0,
              atualizadoEm: "",
              atualizadoPor: "",
            },
          })),
        );
      })
      .finally(() => setLoadingEstrelas(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps - rachaId é a única dependência necessária
  }, [rachaId]);

  // Inicialização automática para mensalistas, se lista estiver vazia e houver config
  useEffect(() => {
    if (participantes.length === 0 && config) {
      const selecionadosIniciais = mockParticipantes.filter(
        (p) => p.mensalista,
      );
      setParticipantes(selecionadosIniciais);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps - Configuração inicial única
  }, [config]);

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
            estrelas: estrelasGlobais[participanteOriginal.id] ?? {
              id: "",
              rachaId,
              jogadorId: participanteOriginal.id,
              estrelas: 0,
              atualizadoEm: "",
              atualizadoPor: "",
            },
          },
        ]);
      }
    }
    setPopoverIndex(null);
  }

  const listSelecionados = participantes;
  const atletasDisponiveis = mockParticipantes.filter(
    (p) => !participantes.some((sel) => sel.id === p.id),
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
            : p,
        ),
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
        className={`relative flex min-h-[94px] flex-col justify-between gap-0.5 rounded-lg border p-2 shadow-sm ${selecionado ? "cursor-pointer border-yellow-400 bg-yellow-100" : "cursor-pointer border-zinc-700 bg-zinc-800 hover:border-yellow-500"} `}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest(".editor-estrelas")) return;
          onClick();
        }}
      >
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex min-w-0 flex-1 flex-row items-center gap-2">
            <Image
              src={jogador.foto}
              alt={`Foto de ${jogador.nome}, ${jogador.posicao} no ${rachaConfig.nome}`}
              width={48}
              height={48}
              className="rounded-md object-cover"
            />
            <span
              className={`truncate text-base font-bold ${selecionado ? "text-black" : "text-white"}`}
            >
              {jogador.nome}
            </span>
            {jogador.mensalista && (
              <span
                className="ml-2 rounded bg-yellow-500 px-1.5 py-0.5 text-xs font-semibold text-black"
                style={{ fontSize: "10px", lineHeight: 1.1 }}
              >
                Mensalista
              </span>
            )}
          </div>
          <div className="flex items-center">
            {selecionado ? (
              <FaCheckCircle
                className="mt-1 text-lg text-green-500 drop-shadow"
                title="Selecionado"
              />
            ) : (
              children
            )}
          </div>
        </div>
        {/* Linha de baixo: posição + estrelas */}
        <div className="mt-1 flex w-full flex-row items-center justify-between">
          <span
            className={`text-xs font-bold uppercase ${selecionado ? "text-yellow-600" : "text-yellow-400"}`}
            style={{ letterSpacing: 0, minWidth: "32px" }}
          >
            {jogador.posicao}
          </span>
          <div className="editor-estrelas mx-2 flex w-full min-w-[110px] max-w-[120px] items-center justify-center">
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
    <section className="mb-6 w-full rounded-xl bg-[#202020] p-4">
      <h2 className="mb-2 text-center text-lg font-bold text-yellow-400">
        Selecione os Participantes do Dia
      </h2>
      {/* Grid: Selecionados + Vagas Vazias */}
      <div className="relative z-0 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
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
              className={`group relative flex min-h-[94px] cursor-pointer flex-col items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 p-2 opacity-80 transition hover:border-yellow-400 ${isOpen ? "z-50" : "z-0"}`}
              onClick={() => setPopoverIndex(idx)}
              onKeyDown={(e) => e.key === "Enter" && setPopoverIndex(idx)}
              role="button"
              tabIndex={0}
              aria-label="Adicionar jogador"
            >
              <FaUserPlus className="mb-2 text-3xl text-gray-500 transition group-hover:text-yellow-400" />
              <span className="text-center text-xs font-bold text-gray-400">
                Vaga disponível
              </span>
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
              <span className="mt-1 block text-red-400">
                Limite ultrapassado! Desmarque algum jogador.
              </span>
            )}
            {participantes.length < maxParticipantes && (
              <span className="mt-1 block text-yellow-300">
                Selecione mais {maxParticipantes - participantes.length} jogador
                {maxParticipantes - participantes.length > 1 ? "es" : ""}.
              </span>
            )}
            {participantes.length === maxParticipantes && (
              <span className="mt-1 block font-bold text-green-400">
                Limite perfeito! Pronto para sortear.
              </span>
            )}
          </>
        )}
      </div>
    </section>
  );
}
