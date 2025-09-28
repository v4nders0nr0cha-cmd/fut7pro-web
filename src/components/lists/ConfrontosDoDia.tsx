import type { Partida } from "@/types/partida";

interface ConfrontosDoDiaProps {
  partidas: Partida[];
}

export default function ConfrontosDoDia({ partidas }: ConfrontosDoDiaProps) {
  if (!partidas || partidas.length === 0) {
    return null;
  }

  const ordenadas = [...partidas].sort((a, b) => {
    const dataA = `${a.data ?? ""}${a.horario ?? ""}`;
    const dataB = `${b.data ?? ""}${b.horario ?? ""}`;
    return dataA.localeCompare(dataB);
  });

  return (
    <section className="mt-12 max-w-4xl mx-auto">
      <h3 className="text-lg font-bold text-yellow-400 mb-4 text-center">Tabela de Confrontos</h3>
      <div className="overflow-x-auto rounded-2xl bg-neutral-900 shadow-md">
        <table className="w-full text-center">
          <thead>
            <tr className="bg-neutral-800 text-neutral-200 text-base">
              <th className="py-2 px-3 w-16">#</th>
              <th className="py-2 px-3">Confronto</th>
              <th className="py-2 px-3 w-32">Horário</th>
              <th className="py-2 px-3 w-40">Local</th>
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((partida, index) => (
              <tr key={partida.id} className="border-b border-neutral-800 hover:bg-neutral-800 transition">
                <td className="py-2 font-medium">{index + 1}</td>
                <td className="py-2 font-semibold">
                  <div className="flex items-center justify-center gap-2">
                    <span>{partida.timeA}</span>
                    <span className="text-yellow-400 font-bold">x</span>
                    <span>{partida.timeB}</span>
                  </div>
                </td>
                <td className="py-2 text-neutral-300">{partida.horario || "--"}</td>
                <td className="py-2 text-neutral-400">{partida.local || "Definir"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
