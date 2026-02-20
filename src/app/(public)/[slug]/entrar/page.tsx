import { Suspense } from "react";
import type { Metadata } from "next";
import EntrarClient from "@/app/(public)/entrar/EntrarClient";

type EntrarPageProps = {
  params: { slug: string };
};

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

export function generateMetadata({ params }: EntrarPageProps): Metadata {
  const slug = params.slug;
  return {
    title: `Entrar no Fut7Pro | ${slug}`,
    description: "Acesso do atleta com conta global Fut7Pro.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${APP_URL}/${slug}/entrar`,
    },
  };
}

export default function SlugEntrarPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-lg px-4 py-10 text-gray-300">Carregando...</div>
      }
    >
      <EntrarClient />
    </Suspense>
  );
}
