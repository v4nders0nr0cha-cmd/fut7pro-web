"use client";
import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Circle, Trophy } from "lucide-react";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import { ONBOARDING_IDS, STEP_HELP, isOnboardingActionUnlocked } from "@/lib/admin-onboarding";
import AdminGuideInvitationPanel from "./AdminGuideInvitationPanel";
import { guideDestination } from "@/lib/admin-guide-navigation";

const primary =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black hover:bg-yellow-300 disabled:opacity-50";
const secondary =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10 disabled:opacity-50";
export default function AdminOnboarding({
  onClose,
}: {
  onClose?: (permanentlyDismissed?: boolean) => void;
}) {
  const { guide, updating, update, actionError } = useAdminGuide();
  const { data: session } = useSession();
  const returning = Boolean(
    guide?.pedagogicalState.welcomePresentedAt || guide?.pedagogicalState.welcomeSeenAt
  );
  const [selected, setSelected] = useState<string>();
  const [invitationOpen, setInvitationOpen] = useState(false);
  const invitationButtonRef = useRef<HTMLButtonElement>(null);
  if (!guide) return <p role="status">Carregando seus primeiros passos...</p>;
  const tasks = ONBOARDING_IDS.flatMap((id) => guide.tasks.filter((task) => task.id === id));
  const active =
    tasks.find((item) => item.id === selected) ??
    tasks
      .slice(
        Math.max(
          0,
          tasks.findIndex((item) => item.id === guide.pedagogicalState.currentStep)
        )
      )
      .find((item) => !item.completed) ??
    tasks.find((item) => !item.completed) ??
    tasks[0];
  if (!active) return null;
  const started = Boolean(guide.pedagogicalState.welcomeSeenAt);
  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || "organizador";
  const select = async (id: string) => {
    setSelected(id);
    await update({ action: "STEP_SELECTED", tipId: id });
  };
  const destination = guideDestination(guide, active);
  const next = tasks.slice(tasks.indexOf(active) + 1).find((item) => !item.completed);
  const actionUnlocked = isOnboardingActionUnlocked(guide.tasks, active.id);
  if (invitationOpen)
    return (
      <AdminGuideInvitationPanel
        guide={guide}
        updating={updating}
        update={update}
        onBack={() => {
          setInvitationOpen(false);
          window.setTimeout(() => invitationButtonRef.current?.focus(), 0);
        }}
      />
    );
  return (
    <div className="grid min-w-0 gap-6 text-white md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
      <aside className="min-w-0 text-center md:border-r md:border-white/15 md:pr-6">
        <div className="relative mx-auto flex h-28 max-w-64 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200/30 via-yellow-600/15 to-zinc-900 md:h-40">
          {guide.tenant.logoUrl ? (
            <Image
              unoptimized
              src={guide.tenant.logoUrl}
              alt={`Escudo de ${guide.tenant.name}`}
              width={120}
              height={120}
              className="h-24 w-24 object-contain"
            />
          ) : (
            <Trophy className="h-16 w-16 text-yellow-300" aria-hidden="true" />
          )}
          {session?.user?.image && (
            <Image
              unoptimized
              src={session.user.image}
              alt="Sua foto de perfil"
              width={68}
              height={68}
              className="absolute -bottom-6 h-16 w-16 rounded-full border-2 border-yellow-400 object-cover"
            />
          )}
        </div>
        <h2 className="mt-8 text-xl font-bold">
          {returning
            ? `Bem-vindo de volta, ${firstName}!`
            : `Olá, ${firstName}! Bem-vindo ao Fut7Pro!`}
        </h2>
        <p className="mt-3 text-sm text-zinc-300">
          Seu grupo <strong className="text-yellow-300">{guide.tenant.name}</strong> já está ativo!
          Vamos dar os primeiros passos juntos? O guia interativo ajuda você a configurar e utilizar
          a plataforma.
        </p>
        {!started && (
          <button
            className={`${primary} mt-4`}
            disabled={updating}
            onClick={async () => {
              if (await update({ action: "WELCOME_SEEN" }))
                setSelected(tasks.find((item) => !item.completed)?.id);
            }}
          >
            Começar guia
          </button>
        )}
        {onClose && (
          <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs text-zinc-300">
            <button onClick={() => onClose()}>Agora não</button>
            <button
              disabled={updating}
              onClick={async () => {
                if (await update({ action: "DASHBOARD_INVITE_DISMISSED" })) onClose(true);
              }}
            >
              Não mostrar novamente
            </button>
          </div>
        )}
      </aside>
      <section className="min-w-0 space-y-4" aria-label="Primeiros passos do grupo">
        <div>
          <h2 className="text-xl font-bold">Primeiros passos do grupo</h2>
          <p className="mt-1 text-sm text-zinc-300">
            {guide.activationProgress.percentage}% concluído · {guide.activationProgress.completed}{" "}
            de {guide.activationProgress.total} etapas
          </p>
          <div
            role="progressbar"
            aria-label="Progresso do grupo"
            aria-valuenow={guide.activationProgress.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-200"
              style={{ width: `${guide.activationProgress.percentage}%` }}
            />
          </div>
        </div>
        <ol className="space-y-1">
          {tasks.map((item, index) => (
            <li key={item.id}>
              <button
                disabled={updating}
                aria-current={active.id === item.id ? "step" : undefined}
                onClick={() => void select(item.id)}
                className={`flex min-h-10 w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm ${active.id === item.id ? "bg-white/10 text-yellow-200" : "hover:bg-white/5"}`}
              >
                <span aria-hidden="true">{index + 1}</span>
                {item.completed ? (
                  <CheckCircle2
                    size={19}
                    className="shrink-0 text-emerald-400"
                    aria-label="Concluída"
                  />
                ) : (
                  <Circle size={19} className="shrink-0 text-zinc-500" aria-hidden="true" />
                )}
                <span className={item.completed ? "text-zinc-400" : ""}>{item.title}</span>
              </button>
            </li>
          ))}
        </ol>
        {guide.activationProgress.complete && (
          <p role="status" className="text-emerald-300">
            Primeiros passos concluídos! Continue organizando os próximos jogos.
          </p>
        )}
        <section
          className="space-y-3 rounded-xl border border-white/15 bg-black/20 p-4"
          aria-label={active.title}
        >
          <h3 className="text-lg font-bold">{active.title}</h3>
          <p className="text-sm text-zinc-300">{STEP_HELP[active.id]}</p>
          {active.id === "ACTIVE_PLAYERS" ? (
            <button
              ref={invitationButtonRef}
              type="button"
              className={primary}
              disabled={updating || !actionUnlocked}
              aria-describedby={!actionUnlocked ? "onboarding-action-locked" : undefined}
              onClick={() => {
                setSelected("ACTIVE_PLAYERS");
                setInvitationOpen(true);
              }}
            >
              Convidar jogadores agora
            </button>
          ) : actionUnlocked && destination ? (
            <Link
              className={primary}
              href={
                active.id === "ACCOUNT_READY" ? destination : `${destination}?guia=${active.id}`
              }
            >
              {active.id === "ACCOUNT_READY"
                ? "Ver site do grupo"
                : active.completed
                  ? "Consultar funcionalidade"
                  : "Continuar"}
            </Link>
          ) : (
            <button
              type="button"
              className={primary}
              disabled
              aria-describedby={!actionUnlocked ? "onboarding-action-locked" : undefined}
            >
              {active.id === "ACCOUNT_READY"
                ? "Ver site do grupo"
                : active.completed
                  ? "Consultar funcionalidade"
                  : "Continuar"}
            </button>
          )}
          {!actionUnlocked && (
            <p id="onboarding-action-locked" className="text-sm text-zinc-300">
              Conclua as etapas anteriores para liberar esta ação.
            </p>
          )}
          {!active.completed && !active.canAct && active.id !== "ACTIVE_PLAYERS" && (
            <p className="text-sm text-zinc-300">
              Esta ação depende de outro administrador autorizado do grupo.
            </p>
          )}
          {next && (
            <button
              className="ml-2 min-h-11 text-sm text-zinc-300 underline"
              disabled={updating}
              onClick={async () => {
                if (active.completed) await select(next.id);
                else if (await update({ action: "STEP_SKIPPED", tipId: active.id }))
                  setSelected(next.id);
              }}
            >
              {active.completed ? "Próxima etapa" : "Pular etapa"}
            </button>
          )}
        </section>
        {actionError && (
          <p role="alert" className="text-sm text-red-300">
            Não foi possível salvar. Atualize o guia e tente novamente.
          </p>
        )}
      </section>
    </div>
  );
}
