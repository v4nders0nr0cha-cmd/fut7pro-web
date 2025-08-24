"use client";

interface SeletorAnoProps {
  anosDisponiveis: number[];
  onChange: (ano: number) => void;
  anoSelecionado: number;
}

export default function SeletorAno({
  anosDisponiveis,
  onChange,
  anoSelecionado,
}: SeletorAnoProps) {
  return (
    <div className="mb-6">
      <label htmlFor="ano" className="mr-2 font-bold text-yellow-400">
        Selecione o Ano:
      </label>
      <select
        id="ano"
        value={anoSelecionado}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded border border-yellow-400 bg-[#1A1A1A] px-3 py-1 text-white"
      >
        {anosDisponiveis.map((ano) => (
          <option key={ano} value={ano}>
            {ano}
          </option>
        ))}
      </select>
    </div>
  );
}
