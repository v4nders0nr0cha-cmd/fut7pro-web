"use client";
import type { AdminGuideData } from "@/types/admin-guide";

export type GuideTransitionKind = "CELEBRATION" | "FOOTBALL_INVITE";
export default function AdminGuidePhaseTransition({
  guide,
  kind,
  updating,
  onStart,
  onInvite,
  onClose,
}: {
  guide: AdminGuideData;
  kind: GuideTransitionKind;
  updating: boolean;
  onStart: () => void;
  onInvite: () => void;
  onClose: () => void;
}) {
  const ready = Boolean(guide.eligibility?.footballUnlocked);
  const eligibility = guide.eligibility;
  const title =
    kind === "FOOTBALL_INVITE"
      ? "A galera está chegando! Agora é hora de entrar em campo! ⚽"
      : ready
        ? "Sua pelada está pronta para entrar em campo! ⚽"
        : "Sua pelada está configurada! 🎉⚽";
  return (
    <section className="space-y-5 py-2 text-white" aria-labelledby="guide-transition-title">
      <p className="text-sm font-semibold text-yellow-300">
        {kind === "CELEBRATION" ? "Parte 1 concluída · 4 de 4 etapas" : "Parte 2 — Entre em campo"}
      </p>
      <h2 id="guide-transition-title" className="text-2xl font-bold leading-snug">
        {title}
      </h2>
      <p className="text-zinc-300">
        {ready
          ? "Seu grupo já tem jogadores suficientes para começar a próxima fase. Vamos avaliar os atletas, preparar sua primeira rodada e conhecer os recursos esportivos do Fut7Pro?"
          : "Parabéns! Você preparou a estrutura da sua pelada no Fut7Pro. Agora é hora de reunir a galera! Quando houver pelo menos dez atletas válidos cadastrados, vamos começar a próxima fase."}
      </p>
      {eligibility && (
        <p className="rounded-xl border border-yellow-400/25 bg-yellow-400/5 p-4 font-semibold text-yellow-200">
          {eligibility.eligiblePlayers} de {eligibility.minimumPlayers} atletas cadastrados
          {eligibility.missingPlayers > 0
            ? ` — faltam ${eligibility.missingPlayers} para liberar a próxima fase.`
            : " — sua próxima fase está liberada!"}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          autoFocus
          type="button"
          disabled={updating}
          onClick={ready ? onStart : onInvite}
          className="min-h-11 rounded-lg bg-yellow-400 px-4 py-3 font-bold text-black disabled:opacity-50"
        >
          {ready ? "Começar a Parte 2" : "Convidar mais jogadores"}
        </button>
        <button
          type="button"
          className="min-h-11 rounded-lg border border-white/20 px-4 py-3"
          onClick={onClose}
        >
          Agora não
        </button>
      </div>
    </section>
  );
}
