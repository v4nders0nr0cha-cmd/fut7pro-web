import type { Metadata } from "next";
import { rachaConfig } from "@/config/racha.config";
import EsqueciSenhaAtletaClient from "@/app/(public)/esqueci-senha/EsqueciSenhaAtletaClient";

type EsqueciSenhaPageProps = {
  params: { slug: string };
};

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

export function generateMetadata({ params }: EsqueciSenhaPageProps): Metadata {
  const slug = params.slug || rachaConfig.slug;
  return {
    title: `Esqueci minha senha | ${slug} | Fut7Pro`,
    description: "Recupere a senha da sua conta de atleta no Fut7Pro.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${APP_URL}/${slug}/esqueci-senha`,
    },
  };
}

export default function SlugEsqueciSenhaPage() {
  return <EsqueciSenhaAtletaClient />;
}
