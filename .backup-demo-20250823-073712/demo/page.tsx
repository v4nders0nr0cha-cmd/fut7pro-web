'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoEntryPage() {
  const router = useRouter();

  useEffect(() => {
    // Setar cookies de demo com path=/ (importante!)
    document.cookie = 'demo=1; path=/; max-age=86400'; // 24 horas
    document.cookie = 'tenant=demo; path=/; max-age=86400'; // 24 horas
    document.cookie = 'demo-mode=1; path=/; max-age=86400'; // Para useDemoMode
    document.cookie = 'readonly=1; path=/; max-age=86400'; // Para useDemoMode
    document.cookie = 'demo-site-public=1; path=/; max-age=86400'; // Para site público
    
    // Aguardar um pouco para os cookies serem setados
    setTimeout(() => {
      // Redirecionar para a página principal (que será interceptada pelo middleware)
      router.push('/');
    }, 100);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-8"></div>
        <h1 className="text-2xl font-bold mb-4">Iniciando Demo...</h1>
        <p className="text-gray-300">Configurando ambiente de demonstração</p>
      </div>
    </div>
  );
}
