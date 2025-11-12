import Image from "next/image";
import type { DerivedConfronto } from "@/utils/match-adapters";

type Props = {
  confrontos: DerivedConfronto[];
  titulo?: string;
};

const DEFAULT_LOGO = "/images/times/time_padrao_01.png";

function TimeCell({
  name,
  logo,
  align,
}: {
  name: string;
  logo?: string | null;
  align?: "left" | "right";
}) {
  const safeLogo = logo && logo.length > 0 ? logo : DEFAULT_LOGO;

  return (
    <span
      className={`flex items-center gap-1 ${
        align === "left" ? "justify-end" : "justify-start"
      } min-w-[106px] md:min-w-[120px]`}
    >
      {align === "left" ? (
        <>
          <Image src={safeLogo} alt={name} width={24} height={24} className="rounded bg-black" />
          <span>{name}</span>
        </>
      ) : (
        <>
          <span>{name}</span>
          <Image src={safeLogo} alt={name} width={24} height={24} className="rounded bg-black" />
        </>
      )}
    </span>
  );
}

export function ConfrontosDoDia({ confrontos, titulo = "Tabela de Confrontos" }: Props) {
  if (!Array.isArray(confrontos) || confrontos.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 max-w-4xl mx-auto">
      <h3 className="text-lg font-bold text-yellow-400 mb-4 text-center">{titulo}</h3>
      <div className="flex flex-col gap-8 justify-center">
        <div className="flex-1 bg-neutral-900 rounded-2xl shadow-md overflow-hidden">
          <div className="bg-neutral-800 text-yellow-400 text-lg font-semibold text-center py-2 rounded-t-2xl">
            Confrontos registrados
          </div>
          <table className="w-full text-center">
            <thead>
              <tr className="bg-neutral-800 text-neutral-200 text-base">
                <th className="py-2">#</th>
                <th className="py-2">Jogo</th>
                <th className="py-2">Placar</th>
                <th className="py-2">Local / Data</th>
              </tr>
            </thead>
            <tbody>
              {confrontos.map((jogo, index) => (
                <tr
                  key={jogo.id}
                  className="border-b border-neutral-800 hover:bg-neutral-800 transition"
                >
                  <td className="py-2 font-medium">{index + 1}</td>
                  <td className="py-2 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <TimeCell name={jogo.timeA.nome} logo={jogo.timeA.logo} align="left" />
                      <span className="mx-2 text-yellow-400 font-bold">x</span>
                      <TimeCell name={jogo.timeB.nome} logo={jogo.timeB.logo} align="right" />
                    </div>
                  </td>
                  <td className="py-2 text-neutral-200 font-semibold">
                    {jogo.placar.a} <span className="text-yellow-400">x</span> {jogo.placar.b}
                  </td>
                  <td className="py-2 text-neutral-300">
                    {jogo.local ?? "Local nao informado"}
                    <div className="text-[11px] text-neutral-500">{jogo.data}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default ConfrontosDoDia;
