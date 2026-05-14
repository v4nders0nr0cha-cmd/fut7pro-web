import type { LiveStandingRow } from "@/types/partida";

type Props = {
  rows: LiveStandingRow[];
};

export function LiveStandingsTable({ rows }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-[#161616]">
      <div className="border-b border-neutral-800 px-4 py-3">
        <h2 className="text-base font-semibold text-white">Classificação da rodada</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-black/40 text-xs uppercase text-neutral-400">
            <tr>
              {["Time", "Pts", "J", "V", "E", "D", "GP", "GC", "SG"].map((head) => (
                <th key={head} className="px-3 py-3 font-semibold">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.teamId} className="border-t border-neutral-800 text-neutral-200">
                <td className="px-3 py-3 font-semibold text-white">{row.team}</td>
                <td className="px-3 py-3 text-brand">{row.pts}</td>
                <td className="px-3 py-3">{row.j}</td>
                <td className="px-3 py-3">{row.v}</td>
                <td className="px-3 py-3">{row.e}</td>
                <td className="px-3 py-3">{row.d}</td>
                <td className="px-3 py-3">{row.gp}</td>
                <td className="px-3 py-3">{row.gc}</td>
                <td className="px-3 py-3">{row.sg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
