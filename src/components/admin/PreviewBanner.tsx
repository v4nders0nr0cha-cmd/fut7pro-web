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

export default function PreviewBanner({
  fotoBanner,
  jogadores,
  data,
  onPublicar,
}: Props) {
  return (
    <section className="mb-6 flex w-full max-w-3xl flex-col items-center rounded-2xl bg-zinc-800 p-4 shadow-lg">
      <h2 className="mb-2 text-lg font-bold text-yellow-300">
        Prévia do Banner
      </h2>
      <div className="flex w-full flex-col items-center gap-4 md:flex-row">
        <div className="mb-3 flex h-36 w-56 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-yellow-400 bg-zinc-700 shadow-lg md:mb-0">
          {fotoBanner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoBanner}
              alt="Banner Time Campeão do Dia"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-gray-400">Foto do Time Campeão</span>
          )}
        </div>
        <div className="flex flex-1 flex-col items-center md:items-start">
          <span className="mb-1 text-sm text-gray-300">Data do racha:</span>
          <span className="mb-2 text-lg font-bold text-yellow-200">{data}</span>
          <span className="mb-1 text-sm text-gray-300">
            Jogadores campeões do dia:
          </span>
          <ul className="flex flex-wrap gap-2">
            {jogadores.map((j) => (
              <li
                key={j.id}
                className="rounded-xl bg-yellow-900/80 px-3 py-1 text-sm font-semibold text-yellow-200 shadow"
              >
                {j.nome}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button
        className="mt-5 rounded-xl bg-yellow-400 px-6 py-2 font-bold text-black shadow-lg transition hover:bg-yellow-300"
        onClick={onPublicar}
      >
        Publicar Campeão do Dia
      </button>
    </section>
  );
}
