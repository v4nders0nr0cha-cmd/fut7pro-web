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

export function PlayerCard({ title, name, value, imageUrl, href }: PlayerCardProps) {
  const content = (
    <div className="bg-[#1a1a1a] rounded-xl p-3 flex gap-3 items-center mb-4 shadow-md transition-all duration-300 hover:bg-[#2a2a2a] hover:shadow-brand cursor-pointer">
      <Image src={imageUrl} alt={name} width={70} height={70} className="rounded-md object-cover" />
      <div>
        <p className="text-[11px] text-brand font-bold leading-none uppercase">{title}</p>
        <p className="text-sm font-semibold text-white leading-tight">{name}</p>
        <p className="text-xs text-brand font-medium">{value}</p>
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
      <div className="bg-[#1a1a1a] rounded-xl p-3 mb-4 cursor-pointer hover:bg-[#2a2a2a] transition-all duration-300 shadow-md hover:shadow-brand">
        <p className="text-[11px] text-brand font-bold mb-2 uppercase">{title}</p>
        <ol className="text-sm text-white space-y-1">
          {list.map((item, index) => (
            <li key={index}>
              {index + 1}. {item.name}{" "}
              <span className="text-brand font-semibold">- {item.value}</span>
            </li>
          ))}
        </ol>
      </div>
    </Link>
  );
}
