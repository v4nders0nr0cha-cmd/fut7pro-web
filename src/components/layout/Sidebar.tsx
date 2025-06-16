"use client";

import Image from "next/image";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-full h-full bg-[#111] text-white px-4 py-6">
      {/* Logo e nome do racha */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <Image
          src="/images/logos/logo_fut7pro.png"
          alt="Logo do Fut7Pro - sistema de futebol 7"
          width={80}
          height={80}
          className="object-contain"
        />
        <span className="text-xl font-bold text-yellow-400">Fut7Pro</span>
      </div>

      {/* Artilheiro do Dia */}
      <div className="mb-6 bg-[#1A1A1A] rounded-xl p-3 hover:shadow-[0_0_10px_2px_#FFCC00] transition-shadow cursor-pointer">
        <p className="text-[10px] uppercase font-bold text-yellow-400 mb-1">Artilheiro do Dia</p>
        <div className="flex items-center gap-3">
          <Image
            src="/images/jogadores/jogador_padrao_01.jpg"
            alt="Foto do Jogador XPTO"
            width={48}
            height={48}
            className="rounded-md object-cover"
          />
          <div>
            <p className="font-semibold text-sm">Jogador XPTO</p>
            <p className="text-yellow-400 text-xs">3 gols</p>
          </div>
        </div>
      </div>

      {/* Cards com selo temporário e ícones personalizados */}
      <SidebarPlayerCard
        title="Artilheiro do Ano"
        name="Craque Alpha"
        value="22 gols"
        href="/estatisticas/atacantes"
        image="/images/jogadores/jogador_padrao_02.jpg"
        icon="/images/icons/bola-de-ouro.png"
      />

      <SidebarRankingCard
        title="Artilheiros do Ano"
        label="GOLS"
        items={[
          { name: "Craque Alpha", value: 22 },
          { name: "Camisa 10", value: 17 },
          { name: "XPTO", value: 13 },
          { name: "R10", value: 10 },
          { name: "Caveirão", value: 8 },
        ]}
      />

      <SidebarPlayerCard
        title="Melhor do Ano"
        name="Mario"
        value="45 pontos"
        href="/estatisticas"
        image="/images/jogadores/jogador_padrao_05.jpg"
        icon="🏆"
      />

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

      <SidebarPlayerCard
        title="Atacante do Ano"
        name="Craque Alpha"
        value="22 gols"
        href="/estatisticas/atacantes"
        image="/images/jogadores/jogador_padrao_06.jpg"
        icon="🏆"
      />
      <SidebarPlayerCard
        title="Meia do Ano"
        name="Camisa 10"
        value="18 assistências"
        href="/estatisticas/meias"
        image="/images/jogadores/jogador_padrao_07.jpg"
        icon="🏆"
      />
      <SidebarPlayerCard
        title="Zagueiro do Ano"
        name="Murão"
        value="33 desarmes"
        href="/estatisticas/zagueiros"
        image="/images/jogadores/jogador_padrao_08.jpg"
        icon="🏆"
      />
      <SidebarPlayerCard
        title="Goleiro do Ano"
        name="Muralha"
        value="50 defesas"
        href="/estatisticas/goleiros"
        image="/images/jogadores/jogador_padrao_09.jpg"
        icon="🏆"
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
      {/* Selo Temporário */}
      <span className="absolute top-2 right-3 text-xs text-gray-300">🕓 Temporário</span>

      {/* Ícone grande abaixo do selo */}
      {icon && (
        <div className="absolute top-7 right-3">
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
  items: { name: string; value: number }[];
}) {
  return (
    <div className="bg-[#1A1A1A] rounded-xl p-3 mb-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-[10px] uppercase font-bold text-yellow-400">{title}</p>
        <span className="text-[10px] uppercase text-gray-400">{label}</span>
      </div>
      <ul className="space-y-1 text-sm text-white">
        {items.map((item, index) => (
          <li key={index} className="flex justify-between">
            <span>{item.name}</span>
            <span className="text-yellow-400 font-semibold">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
