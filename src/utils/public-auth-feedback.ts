"use client";

const PUBLIC_AUTH_SUCCESS_STORAGE_KEY = "fut7pro_public_auth_success";
const PUBLIC_AUTH_SUCCESS_MAX_AGE_MS = 15000;
export const PUBLIC_AUTH_SUCCESS_TITLE = "Login realizado com sucesso";
export const PUBLIC_AUTH_SUCCESS_MESSAGE =
  "Seu perfil e os atalhos do atleta já estão prontos neste racha.";

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
