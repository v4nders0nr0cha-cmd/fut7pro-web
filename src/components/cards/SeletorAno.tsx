"use client";

interface SeletorAnoProps {
  anosDisponiveis: number[];
  onChange: (ano: number) => void;
  anoSelecionado: number;
}

export default function SeletorAno({ anosDisponiveis, onChange, anoSelecionado }: SeletorAnoProps) {
  return (
    <div className="mb-6">
      <label htmlFor="ano" className="text-yellow-400 font-bold mr-2">
        Selecione o Ano:
      </label>
      <select
        id="ano"
        value={anoSelecionado}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-[#1A1A1A] text-white border border-yellow-400 px-3 py-1 rounded"
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
