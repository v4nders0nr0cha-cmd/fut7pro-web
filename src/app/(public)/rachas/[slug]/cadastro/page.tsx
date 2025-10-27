"use client";

import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";

const POSICOES = ["GOLEIRO", "ZAGUEIRO", "MEIA", "ATACANTE"] as const;

export default function CadastroAtletaPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [email, setEmail] = useState("");
  const [posicao, setPosicao] = useState<(typeof POSICOES)[number] | "">("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const res = await fetch("/api/public/solicitacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rachaSlug: params.slug,
        nome,
        apelido,
        email,
        posicao,
        fotoUrl: fotoUrl || null,
        mensagem: mensagem || null,
      }),
    });
    const payload = await res.json().catch(() => null);
    if (res.ok) {
      setStatus("Solicitação enviada! Você será avisado quando for aprovada.");
      setTimeout(() => router.push(`/rachas/${params.slug}`), 1200);
    } else {
      setStatus(payload?.error || "Falha ao enviar solicitação.");
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <Head>
        <title>Cadastro de Atleta</title>
      </Head>
      <h1 className="text-2xl font-bold text-white mb-4">Quero fazer parte do racha</h1>
      {status && <div className="mb-4 text-sm text-yellow-300">{status}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full bg-[#23272f] text-white rounded px-3 py-2" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required minLength={3} />
        <input className="w-full bg-[#23272f] text-white rounded px-3 py-2" placeholder="Apelido (opcional)" value={apelido} onChange={(e) => setApelido(e.target.value)} />
        <input className="w-full bg-[#23272f] text-white rounded px-3 py-2" placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <select className="w-full bg-[#23272f] text-white rounded px-3 py-2" required value={posicao} onChange={(e) => setPosicao(e.target.value as any)}>
          <option value="">Selecione a posição</option>
          {POSICOES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input className="w-full bg-[#23272f] text-white rounded px-3 py-2" placeholder="URL da foto (opcional)" value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} />
        <textarea className="w-full bg-[#23272f] text-white rounded px-3 py-2" placeholder="Mensagem (opcional)" value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
        <button className="bg-yellow-400 text-black font-bold px-4 py-2 rounded hover:bg-yellow-300">Enviar solicitação</button>
      </form>
    </main>
  );
}

