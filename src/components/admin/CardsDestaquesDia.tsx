"use client";
import { useState } from "react";
import { Confronto, Time, Jogador, Gol, Assistencia } from "@/types/interfaces";

// Interface específica para Time Campeão
interface TimeCampeao {
  id: string;
  nome: string;
  jogadores: string[];
  data: string;
}

type Props = {
  confrontos: Confronto[];
  times: Time[];
  timeCampeao: TimeCampeao;
};

function getArtilheiro(confrontos: Confronto[], times: Time[]): Jogador | null {
  // Busca jogador com mais gols no dia (mock: só pega o primeiro do time 0)
  // Aqui você faz a contagem real a partir dos eventos de todos confrontos
  return times[0]?.jogadores[3] || null;
}

function getMelhorMeia(confrontos: Confronto[], times: Time[]): Jogador | null {
  // Implementar lógica real de busca do melhor meia
  return times[0]?.jogadores[4] || null;
}

function getMelhorZagueiro(
  confrontos: Confronto[],
  times: Time[],
): Jogador | null {
  // Implementar lógica real de busca do melhor zagueiro
  return times[0]?.jogadores[1] || null;
}

function getMelhorGoleiro(
  confrontos: Confronto[],
  times: Time[],
): Jogador | null {
  // Implementar lógica real de busca do melhor goleiro
  return times[0]?.jogadores[0] || null;
}

export default function CardsDestaquesDia({
  confrontos,
  times,
  timeCampeao,
}: Props) {
  const [faltou, setFaltou] = useState<Record<string, boolean>>({});

  const artilheiro = getArtilheiro(confrontos, times);
  const melhorMeia = getMelhorMeia(confrontos, times);
  const melhorZagueiro = getMelhorZagueiro(confrontos, times);
  const melhorGoleiro = getMelhorGoleiro(confrontos, times);

  if (!artilheiro || !melhorMeia || !melhorZagueiro || !melhorGoleiro) {
    return (
      <div className="py-8 text-center text-gray-400">
        <p>Carregando destaques do dia...</p>
      </div>
    );
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      <CardDestaque
        titulo="Artilheiro do Dia"
        nome={artilheiro.nome}
        apelido={artilheiro.apelido}
        pos={artilheiro.posicao}
        foto={artilheiro.foto}
        infoExtra="3 gols"
        canFaltou={true}
        faltouKey="artilheiro"
        faltou={faltou}
        setFaltou={setFaltou}
      />

      <CardDestaque
        titulo="Meia do Dia"
        nome={melhorMeia.nome}
        apelido={melhorMeia.apelido}
        pos={melhorMeia.posicao}
        foto={melhorMeia.foto}
        infoExtra="2 assistências"
        canFaltou={true}
        faltouKey="meia"
        faltou={faltou}
        setFaltou={setFaltou}
      />

      <CardDestaque
        titulo="Zagueiro do Dia"
        nome={melhorZagueiro.nome}
        apelido={melhorZagueiro.apelido}
        pos={melhorZagueiro.posicao}
        foto={melhorZagueiro.foto}
        canFaltou={true}
        faltouKey="zagueiro"
        faltou={faltou}
        setFaltou={setFaltou}
      />

      <CardDestaque
        titulo="Goleiro do Dia"
        nome={melhorGoleiro.nome}
        apelido={melhorGoleiro.apelido}
        pos={melhorGoleiro.posicao}
        foto={melhorGoleiro.foto}
        canFaltou={true}
        faltouKey="goleiro"
        faltou={faltou}
        setFaltou={setFaltou}
      />
    </div>
  );
}

interface CardDestaqueProps {
  titulo: string;
  nome: string;
  apelido?: string;
  pos: string;
  foto?: string;
  infoExtra?: string;
  canFaltou: boolean;
  faltouKey: string;
  faltou: Record<string, boolean>;
  setFaltou: (value: Record<string, boolean>) => void;
}

function CardDestaque({
  titulo,
  nome,
  apelido,
  pos,
  foto,
  infoExtra,
  canFaltou,
  faltouKey,
  faltou,
  setFaltou,
}: CardDestaqueProps) {
  return (
    <div className="relative flex min-h-[260px] min-w-[185px] max-w-xs flex-col items-center justify-between rounded-xl bg-zinc-800 px-5 py-4 shadow-lg">
      {foto ? (
        <img
          src={foto}
          alt={nome}
          className="mb-2 h-20 w-20 rounded-full border-4 border-yellow-400 object-cover"
        />
      ) : (
        <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full border-4 border-yellow-400 bg-zinc-900" />
      )}

      <div className="mb-1 text-center text-sm font-bold uppercase text-yellow-400">
        {titulo}
      </div>

      <div className="text-center text-lg font-bold text-white">{nome}</div>
      <div className="text-xs text-yellow-200">
        {apelido ? apelido : ""} {pos ? `| ${pos}` : ""}
      </div>

      {infoExtra && (
        <div className="mt-1 text-sm font-bold text-yellow-400">
          {infoExtra}
        </div>
      )}

      {canFaltou && (
        <label className="mt-2 flex cursor-pointer items-center gap-1 text-xs text-yellow-400">
          <input
            type="checkbox"
            checked={!!faltou[faltouKey]}
            onChange={(e) =>
              setFaltou({
                ...faltou,
                [faltouKey]: e.target.checked,
              })
            }
          />
          Jogador não compareceu ao racha
        </label>
      )}

      <div className="h-6"></div>
    </div>
  );
}
