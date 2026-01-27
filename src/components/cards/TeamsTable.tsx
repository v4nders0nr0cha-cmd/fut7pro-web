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
      className="bg-[#1a1a1a] rounded-xl p-4 mb-6 shadow-md hover:shadow-[0_0_20px_2px_var(--brand)] hover:bg-[#2a2a2a] cursor-pointer transition-all w-full"
      aria-labelledby="titulo-vitorias"
    >
      <h2 id="titulo-vitorias" className="text-brand text-sm font-bold uppercase mb-3">
        Times que mais venceram no Quadrimestre
      </h2>

      <div className="space-y-2 overflow-x-auto">
        {teams.map((team, index) => (
          <div key={index} className="min-w-[240px]">
            <div className="flex justify-between items-center text-sm text-white gap-2">
              <span className="truncate">{team.name}</span>
              <span className="text-brand font-semibold whitespace-nowrap">{team.points} pts</span>
            </div>
            <div className="w-full bg-[#333] h-2 rounded mt-1 mb-2">
              <div
                className="bg-brand h-2 rounded transition-all duration-300"
                style={{ width: `${Math.min(team.points * 5, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
