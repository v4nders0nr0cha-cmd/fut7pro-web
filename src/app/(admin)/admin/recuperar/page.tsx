"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { HiOutlineMail, HiOutlineShieldCheck } from "react-icons/hi";

export default function RecuperarSenhaPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black" />}> 
      <RecuperarSenhaInner />
    </Suspense>
  );
}

function RecuperarSenhaInner() {
  const params = useSearchParams();
  const token = useMemo(() => params?.get("token") ?? "", [params]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const solicitar = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/recover/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setMessage(
        res.ok
          ? "Se o e-mail estiver cadastrado enviaremos um link de recuperação. Verifique sua caixa de entrada e spam."
          : "Não foi possível iniciar a recuperação."
      );
    } finally {
      setLoading(false);
    }
  };

  const redefinir = async () => {
    if (password !== confirm) {
      setMessage("As senhas não conferem.");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/recover/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        setMessage("Senha alterada com sucesso! Faça login novamente.");
        setTimeout(() => router.push("/admin/login"), 1200);
      } else {
        const payload = await res.json().catch(() => null);
        setMessage(payload?.error || "Token inválido ou expirado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,204,0,0.20),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(34,197,94,0.16),_transparent_60%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-16">
        {!token ? (
          <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-black/70 p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 text-yellow-300">
              <HiOutlineMail className="h-6 w-6" />
              <span className="text-sm font-semibold uppercase tracking-[0.3em]">Recuperar acesso</span>
            </div>
            <h1 className="mt-4 text-2xl font-bold">Esqueceu sua senha?</h1>
            <p className="mt-2 text-sm text-zinc-300">
              Informe o e-mail usado no cadastro do painel admin. Enviaremos um link temporário para você criar
              uma nova senha.
            </p>

            <div className="mt-6">
              <label className="text-sm font-semibold text-zinc-200">E-mail cadastrado</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="presidente@seuracha.com"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder:text-zinc-400 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
              />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={solicitar}
              className="mt-6 w-full rounded-xl bg-yellow-400 py-3 text-base font-bold uppercase tracking-wide text-black shadow-[0_10px_30px_rgba(255,215,0,0.35)] transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </button>

            <p className="mt-6 text-center text-sm text-zinc-300">
              Lembrou a senha?{" "}
              <button
                type="button"
                onClick={() => router.push("/admin/login")}
                className="font-semibold text-yellow-300 hover:text-yellow-200"
              >
                Voltar para o login
              </button>
            </p>

            {message && <div className="mt-4 text-sm text-yellow-200">{message}</div>}
          </section>
        ) : (
          <section className="w-full max-w-lg rounded-3xl border border-emerald-400/20 bg-black/70 p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 text-emerald-300">
              <HiOutlineShieldCheck className="h-6 w-6" />
              <span className="text-sm font-semibold uppercase tracking-[0.3em]">Definir nova senha</span>
            </div>
            <h1 className="mt-4 text-2xl font-bold">Crie uma nova senha segura</h1>
            <p className="mt-2 text-sm text-zinc-300">
              Digite uma nova senha para sua conta. Ela deve ter pelo menos 8 caracteres.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-zinc-200">Nova senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder:text-zinc-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-200">Confirmar nova senha</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  placeholder="Repita a senha"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder:text-zinc-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={redefinir}
              className="mt-6 w-full rounded-xl bg-emerald-400 py-3 text-base font-bold uppercase tracking-wide text-black shadow-[0_10px_30px_rgba(16,185,129,0.35)] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>

            <p className="mt-6 text-center text-sm text-zinc-300">
              Token expirou?{" "}
              <button
                type="button"
                onClick={() => router.replace("/admin/recuperar")}
                className="font-semibold text-emerald-300 hover:text-emerald-200"
              >
                Solicitar novamente
              </button>
            </p>

            {message && <div className="mt-4 text-sm text-emerald-200">{message}</div>}
          </section>
        )}
      </div>
    </main>
  );
}
