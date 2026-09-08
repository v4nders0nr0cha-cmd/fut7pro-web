"use client";

import { Dialog } from "@headlessui/react";
import Image from "next/image";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  CheckCircle2,
  Edit3,
  ImagePlus,
  Lightbulb,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRacha } from "@/context/RachaContext";
import { TimesApiError, useTimes } from "@/hooks/useTimes";
import type { Time } from "@/types/time";
import {
  Fut7ConfirmDialog,
  Fut7DestructiveDialog,
  Fut7InlineFeedback,
  showFut7Toast,
} from "@/components/ui/feedback";

const DEFAULT_LOGO = "/images/times/time_padrao_01.png";
const DEFAULT_COLOR = "#FFD700";
const ALLOWED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_LOGO_SIZE = 2 * 1024 * 1024;

type TabKey = "active" | "archived";
type ModalMode = "create" | "edit";
type TeamModalState = { mode: ModalMode; team?: Time } | null;

function getTeamLogo(time?: Pick<Time, "logo" | "logoUrl"> | null) {
  return time?.logo || time?.logoUrl || DEFAULT_LOGO;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof TimesApiError) {
    if (error.code === "TEAM_HAS_HISTORICAL_USAGE") {
      return "Este time já faz parte do histórico do racha e não pode ser excluído. Arquive-o para deixar de utilizá-lo em novas partidas.";
    }
    if (
      error.code === "TEAM_ARCHIVED_FOR_NEW_OPERATION" ||
      error.code === "TEAM_INVALID_FOR_NEW_OPERATION"
    ) {
      return error.message || fallback;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function matchCountLabel(count?: number) {
  const total = Number.isFinite(Number(count)) ? Number(count) : 0;
  if (total === 1) return "1 partida registrada";
  return `${total} partidas registradas`;
}

function TeamSkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-44 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-950/80"
        />
      ))}
    </div>
  );
}

function EmptyState({ tab, onCreate }: { tab: TabKey; onCreate: () => void }) {
  if (tab === "archived") {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/70 px-5 py-12 text-center">
        <Archive className="mx-auto h-10 w-10 text-zinc-500" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-bold text-white">Nenhum time arquivado</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
          Os times que você arquivar aparecerão aqui e poderão ser reativados quando necessário.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-yellow-400/35 bg-yellow-400/[0.04] px-5 py-12 text-center">
      <ImagePlus className="mx-auto h-10 w-10 text-yellow-300" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-bold text-white">Nenhum time ativo</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
        Cadastre o primeiro time para utilizá-lo nos sorteios e partidas do racha.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-extrabold text-black transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-black"
      >
        <Plus size={18} aria-hidden="true" />
        Novo Time
      </button>
    </div>
  );
}

function TeamCard({
  time,
  archived,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: {
  time: Time;
  archived: boolean;
  onEdit: (time: Time) => void;
  onArchive: (time: Time) => void;
  onRestore: (time: Time) => void;
  onDelete: (time: Time) => void;
}) {
  const matchCount = Number.isFinite(Number(time.matchCount)) ? Number(time.matchCount) : 0;
  const canDelete = time.canDelete === true && time.hasHistoricalUsage !== true && matchCount === 0;
  const color = time.cor || time.color || DEFAULT_COLOR;

  return (
    <article className="group flex min-w-0 flex-col rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition hover:border-yellow-400/35 hover:bg-zinc-900/90">
      <div className="flex min-w-0 items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          <Image
            src={getTeamLogo(time)}
            alt={`Logo do time ${time.nome}`}
            fill
            sizes="64px"
            className="object-contain p-1.5"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 break-words text-lg font-extrabold leading-tight text-white">
            {time.nome}
          </h2>
          <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 text-sm text-zinc-300">
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/40"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="min-w-0 truncate">{color}</span>
          </div>
          <p className="mt-2 text-sm text-zinc-400">{matchCountLabel(matchCount)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {!archived && (
          <button
            type="button"
            onClick={() => onEdit(time)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-zinc-700 px-3 py-2 text-sm font-bold text-zinc-100 transition hover:border-yellow-400/60 hover:bg-yellow-400/10 focus:outline-none focus:ring-2 focus:ring-yellow-200"
            aria-label={`Editar ${time.nome}`}
          >
            <Edit3 size={16} aria-hidden="true" />
            Editar
          </button>
        )}
        {!archived && canDelete && (
          <button
            type="button"
            onClick={() => onDelete(time)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-400/35 px-3 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-200"
            aria-label={`Excluir ${time.nome}`}
          >
            <Trash2 size={16} aria-hidden="true" />
            Excluir
          </button>
        )}
        {!archived && !canDelete && (
          <button
            type="button"
            onClick={() => onArchive(time)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-yellow-400/45 px-3 py-2 text-sm font-bold text-yellow-200 transition hover:bg-yellow-400/10 focus:outline-none focus:ring-2 focus:ring-yellow-200"
            aria-label={`Arquivar ${time.nome}`}
          >
            <Archive size={16} aria-hidden="true" />
            Arquivar
          </button>
        )}
        {archived && (
          <button
            type="button"
            onClick={() => onRestore(time)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-3 py-2 text-sm font-extrabold text-black transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-black"
            aria-label={`Reativar ${time.nome}`}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Reativar time
          </button>
        )}
      </div>
    </article>
  );
}

function MonetizationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/75" aria-hidden="true" />
      <div className="fixed inset-0 flex h-[100dvh] items-center justify-center p-3 sm:p-6">
        <Dialog.Panel className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-yellow-400/15 bg-[#151515] shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-800 px-5 py-4 sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300/80">
                Naming Rights
              </p>
              <Dialog.Title className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
                Dicas de Monetização com Times
              </Dialog.Title>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-200"
              aria-label="Fechar dicas de monetização"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 text-sm leading-6 text-zinc-300 sm:px-6">
            <p>
              Além dos espaços tradicionais de patrocinadores, você também pode transformar cada
              time do seu racha em uma cota especial de Naming Rights (direitos de nome).
            </p>
            <p className="mt-3">
              Em vez de usar um nome genérico como Time Amarelo, uma empresa parceira pode dar nome
              e identidade ao time.
            </p>

            <div className="my-5 grid gap-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.04] p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-xs font-bold uppercase text-zinc-500">Time genérico</p>
                <p className="mt-2 text-lg font-extrabold text-white">Time Amarelo</p>
              </div>
              <div className="flex justify-center text-yellow-300" aria-hidden="true">
                ↓
              </div>
              <div className="rounded-xl border border-yellow-400/35 bg-zinc-950 p-4">
                <p className="text-xs font-bold uppercase text-yellow-300">Time patrocinado</p>
                <p className="mt-2 text-lg font-extrabold text-white">Casa do Gamer</p>
              </div>
            </div>

            <p>
              Dentro do Fut7Pro, a marca passa a acompanhar esse time em diferentes momentos, como
              nos Times do Dia, partidas, resultados, rankings e histórico do racha.
            </p>
            <p className="mt-3">
              Para valorizar ainda mais essa cota, você pode incluir tudo o que já oferece nos
              planos mais básicos e adicionar benefícios exclusivos, como:
            </p>
            <ul className="mt-3 space-y-2">
              {[
                "Logo exclusiva na frente do colete;",
                "Logo nas costas dos uniformes ou coletes;",
                "Time com uniforme ou colete personalizado nas cores e identidade do patrocinador.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-semibold text-zinc-100">
              Assim, o patrocinador não ocupa apenas um espaço de divulgação: ele passa a fazer
              parte da identidade de um dos times do racha.
            </p>
          </div>
          <div className="border-t border-zinc-800 px-5 py-4 text-right sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-yellow-400 px-5 py-3 text-sm font-extrabold text-black transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-black"
            >
              Entendi
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

function TeamFormModal({
  state,
  currentSlug,
  saving,
  onClose,
  onSubmit,
}: {
  state: TeamModalState;
  currentSlug: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: { nome: string; cor: string; logoUrl: string }) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState(DEFAULT_COLOR);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const open = Boolean(state);
  const isEdit = state?.mode === "edit";
  const hasHistoricalUsage = Boolean(state?.team?.hasHistoricalUsage);

  useEffect(() => {
    if (!state) return;
    setNome(state.team?.nome || "");
    setCor(state.team?.cor || state.team?.color || DEFAULT_COLOR);
    setLogoUrl(getTeamLogo(state.team));
    setUploadError(null);
    setFormError(null);
  }, [state]);

  const handleLogoFile = async (file: File) => {
    setUploadError(null);

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setUploadError("Envie uma imagem JPEG, PNG ou WebP.");
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      setUploadError("Envie uma imagem de até 2 MB.");
      return;
    }

    if (!currentSlug) {
      setUploadError("Selecione um racha no Hub para enviar logos.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads/team-logo", {
        method: "POST",
        headers: {
          "x-tenant-slug": currentSlug,
        },
        body: formData,
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.message || payload?.error || "Falha ao enviar logo.");
      }

      setLogoUrl(payload.url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Falha ao enviar logo.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!nome.trim()) {
      setFormError("Informe o nome do time.");
      return;
    }

    try {
      await onSubmit({
        nome: nome.trim(),
        cor,
        logoUrl: logoUrl || DEFAULT_LOGO,
      });
    } catch (error) {
      setFormError(getErrorMessage(error, "Não foi possível salvar o time."));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving || uploading ? () => undefined : onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/75" aria-hidden="true" />
      <div className="fixed inset-0 flex h-[100dvh] items-center justify-center p-3 sm:p-6">
        <Dialog.Panel className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#151515] shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-800 px-5 py-4 sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300/80">
                {isEdit ? "Editar time" : "Novo time"}
              </p>
              <Dialog.Title className="mt-1 text-xl font-extrabold text-white">
                {isEdit ? `Editando: ${state?.team?.nome || "time"}` : "Adicionar time"}
              </Dialog.Title>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving || uploading}
              className="rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-200 disabled:opacity-50"
              aria-label="Fechar modal de time"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              {hasHistoricalUsage && (
                <Fut7InlineFeedback tone="warning" title="Time com histórico">
                  Este time possui histórico no racha. Alterações de nome, logo ou cor também podem
                  aparecer em registros antigos. Para uma nova identidade ou patrocinador, considere
                  arquivar este time e cadastrar outro.
                </Fut7InlineFeedback>
              )}

              {formError && (
                <Fut7InlineFeedback
                  tone="error"
                  title="Não foi possível salvar"
                  onDismiss={() => setFormError(null)}
                >
                  {formError}
                </Fut7InlineFeedback>
              )}

              <div>
                <label htmlFor="team-name" className="block text-sm font-bold text-zinc-200">
                  Nome do time
                </label>
                <input
                  id="team-name"
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/25"
                  placeholder="Casa do Gamer"
                  maxLength={60}
                  autoFocus
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="team-color" className="block text-sm font-bold text-zinc-200">
                  Cor do time
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    id="team-color"
                    type="color"
                    value={cor}
                    onChange={(event) => setCor(event.target.value)}
                    className="h-11 w-14 rounded-xl border border-zinc-700 bg-zinc-950 p-1"
                    disabled={saving}
                  />
                  <span className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-300">
                    {cor}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-sm font-bold text-zinc-200">Logo do time</span>
                <div className="mt-2 rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                      <Image
                        src={logoUrl || DEFAULT_LOGO}
                        alt={nome ? `Prévia da logo do time ${nome}` : "Prévia da logo do time"}
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">
                        {logoUrl && logoUrl !== DEFAULT_LOGO ? "Logo enviada" : "Enviar logo"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-zinc-400">
                        JPEG, PNG ou WebP com até 2 MB.
                      </p>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void handleLogoFile(file);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading || saving}
                        className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-yellow-400/45 px-3 py-2 text-sm font-bold text-yellow-200 transition hover:bg-yellow-400/10 focus:outline-none focus:ring-2 focus:ring-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Upload size={16} aria-hidden="true" />
                        )}
                        {uploading
                          ? "Enviando..."
                          : logoUrl && logoUrl !== DEFAULT_LOGO
                            ? "Trocar logo"
                            : "Enviar logo"}
                      </button>
                    </div>
                  </div>
                  {uploadError && (
                    <p className="mt-3 text-sm font-semibold text-red-300" role="alert">
                      {uploadError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-zinc-800 bg-[#151515] px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={onClose}
                disabled={saving || uploading}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-200 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-extrabold text-black transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {isEdit ? "Salvar alterações" : "Adicionar time"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default function CriarTimesPage() {
  const { tenantSlug } = useRacha();
  const currentSlug = tenantSlug?.trim() || "";
  const {
    times,
    addTime,
    updateTime,
    deleteTime,
    archiveTime,
    restoreTime,
    mutate,
    isLoading,
    isError,
  } = useTimes(currentSlug || undefined, { status: "all" });

  const [activeTab, setActiveTab] = useState<TabKey>("active");
  const [teamModal, setTeamModal] = useState<TeamModalState>(null);
  const [monetizationOpen, setMonetizationOpen] = useState(false);
  const [teamToArchive, setTeamToArchive] = useState<Time | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Time | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const activeTeams = useMemo(() => times.filter((time) => !time.archivedAt), [times]);
  const archivedTeams = useMemo(() => times.filter((time) => Boolean(time.archivedAt)), [times]);
  const visibleTeams = activeTab === "active" ? activeTeams : archivedTeams;
  const savingForm = pendingAction === "save";

  const handleSaveTeam = async (payload: { nome: string; cor: string; logoUrl: string }) => {
    if (!currentSlug) {
      throw new Error("Selecione um racha no Hub para criar ou editar times.");
    }

    setPendingAction("save");
    setPageError(null);
    try {
      if (teamModal?.mode === "edit" && teamModal.team) {
        await updateTime({
          ...teamModal.team,
          nome: payload.nome,
          cor: payload.cor,
          logo: payload.logoUrl,
          logoUrl: payload.logoUrl,
        });
        showFut7Toast({ tone: "success", title: "Time atualizado" });
      } else {
        await addTime({
          nome: payload.nome,
          cor: payload.cor,
          logo: payload.logoUrl,
          logoUrl: payload.logoUrl,
          rachaId: currentSlug,
        });
        showFut7Toast({ tone: "success", title: "Time adicionado" });
      }
      setTeamModal(null);
      await mutate();
    } finally {
      setPendingAction(null);
    }
  };

  const handleArchive = async () => {
    if (!teamToArchive) return;
    setPendingAction("archive");
    setPageError(null);
    try {
      await archiveTime(teamToArchive.id);
      showFut7Toast({
        tone: "success",
        title: "Time arquivado",
        message: "Ele não aparecerá em novos sorteios e partidas.",
      });
      setTeamToArchive(null);
      setActiveTab("archived");
      await mutate();
    } catch (error) {
      setPageError(getErrorMessage(error, "Não foi possível arquivar o time."));
    } finally {
      setPendingAction(null);
    }
  };

  const handleRestore = async (time: Time) => {
    setPendingAction(`restore-${time.id}`);
    setPageError(null);
    try {
      await restoreTime(time.id);
      showFut7Toast({ tone: "success", title: "Time reativado" });
      setActiveTab("active");
      await mutate();
    } catch (error) {
      setPageError(getErrorMessage(error, "Não foi possível reativar o time."));
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async () => {
    if (!teamToDelete) return;
    setPendingAction("delete");
    setPageError(null);
    try {
      await deleteTime(teamToDelete.id);
      showFut7Toast({ tone: "success", title: "Time excluído" });
      setTeamToDelete(null);
      await mutate();
    } catch (error) {
      setPageError(getErrorMessage(error, "Não foi possível excluir o time."));
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <>
      <main className="min-h-screen px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 text-white sm:px-6 sm:pb-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300/80">
                  Times oficiais do racha
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-yellow-300 sm:text-4xl">
                  Gerenciar Times
                </h1>
                <p className="mt-3 text-sm leading-6 text-zinc-300 sm:text-base">
                  Cadastre e organize os times do seu racha. Defina nome, cor e identidade visual,
                  arquive times que não são mais utilizados e preserve todo o histórico das
                  partidas.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                <button
                  type="button"
                  onClick={() => setMonetizationOpen(true)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-yellow-400/35 px-4 py-3 text-sm font-bold text-yellow-200 transition hover:bg-yellow-400/10 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                >
                  <Lightbulb size={18} aria-hidden="true" />
                  Dicas de Monetização
                </button>
                <button
                  type="button"
                  onClick={() => setTeamModal({ mode: "create" })}
                  disabled={!currentSlug}
                  className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-yellow-400 px-4 py-3 text-sm font-extrabold text-black transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={18} aria-hidden="true" />
                  Novo Time
                </button>
              </div>
            </div>
          </header>

          <div className="mt-5 space-y-4">
            {!currentSlug && (
              <Fut7InlineFeedback tone="warning" title="Racha não selecionado">
                Selecione um racha no Hub para cadastrar, editar, arquivar ou reativar times.
              </Fut7InlineFeedback>
            )}
            {isError && (
              <Fut7InlineFeedback tone="error" title="Erro ao carregar times">
                Não foi possível carregar os times do racha. Tente novamente em instantes.
              </Fut7InlineFeedback>
            )}
            {pageError && (
              <Fut7InlineFeedback
                tone="error"
                title="Ação não concluída"
                onDismiss={() => setPageError(null)}
              >
                {pageError}
              </Fut7InlineFeedback>
            )}
          </div>

          <section className="mt-6">
            <div
              className="grid grid-cols-2 gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-1.5 sm:inline-grid sm:min-w-[360px]"
              role="tablist"
              aria-label="Filtrar times"
            >
              {[
                { key: "active" as const, label: "Ativos", count: activeTeams.length },
                { key: "archived" as const, label: "Arquivados", count: archivedTeams.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`min-h-11 rounded-xl px-3 py-2 text-sm font-extrabold transition focus:outline-none focus:ring-2 focus:ring-yellow-200 ${
                    activeTab === tab.key
                      ? "bg-yellow-400 text-black shadow"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  {tab.label} <span className="font-black">{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="mt-5" role="tabpanel">
              {isLoading ? (
                <TeamSkeletonGrid />
              ) : visibleTeams.length === 0 ? (
                <EmptyState tab={activeTab} onCreate={() => setTeamModal({ mode: "create" })} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleTeams.map((time) => (
                    <TeamCard
                      key={time.id}
                      time={time}
                      archived={activeTab === "archived"}
                      onEdit={(team) => setTeamModal({ mode: "edit", team })}
                      onArchive={setTeamToArchive}
                      onRestore={handleRestore}
                      onDelete={setTeamToDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <TeamFormModal
        state={teamModal}
        currentSlug={currentSlug}
        saving={savingForm}
        onClose={() => setTeamModal(null)}
        onSubmit={handleSaveTeam}
      />

      <MonetizationDialog open={monetizationOpen} onClose={() => setMonetizationOpen(false)} />

      <Fut7ConfirmDialog
        open={Boolean(teamToArchive)}
        title={`Arquivar ${teamToArchive?.nome || "time"}?`}
        description="Este time deixará de aparecer em novos sorteios e partidas, mas todo o histórico do racha continuará preservado."
        confirmLabel="Arquivar time"
        cancelLabel="Cancelar"
        loading={pendingAction === "archive"}
        tone="warning"
        onClose={() => setTeamToArchive(null)}
        onConfirm={handleArchive}
      >
        <p className="text-sm leading-6 text-zinc-300">
          Se voltar a utilizar este time no futuro, você poderá reativá-lo.
        </p>
      </Fut7ConfirmDialog>

      <Fut7DestructiveDialog
        open={Boolean(teamToDelete)}
        title={`Excluir ${teamToDelete?.nome || "time"}?`}
        description="Este time ainda não possui histórico registrado e poderá ser excluído definitivamente."
        confirmLabel="Excluir time"
        cancelLabel="Cancelar"
        loading={pendingAction === "delete"}
        onClose={() => setTeamToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
