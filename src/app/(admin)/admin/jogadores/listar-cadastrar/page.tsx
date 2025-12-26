"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import {
  FaUserPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
  FaLink,
} from "react-icons/fa";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useJogadores } from "@/hooks/useJogadores";
import { rachaConfig } from "@/config/racha.config";
import type { Jogador } from "@/types/jogador";
import JogadorForm from "@/components/admin/JogadorForm";

// --- MODAL EXCLUSÃO ---
function ModalExcluirJogador({
  open,
  jogador,
  onClose,
  onConfirm,
}: {
  open: boolean;
  jogador?: Jogador;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open || !jogador) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-[#201414] border-2 border-red-700 rounded-2xl shadow-xl p-8 max-w-xs w-full flex flex-col items-center gap-4">
        <FaExclamationTriangle className="text-4xl text-red-600 animate-pulse" />
        <h2 className="text-lg text-red-500 font-bold text-center">
          Atenção! Exclusão definitiva de jogador
        </h2>
        <div className="text-sm text-gray-200 text-center">
          <b>{jogador.nome}</b> será{" "}
          <span className="text-red-400 font-bold">
            removido de todos os rankings, históricos e estatísticas
          </span>{" "}
          do racha.
          <br />
          <span className="text-red-400 font-bold block mt-2">Essa ação é IRREVERSÍVEL!</span>
          <br />
          Tem certeza que deseja continuar?
        </div>
        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-2 rounded-md"
          >
            Excluir DEFINITIVAMENTE
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MODAL CADASTRO ---
function ModalCadastroJogador({
  open,
  onClose,
  onSave,
  loading,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (jogador: Partial<Jogador>, fotoFile?: File | null) => void;
  loading: boolean;
  error?: string | null;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-3">
      <div className="bg-[#151515] border border-cyan-700 rounded-2xl shadow-xl p-6 w-full max-w-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg text-cyan-300 font-bold">Cadastrar Jogador</h2>
            <p className="text-sm text-gray-300">
              Cadastro manual cria um jogador sem login. Use apenas quando necessario.
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold px-3 py-2 rounded-md"
          >
            Fechar
          </button>
        </div>

        <JogadorForm onSave={onSave} onCancel={onClose} isLoading={loading} />

        {error && <div className="text-sm text-red-300">{error}</div>}
      </div>
    </div>
  );
}

// --- MODAL VINCULO ---
function ModalVincularJogador({
  open,
  jogador,
  contas,
  busca,
  onBuscaChange,
  contaId,
  onContaChange,
  confirmacao,
  onConfirmacaoChange,
  onClose,
  onConfirm,
  loading,
  error,
}: {
  open: boolean;
  jogador?: Jogador;
  contas: Jogador[];
  busca: string;
  onBuscaChange: (value: string) => void;
  contaId: string;
  onContaChange: (value: string) => void;
  confirmacao: string;
  onConfirmacaoChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  error?: string | null;
}) {
  if (!open || !jogador) return null;
  const confirmacaoOk = confirmacao.trim().toUpperCase() === "VINCULAR";
  const confirmDisabled = !confirmacaoOk || !contaId || loading;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-3">
      <div className="bg-[#151515] border border-yellow-600 rounded-2xl shadow-xl p-6 w-full max-w-lg flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Image
            src={jogador.avatar || "/images/jogadores/jogador_padrao_01.jpg"}
            alt={jogador.nome}
            width={56}
            height={56}
            className="rounded-full object-cover"
          />
          <div>
            <h2 className="text-lg text-yellow-400 font-bold">Vincular Jogador</h2>
            <p className="text-sm text-gray-300">
              Jogador NPC: <span className="text-white font-semibold">{jogador.nome}</span>
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-300 leading-relaxed">
          <p className="mb-2">
            Esta acao conecta a conta com login ao jogador NPC selecionado. O atleta passa a usar
            este jogador, mantendo todo o historico, rankings e estatisticas do NPC.
          </p>
          <p className="mb-2">
            Os dados da conta escolhida (nome, apelido, foto, posicao, status) passam a substituir
            os dados atuais do NPC.
          </p>
          <p>
            Se a conta escolhida ja tiver historico, o vinculo sera bloqueado para evitar
            duplicidade.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm text-gray-200 font-semibold">Conta do atleta (com login)</label>
          <input
            type="text"
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            placeholder="Buscar por nome, apelido ou email..."
            className="rounded-md bg-[#23272f] border border-gray-700 text-white px-3 py-2 w-full focus:border-cyan-600"
          />
          <select
            value={contaId}
            onChange={(e) => onContaChange(e.target.value)}
            className="rounded-md bg-[#23272f] border border-gray-700 text-white px-3 py-2 w-full focus:border-cyan-600"
          >
            <option value="">Selecione a conta do atleta</option>
            {contas.map((conta) => (
              <option key={conta.id} value={conta.userId || ""}>
                {conta.nome}
                {conta.apelido ? ` (${conta.apelido})` : ""} - {conta.email || "sem email"}
              </option>
            ))}
          </select>
          {contas.length === 0 && (
            <div className="text-xs text-yellow-300">
              Nenhuma conta com login encontrada para vincular.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-200 font-semibold">
            Para confirmar, digite <span className="text-yellow-400">VINCULAR</span>
          </label>
          <input
            type="text"
            value={confirmacao}
            onChange={(e) => onConfirmacaoChange(e.target.value)}
            placeholder="VINCULAR"
            className="rounded-md bg-[#23272f] border border-gray-700 text-white px-3 py-2 w-full focus:border-yellow-400"
          />
        </div>

        {error && <div className="text-sm text-red-300">{error}</div>}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`px-4 py-2 rounded-md font-bold ${
              confirmDisabled
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600 text-black"
            }`}
          >
            {loading ? "Vinculando..." : "Vincular"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- BADGE DE STATUS ---
function StatusBadge({ status }: { status: Jogador["status"] }) {
  const color =
    status === "Ativo"
      ? "bg-green-700 text-green-200"
      : status === "Suspenso"
        ? "bg-yellow-700 text-yellow-200"
        : "bg-gray-600 text-gray-200";
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold mr-1 ${color}`}>
      {status}
    </span>
  );
}

// === COMPONENTE PRINCIPAL ===
export default function Page() {
  const rachaId = rachaConfig.slug;
  const { jogadores, isLoading, isError, error, deleteJogador, mutate, addJogador } =
    useJogadores(rachaId);
  const [busca, setBusca] = useState("");
  const [showModalExcluir, setShowModalExcluir] = useState(false);
  const [excluirJogador, setExcluirJogador] = useState<Jogador | undefined>();
  const [showModalCadastro, setShowModalCadastro] = useState(false);
  const [cadastroErro, setCadastroErro] = useState<string | null>(null);
  const [cadastroLoading, setCadastroLoading] = useState(false);
  const [showModalVincular, setShowModalVincular] = useState(false);
  const [jogadorVinculo, setJogadorVinculo] = useState<Jogador | undefined>();
  const [buscaConta, setBuscaConta] = useState("");
  const [contaSelecionada, setContaSelecionada] = useState("");
  const [confirmacaoVinculo, setConfirmacaoVinculo] = useState("");
  const [vincularErro, setVincularErro] = useState<string | null>(null);
  const [vinculando, setVinculando] = useState(false);

  const jogadoresFiltrados = jogadores.filter(
    (j) =>
      j.nome.toLowerCase().includes(busca.toLowerCase()) ||
      j.apelido.toLowerCase().includes(busca.toLowerCase())
  );

  const contasComLogin = useMemo(() => jogadores.filter((j) => j.userId), [jogadores]);
  const podeVincular = contasComLogin.length > 0;

  const contasFiltradas = useMemo(() => {
    if (!showModalVincular) return [];
    const termo = buscaConta.trim().toLowerCase();
    return contasComLogin
      .filter((j) => j.id !== jogadorVinculo?.id)
      .filter((j) => {
        if (!termo) return true;
        return (
          j.nome.toLowerCase().includes(termo) ||
          j.apelido.toLowerCase().includes(termo) ||
          (j.email || "").toLowerCase().includes(termo)
        );
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [buscaConta, contasComLogin, jogadorVinculo?.id, showModalVincular]);

  const abrirModalCadastro = () => {
    setCadastroErro(null);
    setCadastroLoading(false);
    setShowModalCadastro(true);
  };

  const fecharModalCadastro = () => {
    if (cadastroLoading) return;
    setShowModalCadastro(false);
    setCadastroErro(null);
    setCadastroLoading(false);
  };

  const abrirModalVinculo = (jogador: Jogador) => {
    setJogadorVinculo(jogador);
    setBuscaConta("");
    setContaSelecionada("");
    setConfirmacaoVinculo("");
    setVincularErro(null);
    setShowModalVincular(true);
  };

  const fecharModalVinculo = () => {
    setShowModalVincular(false);
    setJogadorVinculo(undefined);
    setBuscaConta("");
    setContaSelecionada("");
    setConfirmacaoVinculo("");
    setVincularErro(null);
  };

  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads/avatar", {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    let body: unknown = undefined;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    if (!response.ok) {
      const message =
        (body as { message?: string; error?: string } | undefined)?.message ||
        (body as { error?: string } | undefined)?.error ||
        "Erro ao enviar imagem.";
      throw new Error(message);
    }

    const url = (body as { url?: string } | undefined)?.url;
    if (!url) {
      throw new Error("Upload retornou uma URL invalida.");
    }

    return url;
  };

  const confirmarCadastro = async (jogador: Partial<Jogador>, fotoFile?: File | null) => {
    if (cadastroLoading) return;
    setCadastroLoading(true);
    setCadastroErro(null);

    try {
      let uploadedUrl: string | undefined;
      if (fotoFile) {
        uploadedUrl = await uploadAvatar(fotoFile);
      }

      const payload: Partial<Jogador> = {
        ...jogador,
        foto: undefined,
      };
      if (typeof uploadedUrl !== "undefined") {
        payload.photoUrl = uploadedUrl;
      }

      const result = await addJogador(payload);
      if (!result) {
        throw new Error("Nao foi possivel cadastrar o jogador.");
      }

      setShowModalCadastro(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao foi possivel cadastrar o jogador.";
      setCadastroErro(message);
    } finally {
      setCadastroLoading(false);
    }
  };

  const confirmarVinculo = async () => {
    if (!jogadorVinculo || !contaSelecionada) return;
    setVinculando(true);
    setVincularErro(null);

    try {
      const response = await fetch("/api/jogadores/vincular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jogadorId: jogadorVinculo.id,
          userId: contaSelecionada,
        }),
      });

      const text = await response.text();
      let body: unknown = undefined;
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          body = text;
        }
      }

      if (!response.ok) {
        const message =
          (body as { message?: string; error?: string } | undefined)?.message ||
          (body as { error?: string } | undefined)?.error ||
          "Falha ao vincular jogador.";
        throw new Error(message);
      }

      await mutate();
      fecharModalVinculo();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao vincular jogador.";
      setVincularErro(message);
    } finally {
      setVinculando(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06 },
    }),
    exit: { opacity: 0, y: 14, transition: { duration: 0.2 } },
  };

  return (
    <>
      <Head>
        <title>Gestão de Jogadores | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Administre a lista de jogadores do seu racha, incluindo cadastro, edição e exclusão."
        />
      </Head>

      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-2 sm:px-6 max-w-5xl mx-auto">
        {/* DESCRIÇÃO ADMIN */}
        <div className="bg-[#1a1a1a] border border-yellow-600 rounded-lg p-4 mb-6 text-sm text-gray-300">
          <p className="mb-2">
            <strong className="text-yellow-400">⚠️ Importante:</strong> Todos os atletas do seu
            racha podem se cadastrar diretamente pelo <strong>site público</strong>.
          </p>
          <p className="mb-2">
            Recomendamos que você incentive os jogadores a realizarem o cadastro por conta própria,
            garantindo dados corretos e integração automática com os rankings.
          </p>
          <p className="mb-2">
            Utilize o botão <strong>"Cadastrar Jogador"</strong> apenas em casos específicos, como:
          </p>
          <ul className="list-disc ml-5 mt-2">
            <li>Jogadores com dificuldade de acesso à internet;</li>
            <li>Atletas com pouca familiaridade com tecnologia;</li>
            <li>Casos excepcionais onde o administrador precisa intervir manualmente.</li>
          </ul>
        </div>

        {/* BARRA DE BUSCA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou apelido..."
              className="rounded-md bg-[#23272f] border border-gray-700 text-white px-3 py-2 w-full sm:w-72 focus:border-cyan-600"
            />
            <FaSearch className="text-gray-400 text-lg -ml-8 pointer-events-none" />
          </div>
          <button
            onClick={abrirModalCadastro}
            className="flex items-center gap-2 bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded-lg font-bold"
          >
            <FaUserPlus /> Cadastrar Jogador
          </button>
        </div>

        {/* LISTA DE JOGADORES */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
            Jogadores cadastrados ({jogadoresFiltrados.length})
          </div>

          {isLoading ? (
            <div className="text-center text-gray-400 py-8">Carregando jogadores...</div>
          ) : isError ? (
            <div className="text-center text-red-400 py-8">
              Ocorreu um erro ao carregar os jogadores.
              {error && <div className="text-xs text-red-300 mt-2">{error}</div>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <AnimatePresence>
                {jogadoresFiltrados.map((j, i) => (
                  <motion.div
                    key={j.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={cardVariants}
                    layout
                    className="bg-[#23272f] border border-cyan-700 rounded-xl p-4 shadow-xl"
                  >
                    <div className="flex items-center">
                      <Image
                        src={j.avatar || "/images/jogadores/jogador_padrao_01.jpg"}
                        alt={j.nome}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                      <div className="pl-4 flex-1">
                        <div className="font-bold text-white">
                          {j.nome} <span className="text-gray-400">({j.apelido})</span>
                        </div>
                        <div className="text-sm text-gray-300">{j.posicao}</div>
                        <div className="text-xs mt-1 flex gap-1 items-center">
                          <StatusBadge status={j.status} />
                          {j.mensalista && (
                            <span className="bg-yellow-700 text-yellow-200 font-bold rounded px-2 py-0.5 text-xs">
                              Mensalista
                            </span>
                          )}
                          {j.userId ? (
                            <span className="bg-emerald-700 text-emerald-100 font-bold rounded px-2 py-0.5 text-xs">
                              Com login
                            </span>
                          ) : (
                            <span className="bg-zinc-700 text-zinc-200 font-bold rounded px-2 py-0.5 text-xs">
                              Sem login
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-cyan-900/40 mt-4 pt-3 flex gap-2 justify-end">
                      {!j.userId && (
                        <button
                          className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                            podeVincular
                              ? "bg-indigo-700 hover:bg-indigo-800 text-white"
                              : "bg-gray-700 text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!podeVincular}
                          onClick={() => abrirModalVinculo(j)}
                        >
                          <FaLink /> Vincular
                        </button>
                      )}
                      <button
                        className="bg-gray-700 hover:bg-cyan-800 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                        onClick={() => alert("Função de edição em desenvolvimento.")}
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        className="bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                        onClick={() => {
                          setExcluirJogador(j);
                          setShowModalExcluir(true);
                        }}
                      >
                        <FaTrash /> Excluir
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <ModalExcluirJogador
        open={showModalExcluir}
        jogador={excluirJogador}
        onClose={() => setShowModalExcluir(false)}
        onConfirm={() => {
          if (excluirJogador) deleteJogador(excluirJogador.id);
          setShowModalExcluir(false);
        }}
      />

      <ModalCadastroJogador
        open={showModalCadastro}
        onClose={fecharModalCadastro}
        onSave={confirmarCadastro}
        loading={cadastroLoading}
        error={cadastroErro}
      />

      <ModalVincularJogador
        open={showModalVincular}
        jogador={jogadorVinculo}
        contas={contasFiltradas}
        busca={buscaConta}
        onBuscaChange={setBuscaConta}
        contaId={contaSelecionada}
        onContaChange={setContaSelecionada}
        confirmacao={confirmacaoVinculo}
        onConfirmacaoChange={setConfirmacaoVinculo}
        onClose={fecharModalVinculo}
        onConfirm={confirmarVinculo}
        loading={vinculando}
        error={vincularErro}
      />
    </>
  );
}
