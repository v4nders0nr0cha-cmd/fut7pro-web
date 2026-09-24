import { Suspense } from "react";
import type { Metadata } from "next";
import RegisterClient from "@/app/(public)/register/RegisterClient";

type RegisterPageProps = {
  params: Promise<{ slug: string }>;
};

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

export async function generateMetadata(props: RegisterPageProps): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug;
  return {
    title: `Cadastro do Atleta | ${slug} | Fut7Pro`,
    description: "Crie sua conta de atleta para acessar o Fut7Pro.",
    robots: { index: false, follow: true },
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
