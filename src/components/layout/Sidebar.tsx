"use client";

import Image from "next/image";
import Link from "next/link";
import { useTema } from "@/hooks/useTema";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import type { RankingAtleta } from "@/types/estatisticas";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const DEFAULT_IMAGE = "/images/jogadores/jogador_padrao_01.jpg";

export default function Sidebar() {
  const { logo, nome } = useTema();
  const { publicHref, publicSlug } = usePublicLinks();
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

  const maioresPontuadores = topGeral?.slice(0, 5);

  const artilheiroData = {
    name: artilheiro?.nome ?? "Artilheiro em atualização",
    value: artilheiro ? `${artilheiro.gols ?? artilheiro.pontos ?? 0} gols` : "Em processamento",
    href: publicHref(artilheiro?.slug ? `/atletas/${artilheiro.slug}` : "/estatisticas/atacantes"),
    image: safeImage(artilheiro?.foto, "/images/jogadores/jogador_padrao_01.jpg"),
  };

  const maestroData = {
    name: maestro?.nome ?? "Maestro em atualização",
    value: maestro ? `${maestro.assistencias ?? 0} assistências` : "Em processamento",
    href: publicHref(maestro?.slug ? `/atletas/${maestro.slug}` : "/estatisticas/meias"),
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
    href: publicHref(goleiro?.slug ? `/atletas/${goleiro.slug}` : "/estatisticas/goleiros"),
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
        <span className="text-xl font-bold text-yellow-400">{nome}</span>
      </div>

      <SidebarPlayerCard
        title="Artilheiro do Dia"
        name={artilheiroData.name}
        value={artilheiroData.value}
        href={artilheiroData.href}
        image={artilheiroData.image}
        icon="/images/icons/bola-de-ouro.png"
      />

      <SidebarPlayerCard
        title="Maestro do Dia"
        name={maestroData.name}
        value={maestroData.value}
        href={maestroData.href}
        image={maestroData.image}
        icon="/images/icons/chuteira-de-ouro.png"
      />

      <SidebarPlayerCard
        title="Artilheiro do Ano"
        name={artilheiroData.name}
        value={artilheiroData.value}
        href={publicHref("/estatisticas/atacantes")}
        image={artilheiroData.image}
        icon="/images/icons/bola-de-ouro.png"
      />

      <SidebarPlayerCard
        title="Meia do Ano"
        name={maestroData.name}
        value={maestroData.value}
        href={publicHref("/estatisticas/meias")}
        image={maestroData.image}
        icon="/images/icons/chuteira-de-ouro.png"
      />

      <SidebarPlayerCard
        title="Goleiro do Ano"
        name={goleiroData.name}
        value={goleiroData.value}
        href={publicHref("/estatisticas/goleiros")}
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
}: {
  title: string;
  name: string;
  value: string;
  href: string;
  image: string;
  icon?: string;
}) {
  return (
    <Link
      href={href}
      className="relative block bg-[#1A1A1A] rounded-xl p-3 mb-4 hover:shadow-[0_0_10px_2px_#FFCC00] transition-shadow cursor-pointer"
    >
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

      <p className="text-[10px] uppercase font-bold text-yellow-400 mb-1">{title}</p>
      <div className="flex items-center gap-3">
        <Image
          src={image}
          alt={`Foto de ${name}`}
          width={40}
          height={40}
          className="rounded-md object-cover"
        />
        <div className="flex flex-col">
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-yellow-400 text-xs">{value}</p>
        </div>
      </div>
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
        <p className="text-[10px] uppercase font-bold text-yellow-400">{title}</p>
        <span className="text-[10px] uppercase text-gray-400">{label}</span>
      </div>
      <ul className="space-y-1 text-sm text-white">
        {items.map((item, index) => {
          const content = (
            <>
              <span>{item.name}</span>
              <span className="text-yellow-400 font-semibold">{item.value}</span>
            </>
          );

          return (
            <li key={index} className="flex justify-between">
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex justify-between w-full hover:text-yellow-300"
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
  return src && src.trim() ? src : fallback;
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
