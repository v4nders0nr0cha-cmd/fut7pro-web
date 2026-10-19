import type { Metadata } from "next";
import VisualTemasClient from "./VisualTemasClient";

export const metadata: Metadata = {
  title: "Visual e temas do grupo | Fut7Pro Painel Admin",
  description:
    "Escolha e personalize o tema visual do seu grupo no Fut7Pro. Paletas de cores sofisticadas, esportivas e exclusivas.",
  keywords: [
    "Fut7Pro",
    "temas",
    "paleta de cores",
    "visual",
    "personalização",
    "painel admin",
    "futebol 7",
    "SaaS",
  ],
};

export default function VisualTemasPage() {
  return <VisualTemasClient />;
}
