import type { Metadata } from "next";
import ResetarSenhaClient from "@/app/admin/resetar-senha/ResetarSenhaClient";

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
    description: "Crie uma nova senha para acessar sua conta Fut7Pro.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${APP_URL}/${slug}/resetar-senha`,
    },
  };
}

export default function SlugResetarSenhaPage({ params }: ResetarSenhaPageProps) {
  const loginHref = `/${params.slug}/login`;
  const forgotHref = `/${params.slug}/esqueci-senha`;

  return (
    <ResetarSenhaClient
      description="Crie uma nova senha para acessar sua conta de atleta no Fut7Pro."
      loginHref={loginHref}
      forgotHref={forgotHref}
    />
  );
}
