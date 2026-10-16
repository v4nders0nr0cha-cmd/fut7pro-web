"use client";

import Link from "next/link";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import { nextGuideDestination } from "@/lib/admin-guide-navigation";

export default function AdminGuideCard() {
  const { guide, loading, error, actionError, updating, retry, update } = useAdminGuide();

  return (
    <section
      aria-label="Guia Fut7Pro"
      className="rounded-2xl border border-yellow-400/20 bg-[#23272F] p-5 text-white shadow-lg sm:p-6"
      data-testid="admin-guide-card"
    >
      <div className="flex items-start gap-3">
        <BookOpen className="mt-0.5 shrink-0 text-yellow-300" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold">Guia Fut7Pro</h2>
          {loading ? (
            <p className="mt-2 text-sm text-zinc-300" role="status">
              Carregando seu progresso...
            </p>
          ) : error || !guide ? (
            <div className="mt-2 text-sm text-zinc-300">
              <p>Não foi possível carregar o Guia Fut7Pro agora.</p>
              <button
                type="button"
                onClick={() => void retry()}
                className="mt-3 rounded-lg border border-yellow-400/50 px-3 py-2 font-semibold text-yellow-200 hover:bg-yellow-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              {!guide.pedagogicalState.welcomeSeenAt && (
                <div className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
                  <p className="font-semibold text-yellow-200">Bem-vindo ao Guia Fut7Pro!</p>
                  <p className="mt-1 text-sm text-zinc-200">
                    {guide.activationProgress.complete
                      ? "Sua pelada já tem uma jornada inicial concluída. Conheça os recursos disponíveis para sua função."
                      : "Acompanhe a preparação da pelada, os primeiros jogos e os recursos disponíveis para sua função."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => void update({ action: "WELCOME_SEEN" })}
                      className="rounded-lg bg-yellow-400 px-3 py-2 text-sm font-bold text-black hover:bg-yellow-300 disabled:opacity-60"
                    >
                      Começar
                    </button>
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => void update({ action: "WELCOME_SEEN" })}
                      className="rounded-lg border border-white/30 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-60"
                    >
                      Agora não
                    </button>
                  </div>
                </div>
              )}
              <p className="mt-3 text-sm text-zinc-300">
                {guide.activationProgress.complete
                  ? "A ativação inicial da pelada está concluída. O Guia continua disponível para consulta."
                  : "Acompanhe os primeiros passos da pelada sem interromper sua rotina."}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  <strong className="text-yellow-200">{guide.activationProgress.completed}</strong>{" "}
                  de {guide.activationProgress.total} etapas concluídas
                </span>
                <span>{guide.activationProgress.percentage}%</span>
              </div>
              <div
                role="progressbar"
                aria-label="Progresso da ativação inicial"
                aria-valuenow={guide.activationProgress.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-700"
              >
                <div
                  className="h-full rounded-full bg-yellow-400"
                  style={{
                    width: `${Math.max(0, Math.min(100, guide.activationProgress.percentage))}%`,
                  }}
                />
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  {guide.nextAction ? (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-wide text-yellow-300">
                        Próximo passo
                      </p>
                      <p className="mt-1 font-medium">{guide.nextAction.title}</p>
                    </>
                  ) : (
                    <p className="flex items-center gap-2 text-sm text-zinc-200">
                      <CheckCircle2 size={18} className="text-yellow-300" aria-hidden="true" />
                      Nenhuma ação disponível para sua função no momento.
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {nextGuideDestination(guide) && (
                    <Link
                      href={nextGuideDestination(guide)!}
                      target={guide.nextAction?.taskId === "PUBLIC_SITE" ? "_blank" : undefined}
                      rel={
                        guide.nextAction?.taskId === "PUBLIC_SITE"
                          ? "noopener noreferrer"
                          : undefined
                      }
                      onClick={
                        guide.nextAction?.taskId === "PUBLIC_SITE"
                          ? () => void update({ action: "PUBLIC_SITE_OPENED" })
                          : undefined
                      }
                      className="rounded-lg bg-yellow-400 px-4 py-2 text-center text-sm font-bold text-black hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                    >
                      Continuar configuração
                    </Link>
                  )}
                  <Link
                    href="/admin/guia-fut7pro"
                    className="rounded-lg border border-white/30 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
                  >
                    Ver meu Guia
                  </Link>
                </div>
              </div>
              {actionError && (
                <p role="alert" className="mt-3 text-sm text-red-300">
                  {actionError.status === 409
                    ? "O Guia mudou em outra sessão. Confira o estado atualizado e tente novamente."
                    : "Não foi possível salvar sua escolha. Tente novamente."}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
