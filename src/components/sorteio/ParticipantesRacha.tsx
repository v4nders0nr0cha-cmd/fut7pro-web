"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { Participante, ConfiguracaoRacha, AvaliacaoEstrela, Posicao } from "@/types/sorteio";
import { FaCheckCircle, FaUserPlus } from "react-icons/fa";
import { rachaConfig } from "@/config/racha.config";
import { useJogadores } from "@/hooks/useJogadores";
import { useNiveisAtletas } from "@/hooks/useNiveisAtletas";
import StarRatingDisplay from "@/components/ui/StarRatingDisplay";
import { formatNivel } from "@/utils/nivel-atleta";
import type { Jogador } from "@/types/jogador";

interface Props {
  rachaId: string; // ID do racha atual
  config: ConfiguracaoRacha | null;
  participantes: Participante[];
  setParticipantes: (p: Participante[]) => void;
}

function normalizarPosicao(posicao?: Jogador["posicao"]): Posicao {
  const value = String(posicao || "").toLowerCase();
  if (value.startsWith("gol")) return "GOL";
  if (value.startsWith("zag")) return "ZAG";
  if (value.startsWith("mei")) return "MEI";
  if (value.startsWith("ata")) return "ATA";
  return "MEI";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
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
          <div className="text-xs text-center text-gray-400">Nenhum atleta disponivel</div>
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
              alt={`Foto de ${p.nome}, posicao: ${p.posicao}, ${rachaConfig.nome}`}
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
  const { niveis, isLoading: loadingEstrelas } = useNiveisAtletas(rachaId);
  const [popoverKey, setPopoverKey] = useState<string | null>(null);
  const [seededMensalistas, setSeededMensalistas] = useState(false);
  const [rankingMap, setRankingMap] = useState<Record<string, number>>({});

  const { jogadores, isLoading: loadingJogadores } = useJogadores(rachaId, { includeBots: true });

  const estrelasGlobais = useMemo(() => {
    const map: { [id: string]: AvaliacaoEstrela } = {};
    (niveis || []).forEach((nivel) => {
      map[nivel.jogadorId] = nivel;
    });
    return map;
  }, [niveis]);

  const maxParticipantes =
    config?.numTimes && config?.jogadoresPorTime ? config.numTimes * config.jogadoresPorTime : 0;

  const buildDefaultEstrelas = useCallback(
    (jogadorId: string): AvaliacaoEstrela => ({
      id: "",
      rachaId,
      jogadorId,
      habilidade: null,
      fisico: null,
      nivelFinal: null,
      estrelas: 0,
      atualizadoEm: "",
      atualizadoPor: "",
    }),
    [rachaId]
  );

  useEffect(() => {
    if (!rachaId) return;
    const needsUpdate = participantes.some((p) => {
      const next = estrelasGlobais[p.id] ?? buildDefaultEstrelas(p.id);
      const atual = p.estrelas;
      return (
        !atual ||
        atual.id !== next.id ||
        atual.estrelas !== next.estrelas ||
        atual.nivelFinal !== next.nivelFinal ||
        atual.habilidade !== next.habilidade ||
        atual.fisico !== next.fisico ||
        atual.atualizadoEm !== next.atualizadoEm
      );
    });

    if (!needsUpdate) return;

    setParticipantes(
      participantes.map((p) => ({
        ...p,
        estrelas: estrelasGlobais[p.id] ?? buildDefaultEstrelas(p.id),
      }))
    );
  }, [rachaId, participantes, estrelasGlobais, buildDefaultEstrelas, setParticipantes]);

  // Busca ranking publico para enriquecer o balanceamento
  useEffect(() => {
    const slug = rachaConfig.slug;
    if (!slug) return;
    fetch(`/api/public/${slug}/player-rankings?type=geral`)
      .then((res) => res.json())
      .then((data) => {
        const map: Record<string, number> = {};
        (data?.rankings || data?.results || []).forEach((item: any) => {
          if (item.playerId || item.id) {
            map[item.playerId || item.id] = item.pontos || item.rankingPontos || 0;
          }
        });
        setRankingMap(map);
      })
      .catch(() => {
        // silencioso: ranking nao e obrigatorio
      });
  }, []);

  const participantesDisponiveis = useMemo<Participante[]>(() => {
    const mapped = (jogadores || []).map((jogador) => {
      const estrela = estrelasGlobais[jogador.id] ?? buildDefaultEstrelas(jogador.id);

      return {
        id: jogador.id,
        nome: jogador.nome || jogador.apelido || "Jogador",
        slug: slugify(jogador.nome || jogador.apelido || jogador.id),
        foto: jogador.avatar || jogador.foto || "/images/jogadores/jogador_padrao_01.jpg",
        posicao: normalizarPosicao(jogador.posicao),
        rankingPontos: rankingMap[jogador.id] ?? 0,
        vitorias: 0,
        assistencias: 0,
        gols: 0,
        estrelas: estrela,
        mensalista: !!jogador.mensalista,
        isBot: jogador.isBot,
        partidas: (jogador as any).partidas ?? 0,
      };
    });
    const bots = mapped.filter((item) => item.isBot);
    const reais = mapped.filter((item) => !item.isBot);
    return [...reais, ...bots];
  }, [jogadores, estrelasGlobais, buildDefaultEstrelas, rankingMap]);

  // Inicializa automaticamente mensalistas na primeira carga
  useEffect(() => {
    if (
      participantes.length === 0 &&
      config &&
      participantesDisponiveis.length > 0 &&
      !seededMensalistas
    ) {
      const selecionadosIniciais = participantesDisponiveis.filter((p) => p.mensalista);
      if (selecionadosIniciais.length) {
        setParticipantes(selecionadosIniciais);
        setSeededMensalistas(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, participantesDisponiveis, participantes.length, seededMensalistas]);

  function handleSelect(id: string) {
    const isSelected = participantes.some((p) => p.id === id);
    const participanteOriginal = participantesDisponiveis.find((p) => p.id === id);

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
              participanteOriginal.estrelas ??
              buildDefaultEstrelas(participanteOriginal.id),
          },
        ]);
      }
    }
    setPopoverKey(null);
  }

  const listSelecionados = participantes;
  const atletasDisponiveis = participantesDisponiveis.filter(
    (p) => !participantes.some((sel) => sel.id === p.id)
  );

  const vagasRestantes = Math.max(0, maxParticipantes - participantes.length);
  const goleirosNecessarios = config?.numTimes ?? 0;

  const {
    mensalistasSelecionados,
    goleirosSelecionados,
    outrosSelecionados,
    goleirosSelecionadosTotal,
  } = useMemo(() => {
    const mensalistas = listSelecionados.filter((p) => p.mensalista);
    const mensalistasIds = new Set(mensalistas.map((p) => p.id));
    const goleiros = listSelecionados.filter(
      (p) => p.posicao === "GOL" && !mensalistasIds.has(p.id)
    );
    const outros = listSelecionados.filter((p) => !mensalistasIds.has(p.id) && p.posicao !== "GOL");
    const totalGoleiros = listSelecionados.filter((p) => p.posicao === "GOL").length;
    return {
      mensalistasSelecionados: mensalistas,
      goleirosSelecionados: goleiros,
      outrosSelecionados: outros,
      goleirosSelecionadosTotal: totalGoleiros,
    };
  }, [listSelecionados]);

  const goleiroSlots = Math.max(
    0,
    Math.min(vagasRestantes, goleirosNecessarios - goleirosSelecionadosTotal)
  );
  const vagasGerais = Math.max(0, vagasRestantes - goleiroSlots);
  const goleirosDisponiveis = atletasDisponiveis.filter((p) => p.posicao === "GOL");

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
    const estrelaInfo =
      estrelasGlobais[jogador.id] ?? jogador.estrelas ?? buildDefaultEstrelas(jogador.id);
    const habilidade = estrelaInfo?.habilidade ?? null;
    const fisico = estrelaInfo?.fisico ?? null;
    const nivelFinal = estrelaInfo?.nivelFinal ?? estrelaInfo?.estrelas ?? 0;
    const temNivel = typeof habilidade === "number" && typeof fisico === "number";
    const tooltip = `Habilidade ${typeof habilidade === "number" ? habilidade : "-"}, Fisico ${typeof fisico === "number" ? fisico : "-"}`;
    const nivelTexto = formatNivel(temNivel ? nivelFinal : null);

    return (
      <div
        className={`flex flex-col justify-between p-2 rounded-lg border relative min-h-[94px] shadow-sm gap-0.5
                    ${selecionado ? "bg-yellow-100 border-yellow-400 cursor-pointer" : "bg-zinc-800 border-zinc-700 cursor-pointer hover:border-yellow-500"}
                `}
        onClick={onClick}
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
        {/* Linha inferior: posicao + estrelas */}
        <div className="flex flex-row items-center justify-between w-full mt-1">
          <span
            className={`text-xs font-bold uppercase ${selecionado ? "text-yellow-600" : "text-yellow-400"}`}
            style={{ letterSpacing: 0, minWidth: "32px" }}
          >
            {jogador.posicao}
          </span>
          <div className="flex items-center gap-2 mx-2" title={tooltip}>
            <StarRatingDisplay value={nivelFinal} max={5} size={14} />
            <span
              className={`text-xs font-semibold ${selecionado ? "text-black" : "text-gray-200"}`}
            >
              Nivel {nivelTexto}
            </span>
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
        {mensalistasSelecionados.map((jogador) => (
          <CardJogador
            key={jogador.id}
            jogador={jogador}
            selecionado
            onClick={() => handleSelect(jogador.id)}
          />
        ))}

        {goleirosSelecionados.map((jogador) => (
          <CardJogador
            key={jogador.id}
            jogador={jogador}
            selecionado
            onClick={() => handleSelect(jogador.id)}
          />
        ))}

        {/* Vagas exclusivas para goleiro */}
        {Array.from({ length: goleiroSlots }).map((_, idx) => {
          const key = `gol-${idx}`;
          const isOpen = popoverKey === key;
          return (
            <div
              key={`vaga-goleiro-${idx}`}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border border-yellow-500/40 bg-zinc-900 opacity-90 cursor-pointer relative min-h-[94px] hover:border-yellow-400 group transition ${isOpen ? "z-50" : "z-0"}`}
              onClick={() => setPopoverKey(key)}
              onKeyDown={(e) => e.key === "Enter" && setPopoverKey(key)}
              role="button"
              tabIndex={0}
              aria-label="Escolher goleiro"
            >
              <FaUserPlus className="text-gray-500 text-3xl mb-2 group-hover:text-yellow-400 transition" />
              <span className="text-xs text-yellow-300 font-bold text-center">
                Escolha o Goleiro
              </span>
              <PopoverSelecionarJogador
                open={isOpen}
                onClose={() => setPopoverKey(null)}
                onSelecionar={handleSelect}
                listaDisponivel={goleirosDisponiveis}
              />
            </div>
          );
        })}

        {outrosSelecionados.map((jogador) => (
          <CardJogador
            key={jogador.id}
            jogador={jogador}
            selecionado
            onClick={() => handleSelect(jogador.id)}
          />
        ))}

        {/* Cards de vagas clicaveis */}
        {Array.from({ length: vagasGerais }).map((_, idx) => {
          const key = `vaga-${idx}`;
          const isOpen = popoverKey === key;
          return (
            <div
              key={`vaga-vazia-${idx}`}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border border-zinc-700 bg-zinc-900 opacity-80 cursor-pointer relative min-h-[94px] hover:border-yellow-400 group transition ${isOpen ? "z-50" : "z-0"}`}
              onClick={() => setPopoverKey(key)}
              onKeyDown={(e) => e.key === "Enter" && setPopoverKey(key)}
              role="button"
              tabIndex={0}
              aria-label="Adicionar jogador"
            >
              <FaUserPlus className="text-gray-500 text-3xl mb-2 group-hover:text-yellow-400 transition" />
              <span className="text-xs text-gray-400 font-bold text-center">Vaga disponivel</span>
              <PopoverSelecionarJogador
                open={isOpen}
                onClose={() => setPopoverKey(null)}
                onSelecionar={handleSelect}
                listaDisponivel={atletasDisponiveis}
              />
            </div>
          );
        })}
      </div>

      {/* Rodape de status */}
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
      {loadingJogadores && (
        <div className="text-center text-xs text-gray-400 mt-2">Carregando atletas...</div>
      )}
      {loadingEstrelas && (
        <div className="text-center text-xs text-gray-400 mt-2">Carregando niveis...</div>
      )}
    </section>
  );
}
