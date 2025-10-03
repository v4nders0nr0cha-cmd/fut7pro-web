// src/app/rachas/[slug]/page.tsx
"use client";

import { TenantLayout } from "@/components/tenant/TenantLayout";
import { useTenant } from "@/hooks/useTenant";
import { useEffect, useState } from "react";
import { tenantApi } from "@/lib/api";
import { Tenant } from "@/types/tenant";

interface RachaPageProps {
  params: {
    slug: string;
  };
}

export default function RachaPage({ params }: RachaPageProps) {
  const { tenant, setTenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTenant = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await tenantApi.getBySlug(params.slug);

        if (response.error) {
          throw new Error(response.error);
        }

        setTenant(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao carregar racha";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      loadTenant();
    }
  }, [params.slug, setTenant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-fundo flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando racha...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-fundo flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Racha não encontrado</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <TenantLayout requireAuth={false}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-4">{tenant?.name || "Racha"}</h1>

          {tenant?.description && <p className="text-gray-300 mb-6">{tenant.description}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Jogos</h3>
              <p className="text-gray-300">Veja os jogos do racha</p>
              <button className="mt-3 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80">
                Ver Jogos
              </button>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Times</h3>
              <p className="text-gray-300">Gerencie os times</p>
              <button className="mt-3 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80">
                Ver Times
              </button>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Jogadores</h3>
              <p className="text-gray-300">Lista de jogadores</p>
              <button className="mt-3 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80">
                Ver Jogadores
              </button>
            </div>
          </div>
        </div>
      </div>
    </TenantLayout>
  );
}
