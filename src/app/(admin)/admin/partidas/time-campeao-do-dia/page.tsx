"use client";

import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { usePartidas } from "@/hooks/usePartidas";
import CardsDestaquesDiaV2 from "@/components/admin/CardsDestaquesDiaV2";
import ModalRegrasDestaques from "@/components/admin/ModalRegrasDestaques";
import BannerUpload from "@/components/admin/BannerUpload";
import ChampionDayPublishedModal from "@/components/admin/ChampionDayPublishedModal";
import { useRacha } from "@/context/RachaContext";
import { useCriticalSessionRefresh } from "@/hooks/useCriticalSessionRefresh";
import { useMe } from "@/hooks/useMe";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import { buildDestaquesDoDia } from "@/utils/destaquesDoDia";
import { buildPublicHref } from "@/utils/public-links";
import type { DestaqueDiaResponse } from "@/types/destaques";

export default function TimeCampeaoDoDiaPage() {
  const router = useRouter();
  const { tenantSlug: contextTenantSlug } = useRacha();
  const { me } = useMe({ context: "admin" });
  const currentTenantSlug = contextTenantSlug || me?.tenant?.tenantSlug || "";
  const { partidas, isLoading, isError, error, mutate } = usePartidas();
  const [destaqueDia, setDestaqueDia] = useState<DestaqueDiaResponse | null>(null);
  const [isFetchingDestaque, setIsFetchingDestaque] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showModalRegras, setShowModalRegras] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishCelebration, setShowPublishCelebration] = useState(false);
  const [publishedTenantSlug, setPublishedTenantSlug] = useState<string | null>(null);
  const { ensureFreshSession } = useCriticalSessionRefresh({ minIntervalMs: 10_000 });

  const celebrationTenantSlug = publishedTenantSlug || currentTenantSlug;
  const { racha } = useRachaPublic(celebrationTenantSlug);
  const rachaName = racha?.nome?.trim() || celebrationTenantSlug || "seu racha";
  const publicUrl = celebrationTenantSlug ? buildPublicHref("/", celebrationTenantSlug) : null;

  const { confrontos, times, dataReferencia } = useMemo(
    () => buildDestaquesDoDia(partidas as any),
    [partidas]
  );

  const hasDados = confrontos.length > 0 && times.length > 0;
  const dataKey = useMemo(() => {
    if (!dataReferencia) return null;
    const date = new Date(dataReferencia);
    if (Number.isNaN(date.getTime())) return null;
    return format(date, "yyyy-MM-dd");
  }, [dataReferencia]);

  const bannerUrl = destaqueDia?.bannerUrl ?? null;
  const destaqueAtualizadoEm = destaqueDia?.updatedAt
    ? new Date(destaqueDia.updatedAt).toLocaleString("pt-BR")
    : null;

  useEffect(() => {
    if (!dataKey) {
      setDestaqueDia(null);
      setIsFetchingDestaque(false);
      return;
    }

    let active = true;
    setIsFetchingDestaque(true);
    setActionError(null);

    fetch(`/api/admin/destaques-do-dia?date=${dataKey}`, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(body?.error || "Falha ao carregar destaques do dia.");
        }
        return body as DestaqueDiaResponse | null;
      })
      .then((body) => {
        if (!active) return;
        setDestaqueDia(body);
      })
      .catch((err) => {
        if (!active) return;
        setActionError(err instanceof Error ? err.message : "Falha ao carregar destaques.");
      })
      .finally(() => {
        if (!active) return;
        setIsFetchingDestaque(false);
      });

    return () => {
      active = false;
    };
  }, [dataKey]);

  useEffect(() => {
    setPublishError(null);
    setShowPublishCelebration(false);
    setPublishedTenantSlug(null);
  }, [dataKey]);

  const parseBody = (text: string) => {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const resolveErrorMessage = (text: string, fallback: string) => {
    const body = parseBody(text);
    if (body?.error) return body.error;
    if (body?.message) return body.message;
    return text || fallback;
  };

  const saveDestaque = async (payload: Partial<DestaqueDiaResponse>) => {
    if (!dataKey) return null;
    setIsSaving(true);
    setActionError(null);
    try {
      await ensureFreshSession();
      const response = await fetch("/api/admin/destaques-do-dia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dataKey, ...payload }),
      });
      const bodyText = await response.text().catch(() => "");
      const body = parseBody(bodyText);
      if (!response.ok) {
        throw new Error(resolveErrorMessage(bodyText, "Falha ao salvar destaques."));
      }
      setDestaqueDia(body);
      return body as DestaqueDiaResponse;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Falha ao salvar destaques.");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (!dataKey) return false;
    setIsSaving(true);
    setActionError(null);
    try {
      await ensureFreshSession();
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/destaques-do-dia/upload", {
        method: "POST",
        body: formData,
      });
      const bodyText = await response.text().catch(() => "");
      const body = parseBody(bodyText);
      if (!response.ok || !body?.url) {
        throw new Error(resolveErrorMessage(bodyText, "Falha ao enviar banner."));
      }
      const saved = await saveDestaque({ bannerUrl: body.url });
      return Boolean(saved);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Falha ao enviar banner.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleBannerRemove = async () => {
    await saveDestaque({ bannerUrl: null });
  };

  const handleZagueiroChange = async (athleteId: string) => {
    await saveDestaque({ zagueiroId: athleteId || null });
  };

  const handleAusencia = async (
    role: "atacante" | "meia" | "goleiro" | "zagueiro",
    athleteId: string,
    ausente: boolean
  ) => {
    if (!dataKey || !athleteId) return;
    setIsSaving(true);
    setActionError(null);
    try {
      await ensureFreshSession();
      const response = await fetch("/api/admin/destaques-do-dia/ausencia", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dataKey, athleteId, role, ausente }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error || "Falha ao atualizar ausência.");
      }
      if (body?.destaque) {
        setDestaqueDia(body.destaque as DestaqueDiaResponse);
      }
      await mutate();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Falha ao atualizar ausência.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!dataKey) return;
    setIsPublishing(true);
    setPublishError(null);
    setShowPublishCelebration(false);
    try {
      await ensureFreshSession();
      const response = await fetch("/api/admin/destaques-do-dia/publicar", {
        method: "POST",
      });
      const bodyText = await response.text().catch(() => "");
      if (!response.ok) {
        throw new Error(resolveErrorMessage(bodyText, "Falha ao publicar no site."));
      }
      const body = parseBody(bodyText);
      const nextTenantSlug = typeof body?.slug === "string" ? body.slug.trim() : "";
      if (nextTenantSlug) {
        setPublishedTenantSlug(nextTenantSlug);
      }
      setShowPublishCelebration(true);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Falha ao publicar no site.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <Head>
        <title>Time Campeão do Dia | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Veja o Time Campeão do Dia e os destaques gerados automaticamente a partir das partidas reais do racha."
        />
        <meta
          name="keywords"
          content="racha, fut7, time campeão do dia, destaques, painel admin, futebol entre amigos"
        />
      </Head>

      <ChampionDayPublishedModal
        open={showPublishCelebration}
        rachaName={rachaName}
        publicUrl={publicUrl}
        onClose={() => setShowPublishCelebration(false)}
        onGoDashboard={() => {
          setShowPublishCelebration(false);
          router.push("/admin/dashboard");
        }}
      />

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 min-h-screen bg-zinc-900 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-3 text-center drop-shadow">
          Time Campeão do Dia
        </h1>
        <p className="text-gray-300 mb-6 text-center text-lg max-w-2xl">
          Os dados abaixo são calculados automaticamente com base nas partidas finalizadas em
          Resultados do Dia. Zagueiro do Dia tem que ser escolhido manualmente.
        </p>
        {isFetchingDestaque && (
          <div className="text-xs text-yellow-300 mb-3">Carregando dados salvos do dia...</div>
        )}
        {destaqueAtualizadoEm && (
          <div className="text-xs text-zinc-400 mb-4">
            Última atualização: {destaqueAtualizadoEm}
          </div>
        )}
        {actionError && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 rounded-lg max-w-xl text-center mb-6">
            <p className="font-semibold mb-1">Não foi possível concluir a ação.</p>
            <p className="text-sm">{actionError}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-gray-300 py-10 text-center">
            Carregando partidas para calcular o Time Campeão do Dia...
          </div>
        )}

        {isError && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 rounded-lg max-w-xl text-center">
            <p className="font-semibold mb-1">Erro ao carregar partidas do dia.</p>
            {error && <p className="text-sm">{String(error)}</p>}
          </div>
        )}

        {!isLoading && !isError && !hasDados && (
          <div className="text-gray-300 py-10 text-center">
            Nenhuma partida finalizada encontrada para o dia selecionado. Registre partidas no
            painel para habilitar o cálculo do Time Campeão do Dia.
          </div>
        )}

        {!isLoading && !isError && hasDados && (
          <>
            <div className="w-full flex flex-col items-center mt-6 mb-3">
              <h2 className="text-2xl font-extrabold text-yellow-400 mb-1">Destaques do Dia</h2>
              <button
                className="text-sm underline text-yellow-300 hover:text-yellow-500 mb-2 transition"
                onClick={() => setShowModalRegras(true)}
                tabIndex={0}
              >
                clique aqui e saiba as regras
              </button>
            </div>

            {showModalRegras && <ModalRegrasDestaques onClose={() => setShowModalRegras(false)} />}

            <div className="w-full flex flex-col items-center gap-12 mt-4 max-w-5xl">
              <CardsDestaquesDiaV2
                confrontos={confrontos}
                times={times}
                zagueiroId={destaqueDia?.zagueiroId ?? null}
                faltou={destaqueDia?.faltou ?? null}
                onSelectZagueiro={handleZagueiroChange}
                onToggleAusencia={handleAusencia}
              />

              <BannerUpload
                bannerUrl={bannerUrl}
                isSaving={isSaving}
                onUpload={handleBannerUpload}
                onRemove={handleBannerRemove}
              />

              <div className="w-full max-w-2xl flex flex-col items-center gap-3 bg-zinc-900 border border-yellow-400/40 rounded-xl p-6">
                <div className="text-yellow-300 font-semibold text-lg text-center">
                  Salvar e Publicar no Site
                </div>
                <p className="text-sm text-zinc-300 text-center max-w-md">
                  Aplica o Time Campeão do Dia, destaques individuais e banner no site público do
                  seu racha.
                </p>
                <button
                  type="button"
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg shadow disabled:opacity-60"
                  onClick={handlePublish}
                  disabled={isSaving || isPublishing}
                >
                  {isPublishing ? "Publicando no site..." : "Salvar e Publicar no Site"}
                </button>
                {publishError && (
                  <div className="text-sm text-red-200 text-center">{publishError}</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
