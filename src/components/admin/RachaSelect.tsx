"use client";
import { useRacha } from "@/context/RachaContext";
import { useContext } from "react";
import { AdminContext } from "@/context/AdminProvider";

type Props = {
  value?: string;
  onChange?: (id: string) => void;
};

export default function RachaSelect({ value, onChange }: Props) {
  const context = useRacha();
  const { rachas } = useContext(AdminContext);

  // Garante que rachas seja sempre array (nunca undefined)
  const safeRachas = Array.isArray(rachas) ? rachas : [];

  const selectValue = value ?? context.rachaId;
  const handleChange = onChange ?? context.setRachaId;

  return (
    <div className="mb-6 max-w-xs">
      <label className="block mb-1 text-yellow-500 font-medium">Selecione o Racha</label>
      <select
        className="w-full border border-yellow-500 rounded px-3 py-2 bg-[#191919] text-white"
        value={selectValue}
        onChange={(e) => handleChange?.(e.target.value)}
      >
        <option value="">Selecione...</option>
        {safeRachas.map((racha) => (
          <option key={racha.id} value={racha.id}>
            {racha.nome}
          </option>
        ))}
      </select>
    </div>
  );
}
