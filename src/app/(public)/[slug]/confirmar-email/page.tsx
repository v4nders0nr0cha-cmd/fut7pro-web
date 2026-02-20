import { Suspense } from "react";
import type { Metadata } from "next";
import ConfirmarEmailPublicClient from "@/app/(public)/confirmar-email/ConfirmarEmailPublicClient";

type ConfirmarEmailSlugPageProps = {
  params: { slug: string };
};

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

export function generateMetadata({ params }: ConfirmarEmailSlugPageProps): Metadata {
  const slug = params.slug;
  return {
    title: `Confirmação de e-mail | ${slug} | Fut7Pro`,
    description: "Confirme seu e-mail para liberar o acesso da sua conta no Fut7Pro.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${APP_URL}/${slug}/confirmar-email`,
    },
  };
}

export default function ConfirmarEmailSlugPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-lg px-4 py-10 text-gray-300">Carregando...</div>
      }
    >
      <ConfirmarEmailPublicClient />
    </Suspense>
  );
}
