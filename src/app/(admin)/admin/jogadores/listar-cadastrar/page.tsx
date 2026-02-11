"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  FaUserPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
  FaLink,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { useJogadores } from "@/hooks/useJogadores";
import { useAthleteRequests } from "@/hooks/useAthleteRequests";
import { useAutoApproveAthletes } from "@/hooks/useAutoApproveAthletes";
import { useRacha } from "@/context/RachaContext";
import type { Jogador } from "@/types/jogador";
import type { AthleteRequest } from "@/types/athlete-request";
import JogadorForm from "@/components/admin/JogadorForm";
import { Switch } from "@/components/ui/Switch";
import AvatarFut7Pro from "@/components/ui/AvatarFut7Pro";

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
              Cadastro manual cria um jogador sem login. Use apenas quando necessário.
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

// --- MODAL EDICAO ---
function ModalEditarJogador({
  open,
  jogador,
  onClose,
  onSave,
  loading,
  error,
}: {
  open: boolean;
  jogador?: Jogador;
  onClose: () => void;
  onSave: (jogador: Partial<Jogador>, fotoFile?: File | null) => void;
  loading: boolean;
  error?: string | null;
}) {
  if (!open || !jogador) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-3">
      <div className="bg-[#151515] border border-cyan-700 rounded-2xl shadow-xl p-6 w-full max-w-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg text-cyan-300 font-bold">Editar Jogador</h2>
            <p className="text-sm text-gray-300">Atualize os dados do atleta e ajuste a foto.</p>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold px-3 py-2 rounded-md"
          >
            Fechar
          </button>
        </div>

        <JogadorForm jogador={jogador} onSave={onSave} onCancel={onClose} isLoading={loading} />

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
          <AvatarFut7Pro
            src={jogador.avatarUrl || jogador.avatar || jogador.foto || jogador.photoUrl}
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
            Esta ação conecta a conta com login ao jogador NPC selecionado. O atleta passa a usar
            este jogador, mantendo todo o histórico, rankings e estatísticas do NPC.
          </p>
          <p className="mb-2">
            Os dados da conta escolhida (nome, apelido, foto, posição, status) passam a substituir
            os dados atuais do NPC.
          </p>
          <p>
            Se a conta escolhida já tiver histórico, o vínculo será bloqueado para evitar
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

function ModalAutoApproveConfirm({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-3">
      <div className="bg-[#151515] border border-yellow-600 rounded-2xl shadow-xl p-6 w-full max-w-md flex flex-col gap-4">
        <h2 className="text-lg text-yellow-400 font-bold">Liberar auto-aceite?</h2>
        <p className="text-sm text-gray-200 leading-relaxed">
          Apito inicial: ao ligar o auto-aceite, todo atleta novo entra no racha sem aprovação
          manual. Use somente nos primeiros dias.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-md"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Ativando..." : "Ativar auto-aceite"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalRejeitarSolicitacao({
  open,
  solicitacao,
  motivo,
  onMotivoChange,
  onClose,
  onConfirm,
  loading,
  error,
}: {
  open: boolean;
  solicitacao?: AthleteRequest | null;
  motivo: string;
  onMotivoChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  error?: string | null;
}) {
  if (!open || !solicitacao) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-3">
      <div className="bg-[#151515] border border-red-700 rounded-2xl shadow-xl p-6 w-full max-w-md flex flex-col gap-4">
        <h2 className="text-lg text-red-400 font-bold">Rejeitar solicitação</h2>
        <p className="text-sm text-gray-200">
          Você está recusando <strong>{solicitacao.name}</strong>. A conta continua global, mas não
          entra no racha.
        </p>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Motivo (opcional)
            <textarea
              value={motivo}
              onChange={(e) => onMotivoChange(e.target.value)}
              rows={3}
              placeholder="Ex: cadastro duplicado ou dados incompletos."
              className="mt-2 w-full rounded-md bg-[#23272f] border border-gray-700 text-white px-3 py-2 focus:border-red-400"
            />
          </label>
        </div>
        {error && <div className="text-sm text-red-300">{error}</div>}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-md"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Rejeitando..." : "Rejeitar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalVincularSolicitacao({
  open,
  solicitacao,
  npcs,
  busca,
  onBuscaChange,
  npcId,
  onNpcChange,
  confirmacao,
  onConfirmacaoChange,
  onClose,
  onConfirm,
  loading,
  error,
}: {
  open: boolean;
  solicitacao?: AthleteRequest | null;
  npcs: Jogador[];
  busca: string;
  onBuscaChange: (value: string) => void;
  npcId: string;
  onNpcChange: (value: string) => void;
  confirmacao: string;
  onConfirmacaoChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  error?: string | null;
}) {
  if (!open || !solicitacao) return null;
  const confirmacaoOk = confirmacao.trim().toUpperCase() === "VINCULAR";
  const confirmDisabled =
    !confirmacaoOk || !npcId || loading || !solicitacao.userId || npcs.length === 0;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-3">
      <div className="bg-[#151515] border border-yellow-600 rounded-2xl shadow-xl p-6 w-full max-w-lg flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <AvatarFut7Pro
            src={solicitacao.avatarUrl || solicitacao.photoUrl}
            alt={solicitacao.name}
            width={56}
            height={56}
            className="rounded-full object-cover"
          />
          <div>
            <h2 className="text-lg text-yellow-400 font-bold">Vincular solicitação</h2>
            <p className="text-sm text-gray-300">
              Conta com login: <span className="text-white font-semibold">{solicitacao.name}</span>
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-300 leading-relaxed">
          Este fluxo conecta o atleta pendente a um jogador NPC existente, mantendo histórico,
          rankings e estatísticas do NPC.
        </div>

        {!solicitacao.userId && (
          <div className="text-xs text-red-300">
            Conta do atleta ainda não localizada. Aguarde a criação ou aprove a solicitação.
          </div>
        )}

        <div className="flex flex-col gap-3">
          <label className="text-sm text-gray-200 font-semibold">Jogador NPC existente</label>
          <input
            type="text"
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            placeholder="Buscar por nome, apelido ou email..."
            className="rounded-md bg-[#23272f] border border-gray-700 text-white px-3 py-2 w-full focus:border-cyan-600"
          />
          <select
            value={npcId}
            onChange={(e) => onNpcChange(e.target.value)}
            className="rounded-md bg-[#23272f] border border-gray-700 text-white px-3 py-2 w-full focus:border-cyan-600"
          >
            <option value="">Selecione o NPC para vincular</option>
            {npcs.map((npc) => (
              <option key={npc.id} value={npc.id}>
                {npc.nome}
                {npc.apelido ? ` (${npc.apelido})` : ""} - {npc.posicao || npc.position}
              </option>
            ))}
          </select>
          {npcs.length === 0 && (
            <div className="text-xs text-yellow-300">Nenhum jogador NPC disponível.</div>
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

const POSICAO_LABEL: Record<string, string> = {
  goleiro: "Goleiro",
  zagueiro: "Zagueiro",
  meia: "Meia",
  atacante: "Atacante",
};

function formatPosicao(value?: string | null) {
  if (!value) return "-";
  const key = value.toLowerCase();
  return POSICAO_LABEL[key] || value;
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
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
  const { data: session } = useSession();
  const { rachaId: contextRachaId, tenantSlug, setRachaId, setTenantSlug } = useRacha();
  const sessionUser = session?.user as { tenantId?: string; tenantSlug?: string } | undefined;
  const resolvedRachaId = sessionUser?.tenantId || contextRachaId || "";
  const resolvedSlug = sessionUser?.tenantSlug || tenantSlug || "";
  const missingTenantScope = !resolvedRachaId || !resolvedSlug;

  useEffect(() => {
    if (sessionUser?.tenantId) {
      setRachaId(sessionUser.tenantId);
    }
    if (sessionUser?.tenantSlug) {
      setTenantSlug(sessionUser.tenantSlug);
    }
  }, [sessionUser?.tenantId, sessionUser?.tenantSlug, setRachaId, setTenantSlug]);

  const allowRequests = Boolean(resolvedSlug);

  const {
    jogadores,
    isLoading,
    isError,
    error,
    deleteJogador,
    mutate: mutateJogadores,
    addJogador,
    updateJogador,
  } = useJogadores(resolvedRachaId);
  const {
    solicitacoes,
    isLoading: solicitacoesLoading,
    isError: solicitacoesError,
    error: solicitacoesErrorMessage,
    approve: approveSolicitacao,
    reject: rejectSolicitacao,
  } = useAthleteRequests({ status: "PENDENTE", enabled: allowRequests });
  const {
    autoApproveAthletes,
    isLoading: autoApproveLoading,
    isUpdating: autoApproveUpdating,
    isError: autoApproveError,
    error: autoApproveErrorMessage,
    toggleAutoApprove,
  } = useAutoApproveAthletes({ enabled: allowRequests });
  const [busca, setBusca] = useState("");
  const [showModalExcluir, setShowModalExcluir] = useState(false);
  const [excluirJogador, setExcluirJogador] = useState<Jogador | undefined>();
  const [showModalCadastro, setShowModalCadastro] = useState(false);
  const [cadastroErro, setCadastroErro] = useState<string | null>(null);
  const [cadastroLoading, setCadastroLoading] = useState(false);
  const [posicaoFiltro, setPosicaoFiltro] = useState("todas");
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [jogadorEditar, setJogadorEditar] = useState<Jogador | undefined>();
  const [editarErro, setEditarErro] = useState<string | null>(null);
  const [editarLoading, setEditarLoading] = useState(false);
  const [showModalVincular, setShowModalVincular] = useState(false);
  const [jogadorVinculo, setJogadorVinculo] = useState<Jogador | undefined>();
  const [buscaConta, setBuscaConta] = useState("");
  const [contaSelecionada, setContaSelecionada] = useState("");
  const [confirmacaoVinculo, setConfirmacaoVinculo] = useState("");
  const [vincularErro, setVincularErro] = useState<string | null>(null);
  const [vinculando, setVinculando] = useState(false);
  const [autoApproveConfirmOpen, setAutoApproveConfirmOpen] = useState(false);
  const [autoApproveLocalError, setAutoApproveLocalError] = useState<string | null>(null);
  const [solicitacaoActionId, setSolicitacaoActionId] = useState<string | null>(null);
  const [solicitacaoActionError, setSolicitacaoActionError] = useState<string | null>(null);
  const [rejeitarSolicitacao, setRejeitarSolicitacao] = useState<AthleteRequest | null>(null);
  const [rejeitarMotivo, setRejeitarMotivo] = useState("");
  const [rejeitarErro, setRejeitarErro] = useState<string | null>(null);
  const [rejeitando, setRejeitando] = useState(false);
  const [vincularSolicitacao, setVincularSolicitacao] = useState<AthleteRequest | null>(null);
  const [npcBusca, setNpcBusca] = useState("");
  const [npcSelecionado, setNpcSelecionado] = useState("");
  const [confirmacaoVincularSolicitacao, setConfirmacaoVincularSolicitacao] = useState("");
  const [vincularSolicitacaoErro, setVincularSolicitacaoErro] = useState<string | null>(null);
  const [vincularSolicitacaoLoading, setVincularSolicitacaoLoading] = useState(false);

  const jogadoresFiltrados = jogadores.filter((j) => {
    const termo = busca.toLowerCase();
    const nomeOk = j.nome.toLowerCase().includes(termo) || j.apelido.toLowerCase().includes(termo);
    if (!nomeOk) return false;
    if (posicaoFiltro === "todas") return true;
    const posicao = String(j.posicao || j.position || "").toLowerCase();
    return posicao === posicaoFiltro;
  });

  const solicitacoesPendentes = useMemo(
    () => solicitacoes.filter((item) => String(item.status || "").toUpperCase() === "PENDENTE"),
    [solicitacoes]
  );
  const solicitacoesCount = solicitacoesPendentes.length;
  const autoApproveBusy = autoApproveLoading || autoApproveUpdating;
  const autoApproveErrorResolved =
    autoApproveLocalError || (autoApproveError ? autoApproveErrorMessage : null);
  const npcsDisponiveis = useMemo(
    () => jogadores.filter((j) => !j.userId && !j.isBot),
    [jogadores]
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

  const npcsFiltrados = useMemo(() => {
    if (!vincularSolicitacao) return [];
    const termo = npcBusca.trim().toLowerCase();
    return npcsDisponiveis
      .filter((npc) => {
        if (!termo) return true;
        return (
          npc.nome.toLowerCase().includes(termo) ||
          npc.apelido.toLowerCase().includes(termo) ||
          (npc.email || "").toLowerCase().includes(termo)
        );
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [npcBusca, npcsDisponiveis, vincularSolicitacao]);

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

  const abrirModalEditar = (jogador: Jogador) => {
    setJogadorEditar(jogador);
    setEditarErro(null);
    setEditarLoading(false);
    setShowModalEditar(true);
  };

  const fecharModalEditar = () => {
    if (editarLoading) return;
    setShowModalEditar(false);
    setJogadorEditar(undefined);
    setEditarErro(null);
    setEditarLoading(false);
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

  const handleAutoApproveChange = async (enabledNext: boolean) => {
    if (autoApproveBusy) return;
    setAutoApproveLocalError(null);
    if (enabledNext) {
      setAutoApproveConfirmOpen(true);
      return;
    }

    try {
      await toggleAutoApprove(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar auto-aceite.";
      setAutoApproveLocalError(message);
    }
  };

  const confirmAutoApprove = async () => {
    if (autoApproveBusy) return;
    setAutoApproveLocalError(null);
    try {
      await toggleAutoApprove(true);
      setAutoApproveConfirmOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar auto-aceite.";
      setAutoApproveLocalError(message);
    }
  };

  const abrirModalRejeitarSolicitacao = (solicitacao: AthleteRequest) => {
    setRejeitarSolicitacao(solicitacao);
    setRejeitarMotivo("");
    setRejeitarErro(null);
  };

  const fecharModalRejeitarSolicitacao = () => {
    if (rejeitando) return;
    setRejeitarSolicitacao(null);
    setRejeitarMotivo("");
    setRejeitarErro(null);
  };

  const confirmarRejeicao = async () => {
    if (!rejeitarSolicitacao || rejeitando) return;
    setRejeitando(true);
    setRejeitarErro(null);

    try {
      await rejectSolicitacao(rejeitarSolicitacao.id, rejeitarMotivo);
      await mutateJogadores();
      setRejeitarSolicitacao(null);
      setRejeitarMotivo("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao rejeitar solicitação.";
      setRejeitarErro(message);
    } finally {
      setRejeitando(false);
    }
  };

  const abrirModalVincularSolicitacao = (solicitacao: AthleteRequest) => {
    setVincularSolicitacao(solicitacao);
    setNpcBusca("");
    setNpcSelecionado("");
    setConfirmacaoVincularSolicitacao("");
    setVincularSolicitacaoErro(null);
  };

  const fecharModalVincularSolicitacao = () => {
    if (vincularSolicitacaoLoading) return;
    setVincularSolicitacao(null);
    setNpcBusca("");
    setNpcSelecionado("");
    setConfirmacaoVincularSolicitacao("");
    setVincularSolicitacaoErro(null);
  };

  const confirmarVincularSolicitacao = async () => {
    if (!vincularSolicitacao || !npcSelecionado || !vincularSolicitacao.userId) return;
    setVincularSolicitacaoLoading(true);
    setVincularSolicitacaoErro(null);

    try {
      const response = await fetch("/api/jogadores/vincular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jogadorId: npcSelecionado,
          userId: vincularSolicitacao.userId,
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

      await approveSolicitacao(vincularSolicitacao.id);
      await mutateJogadores();
      fecharModalVincularSolicitacao();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao vincular solicitação.";
      setVincularSolicitacaoErro(message);
    } finally {
      setVincularSolicitacaoLoading(false);
    }
  };

  const aprovarSolicitacao = async (solicitacao: AthleteRequest) => {
    if (solicitacaoActionId) return;
    setSolicitacaoActionId(solicitacao.id);
    setSolicitacaoActionError(null);

    try {
      await approveSolicitacao(solicitacao.id);
      await mutateJogadores();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao aprovar solicitação.";
      setSolicitacaoActionError(message);
    } finally {
      setSolicitacaoActionId(null);
    }
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
        throw new Error("Não foi possível cadastrar o jogador.");
      }

      setShowModalCadastro(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível cadastrar o jogador.";
      setCadastroErro(message);
    } finally {
      setCadastroLoading(false);
    }
  };

  const confirmarEdicao = async (jogador: Partial<Jogador>, fotoFile?: File | null) => {
    if (!jogadorEditar || editarLoading) return;
    setEditarLoading(true);
    setEditarErro(null);

    try {
      let uploadedUrl: string | undefined;
      if (fotoFile) {
        uploadedUrl = await uploadAvatar(fotoFile);
      }

      const payload: Partial<Jogador> = {
        ...jogador,
        foto: undefined,
        email: undefined,
      };
      if (typeof uploadedUrl !== "undefined") {
        payload.photoUrl = uploadedUrl;
      }

      const result = await updateJogador(jogadorEditar.id, payload);
      if (!result) {
        throw new Error("Não foi possível atualizar o jogador.");
      }

      setShowModalEditar(false);
      setJogadorEditar(undefined);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível atualizar o jogador.";
      setEditarErro(message);
    } finally {
      setEditarLoading(false);
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

      await mutateJogadores();
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
  const showSolicitacoesLista = solicitacoesCount > 0;
  const showSolicitacoesEmpty =
    !solicitacoesLoading && !solicitacoesError && solicitacoesCount === 0 && !autoApproveAthletes;

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
        {missingTenantScope && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Não foi possível identificar o racha ativo. Acesse o Hub e selecione o racha antes de
            gerenciar jogadores.
          </div>
        )}

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

        <section id="solicitacoes" className="mb-8 scroll-mt-28">
          <div className="bg-[#1a1a1a] border border-yellow-600 rounded-lg p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-base font-bold text-yellow-400">Solicitações de atletas</h2>
                <p className="text-sm text-gray-300">
                  Cadastros feitos no site público aguardam aprovação para liberar ranking, jogos e
                  perfil completo.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-300 font-semibold">
                  Aceitar solicitações automaticamente
                </div>
                <Switch
                  checked={autoApproveAthletes}
                  onCheckedChange={handleAutoApproveChange}
                  ariaLabel="Aceitar solicitações automaticamente"
                  disabled={autoApproveBusy}
                />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">
              <span className="text-yellow-300 font-semibold">Ligado:</span> aprova automaticamente.
              <span className="ml-2 text-gray-300 font-semibold">Desligado:</span> exige aprovação
              manual.
            </div>
            {autoApproveBusy && (
              <div className="mt-2 text-xs text-gray-400">Atualizando configuração...</div>
            )}
            {autoApproveErrorResolved && (
              <div className="mt-2 text-xs text-red-300">{autoApproveErrorResolved}</div>
            )}
          </div>

          {autoApproveAthletes && !solicitacoesCount && (
            <div className="mt-3 rounded-lg border border-yellow-500/40 bg-[#1f1a10] px-4 py-3 text-sm text-yellow-200">
              Auto-aceite ligado: novas solicitações entram aprovadas automaticamente.
            </div>
          )}

          <div className="mt-5">
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm mb-2">
              Solicitações pendentes ({solicitacoesCount})
            </div>

            {solicitacaoActionError && (
              <div className="text-xs text-red-300 mb-2">{solicitacaoActionError}</div>
            )}

            {solicitacoesLoading ? (
              <div className="text-center text-gray-400 py-6">Carregando solicitações...</div>
            ) : solicitacoesError ? (
              <div className="text-center text-red-400 py-6">
                Não foi possível carregar as solicitações.
                {solicitacoesErrorMessage && (
                  <div className="text-xs text-red-300 mt-2">{solicitacoesErrorMessage}</div>
                )}
              </div>
            ) : showSolicitacoesLista ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <AnimatePresence>
                  {solicitacoesPendentes.map((solicitacao, index) => {
                    const isActionLoading = solicitacaoActionId === solicitacao.id;
                    const canVincular = Boolean(solicitacao.userId) && npcsDisponiveis.length > 0;
                    const approveDisabled = isActionLoading;
                    const vincularDisabled = !canVincular || isActionLoading;
                    const rejeitarDisabled = isActionLoading;

                    return (
                      <motion.div
                        key={solicitacao.id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={cardVariants}
                        layout
                        className="bg-[#23272f] border border-yellow-600/60 rounded-xl p-4 shadow-xl"
                      >
                        <div className="flex items-center">
                          <AvatarFut7Pro
                            src={solicitacao.avatarUrl || solicitacao.photoUrl}
                            alt={solicitacao.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                          <div className="pl-4 flex-1">
                            <div className="font-bold text-white">
                              {solicitacao.name}
                              {solicitacao.nickname ? (
                                <span className="text-gray-400"> ({solicitacao.nickname})</span>
                              ) : null}
                            </div>
                            <div className="text-sm text-gray-300">
                              {formatPosicao(solicitacao.position)}
                            </div>
                            <div className="text-xs text-gray-400">{solicitacao.email}</div>
                            <div className="text-xs mt-2 flex flex-wrap gap-2 items-center">
                              <span className="bg-yellow-700 text-yellow-200 font-bold rounded px-2 py-0.5">
                                Solicitação pendente
                              </span>
                              <span className="bg-zinc-700 text-zinc-200 font-bold rounded px-2 py-0.5">
                                Criado {formatDateTime(solicitacao.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-yellow-900/40 mt-4 pt-3 flex gap-2 justify-end">
                          <button
                            className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                              approveDisabled
                                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                            disabled={approveDisabled}
                            onClick={() => aprovarSolicitacao(solicitacao)}
                          >
                            <FaCheck /> {approveDisabled ? "Aprovando..." : "Aprovar"}
                          </button>
                          <button
                            className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                              vincularDisabled
                                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                : "bg-indigo-700 hover:bg-indigo-800 text-white"
                            }`}
                            disabled={vincularDisabled}
                            onClick={() => abrirModalVincularSolicitacao(solicitacao)}
                          >
                            <FaLink /> Vincular
                          </button>
                          <button
                            className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                              rejeitarDisabled
                                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                : "bg-red-700 hover:bg-red-800 text-white"
                            }`}
                            disabled={rejeitarDisabled}
                            onClick={() => abrirModalRejeitarSolicitacao(solicitacao)}
                          >
                            <FaTimes /> Rejeitar
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : showSolicitacoesEmpty ? (
              <div className="text-center text-gray-400 py-6">Sem solicitações pendentes.</div>
            ) : null}
          </div>
        </section>

        {/* BARRA DE BUSCA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
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
            <select
              value={posicaoFiltro}
              onChange={(e) => setPosicaoFiltro(e.target.value)}
              className="rounded-md bg-[#23272f] border border-gray-700 text-white px-3 py-2 w-full sm:w-52 focus:border-cyan-600"
              aria-label="Filtrar por posição"
            >
              <option value="todas">Todas as posicoes</option>
              <option value="goleiro">Goleiro</option>
              <option value="zagueiro">Zagueiro</option>
              <option value="meia">Meia</option>
              <option value="atacante">Atacante</option>
            </select>
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
                      <AvatarFut7Pro
                        src={j.avatarUrl || j.avatar || j.foto || j.photoUrl}
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
                        onClick={() => abrirModalEditar(j)}
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

      <ModalEditarJogador
        open={showModalEditar}
        jogador={jogadorEditar}
        onClose={fecharModalEditar}
        onSave={confirmarEdicao}
        loading={editarLoading}
        error={editarErro}
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

      <ModalAutoApproveConfirm
        open={autoApproveConfirmOpen}
        onClose={() => setAutoApproveConfirmOpen(false)}
        onConfirm={confirmAutoApprove}
        loading={autoApproveUpdating}
      />

      <ModalRejeitarSolicitacao
        open={Boolean(rejeitarSolicitacao)}
        solicitacao={rejeitarSolicitacao}
        motivo={rejeitarMotivo}
        onMotivoChange={setRejeitarMotivo}
        onClose={fecharModalRejeitarSolicitacao}
        onConfirm={confirmarRejeicao}
        loading={rejeitando}
        error={rejeitarErro}
      />

      <ModalVincularSolicitacao
        open={Boolean(vincularSolicitacao)}
        solicitacao={vincularSolicitacao}
        npcs={npcsFiltrados}
        busca={npcBusca}
        onBuscaChange={setNpcBusca}
        npcId={npcSelecionado}
        onNpcChange={setNpcSelecionado}
        confirmacao={confirmacaoVincularSolicitacao}
        onConfirmacaoChange={setConfirmacaoVincularSolicitacao}
        onClose={fecharModalVincularSolicitacao}
        onConfirm={confirmarVincularSolicitacao}
        loading={vincularSolicitacaoLoading}
        error={vincularSolicitacaoErro}
      />
    </>
  );
}
