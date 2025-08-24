"use client";

export default function CardProximosJogos() {
  // Dados mockados
  const jogos = [
    { dia: "Sáb", data: "06/07", hora: "10:00", adversario: "Time Azul" },
    { dia: "Qua", data: "10/07", hora: "20:30", adversario: "Time Verde" },
  ];
  return (
    <div className="flex h-full min-h-[140px] flex-col rounded-xl bg-[#23272F] p-6 shadow">
      <span className="text-lg font-bold text-[#41b6e6]">Próximos Jogos</span>
      <div className="mt-2 flex flex-col gap-1">
        {jogos.map((j, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-sm text-white"
          >
            <span>
              {j.dia} {j.data} • {j.hora}
            </span>
            <span className="font-semibold text-[#fff200]">{j.adversario}</span>
          </div>
        ))}
      </div>
      <span className="mt-2 text-xs text-gray-400">
        Clique aqui para ver todos
      </span>
    </div>
  );
}
