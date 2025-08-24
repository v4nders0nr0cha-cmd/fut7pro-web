import Link from "next/link";
import { FaMedal } from "react-icons/fa";
import { PiSoccerBallFill } from "react-icons/pi";
import type { QuadrimestreItem } from "@/types/estatisticas";

interface QuadrimestreTableProps {
  titulo: string;
  dados: readonly QuadrimestreItem[];
}

export default function QuadrimestreTable({
  titulo,
  dados,
}: QuadrimestreTableProps) {
  return (
    <div className="mx-auto mb-8 w-full max-w-2xl rounded-lg bg-[#1A1A1A] p-4 shadow-md">
      <h3 className="mb-3 text-lg font-bold text-yellow-400">{titulo}</h3>
      <ul className="space-y-2">
        {dados.map((item, idx) => (
          <li key={idx} className="flex justify-between text-white">
            {item.slug ? (
              <Link
                href={`/atletas/${item.slug}`}
                className="underline underline-offset-2 transition hover:text-yellow-400"
                title={`Ver perfil de ${item.nome}`}
              >
                {item.nome}
              </Link>
            ) : (
              <span>{item.nome}</span>
            )}

            <span>
              {item.icone === "medalha" ? (
                <FaMedal
                  className="text-yellow-400"
                  aria-label="Medalha de Ouro"
                />
              ) : (
                <PiSoccerBallFill className="text-white" aria-label="Bola" />
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
