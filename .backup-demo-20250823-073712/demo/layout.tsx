import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fut7Pro Demo',
  description: 'Demonstração do sistema Fut7Pro',
  robots: 'noindex, nofollow',
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Banner Demo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 text-center text-sm font-medium">
        🎯 Ambiente Demo - Dados ilustrativos para demonstração
      </div>
      
      {/* Ajustar margem para o banner */}
      <div className="pt-10">
        {children}
      </div>
      
      {/* Script para corrigir URLs de imagens */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Corrigir URLs de imagens que estão sendo acessadas com prefixo demo
            document.addEventListener('DOMContentLoaded', function() {
              const images = document.querySelectorAll('img[src^="/demo/images/"]');
              images.forEach(img => {
                img.src = img.src.replace('/demo/images/', '/images/');
              });
            });
          `,
        }}
      />
    </>
  );
}
