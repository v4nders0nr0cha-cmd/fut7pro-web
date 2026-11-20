"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  ExternalLink,
  UserRoundPlus,
} from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import {
  GUIDE_RECRUITING_CONTEXT,
  contextualGuideHref,
  type GuideOrigin,
} from "@/lib/admin-guide-navigation";
import { isOnboardingActionUnlocked } from "@/lib/admin-onboarding";
import type { AdminGuideData, AdminGuidePatch } from "@/types/admin-guide";

const primary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-50";
const secondary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-300 underline decoration-white/20 underline-offset-4 hover:text-white disabled:opacity-50";
const channels = ["WHATSAPP", "INSTAGRAM"] as const;
type Channel = (typeof channels)[number];
type View = "OPTIONS" | "CONFIRM" | "DONE" | "EXAMPLE";
type Props = {
  guide: AdminGuideData;
  /** A divulgação inicial conclui uma etapa; convites posteriores não alteram essa conquista. */
  mode?: "onboarding" | "reinvite";
  updating: boolean;
  update: (action: AdminGuidePatch) => Promise<boolean>;
  onBack: () => void;
  onContinue?: () => void;
  origin?: GuideOrigin;
  returnTo?: string;
  onNavigate?: () => void;
};
function pendingChannel(key: string, guide: AdminGuideData): Channel | null {
  try {
    const stored = sessionStorage.getItem(key);
    if (stored === "WHATSAPP" || stored === "INSTAGRAM") return stored;
  } catch {
    /* A continuidade básica não depende do armazenamento do navegador. */
  }
  const copied = channels.filter((channel) => guide.pedagogicalState.invitationCopies?.[channel]);
  const latestCopy = copied.sort((a, b) =>
    (guide.pedagogicalState.invitationCopies![b] ?? "").localeCompare(
      guide.pedagogicalState.invitationCopies![a] ?? ""
    )
  )[0];
  if (latestCopy) return latestCopy;
  const declarations = guide.pedagogicalState.invitationConfirmations;
  const lastDeclaration = channels
    .filter((item) => declarations?.[item])
    .sort((a, b) => (declarations?.[b] ?? "").localeCompare(declarations?.[a] ?? ""))[0];
  if (lastDeclaration) return lastDeclaration;
  const latestOpen = [...(guide.pedagogicalState.viewedResources ?? [])]
    .reverse()
    .find((resource) => resource === "whatsapp-share-attempt" || resource === "instagram-opened");
  return latestOpen === "instagram-opened" ? "INSTAGRAM" : latestOpen ? "WHATSAPP" : null;
}
export default function AdminGuideInvitationPanel(props: Props) {
  return (
    <InvitationFlow
      key={`${props.guide.tenant.id}:${props.guide.administrator.membershipId}:${props.mode ?? "onboarding"}`}
      {...props}
    />
  );
}
function InvitationFlow({
  guide,
  mode = "onboarding",
  updating,
  update,
  onBack,
  onContinue = onBack,
  origin = "pagina",
  returnTo,
  onNavigate,
}: Props) {
  const scope = `guide-invitation:v2:${guide.tenant.id}:${guide.administrator.membershipId}`;
  const reinvite = mode === "reinvite";
  const [initial] = useState(() => (reinvite ? null : pendingChannel(scope, guide)));
  const completed = guide.tasks.some((task) => task.id === "ACTIVE_PLAYERS" && task.completed);
  const previousCompletion = useRef(completed);
  const [channel, setChannel] = useState<Channel>(
    initial ?? guide.pedagogicalState.invitationChannel ?? "WHATSAPP"
  );
  const [view, setView] = useState<View>(
    reinvite ? "OPTIONS" : completed ? "DONE" : initial ? "CONFIRM" : "OPTIONS"
  );
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmAccepted, setConfirmAccepted] = useState(false);
  const lock = useRef(false);
  const root = useRef<HTMLElement>(null);
  const returningFromExample = useRef(false);
  const confirmed = guide.pedagogicalState.invitationConfirmations;
  const copied = guide.pedagogicalState.invitationCopies;
  const unlocked = isOnboardingActionUnlocked(
    guide.tasks,
    "ACTIVE_PLAYERS",
    guide.actionAvailability
  );
  const publicUrl = (() => {
    try {
      const url = new URL(guide.tenant.publicUrl ?? "");
      return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password
        ? url.href
        : null;
    } catch {
      return null;
    }
  })();
  const enabled = Boolean(publicUrl && (reinvite || unlocked) && !updating && !busy);
  const canRegister =
    unlocked &&
    guide.capabilities.managePlayers === true &&
    guide.tasks.some((task) => task.id === "ACTIVE_PLAYERS" && task.canAct);
  const canRegisterMore =
    reinvite &&
    guide.eligibility?.preparationComplete === true &&
    guide.eligibility?.footballUnlocked === false &&
    guide.administrator.status === "APROVADO" &&
    guide.capabilities.managePlayers === true;
  const invite = `Fala, galera! ⚽🔥\n\nNosso site da pelada já está no ar!\n\nEntrem pelo link e criem suas contas para acompanhar partidas, estatísticas e conquistas.\n\n👉 ${publicUrl}\n\nTamo junto! 👊⚽`;
  const appHref =
    channel === "WHATSAPP"
      ? `https://wa.me/?text=${encodeURIComponent(invite)}`
      : "https://www.instagram.com/";
  const used = (candidate: Channel) =>
    Boolean(
      (guide.pedagogicalState.invitationChannel === candidate &&
        guide.pedagogicalState.invitationCopiedAt) ||
        confirmed?.[candidate] ||
        copied?.[candidate] ||
        (guide.pedagogicalState.viewedResources ?? []).includes(
          candidate === "WHATSAPP" ? "whatsapp-share-attempt" : "instagram-opened"
        )
    );
  const other = channel === "WHATSAPP" ? "INSTAGRAM" : "WHATSAPP";

  useEffect(() => {
    if (reinvite) return;
    if (completed && (view === "CONFIRM" || !previousCompletion.current)) {
      setView("DONE");
      try {
        sessionStorage.removeItem(scope);
      } catch {
        /* Sem perda do estado confirmado no backend. */
      }
    }
    previousCompletion.current = completed;
  }, [completed, view, scope, reinvite]);
  useEffect(() => {
    const dialog = root.current?.closest('[role="dialog"]');
    const scroller = dialog?.querySelector<HTMLElement>(".overflow-y-auto");
    if (scroller) scroller.scrollTop = 0;
    if (returningFromExample.current) {
      root.current
        ?.querySelector<HTMLButtonElement>(`[data-invitation-example="${channel}"]`)
        ?.focus();
      returningFromExample.current = false;
    } else root.current?.focus({ preventScroll: true });
  }, [view, channel]);
  const start = (selected: Channel) => {
    setChannel(selected);
    setConfirmAccepted(false);
    setFeedback("");
    if (reinvite) {
      setView("OPTIONS");
      return;
    }
    try {
      if (completed) sessionStorage.removeItem(scope);
      else sessionStorage.setItem(scope, selected);
    } catch {
      /* O estado local ainda permite confirmar. */
    }
    setView(completed ? "DONE" : "CONFIRM");
  };
  const recordOpen = (selected: Channel) => {
    if (!enabled) return;
    if (reinvite) {
      setChannel(selected);
      setFeedback("Abra o aplicativo e compartilhe o convite com os jogadores.");
      return;
    }
    start(selected);
    void update({
      action: "RESOURCE_VIEWED",
      resourceId: selected === "WHATSAPP" ? "whatsapp-share-attempt" : "instagram-opened",
    });
  };
  const copy = async (selected: Channel) => {
    if (!enabled || lock.current || !publicUrl) return;
    lock.current = true;
    setBusy(true);
    setFeedback("");
    try {
      await navigator.clipboard.writeText(selected === "WHATSAPP" ? invite : publicUrl);
    } catch {
      setFeedback("A cópia falhou. Permita o acesso à área de transferência e tente novamente.");
      lock.current = false;
      setBusy(false);
      return;
    }
    if (reinvite) {
      setChannel(selected);
      setFeedback(
        selected === "WHATSAPP"
          ? "Convite copiado! Envie a mensagem aos jogadores."
          : "Link copiado! Compartilhe com os jogadores."
      );
      setBusy(false);
      lock.current = false;
      return;
    }
    start(selected);
    const saved = await update({ action: "INVITATION_COPY_RECORDED", channel: selected }).catch(
      () => false
    );
    setFeedback(
      saved
        ? completed
          ? selected === "WHATSAPP"
            ? "Convite copiado!"
            : "Link copiado!"
          : selected === "WHATSAPP"
            ? "Convite copiado. Envie a mensagem no grupo antes de confirmar."
            : "Link copiado. Adicione-o ao perfil do grupo antes de confirmar."
        : "O conteúdo foi copiado, mas não foi possível registrar a cópia. Você pode tentar novamente."
    );
    setBusy(false);
    lock.current = false;
  };
  const confirmSharing = async () => {
    if (reinvite || !enabled || lock.current) return;
    lock.current = true;
    setBusy(true);
    setFeedback("");
    const saved = await update({ action: "INVITATION_SHARED_CONFIRMED", channel }).catch(
      () => false
    );
    if (saved) setConfirmAccepted(true);
    else
      setFeedback("Não foi possível confirmar a divulgação. Tente novamente ou volte às opções.");
    setBusy(false);
    lock.current = false;
  };
  // O retorno do PATCH não substitui a conclusão calculada pelo backend no GET.
  const showDone = !reinvite && completed && view === "DONE";
  const backOptions = () => {
    setView("OPTIONS");
    setFeedback("");
  };
  const choose = (selected: Channel) => {
    setChannel(selected);
    setFeedback("");
    setView("OPTIONS");
  };
  return (
    <section
      ref={root}
      tabIndex={-1}
      aria-label="Convite de jogadores"
      className="min-w-0 space-y-5 text-white focus:outline-none"
    >
      {view === "EXAMPLE" ? (
        <>
          <button
            type="button"
            className={secondary}
            onClick={() => {
              returningFromExample.current = true;
              setView("OPTIONS");
            }}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar às opções de convite
          </button>
          <h2 className="text-lg font-semibold">
            Exemplo no {channel === "WHATSAPP" ? "WhatsApp" : "Instagram"}
          </h2>
          <div className="max-h-[60dvh] overflow-y-auto overflow-x-hidden rounded-xl border border-white/10">
            <Image
              src={`/images/onboarding/${channel === "WHATSAPP" ? "whatsapp" : "instagram"}.webp`}
              alt={`Exemplo ilustrativo ampliado do ${channel === "WHATSAPP" ? "WhatsApp" : "Instagram"}`}
              width={941}
              height={1672}
              sizes="(max-width:767px) calc(100vw - 4rem), 680px"
              className="h-auto w-full object-contain"
            />
          </div>
          <p className="text-xs text-zinc-400">
            Exemplo ilustrativo. Os nomes e links da imagem são referências.
          </p>
        </>
      ) : showDone ? (
        <>
          <header className="space-y-3">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <CheckCircle2 className="shrink-0 text-emerald-400" size={23} aria-hidden="true" />
              Etapa concluída!
            </h2>
            <p className="text-sm leading-relaxed text-zinc-300">
              Você deu o primeiro passo para trazer os jogadores ao Fut7Pro. Agora, incentive a
              galera a criar suas contas e entrar no grupo.
            </p>
          </header>
          <section
            className="space-y-2 border-t border-white/10 pt-4"
            aria-label="Cadastro manual opcional"
          >
            <h3 className="font-semibold">E se algum jogador não conseguir se cadastrar?</h3>
            <p className="text-sm text-zinc-300">
              Você pode criar o perfil dele manualmente e vinculá-lo à conta que ele criar depois,
              preservando seu histórico. A conta precisa entrar neste grupo para permitir a
              vinculação.
            </p>
            <p className="text-xs text-zinc-400">
              Sempre que possível, incentive cada atleta a criar sua própria conta.
            </p>
            {canRegister && !updating ? (
              <Link
                className={secondary}
                href={contextualGuideHref(
                  "/admin/jogadores/listar-cadastrar",
                  "ACTIVE_PLAYERS",
                  origin,
                  returnTo
                )}
                onClick={onNavigate}
              >
                <UserRoundPlus size={17} aria-hidden="true" />
                Cadastrar jogador manualmente
              </Link>
            ) : (
              <p className="text-sm text-zinc-400">
                Um administrador com permissão para gerenciar jogadores pode ajudar com o cadastro
                manual.
              </p>
            )}
          </section>
          {!used(other) && (
            <section
              className="space-y-1 border-t border-white/10 pt-4"
              aria-label="Outro canal de divulgação"
            >
              <p className="text-sm text-zinc-300">Quer divulgar o site em mais um lugar?</p>
              <button type="button" className={secondary} onClick={() => choose(other)}>
                {other === "INSTAGRAM" ? (
                  <FaInstagram aria-hidden="true" />
                ) : (
                  <FaWhatsapp aria-hidden="true" />
                )}
                {other === "INSTAGRAM"
                  ? "Divulgar também no Instagram"
                  : "Compartilhar também no WhatsApp"}
              </button>
            </section>
          )}
          <div className="space-y-2">
            <button type="button" className={`${primary} w-full`} onClick={onContinue}>
              Continuar para a próxima etapa
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <button type="button" className={secondary} onClick={backOptions}>
              Consultar opções e exemplos
            </button>
          </div>
        </>
      ) : view === "CONFIRM" ? (
        <>
          <header className="space-y-3">
            <h2 className="text-xl font-bold">Conseguiu compartilhar o convite?</h2>
            <p className="text-sm text-zinc-300">
              Se já divulgou o site do grupo, confirme para continuar. Se ainda não conseguiu, você
              pode tentar novamente.
            </p>
          </header>
          {channel === "INSTAGRAM" && (
            <p className="text-sm text-zinc-400">
              No Instagram, entre em Editar perfil, procure a opção de links e adicione o endereço
              do site. Os nomes podem variar conforme a versão.
            </p>
          )}
          <a
            className={secondary}
            href={appHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => {
              if (!enabled) event.preventDefault();
              else recordOpen(channel);
            }}
            aria-disabled={!enabled}
          >
            {channel === "WHATSAPP" ? "Abrir WhatsApp novamente" : "Abrir Instagram"}
            <ExternalLink size={13} aria-hidden="true" />
          </a>
          <p className="text-xs text-zinc-400">
            Ao confirmar, você informa que realizou a divulgação. O Fut7Pro não verifica o envio no
            aplicativo.
          </p>
          <div className="flex flex-col items-start gap-2 sm:flex-row">
            <button
              type="button"
              className={primary}
              disabled={!enabled}
              onClick={() => void confirmSharing()}
            >
              {busy
                ? "Salvando..."
                : confirmAccepted
                  ? "Atualizar progresso"
                  : "Já compartilhei o convite"}
            </button>
            <button type="button" className={secondary} disabled={busy} onClick={backOptions}>
              Voltar às opções
            </button>
          </div>
          {confirmAccepted && !completed && (
            <p role="status" className="text-sm text-zinc-300">
              Sua confirmação foi salva. Aguarde a atualização do progresso ou volte às opções para
              tentar novamente.
            </p>
          )}
        </>
      ) : (
        <>
          <header className="space-y-2">
            <h2 className="text-xl font-bold">
              {reinvite ? "Convidar mais jogadores" : "Traga seus primeiros jogadores"}
            </h2>
            <p className="text-sm text-zinc-300">
              {reinvite
                ? "Compartilhe o link do grupo com novos jogadores. Os convites não alteram as etapas já concluídas."
                : "Escolha onde divulgar o site do seu grupo. Assim, os jogadores poderão criar suas contas e acompanhar tudo pelo Fut7Pro."}
            </p>
          </header>
          <div
            role="group"
            aria-label="Como trazer jogadores"
            className="grid grid-cols-2 gap-2 md:hidden"
          >
            {channels.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={channel === option}
                className={`min-h-11 rounded-lg text-sm font-semibold ${channel === option ? "bg-white/10 text-yellow-200" : "text-zinc-400"}`}
                onClick={() => choose(option)}
              >
                {option === "WHATSAPP" ? "WhatsApp" : "Instagram"}
              </button>
            ))}
          </div>
          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            {channels.map((option) => (
              <section
                key={option}
                aria-label={option === "WHATSAPP" ? "WhatsApp" : "Instagram"}
                className={`${channel === option ? "block" : "hidden md:block"} min-w-0 space-y-3 rounded-xl border border-white/10 bg-white/[0.025] p-4 md:flex md:flex-col`}
              >
                {option === "WHATSAPP" ? (
                  <FaWhatsapp size={30} className="text-emerald-400" aria-hidden="true" />
                ) : (
                  <FaInstagram size={30} className="text-amber-200" aria-hidden="true" />
                )}
                <h3 className="text-base font-semibold">
                  {option === "WHATSAPP"
                    ? "Convide a galera pelo WhatsApp"
                    : "Coloque o site no Instagram"}
                </h3>
                <p className="text-sm text-zinc-300 md:flex-1">
                  {option === "WHATSAPP"
                    ? "Envie o convite no grupo da pelada. Depois, pressione a mensagem e escolha Fixar para facilitar o acesso dos jogadores."
                    : "Adicione o link do site ao perfil do Instagram do grupo. Assim, os jogadores poderão encontrá-lo sempre que precisarem."}
                </p>
                {option === "INSTAGRAM" && (
                  <p className="text-xs text-zinc-400">
                    Em Editar perfil, procure a opção de links. Os nomes podem variar conforme a
                    versão.
                  </p>
                )}
                {option === "WHATSAPP" ? (
                  enabled ? (
                    <a
                      className={primary}
                      href={`https://wa.me/?text=${encodeURIComponent(invite)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => recordOpen(option)}
                    >
                      <FaWhatsapp size={17} aria-hidden="true" />
                      Compartilhar no WhatsApp
                    </a>
                  ) : (
                    <button type="button" className={primary} disabled>
                      Compartilhar no WhatsApp
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    className={primary}
                    disabled={!enabled}
                    onClick={() => void copy(option)}
                  >
                    Copiar link
                  </button>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {option === "WHATSAPP" ? (
                    <button
                      type="button"
                      className={secondary}
                      disabled={!enabled}
                      onClick={() => void copy(option)}
                    >
                      Copiar convite
                    </button>
                  ) : (
                    <a
                      className={secondary}
                      href="https://www.instagram.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={!enabled}
                      onClick={(event) => {
                        if (!enabled) event.preventDefault();
                        else recordOpen(option);
                      }}
                    >
                      Abrir Instagram
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  )}
                  <button
                    type="button"
                    className={secondary}
                    data-invitation-example={option}
                    onClick={() => {
                      setChannel(option);
                      setView("EXAMPLE");
                    }}
                  >
                    <Eye size={15} aria-hidden="true" />
                    Ver exemplo
                    <span className="sr-only">
                      {" "}
                      no {option === "WHATSAPP" ? "WhatsApp" : "Instagram"}
                    </span>
                  </button>
                </div>
              </section>
            ))}
          </div>
          {canRegisterMore && !updating && (
            <section
              aria-label="Cadastro manual de jogadores"
              className="grid grid-cols-[16px_minmax(0,1fr)] gap-x-2.5 rounded-xl border border-white/10 px-3 py-2 text-sm"
            >
              <UserRoundPlus size={16} aria-hidden="true" className="mt-0.5 text-zinc-400" />
              <div className="min-w-0">
                <h3 className="font-semibold text-zinc-200">
                  Prefere cadastrar os jogadores manualmente?
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                  Você não precisa esperar os atletas criarem suas contas. Pode cadastrá-los
                  manualmente e vinculá-los às contas deles posteriormente.
                </p>
                <Link
                  className="inline-flex min-h-11 items-center gap-1.5 text-xs text-zinc-300 underline decoration-white/20 underline-offset-4 hover:text-white"
                  href={contextualGuideHref(
                    "/admin/jogadores/listar-cadastrar",
                    GUIDE_RECRUITING_CONTEXT,
                    origin,
                    returnTo
                  )}
                  onClick={onNavigate}
                >
                  <UserRoundPlus size={14} aria-hidden="true" />
                  Cadastrar jogador
                </Link>
              </div>
            </section>
          )}
          {!publicUrl && (
            <p role="status" className="text-sm text-zinc-400">
              O endereço público ainda não está disponível.
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 border-t border-white/10 pt-2">
            <button type="button" className={secondary} onClick={onBack}>
              <ArrowLeft size={15} aria-hidden="true" />
              {reinvite ? "Voltar à Fase 2" : "Voltar aos primeiros passos"}
            </button>
            {completed && !reinvite && (
              <button type="button" className={secondary} onClick={() => setView("DONE")}>
                Ver etapa concluída
              </button>
            )}
          </div>
        </>
      )}
      {feedback && (
        <p role="status" className="text-sm text-yellow-200">
          {feedback}
        </p>
      )}
    </section>
  );
}
