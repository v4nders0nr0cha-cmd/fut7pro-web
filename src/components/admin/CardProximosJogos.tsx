"use client";

export default function CardProximosJogos() {
  // Dados mockados
  const jogos = [
    { dia: "Sáb", data: "06/07", hora: "10:00", adversario: "Time Azul" },
    { dia: "Qua", data: "10/07", hora: "20:30", adversario: "Time Verde" },
  ];
  return (
    <div className="bg-[#23272F] rounded-xl p-6 shadow flex flex-col h-full min-h-[140px]">
      <span className="text-[#41b6e6] font-bold text-lg">Próximos Jogos</span>
      <div className="flex flex-col mt-2 gap-1">
        {jogos.map((j, i) => (
          <div key={i} className="flex items-center justify-between text-white text-sm">
            <span>
              {j.dia} {j.data} • {j.hora}
            </span>
            <span className="font-semibold text-[#fff200]">{j.adversario}</span>
          </div>
        ))}
      </div>
      <span className="text-xs text-gray-400 mt-2">Clique aqui para ver todos</span>
    </div>
  );
}
