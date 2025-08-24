"use client";

import Head from "next/head";
import { useState } from "react";
import RestrictAccess from "@/components/admin/RestrictAccess";

// MOCK DE ATLETAS (substitua por fetch real depois)
const atletas = [
  {
    id: "j1",
    nome: "Bruno Santos",
    email: "bruno@fut7.com",
    avatar: "/images/jogadores/jogador_padrao_05.jpg",
  },
  {
    id: "j2",
    nome: "Felipe Souza",
    email: "felipe@fut7.com",
    avatar: "/images/jogadores/jogador_padrao_06.jpg",
  },
  {
    id: "j3",
    nome: "André Silva",
    email: "andre@fut7.com",
    avatar: "/images/jogadores/jogador_padrao_07.jpg",
  },
];

const cargoLogado = "Presidente"; // só presidente pode acessar

export default function TransferirPropriedadePage() {
  const [busca, setBusca] = useState("");
  const [atleta, setAtleta] = useState<(typeof atletas)[0] | null>(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [error, setError] = useState("");

  const atletasFiltrados = atletas.filter(
    (a) =>
      a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.email.toLowerCase().includes(busca.toLowerCase()),
  );

  function handleTransferir(e: React.FormEvent) {
    e.preventDefault();
    if (!atleta) return setError("Selecione o novo presidente.");
    if (!senha || !email) return setError("Preencha todos os campos.");
    // Aqui faria request real de transferência
    setConfirmado(true);
    setError("");
  }

  if (cargoLogado !== "Presidente") {
    return (
      <RestrictAccess msg="Apenas o presidente pode transferir a propriedade do racha." />
    );
  }

  return (
    <>
      <Head>
        <title>Transferir Propriedade | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Transfira a presidência do racha para outro administrador de forma segura."
        />
        <meta
          name="keywords"
          content="Fut7, racha, presidente, transferência, SaaS"
        />
      </Head>
      <div className="mx-auto w-full max-w-lg pb-24 pt-20 md:pb-12 md:pt-10">
        <h1 className="mb-4 text-2xl font-bold text-zinc-100">
          Transferir Propriedade
        </h1>
        <p className="mb-6 text-zinc-300">
          Você está prestes a transferir a presidência do racha. Essa ação é{" "}
          <span className="font-bold text-yellow-400">irreversível</span>.
        </p>
        {confirmado ? (
          <div className="mt-8 rounded bg-green-700 p-4 text-center font-bold text-white">
            Propriedade transferida com sucesso!
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleTransferir}>
            <div>
              <label className="mb-1 block text-sm font-semibold text-zinc-100">
                Buscar Atleta (Novo Presidente)
              </label>
              <input
                type="text"
                placeholder="Nome ou e-mail"
                className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-white"
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setAtleta(null);
                }}
                autoComplete="off"
              />
              {busca && (
                <div className="mt-1 max-h-36 overflow-y-auto rounded border border-zinc-700 bg-zinc-900">
                  {atletasFiltrados.length === 0 && (
                    <div className="px-3 py-2 text-xs text-zinc-400">
                      Nenhum atleta encontrado.
                    </div>
                  )}
                  {atletasFiltrados.map((a) => (
                    <div
                      key={a.id}
                      className={`flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-zinc-700 ${
                        atleta?.id === a.id ? "bg-zinc-800" : ""
                      }`}
                      onClick={() => setAtleta(a)}
                    >
                      <img
                        src={a.avatar}
                        width={32}
                        height={32}
                        alt={a.nome}
                        className="rounded-full"
                      />
                      <span className="text-sm text-zinc-100">{a.nome}</span>
                      <span className="text-xs text-zinc-400">{a.email}</span>
                    </div>
                  ))}
                </div>
              )}
              {atleta && (
                <div className="mt-3 flex items-center gap-3 rounded border border-zinc-800 bg-zinc-900 p-2">
                  <img
                    src={atleta.avatar}
                    width={32}
                    height={32}
                    alt={atleta.nome}
                    className="rounded-full"
                  />
                  <span className="text-sm text-zinc-100">{atleta.nome}</span>
                  <span className="text-xs text-zinc-400">{atleta.email}</span>
                  <button
                    onClick={() => setAtleta(null)}
                    type="button"
                    className="ml-auto text-xs text-red-400 hover:underline"
                  >
                    remover
                  </button>
                </div>
              )}
            </div>
            <label className="text-sm font-semibold text-zinc-100">
              E-mail do novo presidente
              <input
                className="mt-1 w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-white"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                placeholder="E-mail do novo presidente"
              />
            </label>
            <label className="text-sm font-semibold text-zinc-100">
              Sua senha
              <input
                className="mt-1 w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-white"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                placeholder="Digite sua senha"
              />
            </label>
            {error && <div className="mb-1 text-xs text-red-400">{error}</div>}
            <button
              type="submit"
              className="mt-2 rounded bg-yellow-500 px-6 py-2 font-bold text-black hover:bg-yellow-600"
              disabled={!atleta || !email || !senha}
            >
              Confirmar Transferência
            </button>
          </form>
        )}
      </div>
    </>
  );
}
