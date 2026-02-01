import type { Metadata } from "next";
import { FaWhatsapp } from "react-icons/fa";
import TimesDoDiaClient from "@/components/TimesDoDiaClient";
import { rachaConfig } from "@/config/racha.config";

type TimesDoDiaPageProps = {
  params: { slug: string };
};

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/$/,
  ""
);

export function generateMetadata({ params }: TimesDoDiaPageProps): Metadata {
  const slug = params.slug || rachaConfig.slug;
  const title = `Times do Dia | ${slug} | Fut7Pro`;
  const description =
    "Veja a escalação dos times do dia, destaques e confrontos do racha Fut7. Sistema para Fut7, racha e futebol amador.";
  const canonical = `${APP_URL}/${slug}/partidas/times-do-dia`;

  return {
    title,
    description,
    keywords: [
      "racha",
      "fut7",
      "sistema de racha",
      "sorteio de times",
      "escalacao de times",
      "estatísticas futebol 7",
      "futebol amador",
      "futebol society",
      "campeões do dia",
    ],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Fut7Pro",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function TimesDoDiaPage({ params }: TimesDoDiaPageProps) {
  const slug = params.slug || rachaConfig.slug;
  const texto = encodeURIComponent(
    `Confira os Times do Dia do racha ${slug}! Veja a escalação completa no Fut7Pro: `
  );
  const url = encodeURIComponent(`${APP_URL}/${slug}/partidas/times-do-dia`);
  const whatsappLink = `https://wa.me/?text=${texto}${url}`;

  return (
    <main className="min-h-screen bg-fundo pt-6 px-2 pb-10">
      <h1 className="sr-only">Times do Dia - Sistema Fut7Pro</h1>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-brand mb-4 text-center">Times do Dia</h2>
        <p className="text-center text-neutral-300 mb-8">
          Veja como ficaram as escalações dos times do racha de hoje. Os confrontos e a ordem dos
          jogos estão logo abaixo.
        </p>
        <TimesDoDiaClient slug={slug} />

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
