import { Suspense } from "react";
import type { Metadata } from "next";
import LoginClient from "./LoginClient";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

export const metadata: Metadata = {
  title: "Login do Atleta | Fut7Pro",
  description: "Acesse sua conta de atleta no Fut7Pro.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: `${APP_URL}/login`,
  },
};

export default function LoginPage() {
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
