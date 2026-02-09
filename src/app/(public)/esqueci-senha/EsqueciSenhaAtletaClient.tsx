"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useTema } from "@/hooks/useTema";

type Status = "idle" | "loading" | "sent" | "error";

export default function EsqueciSenhaAtletaClient() {
  const router = useRouter();
  const { publicHref } = usePublicLinks();
  const { nome } = useTema();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setStatus("error");
        setMessage(data?.message || "Não foi possível enviar o e-mail agora.");
        return;
      }

      setStatus("sent");
      setMessage(
        "Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha. Verifique sua caixa de entrada e spam."
      );
    } catch {
      setStatus("error");
      setMessage("Falha ao solicitar o link. Tente novamente.");
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#0b0f16] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c111d]/90 p-6 shadow-2xl backdrop-blur-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-soft">
              Recuperar acesso
            </div>
            <h1 className="text-2xl font-bold text-white">Esqueci minha senha</h1>
            <p className="text-sm text-gray-300">
              Informe seu e-mail para receber o link de redefinição da sua conta de atleta no{" "}
              <span className="font-semibold text-brand-soft">{nome || "Fut7Pro"}</span>.
            </p>
          </div>

          {message && (
            <div
              role="alert"
              aria-live="polite"
              className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
                status === "error"
                  ? "border-red-500/50 bg-red-600/20 text-red-200"
                  : "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              E-mail
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                placeholder="email@exemplo.com"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </label>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-lg bg-brand py-2.5 font-bold text-black shadow-lg transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? "Enviando..." : "Enviar link de recuperação"}
            </button>
          </form>

          <div className="mt-5 space-y-2 text-center text-xs text-gray-400">
            <p>Não encontrou? Verifique também as pastas Spam, Lixo eletrônico ou Promoções.</p>
            <button
              type="button"
              onClick={() => router.push(publicHref("/entrar"))}
              className="text-brand-soft underline hover:text-brand"
            >
              Voltar para entrar
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
