import {
  BookOpen,
  CircleHelp,
  CreditCard,
  ExternalLink,
  Headset,
  MessageCircle,
  RefreshCw,
  UserRound,
  UsersRound,
} from "lucide-react";
import { buildFut7ProOfficialWhatsAppUrl } from "@/config/fut7pro-contact";
import { buildPublicHref } from "@/utils/public-links";

export const ADMIN_BILLING_HREF = "/admin/financeiro/planos-limites";

type ProfileNavigationContext = {
  tenantSlug: string | null;
  athleteKey: string | null;
  canSwitchGroup: boolean;
};

export function getAdminProfileSections({
  tenantSlug,
  athleteKey,
  canSwitchGroup,
}: ProfileNavigationContext) {
  const groupProfileHref = tenantSlug ? buildPublicHref("/perfil", tenantSlug) : null;
  const publicProfileHref =
    tenantSlug && athleteKey ? buildPublicHref(`/atletas/${athleteKey}`, tenantSlug) : null;

  return [
    {
      id: "account",
      title: "Minha conta",
      items: [
        { id: "global-profile", label: "Perfil Global Fut7Pro", href: "/perfil", icon: UserRound },
        ...(groupProfileHref
          ? [
              {
                id: "group-profile",
                label: "Meu perfil neste grupo",
                href: groupProfileHref,
                icon: UsersRound,
              },
            ]
          : []),
        ...(canSwitchGroup
          ? [
              {
                id: "switch-group",
                label: "Trocar de grupo",
                href: "/admin/selecionar-racha",
                icon: RefreshCw,
              },
            ]
          : []),
        ...(publicProfileHref
          ? [
              {
                id: "public-profile",
                label: "Ver perfil público",
                href: publicProfileHref,
                icon: ExternalLink,
                external: true,
              },
            ]
          : []),
      ],
    },
    {
      id: "subscription",
      title: "Assinatura Fut7Pro",
      items: [
        {
          id: "billing",
          label: "Plano e cobrança",
          href: ADMIN_BILLING_HREF,
          icon: CreditCard,
        },
      ],
    },
    {
      id: "help",
      title: "Ajuda e orientação",
      items: [
        { id: "guide", label: "Guia Interativo", href: "/admin/guia-fut7pro", icon: BookOpen },
        {
          id: "help-center",
          label: "Central de Ajuda",
          href: "/admin/comunicacao/ajuda",
          icon: CircleHelp,
        },
        {
          id: "support",
          label: "Suporte Fut7Pro",
          href: "/admin/comunicacao/suporte",
          icon: Headset,
        },
        {
          id: "whatsapp",
          label: "Falar pelo WhatsApp",
          href: buildFut7ProOfficialWhatsAppUrl("Olá! Preciso de ajuda com o Fut7Pro."),
          icon: MessageCircle,
          external: true,
        },
      ],
    },
  ];
}
