"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePublicTenantSlug } from "@/hooks/usePublicTenantSlug";

type FormState = {
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
};

export default function ChatClient() {
  const { user } = useAuth();
  const tenantSlug = usePublicTenantSlug();
  const [form, setForm] = useState<FormState>({
    nome: user?.name ?? "",
    email: user?.email ?? "",
    telefone: "",
    mensagem: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFeedback(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.nome.trim() || !form.email.trim() || !form.mensagem.trim()) {
      setFeedback({ type: "error", message: "Preencha nome, e-mail e mensagem para enviar." });
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
          telefone: form.telefone.trim() || undefined,
          assunto: "suporte",
          mensagem: form.mensagem.trim(),
          slug: tenantSlug,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error ?? "Falha ao enviar mensagem de suporte.");
      }

      setFeedback({
        type: "success",
        message: "Recebemos sua mensagem! A equipe do racha responder� por e-mail.",
      });
      setForm((prev) => ({ ...prev, mensagem: "" }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "N�o foi poss�vel enviar sua mensagem agora.";
      setFeedback({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-zinc-900 rounded-2xl p-5 border border-zinc-800 shadow-lg">
      <section className="bg-zinc-800/80 rounded-xl p-4 border border-yellow-500/30">
        <h2 className="text-lg font-semibold text-yellow-300 mb-1">Central de Suporte</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Precisa falar com os administradores do seu racha? Envie sua d�vida e acompanhe a resposta
          diretamente pelo e-mail cadastrado. O time costuma responder em at� 1 dia �til.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm text-zinc-300 flex flex-col gap-1">
            Nome completo
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              maxLength={80}
              autoComplete="name"
              className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </label>
          <label className="text-sm text-zinc-300 flex flex-col gap-1">
            E-mail para retorno
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              maxLength={100}
              autoComplete="email"
              className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </label>
        </div>

        <label className="text-sm text-zinc-300 flex flex-col gap-1">
          Telefone / WhatsApp (opcional)
          <input
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            maxLength={30}
            className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="(11) 99999-0000"
          />
        </label>

        <label className="text-sm text-zinc-300 flex flex-col gap-1">
          Como podemos ajudar?
          <textarea
            name="mensagem"
            value={form.mensagem}
            onChange={handleChange}
            rows={4}
            maxLength={600}
            className="rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-y"
            placeholder="Descreva sua d�vida ou problema com detalhes..."
            required
          />
        </label>

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

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-black font-semibold hover:bg-yellow-300 transition disabled:opacity-60"
        >
          {submitting ? "Enviando..." : "Enviar mensagem"}
        </button>
      </form>

      <p className="text-xs text-zinc-500 text-center">
        Dica: responda os e-mails do Fut7Pro para manter o hist�rico da conversa e agilizar o
        atendimento.
      </p>
    </div>
  );
}
