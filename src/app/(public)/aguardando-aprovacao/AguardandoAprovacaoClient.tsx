"use client";

import { useTema } from "@/hooks/useTema";
import { usePublicLinks } from "@/hooks/usePublicLinks";

export default function AguardandoAprovacaoClient() {
  const { nome } = useTema();
  const { publicHref } = usePublicLinks();
  const nomeDoRacha = nome || "Fut7Pro";

  return (
    <section className="w-full px-4">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-white/10 bg-[#0f1118] p-6 text-center shadow-2xl">
        <div className="mb-4 rounded-lg border border-yellow-400/30 bg-[#141824] px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
            Aguardando aprovação
          </p>
          <p className="text-sm text-gray-200">
            Racha <span className="font-semibold text-yellow-400">{nomeDoRacha}</span>
          </p>
        </div>

        <h1 className="text-xl font-bold text-white">Solicitação enviada</h1>
        <p className="mt-2 text-sm text-gray-300">
          Seu cadastro está em análise. O administrador precisa aprovar o acesso completo ao racha.
        </p>
        <p className="mt-3 text-xs text-gray-400">
          Quando a aprovação for concluída, você poderá acessar o perfil completo e os rankings.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={publicHref("/login")}
            className="rounded-lg border border-yellow-400/60 px-4 py-2 text-xs font-semibold text-yellow-300 hover:text-yellow-200"
          >
            Voltar para login
          </a>
          <a
            href={publicHref("/")}
            className="rounded-lg bg-yellow-400 px-4 py-2 text-xs font-semibold text-black hover:bg-yellow-300"
          >
            Ir para o site público
          </a>
        </div>
      </div>
    </section>
  );
}
