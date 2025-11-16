"use client";

import { useState, useMemo } from "react";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import { POSITION_OPTIONS, type PositionValue } from "@/constants/positions";
const DEFAULT_TENANT_SLUG =
  process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? rachaConfig.slug ?? "fut7pro";

type Feedback = { type: "success" | "error"; message: string } | null;

export default function RegisterPage() {
  const { rachaId } = useRacha();
  const { racha: rachaSelecionado } = useRachaPublic(rachaId);
  const nomeDoRacha = useMemo(
    () => rachaSelecionado?.nome ?? rachaConfig.nome ?? "Fut7Pro",
    [rachaSelecionado?.nome]
  );
  const tenantSlug = useMemo(
    () => rachaSelecionado?.slug?.trim() || DEFAULT_TENANT_SLUG,
    [rachaSelecionado?.slug]
  );

  const [nome, setNome] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [posicao, setPosicao] = useState<PositionValue>("meia");
  const [mensagem, setMensagem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    if (nome.trim().length < 3) {
      setFeedback({ type: "error", message: "Informe seu nome completo." });
      return;
    }

    if (nickname.trim().length < 2) {
      setFeedback({ type: "error", message: "Informe um apelido com pelo menos 2 letras." });
      return;
    }

    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed.includes("@")) {
      setFeedback({ type: "error", message: "Informe um e-mail válido para contato." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: tenantSlug,
          nome: nome.trim(),
          nickname: nickname.trim(),
          email: emailTrimmed,
          posicao,
          mensagem: mensagem.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          data?.message ??
          data?.error ??
          "Não foi possível enviar sua solicitação. Tente novamente em instantes.";
        throw new Error(message);
      }

      setFeedback({
        type: "success",
        message:
          "Recebemos sua solicitação! Nossa equipe irá analisá-la e você será avisado por e-mail assim que for aprovada.",
      });
      setNome("");
      setNickname("");
      setEmail("");
      setMensagem("");
      setPosicao("meia");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Falha ao enviar sua solicitação. Tente novamente mais tarde.";
      setFeedback({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full min-h-[80vh] flex flex-col items-center justify-center pt-10 md:pt-16 pb-12 px-4">
      <div className="bg-zinc-900/90 border border-zinc-700/60 p-8 rounded-2xl shadow-2xl w-full max-w-lg backdrop-blur-sm">
        <h1 className="text-2xl md:text-3xl font-black text-center text-yellow-400 mb-4">
          Solicite sua Vaga no Racha
        </h1>
        <p className="text-gray-300 text-center text-base leading-relaxed mb-6">
          Preencha os dados abaixo para pedir acesso ao{" "}
          <span className="text-yellow-400 font-semibold">{nomeDoRacha}</span>. O administrador
          avalia cada pedido e responde o quanto antes. Se houver vagas, você será convidado para
          participar das próximas partidas!
        </p>

        {feedback && (
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium mb-6 ${
              feedback.type === "success"
                ? "bg-green-900/40 border border-green-500/40 text-green-200"
                : "bg-red-900/40 border border-red-500/40 text-red-200"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="sr-only">
              Nome completo
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              maxLength={60}
              required
              placeholder="Nome completo"
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label htmlFor="apelido" className="sr-only">
              Apelido
            </label>
            <input
              id="apelido"
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              maxLength={40}
              required
              placeholder="Apelido preferido"
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label htmlFor="email" className="sr-only">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={120}
              required
              placeholder="E-mail para contato"
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label htmlFor="posicao" className="text-sm font-semibold text-zinc-300 mb-1 block">
              Posição preferida
            </label>
            <select
              id="posicao"
              value={posicao}
              onChange={(event) => setPosicao(event.target.value as PositionValue)}
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {POSITION_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mensagem" className="text-sm font-semibold text-zinc-300 mb-1 block">
              Conte um pouco sobre você (opcional)
            </label>
            <textarea
              id="mensagem"
              value={mensagem}
              onChange={(event) => setMensagem(event.target.value)}
              rows={4}
              maxLength={400}
              placeholder="Posso jogar em mais de uma posição, tenho experiência, etc."
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-y"
            />
            <p className="text-xs text-zinc-400 mt-1">
              Essa mensagem ajuda o administrador a conhecer melhor seu perfil.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Enviando..." : "Enviar solicitação"}
          </button>
        </form>

        <p className="text-xs text-zinc-400 mt-6 text-center leading-relaxed">
          Ao enviar a solicitação você concorda em compartilhar seus dados com o administrador do
          racha. Caso a vaga seja aprovada, você receberá um e-mail com as instruções para acessar a
          plataforma e concluir seu cadastro.
        </p>
      </div>
    </main>
  );
}
