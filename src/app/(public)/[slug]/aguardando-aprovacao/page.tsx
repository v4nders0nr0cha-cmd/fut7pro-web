import { Suspense } from "react";
import type { Metadata } from "next";
import AguardandoAprovacaoClient from "@/app/(public)/aguardando-aprovacao/AguardandoAprovacaoClient";

type AguardandoPageProps = {
  params: { slug: string };
};

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

export function generateMetadata({ params }: AguardandoPageProps): Metadata {
  const slug = params.slug;
  return {
    title: `Aguardando aprovação | ${slug} | Fut7Pro`,
    description: "Acompanhe o status da sua solicitação de cadastro no Fut7Pro.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${APP_URL}/${slug}/aguardando-aprovacao`,
    },
  };
}

export default function SlugAguardandoAprovacaoPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-lg px-4 py-10 text-gray-300">Carregando...</div>
      }
    >
      <AguardandoAprovacaoClient />
    </Suspense>
  );
}
