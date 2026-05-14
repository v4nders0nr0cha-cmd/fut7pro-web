import type { LiveEvent } from "@/types/partida";

type Props = {
  events: LiveEvent[];
};

export function LiveTimeline({ events }: Props) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-[#161616] p-4">
      <h2 className="text-base font-semibold text-white">Gols e assistências da rodada</h2>
      <div className="mt-4 space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-neutral-400">Nenhum gol registrado na rodada.</p>
        ) : (
          events.map((event) => {
            const time = event.occurredAt
              ? new Date(event.occurredAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--";
            const displayTime = event.minute?.trim() || time;
            return (
              <div
                key={event.id}
                className="rounded-xl bg-black/35 px-3 py-3 text-sm text-neutral-200"
              >
                <span className="font-semibold text-brand">{displayTime}</span>, Gol do{" "}
                {event.teamName}, {event.scorer?.name ?? "sem autor"}
                {event.assist ? `, assistência de ${event.assist.name}` : ""}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
