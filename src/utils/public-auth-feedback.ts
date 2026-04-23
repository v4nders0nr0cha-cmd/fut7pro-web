"use client";

import { toast } from "react-hot-toast";

export const PUBLIC_AUTH_SUCCESS_MESSAGE =
  "Login realizado com sucesso. Seu perfil já está disponível.";

export function showPublicAuthSuccessToast(message = PUBLIC_AUTH_SUCCESS_MESSAGE) {
  toast.success(message, {
    duration: 3200,
    style: {
      border: "1px solid rgba(250, 204, 21, 0.22)",
      background: "#0f1118",
      color: "#f8fafc",
      boxShadow: "0 18px 50px rgba(0, 0, 0, 0.35)",
      padding: "12px 14px",
    },
    iconTheme: {
      primary: "#facc15",
      secondary: "#0f1118",
    },
  });
}
