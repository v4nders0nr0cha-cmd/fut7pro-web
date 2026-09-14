"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useGlobalProfile } from "@/hooks/useGlobalProfile";
import { useMe } from "@/hooks/useMe";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useTema } from "@/hooks/useTema";
import { resolveActiveTenantSlug } from "@/utils/active-tenant";

type StatusKind = "PENDENTE" | "APROVADO" | "REJEITADO" | "DESCONHECIDO";

function normalizeMembershipStatus(status?: string | null): StatusKind {
  const value = String(status || "")
    .trim()
    .toUpperCase();
  if (value === "PENDENTE" || value === "PENDING") return "PENDENTE";
  if (value === "APROVADO" || value === "APPROVED" || value === "ACTIVE") return "APROVADO";
  if (value === "REJEITADO" || value === "REJECTED") return "REJEITADO";
  return "DESCONHECIDO";
}

export function resolveRequestStatus(
  meStatus?: string | null,
  profileStatus?: string | null
): StatusKind {
  const normalizedMeStatus = normalizeMembershipStatus(meStatus);
  const normalizedProfileStatus = normalizeMembershipStatus(profileStatus);

  if (normalizedProfileStatus === "APROVADO" || normalizedProfileStatus === "REJEITADO") {
    return normalizedProfileStatus;
  }
  if (normalizedMeStatus === "APROVADO" || normalizedMeStatus === "REJEITADO") {
    return normalizedMeStatus;
  }
  if (normalizedMeStatus === "PENDENTE" || normalizedProfileStatus === "PENDENTE") {
    return "PENDENTE";
  }
  return "DESCONHECIDO";
}

function getMetadataString(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return "";
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

function extractRejectionReason(body?: string | null) {
  const match = String(body || "").match(/Motivo informado:\s*(.+?)(?:\.?$)/i);
  return match?.[1]?.trim() || "";
}

export default function AguardandoAprovacaoClient() {
  const pathname = usePathname() ?? "";
  const { nome } = useTema();
  const { publicHref, publicSlug } = usePublicLinks();
  const tenantSlug = resolveActiveTenantSlug(pathname) || publicSlug || "";
  const {
    profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    mutate: mutateProfile,
  } = useGlobalProfile();
  const {
    me,
    isLoading: isMeLoading,
    isError: isMeError,
    mutate: mutateMe,
  } = useMe({
    enabled: Boolean(tenantSlug),
    tenantSlug,
    context: "athlete",
  });
  const membership = useMemo(
    () => profile?.memberships?.find((item) => item.tenantSlug === tenantSlug) || null,
    [profile?.memberships, tenantSlug]
  );
  const status = resolveRequestStatus(me?.membership?.status, membership?.status);
  const isPending = status === "PENDENTE";
  const isCheckingStatus = status === "DESCONHECIDO" && (isProfileLoading || isMeLoading);
  const hasStatusLookupFailed = status === "DESCONHECIDO" && !isCheckingStatus;
  const tenantName = membership?.tenantName || nome?.trim() || "";
  const rejectionNotice = useMemo(() => {
    if (status !== "REJEITADO") return null;
    return (
      profile?.accountNotifications?.find((notification) => {
        const metadataTenantSlug =
          getMetadataString(notification.metadata, "tenantSlug") ||
          getMetadataString(notification.metadata, "slug");
        const metadataStatus =
          getMetadataString(notification.metadata, "status") ||
          getMetadataString(notification.metadata, "decision");
        const title = notification.title.toLowerCase();
        return (
          metadataTenantSlug === tenantSlug &&
          (normalizeMembershipStatus(metadataStatus) === "REJEITADO" ||
            title.includes("não aprovada"))
        );
      }) || null
    );
  }, [profile?.accountNotifications, status, tenantSlug]);
  const rejectionReason =
    getMetadataString(rejectionNotice?.metadata, "rejectionMessage") ||
    getMetadataString(rejectionNotice?.metadata, "reason") ||
    extractRejectionReason(rejectionNotice?.body);

  useEffect(() => {
    if (!isPending) return;
    const interval = window.setInterval(() => {
      void mutateMe();
      void mutateProfile();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [isPending, mutateMe, mutateProfile]);

  const handleRetryStatus = () => {
    void mutateMe();
    void mutateProfile();
  };

  const content = (() => {
    if (status === "APROVADO") {
      return {
        eyebrow: "Entrada aprovada",
        title: "Entrada aprovada!",
        tone: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
        text: "Seu acesso como atleta foi aprovado. Você agora faz parte deste grupo e já pode acessar seu perfil e os recursos disponíveis para os atletas.",
        complement: "",
        primaryLabel: "Acessar o grupo",
        primaryHref: publicHref("/"),
        secondaryLabel: "Minha conta Fut7Pro",
        secondaryHref: "/perfil",
        retry: false,
      };
    }

    if (status === "REJEITADO") {
      return {
        eyebrow: "Solicitação não aprovada",
        title: "Solicitação não aprovada",
        tone: "border-red-400/30 bg-red-400/10 text-red-100",
        text: "Sua solicitação para participar deste grupo não foi aprovada. Sua Conta Fut7Pro continua ativa normalmente.",
        complement: rejectionReason ? `Motivo informado: ${rejectionReason}` : "",
        primaryLabel: "Minha conta Fut7Pro",
        primaryHref: "/perfil",
        secondaryLabel: "Ir para o site do grupo",
        secondaryHref: publicHref("/"),
        retry: false,
      };
    }

    if (isCheckingStatus) {
      return {
        eyebrow: "Verificando status",
        title: "Verificando status da solicitação...",
        tone: "border-white/20 bg-white/5 text-gray-100",
        text: "Estamos consultando o status atual da sua solicitação neste grupo.",
        complement: "",
        primaryLabel: "Minha conta Fut7Pro",
        primaryHref: "/perfil",
        secondaryLabel: "Ir para o site do grupo",
        secondaryHref: publicHref("/"),
        retry: false,
      };
    }

    if (hasStatusLookupFailed) {
      return {
        eyebrow: "Status indisponível",
        title: "Não foi possível verificar o status da sua solicitação.",
        tone: "border-amber-300/30 bg-amber-300/10 text-amber-100",
        text: "Tente novamente em alguns instantes ou continue navegando pelo site do grupo.",
        complement: "",
        primaryLabel: "Tentar novamente",
        primaryHref: "",
        secondaryLabel: "Ir para o site do grupo",
        secondaryHref: publicHref("/"),
        retry: true,
      };
    }

    return {
      eyebrow: "Solicitação em análise",
      title: "Solicitação em análise",
      tone: "border-yellow-400/30 bg-yellow-400/10 text-yellow-100",
      text: "Sua solicitação para participar deste grupo foi enviada aos administradores e ainda está em análise. Você pode continuar navegando pelo site enquanto aguarda a decisão.",
      complement: "Assim que houver uma decisão, o status será atualizado aqui.",
      primaryLabel: "Minha conta Fut7Pro",
      primaryHref: "/perfil",
      secondaryLabel: "Ir para o site do grupo",
      secondaryHref: publicHref("/"),
      retry: false,
    };
  })();

  return (
    <section className="w-full px-4">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-white/10 bg-[#0f1118] p-6 text-center shadow-2xl">
        <div className={`mb-4 rounded-lg border px-3 py-2 ${content.tone}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">{content.eyebrow}</p>
          {tenantName ? <p className="mt-1 text-sm text-gray-100">{tenantName}</p> : null}
        </div>

        <h1 className="text-xl font-bold text-white">{content.title}</h1>
        <p className="mt-2 text-sm text-gray-300">{content.text}</p>
        {content.complement ? (
          <p className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200">
            {content.complement}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {content.retry ? (
            <button
              type="button"
              onClick={handleRetryStatus}
              className="rounded-lg bg-yellow-400 px-4 py-2 text-xs font-semibold text-black hover:bg-yellow-300"
            >
              {content.primaryLabel}
            </button>
          ) : (
            <a
              href={content.primaryHref}
              className="rounded-lg bg-yellow-400 px-4 py-2 text-xs font-semibold text-black hover:bg-yellow-300"
            >
              {content.primaryLabel}
            </a>
          )}
          <a
            href={content.secondaryHref}
            className="rounded-lg border border-yellow-400/60 px-4 py-2 text-xs font-semibold text-yellow-300 hover:text-yellow-200"
          >
            {content.secondaryLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
