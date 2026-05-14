import type { Metadata } from "next";
import MatchdayLiveClient from "@/components/public/matchday-live/MatchdayLiveClient";

export const metadata: Metadata = {
  title: "Placar Ao Vivo | Fut7Pro",
  description:
    "Acompanhe placares, gols, assistências, classificação e destaques parciais da rodada do racha em tempo real.",
};

export default function PlacarAoVivoPage() {
  return <MatchdayLiveClient />;
}
