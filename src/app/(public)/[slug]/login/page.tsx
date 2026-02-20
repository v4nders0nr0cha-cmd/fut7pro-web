import { Suspense } from "react";
import type { Metadata } from "next";
import LoginClient from "@/app/(public)/login/LoginClient";

type LoginPageProps = {
  params: { slug: string };
};

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

export function generateMetadata({ params }: LoginPageProps): Metadata {
  const slug = params.slug;
  return {
    title: `Login do Atleta | ${slug} | Fut7Pro`,
    description: "Acesse sua conta de atleta no Fut7Pro.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${APP_URL}/${slug}/login`,
    },
  };
}

export default function SlugLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-lg px-4 py-10 text-gray-300">Carregando...</div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
