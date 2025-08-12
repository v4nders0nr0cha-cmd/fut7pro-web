// src/components/admin/PreviewBanner.tsx
interface Jogador {
  id: string;
  nome: string;
}

interface Props {
  fotoBanner: string | null;
  jogadores: Jogador[];
  data: string;
  onPublicar: () => void;
}

export default function PreviewBanner({ fotoBanner, jogadores, data, onPublicar }: Props) {
  return (
    <section className="w-full max-w-3xl bg-zinc-800 rounded-2xl shadow-lg p-4 mb-6 flex flex-col items-center">
      <h2 className="font-bold text-lg text-yellow-300 mb-2">Prévia do Banner</h2>
      <div className="w-full flex flex-col md:flex-row items-center gap-4">
        <div className="flex-shrink-0 w-56 h-36 rounded-2xl bg-zinc-700 overflow-hidden shadow-lg flex items-center justify-center border-2 border-yellow-400 mb-3 md:mb-0">
          {fotoBanner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoBanner}
              alt="Banner Time Campeão do Dia"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-sm">Foto do Time Campeão</span>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center md:items-start">
          <span className="text-gray-300 text-sm mb-1">Data do racha:</span>
          <span className="text-yellow-200 font-bold text-lg mb-2">{data}</span>
          <span className="text-gray-300 text-sm mb-1">Jogadores campeões do dia:</span>
          <ul className="flex flex-wrap gap-2">
            {jogadores.map((j) => (
              <li
                key={j.id}
                className="bg-yellow-900/80 text-yellow-200 rounded-xl px-3 py-1 text-sm font-semibold shadow"
              >
                {j.nome}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button
        className="mt-5 px-6 py-2 bg-yellow-400 text-black font-bold rounded-xl shadow-lg hover:bg-yellow-300 transition"
        onClick={onPublicar}
      >
        Publicar Campeão do Dia
      </button>
    </section>
  );
}
