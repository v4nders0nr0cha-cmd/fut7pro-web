"use client";
import CardsDestaquesDiaV2 from "./CardsDestaquesDiaV2";
import type { PublicMatch } from "@/types/partida";
import type { ConfrontoV2, TimeDestaque } from "@/utils/destaquesDoDia";

type Props = {
  confrontos?: ConfrontoV2[];
  times?: TimeDestaque[];
  matches?: PublicMatch[];
  slug?: string;
  isLoading?: boolean;
};

export default function CardsDestaquesDia(props: Props) {
  return <CardsDestaquesDiaV2 {...props} />;
}
