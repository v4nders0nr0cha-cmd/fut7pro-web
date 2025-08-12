"use client";

import Head from "next/head";
import { useState } from "react";
import { FaDownload, FaChevronDown } from "react-icons/fa";

// MOCK do Estatuto - pronto para evoluir para conteúdo dinâmico/admin futuramente
const estatutoTópicos = [
  {
    titulo: "Critérios de Pontuação",
    atualizado: true,
    conteudo: [
      "⚽ Gol marcado: Não gera pontuação adicional, mas conta para o ranking de artilharia.",
      "🎯 Assistência: Não gera pontuação adicional, mas conta para o ranking de assistência.",
      "🏆 Vitória na partida: 3 pontos para cada jogador do time vencedor",
      "🤝 Empate: 1 ponto para cada jogador",
      "❌ Derrota: 0 pontos",
      "🟨 Cartão amarelo: não perde pontos.",
      "🟥 Cartão vermelho: não perde pontos, mas pode ser suspenso temporariamente do racha",
      "🧤 Goleiro: Mesmo critério dos demais, ganha 3 pontos por vitória",
      "⚠️ Observação: só são computados pontos, gols e assistências registrados oficialmente pelo organizador.",
    ],
  },
  {
    titulo: "Multas",
    atualizado: true,
    conteudo: [
      "💰 Multas podem ser aplicadas pelo administrador a jogadores mensalistas ou diaristas que faltarem ao racha sem aviso prévio, especialmente se confirmaram presença e deram 'furo'.",
      "👤 Mensalista que faltar sem justificativa está sujeito à multa definida pelo administrador, podendo também perder prioridade em sorteios ou ser suspenso.",
      "👥 Diarista que confirmar presença e faltar poderá ser multado, além de perder prioridade ou ser colocado no final da lista de espera.",
      "📲 O valor da multa é configurado pelo administrador do racha e pode variar conforme frequência, reincidência ou justificativa.",
      "⚠️ Exceções podem ser consideradas pelo administrador (motivos médicos, imprevistos graves etc).",
      "🔔 Multas visam evitar prejuízo coletivo, garantir comprometimento dos participantes e manter o bom funcionamento do racha.",
    ],
  },
  {
    titulo: "Comportamento",
    conteudo: [
      "🚫 Não nos responsabilizamos por ofensas pessoais, racismo, homofobia ou qualquer forma de discriminação feita por membros, resolvam entre si seus problemas.",
      "🤝 O espírito esportivo deve prevalecer sempre. Jogadores devem respeitar colegas, adversários e arbitragem.",
      "⏱️ Atrasos ou não comparecimento recorrentes no racha podem resultar em advertência, multas e até suspensão temporária.",
      "🟢 Participação em confraternizações e eventos é incentivada, mas não obrigatória.",
    ],
  },
  {
    titulo: "Penalidades",
    conteudo: [
      "🟨 Cartão amarelo: suspensão de 3 minutos fora durante a partida.",
      "🟥 Cartão vermelho: suspensão automática de toda a partida (ou mais, conforme gravidade).",
      "🚫 Condutas antidesportivas graves podem resultar em exclusão permanente do racha.",
      "⏱️ Jogadores que chegarem após o horário estipulado poderão ser substituídos por atletas da lista de espera ou reservas.",
    ],
  },
  {
    titulo: "Definição de Mensalistas, Diaristas, Reservas e Critérios para Participação",
    conteudo: [
      "💸 Mensalista: Jogador que contribui mensalmente e tem vaga garantida em todos os jogos. Algumas vagas do racha são exclusivas para mensalistas.",
      "💵 Diarista: Jogador que paga apenas pelo dia jogado. Pode participar das partidas sempre que houver vagas remanescentes, após o preenchimento pelas vagas de mensalistas.",
      "🕒 Lista de Espera: Jogadores que manifestam interesse mas não garantiram vaga como mensalistas ou diaristas. Entram em caso de ausência ou desistência, por ordem de inscrição.",
      "👤 Convidado: Pode ser chamado excepcionalmente para completar times. Não soma pontos em rankings anuais.",
      "🔄 Critério de prioridade para participação: Mensalista > Diarista > Lista de Espera > Convidado.",
      "📝 As vagas que sobrarem para cada partida, após o preenchimento pelos mensalistas, serão disputadas pelos diaristas. Ganha a vaga o diarista que primeiro colocar o nome na lista, conforme chamada divulgada no grupo oficial de WhatsApp.",
      "⛔ Regras para entrada de novos jogadores: Sujeitas à aprovação dos administradores e do grupo.",
    ],
  },
  {
    titulo: "Organização do Racha",
    conteudo: [
      "👑 Admins: Responsáveis pela gestão, convites, organização dos jogos e mediação de conflitos.",
      "🔁 Admins podem ser substituídos em decisão coletiva, caso não cumpram suas funções.",
      "📝 Sugestões de regras e mudanças no estatuto podem ser enviadas a qualquer momento.",
    ],
  },
  {
    titulo: "Outros Pontos Importantes",
    conteudo: [
      "🏟️ Reserva do campo é de responsabilidade dos admins, mas colaboração com anotações e demais necessidades do racha é sempre bem-vinda.",
      "🚗 Caronas e logística são organizadas no grupo oficial.",
      "📱 Comunicação oficial via grupo de WhatsApp.",
    ],
  },
];

const dataUltimaAtualizacao = "12/07/2025";

export default function EstatutoPage() {
  const [aberto, setAberto] = useState<number | null>(0);

  const handleDownload = () => {
    alert(
      "Função de download do PDF ainda não implementada.\n(Em breve você poderá baixar o estatuto completo!)"
    );
  };

  return (
    <>
      <Head>
        <title>Estatuto | Sobre Nós | Fut7Pro</title>
        <meta
          name="description"
          content="Conheça o estatuto oficial do Fut7Pro: regras de pontuação, multas, penalidades, mensalistas, reservas e muito mais. Baixe o PDF e consulte sempre que precisar."
        />
        <meta
          name="keywords"
          content="estatuto, regras do racha, pontuação, multas, penalidades, comportamento, mensalistas, reservas, futebol 7, fut7pro"
        />
      </Head>

      <main className="max-w-3xl mx-auto px-4 pt-20 flex flex-col gap-8">
        <section>
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">
            Estatuto do Racha Fut7Pro
          </h1>
          <p className="text-white text-base md:text-lg mb-4">
            O Estatuto reúne todas as regras, critérios e boas práticas que regem o funcionamento do
            nosso racha. Consulte, tire dúvidas e ajude a manter a ordem e o espírito esportivo!
          </p>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl hover:brightness-110 transition mb-4"
          >
            <FaDownload /> Baixar PDF do Estatuto
          </button>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-yellow-300 mb-4">
            Perguntas Frequentes do Estatuto (FAQ)
          </h2>
          <div className="flex flex-col gap-3">
            {estatutoTópicos.map((topico, idx) => (
              <div key={idx} className="bg-neutral-900 rounded-xl shadow-md overflow-hidden">
                <button
                  className={`flex justify-between items-center w-full px-5 py-4 text-left focus:outline-none transition ${
                    aberto === idx ? "bg-yellow-400 text-black" : "text-yellow-300"
                  }`}
                  aria-expanded={aberto === idx}
                  onClick={() => setAberto(aberto === idx ? null : idx)}
                >
                  <span className="flex items-center gap-2 text-lg font-semibold">
                    {topico.titulo}
                    {topico.atualizado && (
                      <span className="ml-2 text-xs bg-white text-yellow-500 font-bold px-2 py-0.5 rounded">
                        NOVA
                      </span>
                    )}
                  </span>
                  <FaChevronDown
                    className={`transition-transform duration-200 ${aberto === idx ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 px-5 ${
                    aberto === idx ? "max-h-[1500px] py-3 opacity-100" : "max-h-0 py-0 opacity-0"
                  } overflow-hidden bg-neutral-800 text-neutral-200 text-base`}
                >
                  <ul className="list-disc pl-5 flex flex-col gap-2">
                    {topico.conteudo.map((linha, liIdx) => (
                      <li key={liIdx}>{linha}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="mt-2 text-right text-neutral-400 text-xs">
          Última atualização: {dataUltimaAtualizacao}
        </section>
      </main>
    </>
  );
}
