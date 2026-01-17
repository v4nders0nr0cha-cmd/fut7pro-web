import { Suspense } from "react";
import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

export const metadata: Metadata = {
  title: "Cadastro do Atleta | Fut7Pro",
  description: "Crie sua conta de atleta para acessar o Fut7Pro.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: `${APP_URL}/register`,
  },
};

export default function RegisterPage() {
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
