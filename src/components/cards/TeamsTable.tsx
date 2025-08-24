"use client";

export default function TeamsTable() {
  const teams = [
    { name: "Time Alpha", points: 18 },
    { name: "Time Beta", points: 14 },
    { name: "Time Gama", points: 10 },
    { name: "Time Ômega", points: 8 },
  ];

  return (
    <section
      className="mb-6 w-full cursor-pointer rounded-xl bg-[#1a1a1a] p-4 shadow-md transition-all hover:bg-[#2a2a2a] hover:shadow-[0_0_20px_#FFD700]"
      aria-labelledby="titulo-vitorias"
    >
      <h2
        id="titulo-vitorias"
        className="mb-3 text-sm font-bold uppercase text-[#FFCC00]"
      >
        Times que mais venceram no Quadrimestre
      </h2>

      <div className="space-y-2 overflow-x-auto">
        {teams.map((team, index) => (
          <div key={index} className="min-w-[240px]">
            <div className="flex items-center justify-between gap-2 text-sm text-white">
              <span className="truncate">{team.name}</span>
              <span className="whitespace-nowrap font-semibold text-yellow-400">
                {team.points} pts
              </span>
            </div>
            <div className="mb-2 mt-1 h-2 w-full rounded bg-[#333]">
              <div
                className="h-2 rounded bg-yellow-400 transition-all duration-300"
                style={{ width: `${Math.min(team.points * 5, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
