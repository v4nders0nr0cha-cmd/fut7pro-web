"use client";

import Image from "next/image";

const DEFAULT_LOGO = "/images/logos/logo_fut7pro.png";
const DEFAULT_AVATAR = "/images/logos/logo_fut7pro.png";

export type JogadorTime = {
  id: string;
  nome: string;
  apelido?: string | null;
  foto?: string | null;
  posicao?: string | null;
  status?: "titular" | "substituto" | "ausente";
};

export type TimeDoDia = {
  id?: string;
  nome: string;
  logo?: string | null;
  cor?: string | null;
  ehTimeCampeao?: boolean;
  jogadores: JogadorTime[];
};

function buildPosicaoLabel(posicao?: string | null) {
  if (!posicao) return "";
  const normalized = posicao.toUpperCase();
  const map: Record<string, string> = {
    GOL: "GOL",
    GOLEIRO: "GOL",
    ZAG: "ZAG",
    ZAGUEIRO: "ZAG",
    MEI: "MEI",
    MEIA: "MEI",
    ATA: "ATA",
    ATACANTE: "ATA",
  };
  return map[normalized] ?? normalized.slice(0, 3);
}

export function CardTimeDoDia({ time }: { time: TimeDoDia }) {
  const logo = time.logo || DEFAULT_LOGO;
  const borderColor = time.cor || "#facc15";

  return (
    <article
      className="flex flex-col w-full max-w-md bg-neutral-900 rounded-2xl shadow-lg p-5 mb-8 mx-auto"
      style={{ borderTop: `5px solid ${borderColor}` }}
      aria-label={`Time ${time.nome}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Image
          src={logo}
          alt={`Logo do time ${time.nome}`}
          width={42}
          height={42}
          className="rounded-lg"
        />
        <h2 className="text-lg md:text-xl font-bold text-yellow-400">
          {time.nome}
          {time.ehTimeCampeao && (
            <span
              className="ml-3 px-3 py-1 rounded bg-yellow-400 text-neutral-900 text-sm font-semibold align-middle"
              title="Time Campeão do Dia"
              aria-label="Time Campeão do Dia"
            >
              CAMPEÃO DO DIA
            </span>
          )}
        </h2>
      </div>

      <ul className="w-full mt-1 flex flex-col gap-3">
        {time.jogadores.map((jogador) => {
          const posicaoLabel = buildPosicaoLabel(jogador.posicao);
          const foto = jogador.foto || DEFAULT_AVATAR;
          const status = jogador.status ?? "titular";

          let liClass = "relative flex items-center gap-3 p-2 rounded-lg transition bg-neutral-800";
          if (status === "ausente") liClass += " bg-red-900 opacity-60 line-through";
          if (status === "substituto") liClass += " bg-sky-900 opacity-80 italic";

          return (
            <li key={jogador.id} className={liClass}>
              {posicaoLabel && (
                <span
                  className="absolute top-1 right-3 text-[10px] text-neutral-400 tracking-widest font-bold"
                  title={jogador.posicao ?? "Posição"}
                >
                  {posicaoLabel}
                </span>
              )}
              <Image
                src={foto}
                alt={`Foto de ${jogador.nome}`}
                width={36}
                height={36}
                className="rounded-full border-2 border-neutral-700"
                loading="lazy"
              />
              <div className="flex-1 flex flex-col">
                <span className="font-semibold text-sm">{jogador.nome}</span>
                {jogador.apelido && (
                  <span className="text-xs text-neutral-400">({jogador.apelido})</span>
                )}
                {status !== "titular" && (
                  <span className="text-xs text-neutral-400">
                    {status === "ausente" && "Ausente (não pontua)"}
                    {status === "substituto" && "Apenas completou o time"}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

export default CardTimeDoDia;
