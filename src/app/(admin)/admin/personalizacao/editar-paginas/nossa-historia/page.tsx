"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useAboutAdmin } from "@/hooks/useAbout";

export default function EditarNossaHistoriaPage() {
  const { about, update, isLoading } = useAboutAdmin();
  const [value, setValue] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (about && status === "idle") {
      setValue(JSON.stringify(about, null, 2));
    }
  }, [about, status]);

  const handleSave = async () => {
    try {
      setStatus("saving");
      setError(null);
      const parsed = value ? JSON.parse(value) : {};
      await update(parsed);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (err: any) {
      setError(err?.message || "Erro ao salvar");
      setStatus("error");
    }
  };

  return (
    <>
      <Head>
        <title>Editar Nossa Historia | Personalizacao | Painel Admin</title>
      </Head>
      <div className="min-h-screen bg-[#181A20] pt-20 pb-24 md:pt-6 md:pb-8 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Nossa Historia (página pública)</h1>
            <p className="text-gray-300 text-sm">
              Edite o JSON desta página. Campos suportados: titulo, descricao, marcos[],
              curiosidades[], depoimentos[], categoriasFotos[], videos[], camposHistoricos[],
              campoAtual, membrosAntigos[], campeoesHistoricos[], diretoria[]. Deixe em branco para
              usar o template padrão.
            </p>
          </div>

          <div className="bg-[#22232A] border border-[#2c2f3a] rounded-2xl p-4">
            <textarea
              className="w-full h-[480px] bg-[#111217] text-sm text-gray-100 font-mono rounded-xl p-3 border border-[#2f3342] focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              spellCheck={false}
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={status === "saving"}
                className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {status === "saving" ? "Salvando..." : "Salvar"}
              </button>
              {status === "saved" && <span className="text-green-400 text-sm">Salvo!</span>}
              {status === "error" && error && <span className="text-red-400 text-sm">{error}</span>}
            </div>
          </div>

          {isLoading && <div className="text-gray-400 text-sm">Carregando dados atuais...</div>}
        </div>
      </div>
    </>
  );
}
