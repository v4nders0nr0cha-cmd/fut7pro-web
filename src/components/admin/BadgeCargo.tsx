// src/components/admin/BadgeCargo.tsx
import type { CargoAdmin } from "@/types/admin";

const cores: Record<CargoAdmin, string> = {
  Presidente: "bg-yellow-700 text-yellow-100",
  Vice: "bg-blue-900 text-blue-200",
  "Diretor de Futebol": "bg-green-900 text-green-200",
  "Diretor Financeiro": "bg-purple-900 text-purple-200",
};

export function BadgeCargo({
  cargo,
  minimal = false,
}: {
  cargo: CargoAdmin;
  minimal?: boolean;
}) {
  return (
    <span
      className={`inline-block font-semibold ${
        minimal
          ? "rounded-lg px-2 py-0.5 text-xs"
          : "rounded-full px-3 py-1 text-sm"
      } ${cores[cargo]} select-none`}
    >
      {cargo}
    </span>
  );
}
