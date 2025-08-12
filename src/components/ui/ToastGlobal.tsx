"use client";

import { useEffect, useState } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import { useNotification } from "@/context/NotificationContext";

const ICONS = {
  info: <FaInfoCircle className="text-blue-600" />,
  success: <FaCheckCircle className="text-green-600" />,
  error: <FaTimesCircle className="text-red-600" />,
  warning: <FaExclamationTriangle className="text-yellow-600" />,
  alert: <FaBell className="text-yellow-500" />,
};

export default function ToastGlobal() {
  const { toasts, removeToast } = useNotification();
  const [visibleToast, setVisibleToast] = useState<string | null>(null);

  useEffect(() => {
    if (toasts.length > 0 && toasts[0]) {
      setVisibleToast(toasts[0].message || "");
      const timer = setTimeout(() => {
        if (toasts[0]?.id) removeToast(toasts[0].id);
        setVisibleToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
    setVisibleToast(null);
  }, [toasts, removeToast]);

  if (!visibleToast) return null;

  const toastObj = toasts.length > 0 ? toasts[0] : undefined;
  const toastType = toastObj?.type || "info";
  const Icon = ICONS[toastType as keyof typeof ICONS] || <FaBell />;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[9999] bg-white text-black px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-up min-w-[240px] max-w-[350px] border border-gray-200">
      {Icon}
      <span className="text-sm font-semibold flex-1">{visibleToast}</span>
      <button
        className="ml-3 text-xl hover:text-black/70"
        aria-label="Fechar"
        onClick={() => setVisibleToast(null)}
      >
        ×
      </button>
    </div>
  );
}
