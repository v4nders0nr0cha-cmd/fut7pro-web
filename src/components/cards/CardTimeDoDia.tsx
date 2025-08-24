"use client";

import Image from "next/image";

type JogadorTime = {
  id: string;
  nome: string;
  apelido?: string;
  foto: string;
  posicao: "Goleiro" | "Zagueiro" | "Meia" | "Atacante";
  status: "titular" | "substituto" | "ausente";
};

type TimeDoDia = {
  nome: string;
  logo: string;
  cor: string;
  ehTimeCampeao?: boolean;
  jogadores: JogadorTime[];
};

type Props = {
  time: TimeDoDia;
};

const posicoesAbrev: Record<JogadorTime["posicao"], string> = {
  Goleiro: "GOL",
  Zagueiro: "ZAG",
  Meia: "MEIA",
  Atacante: "ATA",
};

export function CardTimeDoDia({ time }: Props) {
  return (
    <article
      className="mx-auto mb-8 flex w-full max-w-md flex-col rounded-2xl bg-neutral-900 p-5 shadow-lg"
      style={{ borderTop: `5px solid ${time.cor}` }}
      aria-label={`Time ${time.nome}`}
    >
      <div className="mb-2 flex items-center gap-3">
        <Image
          src={time.logo}
          alt={`Logo do time ${time.nome}`}
          width={42}
          height={42}
          className="rounded-lg"
        />
        <h2 className="text-lg font-bold text-yellow-400 md:text-xl">
          {time.nome}
          {time.ehTimeCampeao && (
            <span
              className="ml-3 rounded bg-yellow-400 px-3 py-1 align-middle text-sm font-semibold text-neutral-900"
              title="Time Campeão do Dia"
              aria-label="Time Campeão do Dia"
            >
              CAMPEÃO DO DIA
            </span>
          )}
        </h2>
      </div>

      <ul className="mt-1 flex w-full flex-col gap-3">
        {time.jogadores.map((jogador) => {
          let liClass =
            "relative flex items-center gap-3 p-2 rounded-lg transition bg-neutral-800";
          if (jogador.status === "ausente")
            liClass += " bg-red-900 opacity-60 line-through";
          if (jogador.status === "substituto")
            liClass += " bg-sky-900 opacity-80 italic";

          return (
            <li key={jogador.id} className={liClass}>
              <span
                className="absolute right-3 top-1 text-[10px] font-bold tracking-widest text-neutral-400"
                title={jogador.posicao}
              >
                {posicoesAbrev[jogador.posicao]}
              </span>
              <Image
                src={jogador.foto}
                alt={`Foto de ${jogador.nome}`}
                width={36}
                height={36}
                className="rounded-full border-2 border-neutral-700"
                loading="lazy"
              />
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-semibold">{jogador.nome}</span>
                {jogador.apelido && (
                  <span className="text-xs text-neutral-400">
                    ({jogador.apelido})
                  </span>
                )}
                <span className="text-xs text-neutral-400">
                  {jogador.status === "ausente" && "Ausente (não pontua)"}
                  {jogador.status === "substituto" && "Apenas completou o time"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

export default CardTimeDoDia;
