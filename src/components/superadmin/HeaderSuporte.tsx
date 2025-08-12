import React from "react";

type Stat = { label: string; value: number | string };
interface Props {
  title: string;
  description: string;
  stats: Stat[];
}

const HeaderSuporte: React.FC<Props> = ({ title, description, stats }) => (
  <header className="mb-6">
    <h1 className="text-2xl md:text-3xl font-extrabold text-yellow-400 mb-1">{title}</h1>
    <p className="text-zinc-300 text-base md:text-lg mb-4">{description}</p>
    <div className="flex flex-wrap gap-3 mb-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-zinc-900 text-zinc-200 rounded-xl px-5 py-2 text-center shadow hover:scale-105 transition"
        >
          <div className="text-lg md:text-xl font-bold">{stat.value}</div>
          <div className="text-xs md:text-sm text-zinc-400 uppercase tracking-wider">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </header>
);

export default HeaderSuporte;
