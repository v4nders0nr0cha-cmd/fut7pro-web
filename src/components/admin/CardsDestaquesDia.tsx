"use client";
import { useState } from "react";
import type { Confronto, Time, Jogador } from "@/types/interfaces";

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

function getMelhorZagueiro(confrontos: Confronto[], times: Time[]): Jogador | null {
  // Implementar lógica real de busca do melhor zagueiro
  return times[0]?.jogadores[1] || null;
}

function getMelhorGoleiro(confrontos: Confronto[], times: Time[]): Jogador | null {
  // Implementar lógica real de busca do melhor goleiro
  return times[0]?.jogadores[0] || null;
}

export default function CardsDestaquesDia({ confrontos, times, timeCampeao }: Props) {
  const [faltou, setFaltou] = useState<Record<string, boolean>>({});

  const artilheiro = getArtilheiro(confrontos, times);
  const melhorMeia = getMelhorMeia(confrontos, times);
  const melhorZagueiro = getMelhorZagueiro(confrontos, times);
  const melhorGoleiro = getMelhorGoleiro(confrontos, times);

  if (!artilheiro || !melhorMeia || !melhorZagueiro || !melhorGoleiro) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>Carregando destaques do dia...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
    <div className="flex flex-col items-center bg-zinc-800 rounded-xl shadow-lg px-5 py-4 min-w-[185px] max-w-xs min-h-[260px] justify-between relative">
      {foto ? (
        <img
          src={foto}
          alt={nome}
          className="w-20 h-20 rounded-full mb-2 object-cover border-4 border-yellow-400"
        />
      ) : (
        <div className="w-20 h-20 rounded-full mb-2 flex items-center justify-center bg-zinc-900 border-4 border-yellow-400" />
      )}

      <div className="text-yellow-400 font-bold text-sm text-center mb-1 uppercase">{titulo}</div>

      <div className="text-white text-lg font-bold text-center">{nome}</div>
      <div className="text-yellow-200 text-xs">
        {apelido ? apelido : ""} {pos ? `| ${pos}` : ""}
      </div>

      {infoExtra && <div className="mt-1 text-yellow-400 text-sm font-bold">{infoExtra}</div>}

      {canFaltou && (
        <label className="flex items-center gap-1 mt-2 text-xs text-yellow-400 cursor-pointer">
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

