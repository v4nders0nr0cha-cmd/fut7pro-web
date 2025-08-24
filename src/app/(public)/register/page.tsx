"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRacha } from "@/context/RachaContext";
import { rachaMap } from "@/config/rachaMap";

export default function RegisterPage() {
  const router = useRouter();
  const { rachaId } = useRacha();
  const nomeDoRacha = rachaMap[rachaId]?.nome || "Fut7Pro";

  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nome.length > 10 || apelido.length > 10) {
      alert("Nome e Apelido devem ter no máximo 10 letras.");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, apelido, email, senha }),
    });

    if (res.ok) {
      alert("Conta criada com sucesso!");
      router.push("/login");
    } else {
      const erro = await res.text();
      alert("Erro ao cadastrar: " + erro);
    }
  };

  return (
    <main className="flex min-h-[80vh] w-full flex-col items-center justify-center pb-10 pt-8 md:pt-16">
      <div className="w-full max-w-sm rounded-lg bg-zinc-900 p-6 shadow-lg">
        <h1 className="mb-4 text-center text-xl font-bold">Criar Conta</h1>
        <p className="mb-6 text-center text-base font-medium leading-snug text-gray-300">
          Junte-se ao nosso time! Faça seu cadastro para participar dos
          rankings, das partidas e conquistar seu lugar no Hall da Fama do{" "}
          <span className="font-bold text-yellow-400">{nomeDoRacha}</span>.
          Cadastro exclusivo para atletas, sujeito à aprovação do administrador.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={10}
            required
            placeholder="Nome (máx. 10 letras)"
            className="w-full rounded bg-zinc-800 p-2 text-white"
          />

          <input
            type="text"
            value={apelido}
            onChange={(e) => setApelido(e.target.value)}
            maxLength={10}
            required
            placeholder="Apelido (máx. 10 letras)"
            className="w-full rounded bg-zinc-800 p-2 text-white"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="E-mail"
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

          <button
            type="submit"
            className="w-full rounded bg-yellow-400 py-2 font-bold text-black hover:bg-yellow-300"
          >
            Cadastrar
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          Já tem conta?{" "}
          <a href="/login" className="text-yellow-400 hover:underline">
            Entrar
          </a>
        </div>
      </div>
    </main>
  );
}
