import { Suspense } from "react";
import type { Metadata } from "next";
import RegisterClient from "@/app/(public)/register/RegisterClient";

type RegisterPageProps = {
  params: { slug: string };
};

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

export function generateMetadata({ params }: RegisterPageProps): Metadata {
  const slug = params.slug;
  return {
    title: `Cadastro do Atleta | ${slug} | Fut7Pro`,
    description: "Crie sua conta de atleta para acessar o Fut7Pro.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${APP_URL}/${slug}/register`,
    },
  };
}

export default function SlugRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-lg px-4 py-10 text-gray-300">Carregando...</div>
      }
    >
      <RegisterClient />
    </Suspense>
  );
}
