import React from "react";

type Stat = { label: string; value: number | string };
interface Props {
  title: string;
  description: string;
  stats: Stat[];
}

const HeaderSuporte: React.FC<Props> = ({ title, description, stats }) => (
  <header className="mb-6">
    <h1 className="mb-1 text-2xl font-extrabold text-yellow-400 md:text-3xl">
      {title}
    </h1>
    <p className="mb-4 text-base text-zinc-300 md:text-lg">{description}</p>
    <div className="mb-2 flex flex-wrap gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl bg-zinc-900 px-5 py-2 text-center text-zinc-200 shadow transition hover:scale-105"
        >
          <div className="text-lg font-bold md:text-xl">{stat.value}</div>
          <div className="text-xs uppercase tracking-wider text-zinc-400 md:text-sm">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </header>
);

export default HeaderSuporte;
