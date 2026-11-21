"use client";

import { useAdminGuide } from "@/hooks/useAdminGuide";
import { contextualTask } from "@/lib/admin-guide-context";

const COMPLETE =
  "As avaliações dos atletas elegíveis estão salvas. Experimente usá-las para formar os times da primeira rodada.";
const PARTIAL =
  "As avaliações de habilidade e físico ajudam a equilibrar os times. Você pode revisar as avaliações disponíveis antes do sorteio.";

export default function FirstMatchdayDrawHint() {
  const { guide, validating, error } = useAdminGuide();
  const task = guide && contextualTask(guide, "FIRST_MATCHDAY", "/admin/partidas/criar");
  const authorized = Boolean(task && guide?.actionAvailability?.FIRST_MATCHDAY?.allowed);
  const current = authorized && !validating && !error ? guide?.operationalState : null;
  const complete =
    current?.eligibleLevelCoverage === 100 &&
    typeof current.eligiblePlayerCount === "number" &&
    current.eligiblePlayerCount >= 10 &&
    current.evaluatedEligiblePlayers === current.eligiblePlayerCount;

  // Reserva as variantes na tipografia real, inclusive durante a consulta.
  // A URL sozinha não autoriza orientações sobre os dados do grupo.
  return (
    <div className="mt-3 grid text-sm leading-relaxed text-neutral-400">
      {[COMPLETE, PARTIAL].map((text) => (
        <span
          key={text}
          aria-hidden="true"
          data-draw-hint-reserve={text}
          className="invisible pointer-events-none [grid-area:1/1] before:block before:content-[attr(data-draw-hint-reserve)]"
        />
      ))}
      {current && <p className="[grid-area:1/1]">{complete ? COMPLETE : PARTIAL}</p>}
    </div>
  );
}
