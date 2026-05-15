import type { LiveHighlightPick, LiveHighlights } from "@/types/partida";

type Props = {
  highlights: LiveHighlights;
};

function PickCard({
  title,
  pick,
  suffix,
}: {
  title: string;
  pick: LiveHighlightPick;
  suffix: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-black/35 p-4">
      <p className="text-xs uppercase text-neutral-400">{title}</p>
      <p className="mt-2 text-sm font-semibold text-white">{pick.athlete?.name ?? "Em disputa"}</p>
      <p className="mt-1 text-xs text-brand">
        {pick.value > 0 ? `${pick.value}${suffix}` : pick.status}
      </p>
      <p className="mt-1 text-[11px] text-neutral-500">{pick.status}</p>
    </div>
  );
}

export function LiveHighlightsPanel({ highlights }: Props) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-[#161616] p-4">
      <h2 className="text-base font-semibold text-white">Destaques parciais</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <PickCard title="Artilheiro do Dia" pick={highlights.artilheiro} suffix="g" />
        <PickCard title="Maestro do Dia" pick={highlights.maestro} suffix="a" />
        <PickCard title="Atacante do Dia" pick={highlights.atacante} suffix=" pts" />
        <PickCard title="Meia do Dia" pick={highlights.meia} suffix=" pts" />
        <PickCard title="Goleiro do Dia" pick={highlights.goleiro} suffix=" pts" />
        <div className="rounded-xl border border-neutral-800 bg-black/35 p-4">
          <p className="text-xs uppercase text-neutral-400">Time Campeão parcial</p>
          <p className="mt-2 text-sm font-semibold text-white">
            {highlights.timeCampeao.team ?? "Em disputa"}
          </p>
          <p className="mt-1 text-xs text-brand">{highlights.timeCampeao.status}</p>
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3">
        <p className="text-xs font-semibold text-yellow-200">Zagueiro do Dia</p>
        <p className="mt-1 text-xs text-neutral-300">{highlights.zagueiro.status}</p>
        {highlights.zagueiro.candidates.length > 0 && (
          <p className="mt-2 text-xs text-neutral-200">
            Possíveis candidatos:{" "}
            {highlights.zagueiro.candidates
              .map((candidate) => `${candidate.athlete.name} (${candidate.value})`)
              .join(", ")}
          </p>
        )}
      </div>
    </section>
  );
}
