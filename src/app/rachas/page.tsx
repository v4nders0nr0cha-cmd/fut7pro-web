// src/app/rachas/page.tsx
"use client";

import { useState, useEffect } from "react";
import { tenantApi } from "@/lib/api";
import { Tenant } from "@/types/tenant";
import Link from "next/link";

export default function RachasPage() {
  const [rachas, setRachas] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRachas = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await tenantApi.getAll();

        if (response.error) {
          throw new Error(response.error);
        }

        setRachas(response.data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao carregar rachas";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadRachas();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-fundo flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando rachas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-fundo flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Erro ao carregar rachas</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fundo">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Rachas Disponíveis</h1>
          <p className="text-gray-300 text-lg">
            Escolha um racha para participar ou criar o seu próprio
          </p>
        </div>

        {rachas.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-white mb-4">Nenhum racha encontrado</h2>
              <p className="text-gray-300 mb-6">
                Ainda não há rachas cadastrados. Que tal criar o primeiro?
              </p>
              <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80">
                Criar Racha
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rachas.map((racha) => (
              <Link
                key={racha.id}
                href={`/rachas/${racha.slug}`}
                className="group bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:border-white/40 transition-all duration-200 hover:bg-white/15"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">
                      {racha.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-primary transition-colors">
                      {racha.name}
                    </h3>
                    <p className="text-gray-400 text-sm">@{racha.slug}</p>
                  </div>
                </div>

                {racha.description && (
                  <p className="text-gray-300 mb-4 line-clamp-2">{racha.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{racha.autoJoinEnabled ? "Entrada livre" : "Convite necessário"}</span>
                  <span>Criado em {new Date(racha.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
