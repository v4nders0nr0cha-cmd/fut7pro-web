import Link from 'next/link';

export default function DemoCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Pronto para Começar?
        </h2>
        
        <p className="text-xl text-blue-200 mb-12 max-w-3xl mx-auto">
          A demo do Fut7Pro mostra apenas uma parte do que é possível. 
          Experimente o sistema completo com todas as funcionalidades avançadas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-semibold text-white mb-4">Teste Grátis</h3>
            <p className="text-blue-200 mb-6">
              Comece com 7 dias grátis e teste todas as funcionalidades sem compromisso
            </p>
            <Link 
              href="/teste-gratis"
              className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              🚀 Começar Teste Grátis
            </Link>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-2xl font-semibold text-white mb-4">Fale Conosco</h3>
            <p className="text-blue-200 mb-6">
              Tem dúvidas? Nossa equipe está pronta para ajudar e tirar todas as suas dúvidas
            </p>
            <Link 
              href="/contato"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              📞 Falar com Especialista
            </Link>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6">
            🎮 Continue Explorando a Demo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Link 
              href="/demo/site/times"
              className="bg-white/20 hover:bg-white/30 rounded-lg p-4 transition-colors"
            >
              <div className="text-2xl mb-2">🏟️</div>
              <h4 className="text-lg font-semibold text-white mb-2">Times do Dia</h4>
              <p className="text-blue-200 text-sm">Veja como os times são formados</p>
            </Link>

            <Link 
              href="/demo/site/partidas"
              className="bg-white/20 hover:bg-white/30 rounded-lg p-4 transition-colors"
            >
              <div className="text-2xl mb-2">⚽</div>
              <h4 className="text-lg font-semibold text-white mb-2">Histórico de Partidas</h4>
              <p className="text-blue-200 text-sm">Acompanhe todas as rodadas</p>
            </Link>

            <Link 
              href="/demo/site/rankings"
              className="bg-white/20 hover:bg-white/30 rounded-lg p-4 transition-colors"
            >
              <div className="text-2xl mb-2">🏆</div>
              <h4 className="text-lg font-semibold text-white mb-2">Rankings</h4>
              <p className="text-blue-200 text-sm">Visualize as classificações</p>
            </Link>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-4">
            <p className="text-yellow-200 text-sm">
              💡 A demo é atualizada diariamente às 03:00 com novos dados. 
              Volte sempre para ver diferentes cenários e configurações!
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-blue-200 text-sm mb-4">
            🎯 Esta é apenas uma demonstração. O Fut7Pro real oferece muito mais funcionalidades!
          </p>
          
          <div className="inline-flex flex-wrap gap-4">
            <Link 
              href="/recursos"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors"
            >
              📚 Ver Todos os Recursos
            </Link>
            <Link 
              href="/precos"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors"
            >
              💰 Ver Preços
            </Link>
            <Link 
              href="/sobre"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors"
            >
              ℹ️ Sobre o Fut7Pro
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
