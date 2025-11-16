"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePublicTenantSlug } from "@/hooks/usePublicTenantSlug";

type FormState = {
  nome: string;
  email: string;
  mensagem: string;
};

type SugestaoEnviada = {
  id: string;
  mensagem: string;
  data: string;
};

function gerarId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `sugestao-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function SugestoesPage() {
  const { user } = useAuth();
  const tenantSlug = usePublicTenantSlug();
  const [form, setForm] = useState<FormState>({
    nome: user?.name ?? "",
    email: user?.email ?? "",
    mensagem: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [enviadas, setEnviadas] = useState<SugestaoEnviada[]>([]);

  const sugestoesOrdenadas = useMemo(
    () => [...enviadas].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [enviadas]
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFeedback(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.nome.trim() || !form.email.trim() || !form.mensagem.trim()) {
      setFeedback({ type: "error", message: "Informe nome, e-mail e sua sugest�o." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/contato", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim().toLowerCase(),
          assunto: "sugestao",
          mensagem: form.mensagem.trim(),
          slug: tenantSlug,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error ?? "N�o foi poss�vel enviar sua sugest�o agora.");
      }

      setFeedback({
        type: "success",
        message: "Sugest�o enviada com sucesso! O admin analisar� o mais breve poss�vel.",
      });
      setEnviadas((prev) => [
        {
          id: gerarId(),
          mensagem: form.mensagem.trim(),
          data: new Date().toISOString(),
        },
        ...prev,
      ]);
      setForm((prev) => ({ ...prev, mensagem: "" }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado ao enviar a sugest�o.";
      setFeedback({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto w-full px-4 flex flex-col gap-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-yellow-400">Sugest�es & Feedback</h1>
        <p className="text-zinc-300 text-sm leading-relaxed">
          Compartilhe ideias para melhorar o racha ou o Fut7Pro. As mensagens s�o encaminhadas aos
          administradores que, quando necess�rio, retornam pelo e-mail informado.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 rounded-2xl border border-yellow-500/40 p-5 shadow-lg space-y-4"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm text-zinc-200 font-semibold">
            Nome
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              maxLength={80}
              autoComplete="name"
              className="mt-1 w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </label>
          <label className="text-sm text-zinc-200 font-semibold">
            E-mail
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              maxLength={120}
              autoComplete="email"
              className="mt-1 w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </label>
          <label className="text-sm text-zinc-200 font-semibold">
            Conte sua ideia
            <textarea
              name="mensagem"
              value={form.mensagem}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              className="mt-1 w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-y"
              placeholder="Descreva a sugest�o ou melhoria que gostaria de ver no racha."
              required
            />
          </label>
        </div>

        {feedback && (
          <div
            className={`text-sm rounded-lg px-3 py-2 ${
              feedback.type === "success"
                ? "bg-green-900/60 border border-green-500/50 text-green-200"
                : "bg-red-900/60 border border-red-500/50 text-red-200"
            }`}
          >
            {feedback.message}
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-2 text-black font-semibold hover:bg-yellow-300 transition disabled:opacity-60"
          >
            {submitting ? "Enviando..." : "Enviar sugest�o"}
          </button>
        </div>
      </form>

      <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 shadow-lg">
        <h2 className="text-xl font-semibold text-yellow-300 mb-3">Sugest�es enviadas</h2>
        {sugestoesOrdenadas.length === 0 ? (
          <p className="text-sm text-zinc-400">
            As sugest�es enviadas aparecer�o aqui para que voc� acompanhe o status.
          </p>
        ) : (
          <ul className="space-y-3">
            {sugestoesOrdenadas.map((item) => (
              <li
                key={item.id}
                className="bg-zinc-800 rounded-xl p-3 border border-zinc-700 text-sm text-zinc-200 space-y-1"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Enviada</span>
                  <span>
                    {new Date(item.data).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-base text-white">{item.mensagem}</p>
                <span className="inline-flex items-center text-xxs uppercase tracking-wide bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">
                  Em an�lise
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
