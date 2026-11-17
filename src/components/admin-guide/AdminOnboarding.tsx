"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Circle, Trophy } from "lucide-react";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import { ONBOARDING_IDS, STEP_HELP } from "@/lib/admin-onboarding";
import { guideDestination } from "@/lib/admin-guide-navigation";

const primary =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black hover:bg-yellow-300 disabled:opacity-50";
const secondary =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10 disabled:opacity-50";
export default function AdminOnboarding({ onClose }: { onClose?: () => void }) {
  const { guide, updating, update, actionError } = useAdminGuide();
  const { data: session } = useSession();
  const [returning] = useState(
    Boolean(guide?.pedagogicalState.welcomePresentedAt || guide?.pedagogicalState.welcomeSeenAt)
  );
  const [selected, setSelected] = useState<string>();
  const [channel, setChannel] = useState<"WHATSAPP" | "INSTAGRAM" | "MANUAL">("WHATSAPP");
  const [feedback, setFeedback] = useState("");
  const [copying, setCopying] = useState(false);
  const [expandedImage, setExpandedImage] = useState(false);
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
  const publicUrl = guide.tenant.publicUrl;
  const invite = `Fala, galera! ⚽🔥\n\nNosso site da pelada já está no ar!\n\nEntrem pelo link e criem suas contas para acompanhar partidas, estatísticas e conquistas.\n\n👉 ${publicUrl}\n\nTamo junto! 👊⚽`;
  const select = async (id: string) => {
    setSelected(id);
    setFeedback("");
    await update({ action: "STEP_SELECTED", tipId: id });
  };
  const copy = async () => {
    if (!publicUrl || copying || updating) return;
    setSelected("ACTIVE_PLAYERS");
    setCopying(true);
    setFeedback("");
    try {
      await navigator.clipboard.writeText(channel === "WHATSAPP" ? invite : publicUrl);
    } catch {
      setFeedback("A cópia falhou. Permita o acesso à área de transferência e tente novamente.");
      setCopying(false);
      return;
    }
    const saved = await update({
      action: "INVITATION_COPIED",
      channel: channel === "INSTAGRAM" ? "INSTAGRAM" : "WHATSAPP",
    });
    setFeedback(
      saved
        ? "Convite copiado! A divulgação pode começar."
        : "Copiado. Não foi possível salvar o progresso. Tente copiar novamente."
    );
    setCopying(false);
  };
  const destination = guideDestination(guide, active);
  const next = tasks.slice(tasks.indexOf(active) + 1).find((item) => !item.completed);
  const image = channel === "INSTAGRAM" ? "instagram" : "whatsapp";
  if (expandedImage)
    return (
      <section className="space-y-4 text-white">
        <button autoFocus className={secondary} onClick={() => setExpandedImage(false)}>
          Voltar à orientação
        </button>
        <p className="text-sm text-zinc-300">
          Exemplo ilustrativo. Nomes e links da imagem servem apenas como referência.
        </p>
        <Image
          src={`/images/onboarding/${image}.webp`}
          alt="Imagem educativa ampliada com destaque na localização do convite ou link"
          width={1400}
          height={1800}
          className="h-auto w-full rounded-xl object-contain"
        />
      </section>
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
            <button onClick={onClose}>Agora não</button>
            <button
              disabled={updating}
              onClick={async () => {
                if (await update({ action: "DASHBOARD_INVITE_DISMISSED" })) onClose();
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
            <>
              <div role="group" aria-label="Como trazer jogadores" className="flex flex-wrap gap-2">
                {(["WHATSAPP", "INSTAGRAM", "MANUAL"] as const).map((value) => (
                  <button
                    key={value}
                    aria-pressed={channel === value}
                    className={channel === value ? primary : secondary}
                    onClick={() => {
                      setChannel(value);
                      setFeedback("");
                    }}
                  >
                    {value === "WHATSAPP"
                      ? "WhatsApp"
                      : value === "INSTAGRAM"
                        ? "Instagram"
                        : "Cadastro manual"}
                  </button>
                ))}
              </div>
              {channel === "MANUAL" ? (
                <>
                  <p className="text-sm text-zinc-300">
                    Você pode cadastrar um perfil de jogador que ainda não possui conta e vinculá-lo
                    depois pelo fluxo de jogadores, preservando seu histórico. Recomendamos que cada
                    jogador crie a própria conta. Use o cadastro manual quando necessário.
                  </p>
                  {active.canAct ? (
                    <Link
                      className={primary}
                      href="/admin/jogadores/listar-cadastrar?guia=ACTIVE_PLAYERS"
                    >
                      Cadastrar jogador manualmente
                    </Link>
                  ) : (
                    <p>Peça ao Presidente ou Vice-Presidente para cadastrar o jogador.</p>
                  )}
                  <p className="text-xs text-zinc-400">
                    Na página de jogadores, administradores autorizados também podem ativar a
                    aprovação automática por 24 horas.
                  </p>
                </>
              ) : (
                <>
                  <h4 className="font-semibold">
                    {channel === "WHATSAPP"
                      ? "Convide a galera pelo WhatsApp"
                      : "Coloque o site no Instagram da pelada"}
                  </h4>
                  <p className="text-sm text-zinc-300">
                    {channel === "WHATSAPP"
                      ? "Compartilhe o convite no grupo. Depois de enviar, pressione a mensagem, escolha Fixar e selecione a duração disponível."
                      : "Copie o link, abra o Instagram do grupo e entre em Editar perfil. Em Links, adicione o endereço e salve. Os nomes das opções podem variar conforme a versão."}
                  </p>
                  <p className="break-all rounded-lg bg-white/5 p-2 text-xs">
                    {publicUrl || "O endereço público ainda não está disponível."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={primary}
                      disabled={!publicUrl || updating || copying}
                      onClick={() => void copy()}
                    >
                      {copying
                        ? "Copiando..."
                        : channel === "WHATSAPP"
                          ? "Copiar convite"
                          : "Copiar link"}
                    </button>
                    <a
                      className={secondary}
                      href={
                        channel === "WHATSAPP"
                          ? `https://wa.me/?text=${encodeURIComponent(invite)}`
                          : "https://www.instagram.com/"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => {
                        if (!publicUrl) event.preventDefault();
                        else
                          void update({
                            action: "RESOURCE_VIEWED",
                            resourceId:
                              channel === "WHATSAPP"
                                ? "whatsapp-share-attempt"
                                : "instagram-opened",
                          });
                      }}
                    >
                      {channel === "WHATSAPP" ? "Compartilhar no WhatsApp" : "Abrir Instagram"}
                    </a>
                  </div>
                  <button className="block w-full text-left" onClick={() => setExpandedImage(true)}>
                    <Image
                      src={`/images/onboarding/${image}.webp`}
                      alt={
                        channel === "WHATSAPP"
                          ? "Exemplo ilustrativo de convite fixado no WhatsApp, com destaque amarelo"
                          : "Exemplo ilustrativo do link no perfil do Instagram, com destaque amarelo"
                      }
                      width={800}
                      height={600}
                      className="max-h-48 w-full rounded-lg object-contain"
                    />
                    <span className="text-xs text-zinc-400">
                      Exemplo ilustrativo · Clique para ampliar
                    </span>
                  </button>
                </>
              )}
              {feedback && (
                <p role="status" className="text-sm text-yellow-200">
                  {feedback}
                </p>
              )}
            </>
          ) : (
            destination && (
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
            )
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
