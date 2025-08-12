// src/app/partidas/times-do-dia/page.tsx

import TimesDoDiaClient from "@/components/TimesDoDiaClient";
import { FaWhatsapp } from "react-icons/fa";
import { rachaConfig } from "@/config/racha.config";

export const metadata = {
  title: "Times do Dia | Fut7Pro",
  description:
    "Veja a escalação dos times do dia, destaques, artilheiro, goleiro, craque, maestro do racha Fut7. Sistema para Fut7, racha e futebol amador.",
  keywords:
    "racha, fut7, sistema de racha, sorteio de times, escalação de times, estatísticas futebol 7, futebol amador, futebol society, campeões do dia",
};

export default function TimesDoDiaPage() {
  // WhatsApp share link dinâmico pelo slug do racha
  const texto = encodeURIComponent(
    "Confira os Times do Dia do nosso racha! Veja a escalação completa no Fut7Pro: "
  );
  const url = encodeURIComponent(
    `https://fut7pro.com.br/${rachaConfig.slug}/partidas/times-do-dia`
  );
  const whatsappLink = `https://wa.me/?text=${texto}${url}`;

  return (
    <main className="min-h-screen bg-fundo pt-6 px-2 pb-10">
      <h1 className="sr-only">Times do Dia - Sistema Fut7Pro</h1>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4 text-center">
          Times do Dia
        </h2>
        <p className="text-center text-neutral-300 mb-8">
          Veja como ficaram as escalações dos times do racha de hoje. Os confrontos e a ordem dos
          jogos estão logo abaixo.
        </p>
        <TimesDoDiaClient />

        {/* Botão compartilhar só no final */}
        <div className="flex justify-center mt-10">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-lg shadow transition text-base"
            aria-label="Compartilhar Times do Dia no WhatsApp"
          >
            <FaWhatsapp size={22} />
            Compartilhar no WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
