import Image from "next/image";

const times = {
  Leões: { logo: "/images/times/time_padrao_01.png" },
  Tigres: { logo: "/images/times/time_padrao_02.png" },
  Águias: { logo: "/images/times/time_padrao_03.png" },
  Furacão: { logo: "/images/times/time_padrao_04.png" },
};

function TimeCell({ name, align }: { name: string; align?: "left" | "right" }) {
  return (
    <span
      className={`flex items-center gap-1 ${align === "left" ? "justify-end" : "justify-start"} min-w-[106px] md:min-w-[120px]`}
    >
      {align === "left" ? (
        <>
          <Image
            src={times[name as keyof typeof times].logo}
            alt={name}
            width={24}
            height={24}
            className="rounded bg-black"
          />
          <span>{name}</span>
        </>
      ) : (
        <>
          <span>{name}</span>
          <Image
            src={times[name as keyof typeof times].logo}
            alt={name}
            width={24}
            height={24}
            className="rounded bg-black"
          />
        </>
      )}
    </span>
  );
}

export function ConfrontosDoDia() {
  // Jogos de ida
  const ida = [
    { rodada: 1, timeA: "Leões", timeB: "Tigres" },
    { rodada: 2, timeA: "Águias", timeB: "Furacão" },
    { rodada: 3, timeA: "Leões", timeB: "Águias" },
    { rodada: 4, timeA: "Tigres", timeB: "Furacão" },
    { rodada: 5, timeA: "Leões", timeB: "Furacão" },
    { rodada: 6, timeA: "Tigres", timeB: "Águias" },
  ];
  // Volta (invertendo times)
  const volta = ida.map((jogo, idx) => ({
    rodada: idx + 1,
    timeA: jogo.timeB,
    timeB: jogo.timeA,
  }));

  return (
    <section className="mx-auto mt-12 max-w-4xl">
      <h3 className="mb-4 text-center text-lg font-bold text-yellow-400">
        Tabela de Confrontos
      </h3>
      <div className="flex flex-col justify-center gap-8 md:flex-row">
        {/* Jogos de Ida */}
        <div className="flex-1 overflow-hidden rounded-2xl bg-neutral-900 shadow-md">
          <div className="rounded-t-2xl bg-neutral-800 py-2 text-center text-lg font-semibold text-yellow-400">
            Ida
          </div>
          <table className="w-full text-center">
            <thead>
              <tr className="bg-neutral-800 text-base text-neutral-200">
                <th className="py-2">Rodada</th>
                <th className="py-2">Jogo</th>
                <th className="py-2">Tempo</th>
              </tr>
            </thead>
            <tbody>
              {ida.map((jogo, i) => (
                <tr
                  key={i}
                  className="border-b border-neutral-800 transition hover:bg-neutral-800"
                >
                  <td className="py-2 font-medium">{jogo.rodada}</td>
                  <td className="py-2 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <TimeCell name={jogo.timeA} align="left" />
                      <span className="mx-2 font-bold text-yellow-400">x</span>
                      <TimeCell name={jogo.timeB} align="right" />
                    </div>
                  </td>
                  <td className="py-2 text-neutral-300">7 min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Jogos de Volta */}
        <div className="flex-1 overflow-hidden rounded-2xl bg-neutral-900 shadow-md">
          <div className="rounded-t-2xl bg-neutral-800 py-2 text-center text-lg font-semibold text-yellow-400">
            Volta
          </div>
          <table className="w-full text-center">
            <thead>
              <tr className="bg-neutral-800 text-base text-neutral-200">
                <th className="py-2">Rodada</th>
                <th className="py-2">Jogo</th>
                <th className="py-2">Tempo</th>
              </tr>
            </thead>
            <tbody>
              {volta.map((jogo, i) => (
                <tr
                  key={i}
                  className="border-b border-neutral-800 transition hover:bg-neutral-800"
                >
                  <td className="py-2 font-medium">{jogo.rodada}</td>
                  <td className="py-2 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <TimeCell name={jogo.timeA} align="left" />
                      <span className="mx-2 font-bold text-yellow-400">x</span>
                      <TimeCell name={jogo.timeB} align="right" />
                    </div>
                  </td>
                  <td className="py-2 text-neutral-300">7 min</td>
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
