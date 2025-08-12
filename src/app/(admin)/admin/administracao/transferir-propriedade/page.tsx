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
      a.email.toLowerCase().includes(busca.toLowerCase())
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
    return <RestrictAccess msg="Apenas o presidente pode transferir a propriedade do racha." />;
  }

  return (
    <>
      <Head>
        <title>Transferir Propriedade | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Transfira a presidência do racha para outro administrador de forma segura."
        />
        <meta name="keywords" content="Fut7, racha, presidente, transferência, SaaS" />
      </Head>
      <div className="pt-20 pb-24 md:pt-10 md:pb-12 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-bold mb-4 text-zinc-100">Transferir Propriedade</h1>
        <p className="text-zinc-300 mb-6">
          Você está prestes a transferir a presidência do racha. Essa ação é{" "}
          <span className="text-yellow-400 font-bold">irreversível</span>.
        </p>
        {confirmado ? (
          <div className="bg-green-700 text-white rounded p-4 text-center font-bold mt-8">
            Propriedade transferida com sucesso!
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleTransferir}>
            <div>
              <label className="block text-sm font-semibold text-zinc-100 mb-1">
                Buscar Atleta (Novo Presidente)
              </label>
              <input
                type="text"
                placeholder="Nome ou e-mail"
                className="w-full rounded px-3 py-2 bg-zinc-800 text-white border border-zinc-600"
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setAtleta(null);
                }}
                autoComplete="off"
              />
              {busca && (
                <div className="max-h-36 overflow-y-auto mt-1 border border-zinc-700 rounded bg-zinc-900">
                  {atletasFiltrados.length === 0 && (
                    <div className="text-xs text-zinc-400 px-3 py-2">Nenhum atleta encontrado.</div>
                  )}
                  {atletasFiltrados.map((a) => (
                    <div
                      key={a.id}
                      className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-700 ${
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
                <div className="mt-3 flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded p-2">
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
                    className="ml-auto text-red-400 hover:underline text-xs"
                  >
                    remover
                  </button>
                </div>
              )}
            </div>
            <label className="text-sm font-semibold text-zinc-100">
              E-mail do novo presidente
              <input
                className="mt-1 w-full rounded px-3 py-2 bg-zinc-800 text-white border border-zinc-600"
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
                className="mt-1 w-full rounded px-3 py-2 bg-zinc-800 text-white border border-zinc-600"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                placeholder="Digite sua senha"
              />
            </label>
            {error && <div className="text-xs text-red-400 mb-1">{error}</div>}
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded px-6 py-2 mt-2"
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
