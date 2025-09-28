"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminRegisterPage() {
  const router = useRouter();

  const [nomeRacha, setNomeRacha] = useState("");
  const [slug, setSlug] = useState("");
  const [presidenteNome, setPresidenteNome] = useState("");
  const [presidenteApelido, setPresidenteApelido] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [erro, setErro] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro("");

    const normalizedSlug = normalizeSlug(slug || nomeRacha);

    if (nomeRacha.trim().length < 3 || nomeRacha.trim().length > 64) {
      setErro("Nome do racha deve ter entre 3 e 64 caracteres.");
      return;
    }
    if (presidenteNome.trim().length < 3 || presidenteNome.trim().length > 60) {
      setErro("Nome do presidente deve ter entre 3 e 60 caracteres.");
      return;
    }
    if (presidenteApelido.trim().length < 2 || presidenteApelido.trim().length > 20) {
      setErro("Apelido deve ter entre 2 e 20 caracteres.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(normalizedSlug) || normalizedSlug.length < 3) {
      setErro("Slug deve ser minusculo, sem espacos e conter apenas letras, numeros e hifens.");
      return;
    }
    if (senha !== confirmSenha) {
      setErro("As senhas nao conferem.");
      return;
    }
    if (senha.length < 8) {
      setErro("Senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nomeRacha.trim(),
          slug: normalizedSlug,
          email: email.trim(),
          senha,
          presidenteNome: presidenteNome.trim(),
          presidenteApelido: presidenteApelido.trim(),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (response.ok) {
        alert(payload?.message ?? "Cadastro recebido! Aguarde a validacao da equipe Fut7Pro.");
        router.push("/admin/login");
        return;
      }

      const errorMessage =
        payload && typeof payload.error === "string" ? payload.error : "Erro ao cadastrar racha.";
      setErro(errorMessage);
    } catch (error) {
      console.error("Falha ao cadastrar racha", error);
      setErro("Erro inesperado ao cadastrar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Cadastrar Racha | Painel Admin | Fut7Pro</title>
        <meta
          name="description"
          content="Cadastre seu racha, informe os dados do presidente e solicite acesso ao painel administrativo do Fut7Pro."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <main className="w-full min-h-[80vh] flex flex-col items-center justify-center pt-8 md:pt-16 pb-10">
        <div className="bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-xl font-bold mb-4 text-center">Cadastrar Racha</h1>
          <p className="text-gray-300 text-center mb-6 text-base font-medium leading-snug">
            Cadastre seu racha, informe os dados do presidente e aguarde a validacao da equipe
            Fut7Pro para liberar o painel admin.
          </p>
          {erro && (
            <div className="bg-red-600 text-white text-sm rounded p-2 mb-4 text-center">{erro}</div>
          )}
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              value={nomeRacha}
              onChange={(event) => setNomeRacha(event.target.value)}
              required
              placeholder="Nome do Racha (3-64 letras)"
              minLength={3}
              maxLength={64}
              className="w-full p-2 rounded bg-zinc-800 text-white"
            />
            <input
              type="text"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="Slug (ex: quarta-fc)"
              minLength={3}
              maxLength={32}
              className="w-full p-2 rounded bg-zinc-800 text-white"
              autoCapitalize="none"
              autoCorrect="off"
            />
            <input
              type="text"
              value={presidenteNome}
              onChange={(event) => setPresidenteNome(event.target.value)}
              required
              placeholder="Nome completo do presidente"
              minLength={3}
              maxLength={60}
              className="w-full p-2 rounded bg-zinc-800 text-white"
            />
            <input
              type="text"
              value={presidenteApelido}
              onChange={(event) => setPresidenteApelido(event.target.value)}
              required
              placeholder="Apelido do presidente"
              minLength={2}
              maxLength={20}
              className="w-full p-2 rounded bg-zinc-800 text-white"
            />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="E-mail do presidente"
              className="w-full p-2 rounded bg-zinc-800 text-white"
            />
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
              placeholder="Senha (minimo 8 caracteres)"
              minLength={8}
              className="w-full p-2 rounded bg-zinc-800 text-white"
            />
            <input
              type="password"
              value={confirmSenha}
              onChange={(event) => setConfirmSenha(event.target.value)}
              required
              placeholder="Confirmar Senha"
              minLength={8}
              className="w-full p-2 rounded bg-zinc-800 text-white"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enviando..." : "Cadastrar Racha"}
            </button>
          </form>
          <div className="mt-6 text-center text-sm">
            Ja tem painel?{" "}
            <a href="/admin/login" className="text-yellow-400 hover:underline">
              Entrar
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
