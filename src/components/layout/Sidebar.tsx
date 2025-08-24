"use client";

import Image from "next/image";
import Link from "next/link";
import { rachaConfig } from "@/config/racha.config";

export default function Sidebar() {
  return (
    <aside className="h-full w-full bg-[#111] px-1 py-3 text-white">
      {/* Logo e nome do racha */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <Image
          src={rachaConfig.logo}
          alt={`Logo do ${rachaConfig.nome} - sistema de futebol 7`}
          width={80}
          height={80}
          className="object-contain"
        />
        <span className="text-xl font-bold text-yellow-400">
          {rachaConfig.nome}
        </span>
      </div>

      {/* Artilheiro do Dia */}
      <div className="mb-6 cursor-pointer rounded-xl bg-[#1A1A1A] p-3 transition-shadow hover:shadow-[0_0_10px_2px_#FFCC00]">
        <p className="mb-1 text-[10px] font-bold uppercase text-yellow-400">
          Artilheiro do Dia
        </p>
        <div className="flex items-center gap-3">
          <Image
            src="/images/jogadores/jogador_padrao_01.jpg"
            alt="Foto do Jogador XPTO"
            width={48}
            height={48}
            className="rounded-md object-cover"
          />
          <div>
            <p className="text-sm font-semibold">Jogador XPTO</p>
            <p className="text-xs text-yellow-400">3 gols</p>
          </div>
        </div>
      </div>

      {/* Maestro do Dia */}
      <div className="mb-6 cursor-pointer rounded-xl bg-[#1A1A1A] p-3 transition-shadow hover:shadow-[0_0_10px_2px_#FFCC00]">
        <p className="mb-1 text-[10px] font-bold uppercase text-yellow-400">
          Maestro do Dia
        </p>
        <div className="flex items-center gap-3">
          <Image
            src="/images/jogadores/jogador_padrao_03.jpg"
            alt="Foto do Maestro do Dia"
            width={48}
            height={48}
            className="rounded-md object-cover"
          />
          <div>
            <p className="text-sm font-semibold">Camisa 10</p>
            <p className="text-xs text-yellow-400">4 assistências</p>
          </div>
        </div>
      </div>

      {/* Artilheiro do Ano */}
      <SidebarPlayerCard
        title="Artilheiro do Ano"
        name="Craque Alpha"
        value="22 gols"
        href="/estatisticas/atacantes"
        image="/images/jogadores/jogador_padrao_02.jpg"
        icon="/images/icons/bola-de-ouro.png"
      />

      {/* Maestro do Ano */}
      <SidebarPlayerCard
        title="Maestro do Ano"
        name="Camisa 10"
        value="31 assistências"
        href="/estatisticas/meias"
        image="/images/jogadores/jogador_padrao_07.jpg"
        icon="/images/icons/chuteira-de-ouro.png"
      />

      {/* Melhor do Ano (agora acima dos Pontuadores) */}
      <SidebarPlayerCard
        title="Melhor do Ano"
        name="Mario"
        value="45 pontos"
        href="/estatisticas"
        image="/images/jogadores/jogador_padrao_05.jpg"
        icon="🏆"
      />

      {/* Maiores Pontuadores */}
      <SidebarRankingCard
        title="Maiores Pontuadores"
        label="PONTOS"
        items={[
          { name: "Mario", value: 45 },
          { name: "Zico", value: 39 },
          { name: "Camisa 10", value: 32 },
          { name: "Ribamar", value: 28 },
          { name: "Fumaça", value: 26 },
        ]}
      />

      {/* Atacante do Ano */}
      <SidebarPlayerCard
        title="Atacante do Ano"
        name="Craque Alpha"
        value="22 gols"
        href="/estatisticas/atacantes"
        image="/images/jogadores/jogador_padrao_06.jpg"
        icon="🏆"
      />
      {/* Meia do Ano */}
      <SidebarPlayerCard
        title="Meia do Ano"
        name="Camisa 10"
        value="18 assistências"
        href="/estatisticas/meias"
        image="/images/jogadores/jogador_padrao_07.jpg"
        icon="🏆"
      />
      {/* Zagueiro do Ano (agora exibe pontos) */}
      <SidebarPlayerCard
        title="Zagueiro do Ano"
        name="Murão"
        value="37 pontos"
        href="/estatisticas/zagueiros"
        image="/images/jogadores/jogador_padrao_08.jpg"
        icon="🏆"
      />
      {/* Goleiro do Ano (agora exibe pontos) */}
      <SidebarPlayerCard
        title="Goleiro do Ano"
        name="Muralha"
        value="42 pontos"
        href="/estatisticas/goleiros"
        image="/images/jogadores/jogador_padrao_09.jpg"
        icon="/images/icons/luva-de-ouro.png"
      />
    </aside>
  );
}

// Componente de card de jogador no sidebar
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
      className="relative mb-4 block cursor-pointer rounded-xl bg-[#1A1A1A] p-3 transition-shadow hover:shadow-[0_0_10px_2px_#FFCC00]"
    >
      {/* Selo Temporário */}
      <span className="absolute right-3 top-2 text-xs text-gray-300">
        🕓 Temporário
      </span>

      {/* Ícone grande abaixo do selo */}
      {icon && (
        <div className="absolute right-3 top-7">
          {typeof icon === "string" && icon.startsWith("/") ? (
            <Image
              src={icon}
              alt="Ícone do prêmio"
              width={28}
              height={28}
              className="object-contain"
            />
          ) : (
            <span className="text-2xl">{icon}</span>
          )}
        </div>
      )}

      <p className="mb-1 text-[10px] font-bold uppercase text-yellow-400">
        {title}
      </p>
      <div className="flex items-center gap-3">
        <Image
          src={image}
          alt={`Foto de ${name}`}
          width={40}
          height={40}
          className="rounded-md object-cover"
        />
        <div className="flex flex-col">
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-xs text-yellow-400">{value}</p>
        </div>
      </div>
    </Link>
  );
}

// Componente de ranking no sidebar
function SidebarRankingCard({
  title,
  label,
  items,
}: {
  title: string;
  label: string;
  items: { name: string; value: number }[];
}) {
  return (
    <div className="mb-4 rounded-xl bg-[#1A1A1A] p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase text-yellow-400">
          {title}
        </p>
        <span className="text-[10px] uppercase text-gray-400">{label}</span>
      </div>
      <ul className="space-y-1 text-sm text-white">
        {items.map((item, index) => (
          <li key={index} className="flex justify-between">
            <span>{item.name}</span>
            <span className="font-semibold text-yellow-400">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
