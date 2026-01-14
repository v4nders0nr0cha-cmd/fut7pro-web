import { Suspense } from "react";
import ResetarSenhaClient from "./ResetarSenhaClient";

export const metadata = {
  title: "Redefinir senha | Fut7Pro",
  description: "Crie uma nova senha para acessar o painel Fut7Pro.",
  robots: { index: false, follow: false },
};

export default function ResetarSenhaPage() {
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
      <ResetarSenhaClient />
    </Suspense>
  );
}
