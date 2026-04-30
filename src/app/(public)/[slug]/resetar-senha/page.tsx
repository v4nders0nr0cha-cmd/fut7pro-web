import type { Metadata } from "next";
import { Suspense } from "react";
import ResetarSenhaAtletaClient from "@/app/(public)/resetar-senha/ResetarSenhaAtletaClient";

type ResetarSenhaPageProps = {
  params: { slug: string };
};

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

export function generateMetadata({ params }: ResetarSenhaPageProps): Metadata {
  const slug = params.slug;
  return {
    title: `Redefinir senha | ${slug} | Fut7Pro`,
    description: "Crie uma nova senha para sua conta de atleta no Fut7Pro.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${APP_URL}/${slug}/resetar-senha`,
    },
  };
}

export default function SlugResetarSenhaPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen w-full bg-[#0b0f16] text-white">
          <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c111d]/90 p-6 text-center text-sm text-gray-300">
              Carregando...
            </div>
          </div>
        </main>
      }
    >
      <ResetarSenhaAtletaClient />
    </Suspense>
  );
}
