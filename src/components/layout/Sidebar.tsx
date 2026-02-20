"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { Info } from "lucide-react";
import { useTema } from "@/hooks/useTema";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import type { RankingAtleta } from "@/types/estatisticas";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import DestaquesRegrasModal from "@/components/modals/DestaquesRegrasModal";
import AvatarFut7Pro from "@/components/ui/AvatarFut7Pro";
import { getAvatarSrc } from "@/utils/avatar";

const DEFAULT_IMAGE = "/images/jogadores/jogador_padrao_01.jpg";
const BADGE_AUTOMATICO = "Automático";
const CRITERIA_DIA = {
  artilheiro: "Mais gols no dia (qualquer time)",
  maestro: "Mais assistências no dia (qualquer time)",
};

export default function Sidebar() {
  const { logo, nome } = useTema();
  const { publicHref, publicSlug } = usePublicLinks();
  const [regrasOpen, setRegrasOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const { rankings: topGeral } = usePublicPlayerRankings({
    slug: publicSlug,
    type: "geral",
    period: "year",
    year: currentYear,
    limit: 5,
  });
  const { rankings: topGols } = usePublicPlayerRankings({
    slug: publicSlug,
    type: "artilheiros",
    period: "year",
    year: currentYear,
    limit: 1,
  });
  const { rankings: topAssist } = usePublicPlayerRankings({
    slug: publicSlug,
    type: "assistencias",
    period: "year",
    year: currentYear,
    limit: 1,
  });

  const artilheiro = topGols?.[0];
  const maestro = topAssist?.[0];
  const melhorDoAno = topGeral?.[0];
  const goleiro = resolveGoleiro(topGeral);
  const artilheiroGols = typeof artilheiro?.gols === "number" ? artilheiro.gols : null;
  const maestroAssists = typeof maestro?.assistencias === "number" ? maestro.assistencias : null;

  const maioresPontuadores = topGeral?.slice(0, 5);

  const artilheiroData = {
    name: artilheiro?.nome ?? "Artilheiro em atualização",
    value: artilheiro ? `${artilheiro.gols ?? artilheiro.pontos ?? 0} gols` : "Em processamento",
    href: publicHref(
      artilheiro?.slug
        ? `/atletas/${artilheiro.slug}`
        : "/estatisticas/melhores-por-posicao/atacantes"
    ),
    image: safeImage(artilheiro?.foto, "/images/jogadores/jogador_padrao_01.jpg"),
  };

  const maestroData = {
    name: maestro?.nome ?? "Maestro em atualização",
    value: maestro ? `${maestro.assistencias ?? 0} assistências` : "Em processamento",
    href: publicHref(
      maestro?.slug ? `/atletas/${maestro.slug}` : "/estatisticas/melhores-por-posicao/meias"
    ),
    image: safeImage(maestro?.foto, "/images/jogadores/jogador_padrao_03.jpg"),
  };

  const melhorDoAnoData = {
    name: melhorDoAno?.nome ?? "Ranking em atualização",
    value: melhorDoAno ? `${melhorDoAno.pontos ?? 0} pontos` : "Em processamento",
    href: publicHref(melhorDoAno?.slug ? `/atletas/${melhorDoAno.slug}` : "/estatisticas"),
    image: safeImage(melhorDoAno?.foto, "/images/jogadores/jogador_padrao_05.jpg"),
  };

  const goleiroData = {
    name: goleiro?.nome ?? melhorDoAnoData.name,
    value: goleiro ? `${goleiro.pontos ?? 0} pontos` : melhorDoAnoData.value,
    href: publicHref(
      goleiro?.slug ? `/atletas/${goleiro.slug}` : "/estatisticas/melhores-por-posicao/goleiros"
    ),
    image: safeImage(goleiro?.foto, "/images/jogadores/jogador_padrao_09.jpg"),
  };

  return (
    <aside className="w-full h-full bg-[#111] text-white px-1 py-3">
      <div className="flex flex-col items-center gap-2 mb-6">
        {logo && (
          <Image
            src={logo}
            alt={`Logo do ${nome} - sistema de futebol 7`}
            width={80}
            height={80}
            className="object-contain"
          />
        )}
        <span className="text-xl font-bold text-brand">{nome}</span>
      </div>

      <SidebarPlayerCard
        title="Artilheiro do Dia"
        name={artilheiroData.name}
        value={artilheiroData.value}
        href={artilheiroData.href}
        image={artilheiroData.image}
        icon="/images/icons/bola-de-ouro.png"
        badge={BADGE_AUTOMATICO}
        criteria={CRITERIA_DIA.artilheiro}
        footerValue={artilheiroGols}
        footerLabel="gols"
        onRulesClick={() => setRegrasOpen(true)}
      />

      <SidebarPlayerCard
        title="Maestro do Dia"
        name={maestroData.name}
        value={maestroData.value}
        href={maestroData.href}
        image={maestroData.image}
        icon="/images/icons/chuteira-de-ouro.png"
        badge={BADGE_AUTOMATICO}
        criteria={CRITERIA_DIA.maestro}
        footerValue={maestroAssists}
        footerLabel="assistências"
        onRulesClick={() => setRegrasOpen(true)}
      />

      <div className="my-2 flex items-center gap-2 px-1">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-brand-soft opacity-70">
          Melhores do Ano
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <SidebarPlayerCard
        title="Artilheiro do Ano"
        name={artilheiroData.name}
        value={artilheiroData.value}
        href={publicHref("/estatisticas/melhores-por-posicao/atacantes")}
        image={artilheiroData.image}
        icon="/images/icons/bola-de-ouro.png"
      />

      <SidebarPlayerCard
        title="Meia do Ano"
        name={maestroData.name}
        value={maestroData.value}
        href={publicHref("/estatisticas/melhores-por-posicao/meias")}
        image={maestroData.image}
        icon="/images/icons/chuteira-de-ouro.png"
      />

      <SidebarPlayerCard
        title="Goleiro do Ano"
        name={goleiroData.name}
        value={goleiroData.value}
        href={publicHref("/estatisticas/melhores-por-posicao/goleiros")}
        image={goleiroData.image}
        icon="/images/icons/luva-de-ouro.png"
      />

      <SidebarPlayerCard
        title="Melhor do Ano"
        name={melhorDoAnoData.name}
        value={melhorDoAnoData.value}
        href={melhorDoAnoData.href}
        image={melhorDoAnoData.image}
        icon="/images/icons/trofeu-de-ouro.png"
      />

      <SidebarRankingCard
        title="Maiores Pontuadores"
        label="PONTOS"
        items={
          maioresPontuadores && maioresPontuadores.length > 0
            ? maioresPontuadores.map((p) => ({
                name: p.nome,
                value: p.pontos ?? 0,
                href: p.slug ? publicHref(`/atletas/${p.slug}`) : undefined,
              }))
            : [
                { name: "Jogador 1", value: 0 },
                { name: "Jogador 2", value: 0 },
                { name: "Jogador 3", value: 0 },
                { name: "Jogador 4", value: 0 },
                { name: "Jogador 5", value: 0 },
              ]
        }
      />
      <DestaquesRegrasModal open={regrasOpen} onClose={() => setRegrasOpen(false)} />
    </aside>
  );
}

function SidebarPlayerCard({
  title,
  name,
  value,
  href,
  image,
  icon,
  badge,
  criteria,
  footerValue,
  footerLabel,
  footerText,
  onRulesClick,
}: {
  title: string;
  name: string;
  value: string;
  href: string;
  image: string;
  icon?: string;
  badge?: string;
  criteria?: string;
  footerValue?: number | null;
  footerLabel?: string;
  footerText?: string;
  onRulesClick?: () => void;
}) {
  const hasFooterValue = typeof footerValue === "number";
  const isHighlight = Boolean(criteria || badge || onRulesClick || hasFooterValue || footerText);
  const badgeStyle =
    badge?.toLowerCase().includes("manual") === true
      ? "bg-red-500/20 text-red-200 border-red-500/40"
      : "bg-brand-soft text-black border-brand";
  const footerLabelText = footerLabel || "";
  const footerDisplayText = footerText || value;

  const handleRulesClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onRulesClick?.();
  };

  const content = isHighlight ? (
    <div className="relative block bg-[#1A1A1A] rounded-xl p-3 mb-4 hover:shadow-brand transition-shadow cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] uppercase font-bold text-brand mb-1 truncate">{title}</p>
          {badge ? (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${badgeStyle}`}
            >
              {badge}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {icon ? (
            icon.startsWith("/") ? (
              <Image
                src={icon}
                alt={`Ícone ${title}`}
                width={24}
                height={24}
                className="object-contain"
              />
            ) : (
              <span className="text-xl">{icon}</span>
            )
          ) : null}
          {onRulesClick ? (
            <button
              type="button"
              onClick={handleRulesClick}
              aria-label="Regras dos Destaques do Dia"
              className="rounded-full border border-white/10 bg-white/5 p-1 text-gray-200 hover:text-brand-soft"
            >
              <Info size={12} />
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 min-w-0">
        <AvatarFut7Pro
          src={image}
          alt={`Foto de ${name}`}
          width={38}
          height={38}
          className="rounded-md object-cover"
        />
        <div className="flex flex-col min-w-0">
          <p className="font-semibold text-sm truncate">{name}</p>
          {criteria ? <p className="text-[11px] text-gray-400 truncate">{criteria}</p> : null}
        </div>
      </div>
      <div className="mt-2 flex items-end justify-between border-t border-white/10 pt-2">
        {hasFooterValue ? (
          <div className="flex items-baseline gap-1 text-brand-soft">
            <span className="text-lg font-bold text-brand">{footerValue}</span>
            <span className="text-[10px] uppercase">{footerLabelText}</span>
          </div>
        ) : (
          <span className="text-xs font-semibold text-brand-soft">{footerDisplayText}</span>
        )}
      </div>
    </div>
  ) : (
    <div className="relative block bg-[#1A1A1A] rounded-xl p-3 mb-4 hover:shadow-brand transition-shadow cursor-pointer">
      {icon && (
        <div className="absolute top-2 right-3">
          {icon.startsWith("/") ? (
            <Image
              src={icon}
              alt={`Ícone ${title}`}
              width={28}
              height={28}
              className="object-contain"
            />
          ) : (
            <span className="text-2xl">{icon}</span>
          )}
        </div>
      )}

      <p className="text-[10px] uppercase font-bold text-brand mb-1">{title}</p>
      <div className="flex items-center gap-3">
        <AvatarFut7Pro
          src={image}
          alt={`Foto de ${name}`}
          width={40}
          height={40}
          className="rounded-md object-cover"
        />
        <div className="flex flex-col">
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-brand text-xs">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <Link href={href} className="relative block">
      {content}
    </Link>
  );
}
function SidebarRankingCard({
  title,
  label,
  items,
}: {
  title: string;
  label: string;
  items: { name: string; value: number; href?: string }[];
}) {
  return (
    <div className="bg-[#1A1A1A] rounded-xl p-3 mb-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-[10px] uppercase font-bold text-brand">{title}</p>
        <span className="text-[10px] uppercase text-gray-400">{label}</span>
      </div>
      <ul className="space-y-1 text-sm text-white">
        {items.map((item, index) => {
          const content = (
            <>
              <span>{item.name}</span>
              <span className="text-brand font-semibold">{item.value}</span>
            </>
          );

          return (
            <li key={index} className="flex justify-between">
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex justify-between w-full hover:text-brand-soft"
                >
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function safeImage(src?: string, fallback: string = DEFAULT_IMAGE) {
  return getAvatarSrc(src, fallback);
}

function resolveGoleiro(rankings?: RankingAtleta[]) {
  if (!rankings) return undefined;
  const goalieTags = [
    "GOL",
    "GOLEIRO",
    "GOLEIRA",
    "GK",
    "GL",
    "GOALKEEPER",
    "GOALIE",
    "KEEPER",
    "GOALKEEP",
  ];
  return rankings.find((p) => {
    const pos = (p.posicao || p.position || "").toUpperCase().replace(/[^A-Z]/g, "");
    return goalieTags.some((tag) => pos === tag || pos.startsWith(tag));
  });
}
