"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const HIGHLIGHTS = [
  {
    title: "Atualizacao em tempo real",
    description: "Tudo que voce edita no painel aparece no site publico do racha.",
  },
  {
    title: "Multi-admin com seguranca",
    description: "Permissoes por perfil e logs de auditoria para cada acao.",
  },
  {
    title: "Financeiro profissional",
    description: "Controle receitas, despesas e patrocinadores em um unico lugar.",
  },
  {
    title: "Rankings oficiais",
    description: "Estatisticas, conquistas e destaques sempre atualizados.",
  },
];

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "https://api.fut7pro.com.br";
  const loginPath = process.env.AUTH_LOGIN_PATH || "/auth/login";
  const contactEmail = "social@fut7pro.com.br";

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErro("");
    setBlocked(false);
    setIsSubmitting(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password: senha,
      });

      if (res?.ok) {
        router.push("/admin/dashboard");
        return;
      }

      try {
        const resp = await fetch(`${apiBase}${loginPath}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: senha }),
        });

        const body = await resp.json().catch(() => ({}) as any);
        const message = (body as any)?.message?.toString?.() ?? "";
        const isBlocked =
          message.toLowerCase().includes("bloque") ||
          message.toLowerCase().includes("blocked") ||
          message.toLowerCase().includes("paused");

        if (isBlocked) {
          setBlocked(true);
          return;
        }
      } catch {
        // ignore
      }

      setErro("E-mail ou senha invalidos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0b0f16] text-white">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(11,15,22,0.65) 0%, rgba(14,21,37,0.55) 50%, rgba(11,15,22,0.75) 100%), url('/images/Capa%20trofeu.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.18),_transparent_55%)]" />
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <section className="order-1 w-full lg:order-2 lg:w-[420px] animate-fade-in">
          <div className="rounded-2xl border border-white/10 bg-[#0c111d]/85 p-6 shadow-2xl backdrop-blur-xl">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Acesse seu painel</h2>
              <p className="text-sm text-gray-300">
                Use o e-mail cadastrado do presidente ou administrador do racha.
              </p>
            </div>

            {erro && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-4 rounded-lg border border-red-500/50 bg-red-600/20 px-3 py-2 text-sm text-red-200"
              >
                {erro}
              </div>
            )}

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/admin/dashboard" })}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white transition hover:border-white/20"
              >
                Continuar com Google
              </button>
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-gray-500">
                <span className="h-px flex-1 bg-white/10" />
                ou
                <span className="h-px flex-1 bg-white/10" />
              </div>
            </div>

            <form onSubmit={handleLogin} className="mt-4 space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                E-mail
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  placeholder="email@exemplo.com"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Senha
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-yellow-400 py-2.5 font-bold text-black shadow-lg transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Entrando..." : "Entrar no painel"}
              </button>
            </form>

            <div className="mt-5 flex flex-col gap-2 text-center text-sm text-gray-300">
              <a
                href={`mailto:${contactEmail}?subject=Recuperar%20acesso%20ao%20painel%20Fut7Pro`}
                className="text-yellow-300 underline hover:text-yellow-200"
              >
                Esqueci minha senha
              </a>
              <div>
                Nao tem conta?{" "}
                <a
                  href="/cadastrar-racha"
                  className="text-yellow-300 underline hover:text-yellow-200"
                >
                  Cadastre seu racha
                </a>
              </div>
              <a
                href={`mailto:${contactEmail}`}
                className="text-yellow-300 underline hover:text-yellow-200"
              >
                Precisa de ajuda? Fale conosco
              </a>
            </div>
          </div>

          <p className="mt-4 hidden text-xs text-gray-400 sm:block">
            Acesso protegido por autenticacao segura e isolada por tenant.
          </p>
        </section>

        <section className="order-2 w-full space-y-5 lg:order-1 lg:w-1/2 animate-slide-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-300">
            Painel Fut7Pro
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Login do Administrador</h1>
            <p className="text-sm leading-relaxed text-gray-300 sm:hidden">
              Acesse a administracao do seu racha.
            </p>
            <p className="hidden text-sm leading-relaxed text-gray-300 sm:block sm:text-base">
              Acesse o centro de comando do seu racha. Tudo que voce atualiza no painel reflete no
              site publico do racha com sincronizacao imediata.
            </p>
          </div>

          <details className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300 backdrop-blur sm:hidden">
            <summary className="cursor-pointer text-sm font-semibold text-white">
              Ver beneficios do painel
            </summary>
            <div className="mt-3 space-y-2 text-xs text-gray-300">
              <ul className="space-y-2">
                {HIGHLIGHTS.map((item) => (
                  <li key={item.title}>
                    <span className="font-semibold text-white">{item.title}:</span>{" "}
                    {item.description}
                  </li>
                ))}
              </ul>
              <div className="border-t border-white/10 pt-3">
                Precisa de ajuda?{" "}
                <a href={`mailto:${contactEmail}`} className="text-yellow-300 underline">
                  {contactEmail}
                </a>
              </div>
            </div>
          </details>

          <div className="hidden grid-cols-2 gap-3 sm:grid">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur"
              >
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="hidden rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300 backdrop-blur sm:block">
            <div className="font-semibold text-white">Suporte direto</div>
            <p className="mt-1 text-xs text-gray-300">
              Precisa de ajuda para entrar? Fale com a equipe pelo e-mail{" "}
              <a href={`mailto:${contactEmail}`} className="text-yellow-300 underline">
                {contactEmail}
              </a>
              .
            </p>
          </div>
        </section>
      </div>

      {blocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f1118] p-6 shadow-2xl animate-slide-in">
            <h2 className="text-xl font-bold text-center text-white">Acesso ao painel bloqueado</h2>
            <p className="mt-3 text-center text-sm leading-relaxed text-gray-300">
              Este racha esta temporariamente bloqueado pelo Fut7Pro e, no momento, nao e possivel
              acessar o painel administrativo.
            </p>
            <p className="mt-3 text-center text-sm leading-relaxed text-gray-300">
              Para solicitar o desbloqueio, entre em contato pelo e-mail{" "}
              <a href={`mailto:${contactEmail}`} className="text-yellow-300 underline">
                {contactEmail}
              </a>
              .
            </p>
            <p className="mt-3 text-center text-sm leading-relaxed text-gray-400">
              Se possivel, informe o nome do racha, o slug e o e-mail do administrador.
            </p>
            <button
              className="mt-5 w-full rounded-lg bg-yellow-400 py-2.5 font-bold text-black shadow-lg transition hover:bg-yellow-300"
              onClick={() => setBlocked(false)}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
