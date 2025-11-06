"use client";

import Head from "next/head";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FaInfoCircle, FaPlus, FaTrash } from "react-icons/fa";
import { useJogadores } from "@/hooks/useJogadores";
import { useAuth } from "@/hooks/useAuth";
import { rachaConfig } from "@/config/racha.config";
import { positionLabel } from "@/constants/positions";
import type { Athlete } from "@/types/jogador";

const FALLBACK_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";

type ModalMensalistaProps = {
  open: boolean;
  onClose: () => void;
  jogadores: Athlete[];
  onAdd: (id: string) => Promise<void>;
  isProcessing?: boolean;
  processingId?: string | null;
};

function ModalMensalista({
  open,
  onClose,
  jogadores,
  onAdd,
  isProcessing = false,
  processingId = null,
}: ModalMensalistaProps) {
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (!open) {
      setBusca("");
    }
  }, [open]);

  const jogadoresDisponiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return jogadores
      .filter((jogador) => {
        if (termo.length === 0) {
          return true;
        }
        const nome = jogador.name?.toLowerCase() ?? "";
        const apelido = jogador.nickname?.toLowerCase() ?? "";
        return nome.includes(termo) || apelido.includes(termo);
      })
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "pt-BR"));
  }, [busca, jogadores]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-[#1c1e22] rounded-2xl p-6 min-w-[320px] w-full max-w-md shadow-xl flex flex-col gap-5">
        <h2 className="text-lg text-yellow-400 font-bold">Cadastrar jogador mensalista</h2>
        <input
          type="text"
          placeholder="Buscar por nome ou apelido..."
          className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-700 focus:border-yellow-400 outline-none"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
          {jogadoresDisponiveis.length === 0 ? (
            <div className="text-center text-gray-400 text-sm">
              Nenhum jogador disponivel para se tornar mensalista.
            </div>
          ) : (
            jogadoresDisponiveis.map((jogador) => {
              const aguardando = isProcessing && processingId === jogador.id;
              const imagem = jogador.photoUrl ?? FALLBACK_AVATAR;
              const apelido = jogador.nickname ?? "Sem apelido";
              return (
                <div
                  key={jogador.id}
                  className="flex items-center gap-3 bg-[#23272f] rounded-xl px-2 py-2"
                >
                  <Image
                    src={imagem}
                    alt={`Foto do jogador ${jogador.name ?? "sem nome"}`}
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-gray-500 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold truncate">{jogador.name}</div>
                    <div className="text-xs text-cyan-200 truncate">{apelido}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void onAdd(jogador.id);
                    }}
                    disabled={isProcessing}
                    className={`bg-yellow-500 text-black font-bold px-3 py-1 rounded shadow text-xs flex items-center gap-1 ${
                      isProcessing ? "opacity-60 cursor-not-allowed" : "hover:bg-yellow-600"
                    }`}
                    title="Adicionar como mensalista"
                  >
                    {aguardando ? (
                      "Processando..."
                    ) : (
                      <>
                        <FaPlus /> Adicionar
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-1 px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 font-semibold text-sm"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

export default function MensalistasPage() {
  const { user } = useAuth();
  const tenantSlug = user?.tenantSlug ?? rachaConfig.slug;
  const {
    jogadores,
    isLoading,
    isValidating,
    isError,
    error: jogadoresError,
    updateJogador,
  } = useJogadores(tenantSlug);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingJogadorId, setPendingJogadorId] = useState<string | null>(null);

  const mensalistas = useMemo(() => {
    return jogadores
      .filter((jogador) => jogador.isMember)
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "pt-BR"));
  }, [jogadores]);

  const candidatos = useMemo(() => jogadores.filter((jogador) => !jogador.isMember), [jogadores]);

  const carregandoLista = (isLoading || isValidating) && jogadores.length === 0;

  const handleAddMensalista = async (id: string) => {
    setPendingJogadorId(id);
    try {
      const atualizado = await updateJogador(id, { isMember: true });
      if (!atualizado) {
        alert(
          "Erro ao cadastrar mensalista. Verifique se o backend ja esta expondo o endpoint e consulte a auditoria."
        );
        return;
      }
      setModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "erro desconhecido";
      alert(`Erro ao cadastrar mensalista: ${message}`);
    } finally {
      setPendingJogadorId(null);
    }
  };

  const handleRemoverMensalista = async (id: string) => {
    if (!window.confirm("Deseja realmente remover este jogador dos mensalistas?")) {
      return;
    }
    setPendingJogadorId(id);
    try {
      const atualizado = await updateJogador(id, { isMember: false });
      if (!atualizado) {
        alert(
          "Erro ao remover mensalista. Valide a disponibilidade do endpoint no backend e acompanhe pela auditoria."
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "erro desconhecido";
      alert(`Erro ao remover mensalista: ${message}`);
    } finally {
      setPendingJogadorId(null);
    }
  };

  return (
    <>
      <Head>
        <title>Mensalistas | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Cadastre e controle os jogadores mensalistas do seu racha, garantindo caixa fixo e beneficios exclusivos aos atletas mais comprometidos."
        />
        <meta
          name="keywords"
          content="fut7, racha, jogadores, mensalistas, painel admin, SaaS futebol, Fut7Pro"
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-5xl mx-auto">
        <h1 className="text-3xl text-yellow-400 font-bold mb-6 text-center">
          Jogadores Mensalistas
        </h1>

        <div className="bg-[#23272f] border-l-4 border-yellow-400 rounded-xl p-4 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <FaInfoCircle className="text-yellow-300 text-2xl shrink-0" />
          <div className="text-sm text-gray-200 leading-relaxed">
            <b>Recomendacao:</b> mantenha <b>60% a 70% das vagas do racha para mensalistas</b>.
            <br />
            Jogadores mensalistas ajudam a manter o caixa fixo, garantindo:
            <ul className="list-disc pl-5 mt-2 mb-2 text-gray-300">
              <li>Vaga garantida nos dias de racha</li>
              <li>Descontos no pagamento a vista</li>
              <li>Beneficios em lojas e parceiros</li>
            </ul>
            Mantenha algumas vagas para <b>diaristas</b> para estimular a concorrencia e renovacao.
            <br />
            <span className="block mt-2">
              Importante: <b>Mensalistas tambem pagam multa em caso de falta</b>.
            </span>
          </div>
        </div>

        {isError && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 text-sm rounded-lg px-4 py-3 mb-6">
            {jogadoresError ??
              "Nao foi possivel carregar os jogadores. Tente novamente em instantes."}
          </div>
        )}

        <div className="flex justify-end mb-8">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={candidatos.length === 0}
            className={`flex items-center gap-2 bg-yellow-500 text-black font-bold px-5 py-2 rounded-xl shadow transition text-sm ${
              candidatos.length === 0 ? "opacity-60 cursor-not-allowed" : "hover:bg-yellow-600"
            }`}
          >
            <FaPlus />
            Cadastrar Mensalista
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-7">
          {carregandoLista ? (
            <div className="text-gray-400 font-semibold py-12 text-center w-full">
              Carregando mensalistas...
            </div>
          ) : mensalistas.length === 0 ? (
            <div className="text-gray-400 font-semibold py-12 text-center w-full">
              Nenhum mensalista cadastrado.
            </div>
          ) : (
            mensalistas.map((jogador) => {
              const imagem = jogador.photoUrl ?? FALLBACK_AVATAR;
              const apelido = jogador.nickname ?? "Sem apelido";
              const status = jogador.status ?? "Ativo";
              const aguardando = pendingJogadorId === jogador.id;
              return (
                <div
                  key={jogador.id}
                  className="bg-[#191b1f] rounded-2xl border-2 border-yellow-400 p-6 flex flex-col items-center w-[320px] max-w-full shadow hover:shadow-xl transition relative"
                >
                  <button
                    type="button"
                    className={`absolute top-3 right-3 rounded-full p-2 transition ${
                      aguardando
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-gray-900 text-red-700 hover:text-red-500"
                    }`}
                    onClick={() => {
                      void handleRemoverMensalista(jogador.id);
                    }}
                    title="Remover mensalista"
                    disabled={aguardando}
                  >
                    <FaTrash />
                  </button>
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400 mb-2 shadow-lg bg-black">
                    <Image
                      src={imagem}
                      alt={`Foto do jogador ${jogador.name ?? "sem nome"}`}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                      priority
                    />
                  </div>
                  <div className="text-lg font-bold text-white text-center">{jogador.name}</div>
                  <div className="text-sm font-semibold text-cyan-200 mb-2 text-center">
                    {apelido}
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap justify-center">
                    <span className="px-3 py-0.5 rounded bg-cyan-700 text-white text-xs">
                      {positionLabel(jogador.position)}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded text-white text-xs ${
                        status === "Ativo"
                          ? "bg-green-600"
                          : status === "Inativo"
                            ? "bg-gray-500"
                            : "bg-yellow-700"
                      }`}
                    >
                      {status}
                    </span>
                    <span className="px-3 py-0.5 rounded bg-yellow-500 text-black font-semibold text-xs">
                      Mensalista
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <ModalMensalista
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          jogadores={candidatos}
          onAdd={handleAddMensalista}
          isProcessing={pendingJogadorId !== null}
          processingId={pendingJogadorId}
        />
      </main>
    </>
  );
}
