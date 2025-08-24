"use client";

import { FaFileAlt } from "react-icons/fa";
import Link from "next/link";

// Props de exemplo, ajuste para dados reais do backend depois
interface CardPlanoAtualProps {
  tipoPlano:
    | "trial"
    | "gratuito"
    | "mensal"
    | "mensal-marketing"
    | "anual"
    | "anual-marketing";
  onUpgrade?: () => void; // Função de upgrade (opcional)
}

export default function CardPlanoAtual({
  tipoPlano,
  onUpgrade,
}: CardPlanoAtualProps) {
  let labelPlano = "";
  let mensagem = "";
  let acao = null;

  switch (tipoPlano) {
    case "gratuito":
      labelPlano = "Grátis";
      mensagem =
        "Plano grátis? Isso é só um amistoso. Vem pro jogo de verdade!";
      acao = (
        <Link
          href="/admin/financeiro/upgrade"
          className="ml-2 text-base font-semibold text-[#00d3d4] underline transition hover:text-[#24e8fa]"
        >
          Subir plano
        </Link>
      );
      break;
    case "trial":
      labelPlano = "Teste Grátis";
      mensagem =
        "Use seu teste gratuito para dominar o sistema e aproveite para captar patrocinadores que podem pagar seu plano!";
      acao = (
        <Link
          href="/admin/financeiro/upgrade"
          className="ml-2 text-base font-semibold text-[#00d3d4] underline transition hover:text-[#24e8fa]"
        >
          Subir plano
        </Link>
      );
      break;
    case "mensal":
      labelPlano = "Mensal Essencial";
      mensagem =
        "Plano Essencial ativado! Controle total do seu racha todos os meses.";
      acao = (
        <Link
          href="/admin/financeiro/renovar"
          className="ml-2 text-base font-semibold text-[#00d3d4] underline transition hover:text-[#24e8fa]"
        >
          Renovar plano
        </Link>
      );
      break;
    case "mensal-marketing":
      labelPlano = "Mensal + Marketing";
      mensagem =
        "Seu racha está jogando na elite! Plano completo com marketing ativado.";
      acao = (
        <Link
          href="/admin/financeiro/renovar"
          className="ml-2 text-base font-semibold text-[#00d3d4] underline transition hover:text-[#24e8fa]"
        >
          Renovar plano
        </Link>
      );
      break;
    case "anual":
      labelPlano = "Anual Essencial";
      mensagem =
        "Você garantiu a temporada completa! Seu racha está seguro o ano todo.";
      acao = (
        <Link
          href="/admin/financeiro/renovar"
          className="ml-2 text-base font-semibold text-[#00d3d4] underline transition hover:text-[#24e8fa]"
        >
          Renovar plano
        </Link>
      );
      break;
    case "anual-marketing":
      labelPlano = "Anual + Marketing";
      mensagem =
        "Você tá no topo! Controle total + marketing garantidos por toda a temporada.";
      acao = (
        <Link
          href="/admin/financeiro/renovar"
          className="ml-2 text-base font-semibold text-[#00d3d4] underline transition hover:text-[#24e8fa]"
        >
          Renovar plano
        </Link>
      );
      break;
    default:
      labelPlano = "Desconhecido";
      mensagem = "";
      acao = null;
  }

  return (
    <div className="flex h-full min-h-[140px] flex-col justify-between gap-3 rounded-xl bg-[#23272F] p-6 shadow">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-[#222f3e] p-3">
          <FaFileAlt className="h-8 w-8 text-[#f5f7fa]" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-300">Plano atual</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-white">
              {labelPlano}
            </span>
            {acao}
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-gradient-to-r from-[#1a222f] via-[#1b2432] to-[#181B20] p-2 text-sm text-white">
        {mensagem}
      </div>
    </div>
  );
}
