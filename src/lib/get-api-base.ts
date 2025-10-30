export function getApiBase() {
  const base =
    typeof window === "undefined"
      ? (process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL)
      : process.env.NEXT_PUBLIC_API_URL;

  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL nao esta configurada.");
  }

  return base.replace(/\/+$/, "");
}
