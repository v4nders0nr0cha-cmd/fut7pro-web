"use client";

import Image from "next/image";
import Link from "next/link";

type PlayerCardProps = {
  title: string;
  name: string;
  value: string;
  imageUrl: string;
  href?: string; // torna o card interativo se fornecido
};

export function PlayerCard({
  title,
  name,
  value,
  imageUrl,
  href,
}: PlayerCardProps) {
  const content = (
    <div className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl bg-[#1a1a1a] p-3 shadow-md transition-all duration-300 hover:bg-[#2a2a2a] hover:shadow-[0_0_20px_#FFD700]">
      <Image
        src={imageUrl}
        alt={name}
        width={70}
        height={70}
        className="rounded-md object-cover"
      />
      <div>
        <p className="text-[11px] font-bold uppercase leading-none text-[#FFCC00]">
          {title}
        </p>
        <p className="text-sm font-semibold leading-tight text-white">{name}</p>
        <p className="text-xs font-medium text-yellow-400">{value}</p>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

type RankingCardProps = {
  title: string;
  list: { name: string; value: string }[];
  href: string;
};

export function RankingCard({ title, list, href }: RankingCardProps) {
  return (
    <Link href={href}>
      <div className="mb-4 cursor-pointer rounded-xl bg-[#1a1a1a] p-3 shadow-md transition-all duration-300 hover:bg-[#2a2a2a] hover:shadow-[0_0_20px_#FFD700]">
        <p className="mb-2 text-[11px] font-bold uppercase text-[#FFCC00]">
          {title}
        </p>
        <ol className="space-y-1 text-sm text-white">
          {list.map((item, index) => (
            <li key={index}>
              {index + 1}. {item.name}{" "}
              <span className="font-semibold text-yellow-400">
                — {item.value}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Link>
  );
}
