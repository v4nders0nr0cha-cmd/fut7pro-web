"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import { FaInfoCircle, FaTimes, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { useSuperAdminIntegracoes } from "@/hooks/useSuperAdminIntegracoes";
import type { SuperAdminIntegration } from "@/hooks/useSuperAdminIntegracoes";

function groupByCategoria(items: SuperAdminIntegration[] | undefined) {
  if (!items) return [] as Array<{ nome: string; integracoes: SuperAdminIntegration[] }>;
  const map = new Map<string, SuperAdminIntegration[]>();
  items.forEach((integration) => {
    const key = integration.categoria || "Outros";
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(integration);
  });
  return Array.from(map.entries()).map(([nome, integracoes]) => ({ nome, integracoes }));
}

export default function IntegracoesSuperAdminPage() {
  const { data, error, isLoading, updateIntegracao } = useSuperAdminIntegracoes();
  const categorias = useMemo(() => groupByCategoria(data), [data]);
  const [modal, setModal] = useState<SuperAdminIntegration | null>(null);
  const [campos, setCampos] = useState<Record<string, string>>({});

  const handleAbrirModal = (integracao: SuperAdminIntegration) => {
    setModal(integracao);
    const initial: Record<string, string> = {};
    integracao.campos?.forEach((campo) => {
      const value = (integracao.configuracao?.[campo.name] as string) ?? "";
      initial[campo.name] = value;
    });
    setCampos(initial);
  };

  const handleCampoChange = (name: string, value: string) => {
    setCampos((prev) => ({ ...prev, [name]: value }));
  };

  const handleFecharModal = () => {
    setModal(null);
    setCampos({});
  };

  const handleSalvar = async () => {
    if (!modal) return;
    try {
      await updateIntegracao(modal.slug, {
        configuracao: campos,
        status: "instalado",
      });
      toast.success(`Integração ${modal.nome} salva com sucesso!`);
      handleFecharModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar integração.");
    }
  };

  const handleRemoverConfig = async () => {
    if (!modal) return;
    try {
      await updateIntegracao(modal.slug, { configuracao: null, status: "disponivel" });
      toast.success(`Integração ${modal.nome} redefinida.`);
      handleFecharModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao remover configuração.");
    }
  };

  return (
    <>
      <Head>
        <title>Integrações SuperAdmin | Fut7Pro</title>
        <meta
          name="description"
          content="Conecte o Fut7Pro aos principais serviços de pagamento, marketing e automação."
        />
      </Head>
      <Toaster />
      <main className="min-h-screen bg-fundo px-2 py-6 flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-amarelo mb-6 text-left w-full max-w-7xl">
          Integrações
        </h1>
        {error && (
          <div className="w-full max-w-7xl mb-4 rounded-xl border border-red-500 bg-red-900/30 px-4 py-3 text-sm text-red-200">
            {error.message}
          </div>
        )}
        {isLoading && !data && (
          <div className="w-full max-w-7xl text-center text-sm text-white/60 py-8">
            Carregando integrações...
          </div>
        )}
        <div className="w-full max-w-7xl space-y-12">
          {categorias.map((categoria) => (
            <section key={categoria.nome} className="mb-4">
              <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <FaInfoCircle /> {categoria.nome}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoria.integracoes.map((integ) => (
                  <div
                    key={integ.id}
                    className="relative flex flex-col items-center bg-zinc-900 rounded-xl p-4 shadow group transition hover:ring-2 hover:ring-amarelo"
                  >
                    <span
                      className={`absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-bold ${integ.status === "instalado" ? "bg-green-700 text-green-100" : "bg-zinc-700 text-zinc-200"}`}
                    >
                      {integ.status === "instalado" ? "Instalado" : "Disponível"}
                    </span>
                    <img
                      src={integ.logoUrl ?? "/images/integracoes/default.png"}
                      alt={`Logo ${integ.nome}`}
                      className="w-24 h-16 object-contain mx-auto mb-3 rounded bg-white"
                    />
                    <div className="font-bold text-base text-white text-center mb-1">
                      {integ.nome}
                    </div>
                    <p className="text-zinc-300 text-sm text-center mb-3">{integ.descricao}</p>
                    <div className="flex gap-2 w-full">
                      <button
                        className="flex-1 px-2 py-2 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition text-sm"
                        onClick={() => handleAbrirModal(integ)}
                      >
                        Configurar
                      </button>
                      {integ.configuracao && (
                        <button
                          className="p-2 rounded-xl border border-zinc-600 text-zinc-400 hover:bg-zinc-800 transition"
                          title="Remover configuração"
                          onClick={async () => {
                            try {
                              await updateIntegracao(integ.slug, {
                                configuracao: null,
                                status: "disponivel",
                              });
                              toast.success("Configuração removida.");
                            } catch (err) {
                              toast.error("Falha ao remover configuração.");
                            }
                          }}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
          {!isLoading && categorias.length === 0 && (
            <div className="text-center text-zinc-400">Nenhuma integração cadastrada.</div>
          )}
        </div>
      </main>

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#191c27] rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              onClick={handleFecharModal}
            >
              <FaTimes />
            </button>
            <h3 className="text-xl font-bold text-white mb-2">{modal.nome}</h3>
            <p className="text-sm text-gray-300 mb-4">{modal.instrucoes}</p>
            <div className="flex flex-col gap-3">
              {modal.campos?.map((campo) => (
                <label key={campo.name} className="flex flex-col gap-1 text-sm text-gray-200">
                  {campo.label}
                  <input
                    type={campo.type === "password" ? "password" : "text"}
                    value={campos[campo.name] ?? ""}
                    placeholder={campo.placeholder}
                    className="rounded-lg bg-[#11131a] border border-zinc-700 px-3 py-2 text-white"
                    onChange={(e) => handleCampoChange(campo.name, e.target.value)}
                  />
                </label>
              ))}
              {(!modal.campos || modal.campos.length === 0) && (
                <p className="text-sm text-zinc-400">
                  Nenhum campo configurável. Use a instrução acima para conectar o serviço.
                </p>
              )}
            </div>
            <div className="flex justify-between mt-6">
              {modal.configuracao && (
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-600 text-red-400 hover:bg-red-600/10"
                  onClick={handleRemoverConfig}
                >
                  <FaTrash /> Remover
                </button>
              )}
              <div className="ml-auto flex gap-3">
                <button
                  className="px-4 py-2 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600"
                  onClick={handleFecharModal}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-bold hover:bg-yellow-400"
                  onClick={handleSalvar}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
