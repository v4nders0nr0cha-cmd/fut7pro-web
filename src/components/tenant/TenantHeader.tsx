// src/components/tenant/TenantHeader.tsx
"use client";

import { useTenant } from "@/hooks/useTenant";
import { useRouter } from "next/navigation";

interface TenantHeaderProps {
  showBackButton?: boolean;
}

export function TenantHeader({ showBackButton = false }: TenantHeaderProps) {
  const { tenant, membership, loading } = useTenant();
  const router = useRouter();

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-white/10 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return null;
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <div>
            <h1 className="text-xl font-semibold text-white">{tenant.name}</h1>
            <p className="text-gray-300 text-sm">
              {tenant.description || `Racha ${tenant.name}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {membership && (
            <div className="text-right">
              <p className="text-sm text-gray-300">
                {membership.role === 'ADMIN' ? 'Administrador' : 'Membro'}
              </p>
              <p className="text-xs text-gray-400">
                {membership.status === 'APROVADO' ? 'Aprovado' : 
                 membership.status === 'PENDENTE' ? 'Pendente' : 'Suspenso'}
              </p>
            </div>
          )}
          
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {tenant.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
