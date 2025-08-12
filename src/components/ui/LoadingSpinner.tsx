// src/components/ui/LoadingSpinner.tsx
// Componente de loading reutilizável

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "white" | "yellow" | "blue";
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

const colorClasses = {
  white: "text-white",
  yellow: "text-yellow-400",
  blue: "text-blue-400",
};

export default function LoadingSpinner({
  size = "md",
  color = "white",
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} />
      {text && <p className="mt-2 text-sm text-gray-400 text-center">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">{spinner}</div>
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{spinner}</div>;
}

// Componente de loading para páginas
export function PageLoading() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <LoadingSpinner size="lg" color="yellow" text="Carregando..." />
    </div>
  );
}

// Componente de loading para cards
export function CardLoading() {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <LoadingSpinner size="md" color="yellow" text="Carregando dados..." />
    </div>
  );
}

// Componente de loading inline
export function InlineLoading() {
  return <LoadingSpinner size="sm" color="white" />;
}
