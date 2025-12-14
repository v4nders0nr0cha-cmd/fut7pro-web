import type { EstatutoTopico, EstatutoData } from "@/types/estatuto";

export const ESTATUTO_FALLBACK_ATUALIZADO_EM = "2025-07-12";

export const ESTATUTO_TOPICOS_PADRAO: EstatutoTopico[] = [
  {
    titulo: "Criterios de Pontuacao",
    atualizado: true,
    conteudo: [
      "Gol marcado conta para o ranking de artilharia, sem pontos extras.",
      "Assistencia conta para o ranking de assistencias, sem pontos extras.",
      "Vitoria na partida: 3 pontos para cada jogador do time vencedor.",
      "Empate: 1 ponto para cada jogador.",
      "Derrota: 0 pontos.",
      "Cartao amarelo: nao remove pontos.",
      "Cartao vermelho: nao remove pontos, mas pode gerar suspensao temporaria.",
      "Goleiro segue o mesmo criterio, soma 3 pontos por vitoria.",
      "Somente registros oficiais contam para pontos, gols e assistencias.",
    ],
  },
  {
    titulo: "Multas",
    atualizado: true,
    conteudo: [
      "Multas podem ser aplicadas a mensalistas ou diaristas que faltarem sem aviso apos confirmar presenca.",
      "Mensalista sem justificativa pode ser multado, perder prioridade ou ser suspenso.",
      "Diarista que confirmar e faltar pode ser multado e ir para o fim da lista de espera.",
      "O valor da multa e definido pelo admin e pode variar por frequencia e reincidencia.",
      "Excecoes podem ser analisadas pelo admin (motivos medicos ou imprevistos graves).",
      "O objetivo das multas e evitar prejuizo coletivo e garantir comprometimento.",
    ],
  },
  {
    titulo: "Comportamento",
    conteudo: [
      "Respeito absoluto: ofensas, racismo ou discriminacao nao sao tolerados.",
      "O espirito esportivo deve prevalecer sempre entre jogadores e arbitragem.",
      "Atrasos ou faltas recorrentes podem gerar advertencia, multa ou suspensao.",
      "Confraternizacoes sao bem-vindas, mas nao obrigatorias.",
    ],
  },
  {
    titulo: "Penalidades",
    conteudo: [
      "Cartao amarelo: suspensao de 3 minutos fora durante a partida.",
      "Cartao vermelho: suspensao automatica da partida (ou mais, conforme gravidade).",
      "Condutas antidesportivas graves podem resultar em exclusao permanente.",
      "Atrasos podem colocar o atleta na lista de espera ou substitui-lo por reservas.",
    ],
  },
  {
    titulo: "Mensalistas, Diaristas e Reservas",
    conteudo: [
      "Mensalista: contribui mensalmente e tem vaga garantida nas partidas.",
      "Diarista: paga por jogo e ocupa vagas remanescentes apos mensalistas.",
      "Lista de espera: usada em caso de ausencia ou desistencia, por ordem de inscricao.",
      "Convidado: chamado apenas para completar times; nao soma pontos anuais.",
      "Prioridade: Mensalista > Diarista > Lista de Espera > Convidado.",
      "Vagas remanescentes sao definidas pela ordem da chamada oficial.",
      "Entrada de novos jogadores depende de aprovacao dos admins e do grupo.",
    ],
  },
  {
    titulo: "Organizacao do Racha",
    conteudo: [
      "Admins cuidam da gestao diaria, convites, organizacao dos jogos e mediacao de conflitos.",
      "Admins podem ser substituidos por decisao coletiva se nao cumprirem suas funcoes.",
      "Sugestoes de regras e melhorias no estatuto sao bem-vindas a qualquer momento.",
    ],
  },
  {
    titulo: "Outros Pontos Importantes",
    conteudo: [
      "Reserva do campo e responsabilidade dos admins, mas a colaboracao e sempre bem-vinda.",
      "Carona e logistica sao combinadas pelo canal oficial do racha.",
      "Comunicacao oficial ocorre nos canais autorizados pelo admin.",
    ],
  },
];

export const ESTATUTO_FALLBACK: EstatutoData = {
  atualizadoEm: ESTATUTO_FALLBACK_ATUALIZADO_EM,
  pdfUrl: null,
  topicos: ESTATUTO_TOPICOS_PADRAO,
};
