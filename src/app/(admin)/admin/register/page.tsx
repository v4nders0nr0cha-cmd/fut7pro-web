"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";

export default function AdminRegisterPage() {
  const router = useRouter();

  const [nomeRacha, setNomeRacha] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (nomeRacha.length < 3 || nomeRacha.length > 32) {
      setErro("O nome do racha deve ter entre 3 e 32 caracteres.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 3) {
      setErro(
        "O slug deve ser minúsculo, sem espaços e pode conter apenas letras, números e hífens.",
      );
      return;
    }
    if (senha !== confirmSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    const res = await fetch("/api/admin/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nomeRacha,
        slug,
        email,
        senha,
      }),
    });

    if (res.ok) {
      alert("Cadastro realizado! Aguarde a aprovação do Fut7Pro.");
      router.push("/admin/login");
    } else {
      const erroMsg = await res.text();
      setErro("Erro ao cadastrar: " + erroMsg);
    }
  };

  return (
    <>
      <Head>
        <title>Cadastrar Racha | Painel Admin | Fut7Pro</title>
        <meta
          name="description"
          content="Cadastre seu racha e ative o painel administrativo no Fut7Pro. Exclusivo para presidentes e gestores de Futebol 7."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <main className="flex min-h-[80vh] w-full flex-col items-center justify-center pb-10 pt-8 md:pt-16">
        <div className="w-full max-w-sm rounded-lg bg-zinc-900 p-6 shadow-lg">
          <h1 className="mb-4 text-center text-xl font-bold">
            Cadastrar Racha
          </h1>
          <p className="mb-6 text-center text-base font-medium leading-snug text-gray-300">
            Cadastre seu racha, escolha o slug de acesso e crie a conta de
            presidente do Painel Admin. O acesso será avaliado e ativado pela
            equipe Fut7Pro.
          </p>
          {erro && (
            <div className="mb-4 rounded bg-red-600 p-2 text-center text-sm text-white">
              {erro}
            </div>
          )}
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              value={nomeRacha}
              onChange={(e) => setNomeRacha(e.target.value)}
              required
              placeholder="Nome do Racha (3-32 letras)"
              minLength={3}
              maxLength={32}
              className="w-full rounded bg-zinc-800 p-2 text-white"
            />
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="Slug (ex: quarta-fc)"
              minLength={3}
              maxLength={24}
              className="w-full rounded bg-zinc-800 p-2 text-white"
              autoCapitalize="none"
              autoCorrect="off"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="E-mail do presidente"
              className="w-full rounded bg-zinc-800 p-2 text-white"
            />
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="Senha"
              className="w-full rounded bg-zinc-800 p-2 text-white"
            />
            <input
              type="password"
              value={confirmSenha}
              onChange={(e) => setConfirmSenha(e.target.value)}
              required
              placeholder="Confirmar Senha"
              className="w-full rounded bg-zinc-800 p-2 text-white"
            />
            <button
              type="submit"
              className="w-full rounded bg-yellow-400 py-2 font-bold text-black transition hover:bg-yellow-300"
            >
              Cadastrar Racha
            </button>
          </form>
          <div className="mt-6 text-center text-sm">
            Já tem painel?{" "}
            <a href="/admin/login" className="text-yellow-400 hover:underline">
              Entrar
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
