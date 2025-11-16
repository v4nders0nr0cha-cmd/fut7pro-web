const tsParser = require("@typescript-eslint/parser");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "coverage/**",
      "**/*.d.ts",
      "**/*.map",
      "jest.setup.js",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          name: "@/components/cards/TorneioCard",
          message: "Componente removido; use dados reais ou hooks de torneios.",
        },
        {
          name: "@/components/lists/ConquistasDoAtleta",
          message: "Use o componente oficial em '@/components/atletas/ConquistasDoAtleta'.",
        },
        {
          name: "@/components/lists/mockCampeoesAno",
          message: "Mocks de campeões foram removidos. Consuma o backend real.",
        },
        {
          name: "@/components/lists/mockMelhoresPorPosicao",
          message: "Mocks de rankings foram eliminados. Utilize hooks/requisições reais.",
        },
        {
          name: "@/components/lists/mockQuadrimestres",
          message: "Quadros quadrimestrais devem vir do backend.",
        },
        {
          name: "@/components/lists/mockRankingQuadrimestral",
          message: "Ranking quadrimestral mockado não é mais permitido.",
        },
        {
          name: "@/components/lists/mockRankingsAnuais",
          message: "Ranking anual deve ser carregado via API.",
        },
        {
          name: "@/components/lists/mockRankingsPorQuadrimestre",
          message: "Dados quadrimestrais precisam vir do backend.",
        },
        {
          name: "@/components/lists/mockJogadores",
          message: "Jogadores mockados foram removidos; use useJogadores/usePublicAthletes.",
        },
        {
          name: "@/components/lists/mockNotificacoes",
          message: "Lista de notificações deve usar os hooks de notificações.",
        },
        {
          name: "@/config/rachaMap",
          message: "O mapa de rachas mockado foi removido. Utilize tenantSlug real/contexto.",
        },
        {
          name: "@/components/lists/mockSuporte",
          message: "Use useContactMessages + backend real no lugar dos mocks de suporte.",
        },
        {
          name: "@/components/lists/mockUsuarioLogado",
          message: "O perfil logado deve vir de /api/admin/atletas/me.",
        },
      ],
    },
  },
];
