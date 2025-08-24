export default function DemoStats() {
  const stats = [
    {
      number: '28',
      label: 'Jogadores Ativos',
      description: 'Distribuídos em 4 times equilibrados',
      color: 'text-blue-400'
    },
    {
      number: '8',
      label: 'Rodadas Completas',
      description: 'Sistema de repetente rotativo',
      color: 'text-green-400'
    },
    {
      number: '24',
      label: 'Partidas Jogadas',
      description: '3 partidas por rodada',
      color: 'text-yellow-400'
    },
    {
      number: '4',
      label: 'Times Ativos',
      description: 'Hawks, Panthers, Wolves, Trovão',
      color: 'text-purple-400'
    }
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Números da Demo
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Dados realistas para demonstrar o potencial completo do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-5xl md:text-6xl font-bold mb-4 ${stat.color}`}>
                {stat.number}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{stat.label}</h3>
              <p className="text-gray-400 text-sm">{stat.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gray-800 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            🎯 Sistema de Repetente Rotativo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🔄</div>
              <h4 className="text-lg font-semibold text-white mb-2">Rotação Automática</h4>
              <p className="text-gray-300">Cada rodada tem um time repetente diferente</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚖️</div>
              <h4 className="text-lg font-semibold text-white mb-2">Equilíbrio Garantido</h4>
              <p className="text-gray-300">Todos os times jogam o mesmo número de partidas</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="text-lg font-semibold text-white mb-2">Rankings Justos</h4>
              <p className="text-gray-300">Classificação baseada em mérito real</p>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <p className="text-blue-200 text-sm text-center">
              💡 O sistema de repetente rotativo é uma inovação exclusiva do Fut7Pro que garante 
              que todos os times tenham oportunidades iguais, criando rankings mais justos e 
              competitivos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
