'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

interface DemoStatus {
  id: string;
  name: string;
  isDemo: boolean;
  demoMode: string;
  isActive: boolean;
  nextReset: string;
  demoFeatures: string[];
}

export default function DemoHero() {
  const [status, setStatus] = useState<DemoStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await apiClient.get('/api/demo/status');
      if (response.error) {
        console.error('Erro ao buscar status:', response.error);
        return;
      }
      setStatus(response.data);
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaygroundToggle = async () => {
    if (!status) return;
    
    setToggleLoading(true);
    try {
      const endpoint = status.demoMode === 'playground' 
        ? '/api/demo/playground/deactivate'
        : '/api/demo/playground/activate';
      
      const response = await apiClient.post(endpoint);
      if (response.error) {
        console.error('Erro ao alternar modo:', response.error);
        return;
      }
      await fetchStatus(); // Recarregar status
    } catch (error) {
      console.error('Erro ao alternar modo:', error);
    } finally {
      setToggleLoading(false);
    }
  };

  const isPlaygroundActive = status?.demoMode === 'playground';

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-6xl mx-auto text-center">
        {/* Badge Demo */}
        <div className="inline-flex items-center px-4 py-2 bg-yellow-500/20 border border-yellow-400/50 rounded-full text-yellow-300 text-sm font-medium mb-8">
          🎯 Ambiente Demo - Dados ilustrativos para demonstração
        </div>

        {/* Título Principal */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Fut7Pro Demo
        </h1>
        
        <p className="text-xl md:text-2xl text-blue-200 mb-12 max-w-4xl mx-auto">
          Experimente o sistema completo de gestão de rachas de futebol 7. 
          Navegue pelas funcionalidades, veja dados realistas e teste como admin.
        </p>

        {/* Navegação Rápida */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link 
            href="/demo/site/times"
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 group"
          >
            <div className="text-4xl mb-4">🏟️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Times do Dia</h3>
            <p className="text-blue-200 text-sm">Veja os elencos formados para as próximas partidas</p>
          </Link>

          <Link 
            href="/demo/site/partidas"
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 group"
          >
            <div className="text-4xl mb-4">⚽</div>
            <h3 className="text-xl font-semibold text-white mb-2">Histórico de Partidas</h3>
            <p className="text-blue-200 text-sm">Acompanhe todas as partidas e resultados</p>
          </Link>

          <Link 
            href="/demo/site/estatisticas"
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 group"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">Rankings e Estatísticas</h3>
            <p className="text-blue-200 text-sm">Visualize classificações e dados dos jogadores</p>
          </Link>
        </div>

        {/* Toggle Playground */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">
            🎮 Modo Playground
          </h3>
          <p className="text-blue-200 mb-6">
            {isPlaygroundActive 
              ? 'Modo ativo: você pode testar funcionalidades de escrita (criar partidas, editar times, etc.)'
              : 'Modo visual: apenas leitura. Ative o playground para testar funcionalidades admin.'
            }
          </p>
          
          <button
            onClick={handlePlaygroundToggle}
            disabled={toggleLoading}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
              isPlaygroundActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {toggleLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isPlaygroundActive ? 'Desativando...' : 'Ativando...'}
              </span>
            ) : (
              isPlaygroundActive ? '🔄 Desativar Playground' : '🎮 Ativar Playground'
            )}
          </button>
          
          {isPlaygroundActive && (
            <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-400/50 rounded-lg">
              <p className="text-yellow-200 text-sm">
                ⚠️ Todas as alterações serão perdidas no próximo reset (03:00). 
                Este é um ambiente de teste seguro.
              </p>
            </div>
          )}
        </div>

        {/* Benefícios do Demo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="text-lg font-semibold text-white mb-2">Dados Realistas</h4>
            <p className="text-blue-200 text-sm">
              28 jogadores, 10 times, partidas completas com rankings coerentes
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-3">🔄</div>
            <h4 className="text-lg font-semibold text-white mb-2">Reset Diário</h4>
            <p className="text-blue-200 text-sm">
              Ambiente sempre limpo e atualizado às 03:00 todos os dias
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-3">🛡️</div>
            <h4 className="text-lg font-semibold text-white mb-2">Zero Risco</h4>
            <p className="text-blue-200 text-sm">
              Sem envio de e-mails reais, sem vazamento de dados, sem impacto na produção
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
