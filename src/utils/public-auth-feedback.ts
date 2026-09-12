"use client";

import { toast } from "react-hot-toast";
export { getHumanAuthErrorMessage } from "@/utils/public-auth-errors";

const PUBLIC_AUTH_SUCCESS_STORAGE_KEY = "fut7pro_public_auth_success";
const PUBLIC_AUTH_SUCCESS_MAX_AGE_MS = 15000;
export const PUBLIC_AUTH_SUCCESS_TITLE = "Login realizado com sucesso";
export const PUBLIC_AUTH_SUCCESS_MESSAGE =
  "Login realizado com sucesso. Seu perfil já está disponível.";

export type PublicAuthSuccessFeedback = {
  title: string;
  message: string;
  createdAt: number;
};

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function queuePublicAuthSuccessFeedback(
  message = PUBLIC_AUTH_SUCCESS_MESSAGE,
  title = PUBLIC_AUTH_SUCCESS_TITLE
) {
  const storage = getStorage();
  if (!storage) return;

  const payload: PublicAuthSuccessFeedback = {
    title,
    message,
    createdAt: Date.now(),
  };

  storage.setItem(PUBLIC_AUTH_SUCCESS_STORAGE_KEY, JSON.stringify(payload));
}

export function consumePublicAuthSuccessFeedback() {
  const storage = getStorage();
  if (!storage) return null;

  const raw = storage.getItem(PUBLIC_AUTH_SUCCESS_STORAGE_KEY);
  if (!raw) return null;

  storage.removeItem(PUBLIC_AUTH_SUCCESS_STORAGE_KEY);

  try {
    const payload = JSON.parse(raw) as Partial<PublicAuthSuccessFeedback>;
    const title = String(payload.title || "").trim();
    const message = String(payload.message || "").trim();
    const createdAt = Number(payload.createdAt || 0);

    if (!title || !message || !createdAt) {
      return null;
    }

    if (Date.now() - createdAt > PUBLIC_AUTH_SUCCESS_MAX_AGE_MS) {
      return null;
    }

    return {
      title,
      message,
      createdAt,
    } satisfies PublicAuthSuccessFeedback;
  } catch {
    return null;
  }
}

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
