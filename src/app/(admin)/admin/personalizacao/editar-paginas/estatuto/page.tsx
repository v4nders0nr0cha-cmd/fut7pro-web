"use client";

import Head from "next/head";
import { useState, type ChangeEvent } from "react";
import { FaChevronDown, FaTrash, FaPlus, FaArrowUp, FaArrowDown } from "react-icons/fa";

// --- Tipagem ---
type TituloTópico =
  | "Critérios de Pontuação"
  | "Multas"
  | "Comportamento"
  | "Penalidades"
  | "Definição de Mensalistas, Diaristas, Reservas e Critérios para Participação"
  | "Organização do Racha"
  | "Outros Pontos Importantes"
  | string;

interface EstatutoTopico {
  titulo: TituloTópico;
  atualizado?: boolean;
  conteudo: string[];
}

const TOPICOS_PADRAO: EstatutoTopico[] = [
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

const DATA_ULTIMA_ATUALIZACAO = "12/07/2025";
const MAX_TOPICOS = 8;

export default function EditarEstatutoAdmin() {
  const [topicos, setTopicos] = useState<EstatutoTopico[]>(TOPICOS_PADRAO);
  const [aberto, setAberto] = useState<number | null>(0);

  // Cria novo tópico
  const adicionarTopico = () => {
    if (topicos.length >= MAX_TOPICOS) return;
    setTopicos([...topicos, { titulo: "Novo Tópico", conteudo: [""] }]);
    setAberto(topicos.length); // abre o novo
  };

  // Remove tópico
  const removerTopico = (idx: number) => {
    if (topicos.length <= 1) return;
    const novos = topicos.filter((_, i) => i !== idx);
    setTopicos(novos);
    setAberto(null);
  };

  // Move tópico para cima/baixo
  const moverTopico = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= topicos.length) return;
    const newTopicos = [...topicos];
    const [moved] = newTopicos.splice(fromIdx, 1);
    if (moved) {
      newTopicos.splice(toIdx, 0, moved);
      setTopicos(newTopicos);
      setAberto(toIdx);
    }
  };

  // Altera o título
  const alterarTitulo = (idx: number, valor: string) => {
    setTopicos(topicos.map((t, i) => (i === idx ? { ...t, titulo: valor } : t)));
  };

  // Adiciona linha no conteúdo
  const adicionarLinha = (idx: number) => {
    setTopicos(topicos.map((t, i) => (i === idx ? { ...t, conteudo: [...t.conteudo, ""] } : t)));
  };

  // Remove linha do conteúdo
  const removerLinha = (tIdx: number, lIdx: number) => {
    setTopicos(
      topicos.map((t, i) =>
        i === tIdx ? { ...t, conteudo: t.conteudo.filter((_, j) => j !== lIdx) } : t
      )
    );
  };

  // Altera linha do conteúdo
  const alterarLinha = (tIdx: number, lIdx: number, valor: string) => {
    setTopicos(
      topicos.map((t, i) =>
        i === tIdx
          ? { ...t, conteudo: t.conteudo.map((linha, j) => (j === lIdx ? valor : linha)) }
          : t
      )
    );
  };

  // Salvar (futura integração backend)
  const handleSalvar = () => {
    alert("Estatuto salvo! (implementar integração real futuramente)");
  };

  return (
    <>
      <Head>
        <title>Editar Estatuto | Admin | Fut7Pro</title>
        <meta
          name="description"
          content="Painel administrativo para editar o estatuto do racha, regras, critérios de pontuação, multas, penalidades e organização. Personalize conforme seu grupo."
        />
        <meta
          name="keywords"
          content="admin estatuto, regras racha, painel administração, editar estatuto, fut7pro, futebol 7"
        />
      </Head>
      <main className="max-w-3xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8 flex flex-col gap-8">
        <section>
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">Editar Estatuto</h1>
          <p className="text-white text-base md:text-lg mb-4">
            Gerencie as regras oficiais, critérios e perguntas frequentes do seu racha de forma
            simples, rápida e segura.
            <br />
            <span className="text-yellow-300 text-sm font-semibold block mt-2">
              Os tópicos abaixo já são padrões em praticamente todo racha. Você pode organizar,
              remover, renomear ou criar outros tópicos de acordo com a necessidade. Máximo de{" "}
              {MAX_TOPICOS} tópicos.
            </span>
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-yellow-300">Tópicos do Estatuto</h2>
            <button
              className={`ml-2 px-3 py-2 rounded-md text-sm flex items-center gap-1 font-bold border-2 border-yellow-400 ${topicos.length >= MAX_TOPICOS ? "opacity-40 cursor-not-allowed" : "bg-yellow-400 text-black hover:brightness-110"}`}
              onClick={adicionarTopico}
              disabled={topicos.length >= MAX_TOPICOS}
            >
              <FaPlus /> Novo Tópico
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {topicos.map((topico, idx) => (
              <div
                key={idx}
                className="bg-neutral-900 rounded-xl shadow-md overflow-hidden border border-neutral-700"
              >
                {/* Accordion */}
                <button
                  className={`flex justify-between items-center w-full px-5 py-4 text-left focus:outline-none transition ${aberto === idx ? "bg-yellow-400 text-black" : "text-yellow-300"}`}
                  aria-expanded={aberto === idx}
                  onClick={() => setAberto(aberto === idx ? null : idx)}
                  type="button"
                >
                  <span className="flex items-center gap-2 text-lg font-semibold">
                    <input
                      className={`font-bold bg-transparent outline-none border-0 border-b-2 border-dashed border-yellow-400 text-lg w-full px-1 ${aberto === idx ? "text-black" : "text-yellow-300"}`}
                      value={topico.titulo}
                      onChange={(e) => alterarTitulo(idx, e.target.value)}
                      maxLength={60}
                      title="Título do tópico"
                    />
                    {topico.atualizado && (
                      <span className="ml-2 text-xs bg-white text-yellow-500 font-bold px-2 py-0.5 rounded">
                        NOVA
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-2">
                    {/* Move up/down */}
                    <button
                      title="Mover para cima"
                      type="button"
                      className={`p-1 rounded-full ${idx === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-yellow-200 text-yellow-700"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        moverTopico(idx, idx - 1);
                      }}
                      disabled={idx === 0}
                      tabIndex={-1}
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      title="Mover para baixo"
                      type="button"
                      className={`p-1 rounded-full ${idx === topicos.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-yellow-200 text-yellow-700"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        moverTopico(idx, idx + 1);
                      }}
                      disabled={idx === topicos.length - 1}
                      tabIndex={-1}
                    >
                      <FaArrowDown />
                    </button>
                    {/* Remover tópico */}
                    <button
                      title="Excluir tópico"
                      type="button"
                      className={`p-1 ml-2 rounded-full hover:bg-red-600 text-red-400`}
                      onClick={(e) => {
                        e.stopPropagation();
                        removerTopico(idx);
                      }}
                      disabled={topicos.length <= 1}
                      tabIndex={-1}
                    >
                      <FaTrash />
                    </button>
                    <FaChevronDown
                      className={`ml-3 transition-transform duration-200 ${aberto === idx ? "rotate-180" : ""}`}
                    />
                  </span>
                </button>
                {/* Conteúdo do tópico */}
                <div
                  className={`transition-all duration-300 px-5 ${aberto === idx ? "max-h-[3000px] py-4 opacity-100" : "max-h-0 py-0 opacity-0"} overflow-hidden bg-neutral-800 text-neutral-200 text-base`}
                >
                  <ul className="flex flex-col gap-2">
                    {topico.conteudo.map((linha, lIdx) => (
                      <li key={lIdx} className="flex items-center gap-2">
                        <textarea
                          className="bg-neutral-900 text-white rounded-lg p-2 w-full border border-neutral-700 focus:border-yellow-400 text-base min-h-[36px] resize-y"
                          value={linha}
                          maxLength={200}
                          onChange={(e) => alterarLinha(idx, lIdx, e.target.value)}
                        />
                        {/* Remover linha */}
                        {topico.conteudo.length > 1 && (
                          <button
                            title="Excluir linha"
                            type="button"
                            className="p-1 rounded-full hover:bg-red-600 text-red-400"
                            onClick={() => removerLinha(idx, lIdx)}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {/* Adicionar linha */}
                  <button
                    className="mt-3 px-3 py-1 bg-yellow-400 text-black rounded font-bold text-sm flex items-center gap-1"
                    onClick={() => adicionarLinha(idx)}
                    disabled={topico.conteudo.length >= 12}
                    type="button"
                  >
                    <FaPlus /> Nova Linha
                  </button>
                  {/* Orientação para emojis */}
                  <div className="text-xs text-neutral-400 mt-3">
                    Dica: você pode colar emojis na frente de cada linha. Recomendo sites como{" "}
                    <a
                      href="https://emojipedia.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-yellow-300"
                    >
                      emojipedia.org
                    </a>{" "}
                    ou{" "}
                    <a
                      href="https://www.copyandpasteemoji.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-yellow-300"
                    >
                      copyandpasteemoji.com
                    </a>
                    .
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Última atualização */}
        <section className="mt-2 text-right text-neutral-400 text-xs">
          Última atualização: {DATA_ULTIMA_ATUALIZACAO}
        </section>

        <div className="flex justify-end mt-6">
          <button
            className="flex items-center gap-2 bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl hover:brightness-110 transition shadow-lg"
            onClick={handleSalvar}
            type="button"
          >
            Salvar Alterações
          </button>
        </div>
      </main>
    </>
  );
}
