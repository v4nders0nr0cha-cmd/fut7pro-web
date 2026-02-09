import Link from "next/link";

export default function PublicSlugNotFound() {
  return (
    <main className="min-h-screen bg-[#0b0f16] px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-2xl border border-white/10 bg-[#0f1118] p-8 text-center shadow-2xl">
        <p className="mb-3 rounded-full border border-red-400/40 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-200">
          Racha não encontrado
        </p>
        <h1 className="text-2xl font-bold">Este racha não existe ou não está disponível.</h1>
        <p className="mt-3 text-sm text-gray-300">
          Verifique o link informado e tente novamente. Se o problema continuar, entre em contato
          com o administrador do racha.
        </p>
        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-center font-semibold text-black"
          >
            Voltar para o Fut7Pro
          </Link>
          <Link
            href="/cadastrar-racha"
            className="flex-1 rounded-lg border border-white/20 px-4 py-2.5 text-center font-semibold text-white hover:border-white/40"
          >
            Criar meu racha
          </Link>
        </div>
      </div>
    </main>
  );
}
