"use client";

import { useSession } from "next-auth/react";
import { useGlobalProfile } from "@/hooks/useGlobalProfile";
import { useMe } from "@/hooks/useMe";
import { buildPublicHref } from "@/utils/public-links";
import { isFut7ProAccountComplete } from "@/utils/public-auth-flow";
import { hasUsableFut7ProSession } from "@/utils/fut7pro-session";
import { DEFAULT_ATHLETE_AVATAR, getAvatarSrc } from "@/utils/avatar";

export function usePublicPersonalArea(tenantSlug: string) {
  const { data: session, status } = useSession();
  const authenticated = hasUsableFut7ProSession(session, status);
  const { profile, isLoading: isProfileLoading } = useGlobalProfile({ enabled: authenticated });
  const {
    me,
    isError: isMeError,
    isLoading: isMeLoading,
    mutate: mutateMe,
  } = useMe({
    enabled: authenticated && Boolean(tenantSlug),
    tenantSlug,
    context: "athlete",
  });
  const membership = profile?.memberships?.find((item) => item.tenantSlug === tenantSlug);
  const meStatusCode = String(
    me?.membership?.status ||
      (me as { membershipStatus?: string | null } | null)?.membershipStatus ||
      ""
  ).toUpperCase();
  const statusCode = meStatusCode || String(membership?.status || "").toUpperCase();
  const approved = Boolean(
    authenticated && !isMeError && me?.athlete && meStatusCode === "APROVADO"
  );
  const pending = statusCode === "PENDENTE" || statusCode === "PENDING";
  const complete = isFut7ProAccountComplete(profile?.user || me?.athlete);
  const email = profile?.user?.email || session?.user?.email || "";
  const name =
    profile?.user?.nickname?.trim() ||
    profile?.user?.name?.trim() ||
    me?.athlete?.firstName?.trim() ||
    session?.user?.name?.trim() ||
    email.split("@")[0] ||
    "Usuário";
  const avatar = getAvatarSrc(
    me?.athlete?.avatarUrl ||
      me?.user?.avatarUrl ||
      profile?.user?.avatarUrl ||
      session?.user?.image,
    DEFAULT_ATHLETE_AVATAR
  );
  const groupSlug = tenantSlug || profile?.memberships?.[0]?.tenantSlug || "";
  const sections = [
    {
      title: "Minha conta",
      items: [
        { label: "Perfil Global Fut7Pro", href: "/perfil", icon: "account" },
        ...(!pending && !complete && Boolean(profile?.user || me?.athlete)
          ? [
              {
                label: "Completar perfil",
                href: tenantSlug
                  ? `/perfil?intent=request-join&racha=${encodeURIComponent(tenantSlug)}`
                  : "/perfil",
                icon: "edit",
              },
            ]
          : []),
      ],
    },
    {
      title: "Meu futebol",
      items: [
        ...(approved && groupSlug
          ? [
              {
                label: "Meu desempenho neste grupo",
                href: buildPublicHref("/perfil", groupSlug),
                icon: "performance",
              },
            ]
          : []),
        ...((profile?.memberships?.length ?? 0) > 1
          ? [{ label: "Trocar de grupo", href: "/perfil#meus-rachas", icon: "switch" }]
          : []),
      ],
    },
    {
      title: "Situação do vínculo",
      items: [
        ...(pending && groupSlug
          ? [
              {
                label: "Solicitação em análise",
                href: buildPublicHref("/aguardando-aprovacao", groupSlug),
                icon: "pending",
              },
            ]
          : []),
        ...(approved && groupSlug
          ? [
              {
                label: me?.athlete?.mensalista
                  ? "Mensalista do grupo"
                  : me?.athlete?.mensalistaRequestStatus === "PENDING"
                    ? "Solicitação de mensalista em análise"
                    : "Situação de mensalista",
                href: `${buildPublicHref("/minha-conta", groupSlug)}#mensalista`,
                icon: "pending",
              },
            ]
          : []),
      ],
    },
  ].filter((section) => section.items.length > 0);

  return {
    authenticated,
    loading: status === "loading" || isMeLoading || isProfileLoading,
    approved,
    pending,
    complete,
    me,
    mutateMe,
    profile,
    name,
    email,
    avatar,
    groupSlug,
    sections,
  };
}
