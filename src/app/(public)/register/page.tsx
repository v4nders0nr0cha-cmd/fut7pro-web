"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTema } from "@/hooks/useTema";
import { usePublicLinks } from "@/hooks/usePublicLinks";

export default function RegisterPage() {
  const router = useRouter();
  const { nome: nomeRacha } = useTema();
  const { publicHref } = usePublicLinks();
  const nomeDoRacha = nomeRacha || "Fut7Pro";

  const [nomeAtleta, setNomeAtleta] = useState("");
  const [apelido, setApelido] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nomeAtleta.length > 10 || apelido.length > 10) {
      alert("Nome e Apelido devem ter no máximo 10 letras.");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nomeAtleta, apelido, email, senha }),
    });

    if (res.ok) {
      alert("Conta criada com sucesso!");
      router.push(publicHref("/login"));
    } else {
      const erro = await res.text();
      alert("Erro ao cadastrar: " + erro);
    }
  };

  return (
    <main className="w-full min-h-[80vh] flex flex-col items-center justify-center pt-8 md:pt-16 pb-10">
      <div className="bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">Criar Conta</h1>
        <p className="text-gray-300 text-center mb-6 text-base font-medium leading-snug">
          Junte-se ao nosso time! Faça seu cadastro para participar dos rankings, das partidas e
          conquistar seu lugar no Hall da Fama do{" "}
          <span className="text-yellow-400 font-bold">{nomeDoRacha}</span>. Cadastro exclusivo para
          atletas, sujeito à aprovação do administrador.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            value={nomeAtleta}
            onChange={(e) => setNomeAtleta(e.target.value)}
            maxLength={10}
            required
            placeholder="Nome (máx. 10 letras)"
            className="w-full p-2 rounded bg-zinc-800 text-white"
          />

          <input
            type="text"
            value={apelido}
            onChange={(e) => setApelido(e.target.value)}
            maxLength={10}
            required
            placeholder="Apelido (máx. 10 letras)"
            className="w-full p-2 rounded bg-zinc-800 text-white"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="E-mail"
            className="w-full p-2 rounded bg-zinc-800 text-white"
          />

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            placeholder="Senha"
            className="w-full p-2 rounded bg-zinc-800 text-white"
          />

          <button
            type="submit"
            className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-300"
          >
            Cadastrar
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          Já tem conta?{" "}
          <a href={publicHref("/login")} className="text-yellow-400 hover:underline">
            Entrar
          </a>
        </div>
      </div>
    </main>
  );
}
