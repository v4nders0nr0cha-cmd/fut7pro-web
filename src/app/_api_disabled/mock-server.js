// Servidor mockado simples para substituir o backend problemático
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Dados mockados para desenvolvimento
const mockData = {
  // Tenant padrão
  tenant: {
    id: 'default',
    name: 'Fut7Pro',
    slug: 'fut7pro'
  },

  // Times (4 times)
  teams: [
    {
      id: 'team-1',
      name: 'Flamengo',
      logo: '/images/logos/flamengo.png',
      color: '#e63946',
      players: ['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6', 'player-7']
    },
    {
      id: 'team-2', 
      name: 'Palmeiras',
      logo: '/images/logos/palmeiras.png',
      color: '#006400',
      players: ['player-8', 'player-9', 'player-10', 'player-11', 'player-12', 'player-13', 'player-14']
    },
    {
      id: 'team-3',
      name: 'São Paulo',
      logo: '/images/logos/sao-paulo.png', 
      color: '#ff0000',
      players: ['player-15', 'player-16', 'player-17', 'player-18', 'player-19', 'player-20', 'player-21']
    },
    {
      id: 'team-4',
      name: 'Santos',
      logo: '/images/logos/santos.png',
      color: '#000000',
      players: ['player-22', 'player-23', 'player-24', 'player-25', 'player-26', 'player-27', 'player-28']
    }
  ],

  // Jogadores (28 jogadores)
  players: [
    { id: 'player-1', name: 'João Silva', position: 'Atacante', teamId: 'team-1' },
    { id: 'player-2', name: 'Pedro Santos', position: 'Meio-campo', teamId: 'team-1' },
    { id: 'player-3', name: 'Carlos Lima', position: 'Defensor', teamId: 'team-1' },
    { id: 'player-4', name: 'Miguel Costa', position: 'Goleiro', teamId: 'team-1' },
    { id: 'player-5', name: 'André Oliveira', position: 'Atacante', teamId: 'team-1' },
    { id: 'player-6', name: 'Rafael Pereira', position: 'Meio-campo', teamId: 'team-1' },
    { id: 'player-7', name: 'Lucas Ferreira', position: 'Defensor', teamId: 'team-1' },
    
    { id: 'player-8', name: 'Diego Alves', position: 'Atacante', teamId: 'team-2' },
    { id: 'player-9', name: 'Bruno Martins', position: 'Meio-campo', teamId: 'team-2' },
    { id: 'player-10', name: 'Felipe Souza', position: 'Defensor', teamId: 'team-2' },
    { id: 'player-11', name: 'Gabriel Rocha', position: 'Goleiro', teamId: 'team-2' },
    { id: 'player-12', name: 'Henrique Nunes', position: 'Atacante', teamId: 'team-2' },
    { id: 'player-13', name: 'Igor Cardoso', position: 'Meio-campo', teamId: 'team-2' },
    { id: 'player-14', name: 'Jorge Mendes', position: 'Defensor', teamId: 'team-2' },
    
    { id: 'player-15', name: 'Kleber Silva', position: 'Atacante', teamId: 'team-3' },
    { id: 'player-16', name: 'Leonardo Costa', position: 'Meio-campo', teamId: 'team-3' },
    { id: 'player-17', name: 'Marcelo Santos', position: 'Defensor', teamId: 'team-3' },
    { id: 'player-18', name: 'Nelson Lima', position: 'Goleiro', teamId: 'team-3' },
    { id: 'player-19', name: 'Oscar Pereira', position: 'Atacante', teamId: 'team-3' },
    { id: 'player-20', name: 'Paulo Ferreira', position: 'Meio-campo', teamId: 'team-3' },
    { id: 'player-21', name: 'Quincy Alves', position: 'Defensor', teamId: 'team-3' },
    
    { id: 'player-22', name: 'Roberto Martins', position: 'Atacante', teamId: 'team-4' },
    { id: 'player-23', name: 'Sérgio Souza', position: 'Meio-campo', teamId: 'team-4' },
    { id: 'player-24', name: 'Thiago Rocha', position: 'Defensor', teamId: 'team-4' },
    { id: 'player-25', name: 'Ulisses Nunes', position: 'Goleiro', teamId: 'team-4' },
    { id: 'player-26', name: 'Victor Cardoso', position: 'Atacante', teamId: 'team-4' },
    { id: 'player-27', name: 'Wagner Mendes', position: 'Meio-campo', teamId: 'team-4' },
    { id: 'player-28', name: 'Xavier Silva', position: 'Defensor', teamId: 'team-4' }
  ],

  // Partidas (8 rodadas = 24 partidas + 1 futuro)
  matches: [
    // Rodada 1
    { id: 'match-1', round: 1, homeTeam: 'team-1', awayTeam: 'team-2', homeScore: 2, awayScore: 1, date: '2025-01-15', status: 'finished' },
    { id: 'match-2', round: 1, homeTeam: 'team-3', awayTeam: 'team-4', homeScore: 0, awayScore: 0, date: '2025-01-15', status: 'finished' },
    { id: 'match-3', round: 1, homeTeam: 'team-1', awayTeam: 'team-3', homeScore: 3, awayScore: 2, date: '2025-01-16', status: 'finished' },
    
    // Rodada 2
    { id: 'match-4', round: 2, homeTeam: 'team-2', awayTeam: 'team-4', homeScore: 1, awayScore: 1, date: '2025-01-17', status: 'finished' },
    { id: 'match-5', round: 2, homeTeam: 'team-1', awayTeam: 'team-4', homeScore: 2, awayScore: 0, date: '2025-01-18', status: 'finished' },
    { id: 'match-6', round: 2, homeTeam: 'team-2', awayTeam: 'team-3', homeScore: 0, awayScore: 2, date: '2025-01-19', status: 'finished' },
    
    // Rodada 3
    { id: 'match-7', round: 3, homeTeam: 'team-3', awayTeam: 'team-1', homeScore: 1, awayScore: 1, date: '2025-01-20', status: 'finished' },
    { id: 'match-8', round: 3, homeTeam: 'team-4', awayTeam: 'team-2', homeScore: 2, awayScore: 3, date: '2025-01-21', status: 'finished' },
    { id: 'match-9', round: 3, homeTeam: 'team-4', awayTeam: 'team-1', homeScore: 0, awayScore: 1, date: '2025-01-22', status: 'finished' },
    
    // Rodada 4
    { id: 'match-10', round: 4, homeTeam: 'team-2', awayTeam: 'team-1', homeScore: 2, awayScore: 2, date: '2025-01-23', status: 'finished' },
    { id: 'match-11', round: 4, homeTeam: 'team-4', awayTeam: 'team-3', homeScore: 1, awayScore: 0, date: '2025-01-24', status: 'finished' },
    { id: 'match-12', round: 4, homeTeam: 'team-3', awayTeam: 'team-1', homeScore: 3, awayScore: 1, date: '2025-01-25', status: 'finished' },
    
    // Rodada 5
    { id: 'match-13', round: 5, homeTeam: 'team-4', awayTeam: 'team-2', homeScore: 0, awayScore: 2, date: '2025-01-26', status: 'finished' },
    { id: 'match-14', round: 5, homeTeam: 'team-1', awayTeam: 'team-4', homeScore: 4, awayScore: 0, date: '2025-01-27', status: 'finished' },
    { id: 'match-15', round: 5, homeTeam: 'team-3', awayTeam: 'team-2', homeScore: 1, awayScore: 1, date: '2025-01-28', status: 'finished' },
    
    // Rodada 6
    { id: 'match-16', round: 6, homeTeam: 'team-1', awayTeam: 'team-3', homeScore: 2, awayScore: 0, date: '2025-01-29', status: 'finished' },
    { id: 'match-17', round: 6, homeTeam: 'team-2', awayTeam: 'team-4', homeScore: 3, awayScore: 1, date: '2025-01-30', status: 'finished' },
    { id: 'match-18', round: 6, homeTeam: 'team-1', awayTeam: 'team-2', homeScore: 1, awayScore: 0, date: '2025-01-31', status: 'finished' },
    
    // Rodada 7
    { id: 'match-19', round: 7, homeTeam: 'team-4', awayTeam: 'team-3', homeScore: 2, awayScore: 2, date: '2025-02-01', status: 'finished' },
    { id: 'match-20', round: 7, homeTeam: 'team-2', awayTeam: 'team-1', homeScore: 0, awayScore: 3, date: '2025-02-02', status: 'finished' },
    { id: 'match-21', round: 7, homeTeam: 'team-3', awayTeam: 'team-4', homeScore: 1, awayScore: 1, date: '2025-02-03', status: 'finished' },
    
    // Rodada 8
    { id: 'match-22', round: 8, homeTeam: 'team-1', awayTeam: 'team-4', homeScore: 3, awayScore: 0, date: '2025-02-04', status: 'finished' },
    { id: 'match-23', round: 8, homeTeam: 'team-2', awayTeam: 'team-3', homeScore: 2, awayScore: 1, date: '2025-02-05', status: 'finished' },
    { id: 'match-24', round: 8, homeTeam: 'team-4', awayTeam: 'team-1', homeScore: 0, awayScore: 2, date: '2025-02-06', status: 'finished' },
    
    // Jogo futuro (próxima rodada)
    { id: 'match-25', round: 9, homeTeam: 'team-1', awayTeam: 'team-3', homeScore: null, awayScore: null, date: '2025-02-07', status: 'scheduled' }
  ],

  // Rankings
  rankings: [
    { id: 'rank-1', playerId: 'player-1', teamId: 'team-1', goals: 8, assists: 3, points: 19, position: 1 },
    { id: 'rank-2', playerId: 'player-8', teamId: 'team-2', goals: 7, assists: 4, points: 18, position: 2 },
    { id: 'rank-3', playerId: 'player-15', teamId: 'team-3', goals: 6, assists: 5, points: 17, position: 3 },
    { id: 'rank-4', playerId: 'player-22', teamId: 'team-4', goals: 5, assists: 6, points: 16, position: 4 },
    { id: 'rank-5', playerId: 'player-2', teamId: 'team-1', goals: 4, assists: 7, points: 15, position: 5 }
  ],

  // Rankings de times
  teamRankings: [
    { id: 'tr-1', teamId: 'team-1', points: 25, games: 8, wins: 7, draws: 1, losses: 0, position: 1, goalsFor: 20, goalsAgainst: 8, goalDifference: 12 },
    { id: 'tr-2', teamId: 'team-3', points: 18, games: 8, wins: 5, draws: 3, losses: 0, position: 2, goalsFor: 15, goalsAgainst: 10, goalDifference: 5 },
    { id: 'tr-3', teamId: 'team-2', points: 15, games: 8, wins: 4, draws: 3, losses: 1, position: 3, goalsFor: 12, goalsAgainst: 11, goalDifference: 1 },
    { id: 'tr-4', teamId: 'team-4', points: 8, games: 8, wins: 2, draws: 2, losses: 4, position: 4, goalsFor: 8, goalsAgainst: 16, goalDifference: -8 }
  ]
};

// Rotas da API
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware para injetar tenant padrão
app.use((req, res, next) => {
  req.tenantSlug = 'default';
  next();
});

// API de times
app.get('/teams', (req, res) => {
  res.json(mockData.teams);
});

app.get('/teams/:id', (req, res) => {
  const team = mockData.teams.find(t => t.id === req.params.id);
  if (!team) return res.status(404).json({ error: 'Time não encontrado' });
  res.json(team);
});

// API de jogadores
app.get('/players', (req, res) => {
  res.json(mockData.players);
});

app.get('/players/:id', (req, res) => {
  const player = mockData.players.find(p => p.id === req.params.id);
  if (!player) return res.status(404).json({ error: 'Jogador não encontrado' });
  res.json(player);
});

// API de partidas
app.get('/matches', (req, res) => {
  res.json(mockData.matches);
});

app.get('/matches/:id', (req, res) => {
  const match = mockData.matches.find(m => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Partida não encontrada' });
  res.json(match);
});

// API de rankings
app.get('/rankings', (req, res) => {
  res.json(mockData.rankings);
});

// API de rankings de times
app.get('/team-rankings', (req, res) => {
  res.json(mockData.teamRankings);
});

// API de tenant
app.get('/tenant', (req, res) => {
  res.json(mockData.tenant);
});

// Rota padrão
app.get('*', (req, res) => {
  res.json({ 
    message: 'API Mockada Fut7Pro',
    endpoints: [
      '/health',
      '/teams',
      '/players', 
      '/matches',
      '/rankings',
      '/team-rankings',
      '/tenant'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor mockado rodando em http://localhost:${PORT}`);
  console.log(`🎯 Tenant: ${mockData.tenant.name}`);
  console.log(`⚽ Times: ${mockData.teams.length}`);
  console.log(`👥 Jogadores: ${mockData.players.length}`);
  console.log(`🏆 Partidas: ${mockData.matches.length}`);
});
