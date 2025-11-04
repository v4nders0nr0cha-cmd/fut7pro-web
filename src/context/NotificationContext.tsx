"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { rachaConfig } from "@/config/racha.config";
import type { NotificationType } from "@/types/notificacao";

type Alertas = {
  jogadores: number;
  partidas: number;
  config: number;
  notificacoesNaoLidas: number;
};

type ToastType = "info" | "success" | "error" | "warning" | "alert";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type Notificacao = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  tone?: ToastType;
};

type NotificationContextType = Alertas & {
  toasts: Toast[];
  notify: (toast: { message: string; type?: ToastType }) => void;
  removeToast: (id: string) => void;
  notificacoes: Notificacao[];
  marcarNotificacaoComoLida: (id: string) => void;
  adicionarNotificacao: (not: Omit<Notificacao, "id" | "isRead" | "createdAt">) => void;
};

const NotificationContext = createContext<NotificationContextType>({
  jogadores: 0,
  partidas: 0,
  config: 0,
  notificacoesNaoLidas: 0,
  toasts: [],
  notify: () => {},
  removeToast: () => {},
  notificacoes: [],
  marcarNotificacaoComoLida: () => {},
  adicionarNotificacao: () => {},
});

export const useNotification = () => useContext(NotificationContext);

// Função para gerar ID único sem hydration mismatch
const generateToastId = () => {
  if (typeof window !== "undefined") {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
  return Math.random().toString(36).substr(2, 9);
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [alertas, setAlertas] = useState<Omit<Alertas, "notificacoesNaoLidas">>({
    jogadores: 0,
    partidas: 0,
    config: 0,
  });

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([
    {
      id: "1",
      title: `Bem-vindo ao ${rachaConfig.nome}!`,
      message: "Use o painel para gerenciar seu racha.",
      type: "SISTEMA",
      isRead: false,
      createdAt: new Date().toISOString(),
      tone: "info",
    },
    {
      id: "2",
      title: "Nova funcao disponivel",
      message: "O sorteio inteligente foi atualizado!",
      type: "PERSONALIZADA",
      isRead: false,
      createdAt: new Date().toISOString(),
      tone: "success",
    },
    {
      id: "3",
      title: "Alerta do SuperAdmin",
      message: "Este domingo havera manutencao programada.",
      type: "ALERTA",
      isRead: false,
      createdAt: new Date().toISOString(),
      tone: "warning",
    },
  ]);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastsRef = useRef<Toast[]>([]);

  useEffect(() => {
    // Simulação inicial — trocar por API/sockets futuramente
    const simulate = setTimeout(() => {
      setAlertas({
        jogadores: 3,
        partidas: 0,
        config: 1,
      });
    }, 1000);
    return () => clearTimeout(simulate);
  }, []);

  const notify = ({ message, type = "info" }: { message: string; type?: ToastType }) => {
    // Só dispara se não houver toast visível (anti-spam visual)
    if (toasts.length === 0) {
      const id = generateToastId();
      const toast = { id, message, type };
      setToasts([toast]);
      toastsRef.current = [toast];
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    toastsRef.current = toastsRef.current.filter((t) => t.id !== id);
  };

  // Remoção automática do único toast visível após 4s
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts([]);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const marcarNotificacaoComoLida = (id: string) => {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const adicionarNotificacao = (not: Omit<Notificacao, "id" | "isRead" | "createdAt">) => {
    setNotificacoes((prev) => [
      {
        ...not,
        id: generateToastId(),
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const notificacoesNaoLidas = notificacoes.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        ...alertas,
        notificacoesNaoLidas,
        toasts,
        notify,
        removeToast,
        notificacoes,
        marcarNotificacaoComoLida,
        adicionarNotificacao,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
