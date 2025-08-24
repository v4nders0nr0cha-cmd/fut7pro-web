export default function DemoFeatures() {
  const features = [
    {
      icon: '⚽',
      title: 'Gestão de Partidas',
      description: 'Crie, edite e acompanhe partidas com placares em tempo real',
      demo: '/demo/site/partidas'
    },
    {
      icon: '🏟️',
      title: 'Formação de Times',
      description: 'Sistema inteligente de sorteio com balanceamento automático',
      demo: '/demo/site/times'
    },
    {
      icon: '📊',
      title: 'Rankings e Estatísticas',
      description: 'Visualize classificações, gols, assistências e performance',
      demo: '/demo/site/rankings'
    },
    {
      icon: '👤',
      title: 'Gestão de Jogadores',
      description: 'Cadastre jogadores com posições e sistema de estrelas',
      demo: '/demo/site/jogadores'
    },
    {
      icon: '🏆',
      title: 'Sistema de Campeonatos',
      description: 'Organize torneios com rodadas e sistema de repetente',
      demo: '/demo/site/campeoes'
    },
    {
      icon: '📱',
      title: 'Compartilhamento',
      description: 'Envie resultados via WhatsApp e redes sociais',
      demo: '/demo/site/compartilhar'
    }
  ];

  return (
    <section className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Funcionalidades Principais
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore todas as funcionalidades do Fut7Pro através da nossa demo interativa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-700 rounded-xl p-6 hover:bg-gray-600 transition-colors">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300 mb-4">{feature.description}</p>
              <a 
                href={feature.demo}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Testar Demo
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6 inline-block">
            <p className="text-blue-200 text-sm">
              💡 Clique em qualquer funcionalidade acima para testar a demo completa. 
              Todas as funcionalidades estão disponíveis para experimentação.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
