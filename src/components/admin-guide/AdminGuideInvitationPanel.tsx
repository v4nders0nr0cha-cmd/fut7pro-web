"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { AdminGuideData, AdminGuidePatch } from "@/types/admin-guide";
import { isOnboardingActionUnlocked } from "@/lib/admin-onboarding";

const primary =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black hover:bg-yellow-300 disabled:opacity-50";
const secondary =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10 disabled:opacity-50";
const channels = [
  { id: "WHATSAPP", label: "WhatsApp" },
  { id: "INSTAGRAM", label: "Instagram" },
  { id: "MANUAL", label: "Cadastro manual" },
] as const;
type Channel = (typeof channels)[number]["id"];

type Props = {
  guide: AdminGuideData;
  updating: boolean;
  update: (action: AdminGuidePatch) => Promise<boolean>;
  onBack: () => void;
};

export default function AdminGuideInvitationPanel({ guide, updating, update, onBack }: Props) {
  const [channel, setChannel] = useState<Channel>("WHATSAPP");
  const [feedback, setFeedback] = useState("");
  const [copying, setCopying] = useState(false);
  const [expandedImage, setExpandedImage] = useState(false);
  const publicUrl = guide.tenant.publicUrl;
  const unlocked = isOnboardingActionUnlocked(
    guide.tasks,
    "ACTIVE_PLAYERS",
    guide.actionAvailability
  );
  const canCopy = Boolean(publicUrl && unlocked && !updating && !copying);
  const canRegister =
    unlocked && Boolean(guide.tasks.find((task) => task.id === "ACTIVE_PLAYERS")?.canAct);
  const invite = `Fala, galera! ⚽🔥\n\nNosso site da pelada já está no ar!\n\nEntrem pelo link e criem suas contas para acompanhar partidas, estatísticas e conquistas.\n\n👉 ${publicUrl}\n\nTamo junto! 👊⚽`;
  const image = channel === "INSTAGRAM" ? "instagram" : "whatsapp";

  const copy = async () => {
    if (!canCopy || !publicUrl) return;
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

  if (expandedImage)
    return (
      <section aria-label="Imagem educativa ampliada" className="space-y-4 text-white">
        <button
          autoFocus
          type="button"
          className={secondary}
          onClick={() => setExpandedImage(false)}
        >
          <ArrowLeft size={16} aria-hidden="true" className="mr-2" />
          Voltar às opções de convite
        </button>
        <Image
          src={`/images/onboarding/${image}.webp`}
          alt={`Exemplo ilustrativo ampliado do ${channel === "INSTAGRAM" ? "Instagram" : "WhatsApp"}`}
          width={941}
          height={1672}
          className="h-auto w-full max-w-full rounded-xl object-contain"
        />
        <p className="text-xs text-zinc-400">
          Exemplo ilustrativo. Os nomes e links da imagem são referências.
        </p>
      </section>
    );

  return (
    <section aria-labelledby="invitation-panel-title" className="min-w-0 space-y-5 text-white">
      <header className="space-y-3">
        <button
          autoFocus
          type="button"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-yellow-200 underline"
          onClick={onBack}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar aos primeiros passos
        </button>
        <h2 id="invitation-panel-title" className="text-2xl font-bold">
          Traga seus primeiros jogadores
        </h2>
        <p className="text-sm text-zinc-300">Escolha como chamar a galera para o site do grupo.</p>
      </header>
      <div role="group" aria-label="Como trazer jogadores" className="grid grid-cols-3 gap-1.5">
        {channels.map((option) => (
          <button
            type="button"
            key={option.id}
            aria-pressed={channel === option.id}
            aria-controls="invitation-channel-content"
            className={`${channel === option.id ? primary : secondary} !px-2 text-xs sm:text-sm`}
            onClick={() => {
              setChannel(option.id);
              setFeedback("");
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
      <section
        id="invitation-channel-content"
        aria-label={channels.find((option) => option.id === channel)?.label}
        className="space-y-4 rounded-xl border border-white/15 bg-black/20 p-4 sm:p-5"
      >
        {channel === "MANUAL" ? (
          <>
            <h3 className="text-lg font-semibold">Uma alternativa para quem ainda não tem conta</h3>
            <p className="text-sm text-zinc-300">
              Você pode cadastrar o perfil de um jogador e vinculá-lo à conta dele depois,
              preservando o histórico.
            </p>
            <p className="text-sm text-zinc-300">
              Recomendamos que cada atleta crie a própria conta. Use o cadastro manual quando
              necessário.
            </p>
            {canRegister ? (
              <Link
                href="/admin/jogadores/listar-cadastrar?guia=ACTIVE_PLAYERS"
                className={primary}
              >
                Cadastrar jogador manualmente
              </Link>
            ) : (
              <>
                <button type="button" disabled className={primary}>
                  Cadastrar jogador manualmente
                </button>
                <p className="text-sm text-zinc-300">
                  Peça ao Presidente ou Vice-Presidente para cadastrar o jogador.
                </p>
              </>
            )}
            <details className="text-sm text-zinc-400">
              <summary className="min-h-11 cursor-pointer py-2">
                Facilitar a entrada dos jogadores
              </summary>
              <p>
                Na página de jogadores, administradores autorizados podem escolher a aprovação
                automática por 24 horas.
              </p>
            </details>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold">
              {channel === "WHATSAPP"
                ? "Convide a galera pelo WhatsApp"
                : "Coloque o site no perfil do Instagram"}
            </h3>
            <p className="text-sm text-zinc-300">
              {channel === "WHATSAPP"
                ? "Envie o convite no grupo da pelada. Depois, pressione a mensagem, escolha Fixar e selecione a duração disponível."
                : "Copie o endereço e abra o perfil do Instagram do grupo. Em Editar perfil → Links/site, cole o endereço e salve. Os nomes das opções podem variar conforme a versão."}
            </p>
            {channel === "WHATSAPP" && publicUrl && (
              <p
                className="break-all rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
                aria-label="Link público do grupo"
              >
                {publicUrl}
              </p>
            )}
            {!publicUrl && (
              <p role="status" className="text-sm text-zinc-300">
                O endereço público ainda não está disponível.
              </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {channel === "WHATSAPP" &&
                (publicUrl && unlocked ? (
                  <a
                    className={primary}
                    href={`https://wa.me/?text=${encodeURIComponent(invite)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      void update({
                        action: "RESOURCE_VIEWED",
                        resourceId: "whatsapp-share-attempt",
                      })
                    }
                  >
                    Compartilhar no WhatsApp
                  </a>
                ) : (
                  <button disabled className={primary}>
                    Compartilhar no WhatsApp
                  </button>
                ))}
              <button
                type="button"
                className={channel === "WHATSAPP" ? secondary : primary}
                disabled={!canCopy}
                onClick={() => void copy()}
              >
                {copying
                  ? "Copiando..."
                  : channel === "WHATSAPP"
                    ? "Copiar convite"
                    : "Copiar link"}
              </button>
              {channel === "INSTAGRAM" && (
                <a
                  className={secondary}
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    void update({ action: "RESOURCE_VIEWED", resourceId: "instagram-opened" })
                  }
                >
                  Abrir Instagram
                </a>
              )}
            </div>
            {feedback && (
              <p role="status" className="text-sm text-yellow-200">
                {feedback}
              </p>
            )}
            <figure className="space-y-2 border-t border-white/10 pt-4">
              <button
                type="button"
                className="block w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
                aria-label={`Ampliar imagem do ${channel === "WHATSAPP" ? "WhatsApp" : "Instagram"}`}
                onClick={() => setExpandedImage(true)}
              >
                <Image
                  src={`/images/onboarding/${image}.webp`}
                  alt={
                    channel === "WHATSAPP"
                      ? "Exemplo de convite fixado no grupo do WhatsApp, com destaque amarelo"
                      : "Exemplo do link do grupo no perfil do Instagram, com destaque amarelo"
                  }
                  width={941}
                  height={1672}
                  sizes="(max-width: 767px) calc(100vw - 4rem), 680px"
                  className="h-[220px] w-full rounded-xl object-cover object-top sm:mx-auto sm:h-[360px] sm:w-auto sm:max-w-full sm:object-contain"
                />
              </button>
              <figcaption className="text-xs text-zinc-400">
                Exemplo ilustrativo · Clique na imagem para ampliar.
              </figcaption>
            </figure>
          </>
        )}
      </section>
    </section>
  );
}
