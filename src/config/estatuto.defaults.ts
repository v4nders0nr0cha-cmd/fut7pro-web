import type { EstatutoTopico, EstatutoData } from "@/types/estatuto";

export const ESTATUTO_FALLBACK_ATUALIZADO_EM = "2025-07-12";

export const ESTATUTO_TOPICOS_PADRAO: EstatutoTopico[] = [
  {
    id: "criterios-pontuacao",
    titulo: "Critérios de Pontuação",
    atualizado: true,
    conteudo: [
      "Gol marcado conta para o ranking de artilharia, sem pontos extras.",
      "Assistência conta para o ranking de assistências, sem pontos extras.",
      "Vitória na partida: 3 pontos para cada jogador do time vencedor.",
      "Empate: 1 ponto para cada jogador.",
      "Derrota: 0 pontos.",
      "Cartão amarelo: não remove pontos.",
      "Cartão vermelho: não remove pontos, mas pode gerar suspensão temporária.",
      "Goleiro segue o mesmo critério, soma 3 pontos por vitória.",
      "Somente registros oficiais contam para pontos, gols e assistências.",
    ],
  },
  {
    id: "multas",
    titulo: "Multas",
    atualizado: true,
    conteudo: [
      "Multas podem ser aplicadas a mensalistas ou diaristas que faltarem sem aviso após confirmar presença.",
      "Mensalista sem justificativa pode ser multado, perder prioridade ou ser suspenso.",
      "Diarista que confirmar e faltar pode ser multado e ir para o fim da lista de espera.",
      "O valor da multa é definido pelo admin e pode variar por frequência e reincidência.",
      "Exceções podem ser analisadas pelo admin (motivos médicos ou imprevistos graves).",
      "O objetivo das multas é evitar prejuízo coletivo e garantir comprometimento.",
    ],
  },
  {
    id: "comportamento",
    titulo: "Comportamento",
    conteudo: [
      "Respeito absoluto: ofensas, racismo ou discriminação não são tolerados.",
      "O espírito esportivo deve prevalecer sempre entre jogadores e arbitragem.",
      "Atrasos ou faltas recorrentes podem gerar advertência, multa ou suspensão.",
      "Confraternizações são bem-vindas, mas não obrigatórias.",
    ],
  },
  {
    id: "penalidades",
    titulo: "Penalidades",
    conteudo: [
      "Cartão amarelo: suspensão de 3 minutos fora durante a partida.",
      "Cartão vermelho: suspensão automática da partida (ou mais, conforme gravidade).",
      "Condutas antidesportivas graves podem resultar em exclusão permanente.",
      "Atrasos podem colocar o atleta na lista de espera ou substituí-lo por reservas.",
    ],
  },
  {
    id: "mensalistas-diaristas-reservas",
    titulo: "Mensalistas, Diaristas e Reservas",
    conteudo: [
      "Mensalista: contribui mensalmente e tem vaga garantida nas partidas.",
      "Diarista: paga por jogo e ocupa vagas remanescentes após mensalistas.",
      "Lista de espera: usada em caso de ausência ou desistência, por ordem de inscrição.",
      "Convidado: chamado apenas para completar times; não soma pontos anuais.",
      "Prioridade: Mensalista > Diarista > Lista de Espera > Convidado.",
      "Vagas remanescentes são definidas pela ordem da chamada oficial.",
      "Entrada de novos jogadores depende de aprovação dos admins e do grupo.",
    ],
  },
  {
    id: "organizacao-do-racha",
    titulo: "Organização do Racha",
    conteudo: [
      "Admins cuidam da gestão diária, convites, organização dos jogos e mediação de conflitos.",
      "Admins podem ser substituídos por decisão coletiva se não cumprirem suas funções.",
      "Sugestões de regras e melhorias no estatuto são bem-vindas a qualquer momento.",
    ],
  },
  {
    id: "outros-pontos-importantes",
    titulo: "Outros Pontos Importantes",
    conteudo: [
      "Reserva do campo é responsabilidade dos admins, mas a colaboração é sempre bem-vinda.",
      "Carona e logística são combinadas pelo canal oficial do racha.",
      "Comunicação oficial ocorre nos canais autorizados pelo admin.",
    ],
  },
];

export const ESTATUTO_FALLBACK: EstatutoData = {
  atualizadoEm: ESTATUTO_FALLBACK_ATUALIZADO_EM,
  pdfUrl: null,
  topicos: ESTATUTO_TOPICOS_PADRAO,
};
