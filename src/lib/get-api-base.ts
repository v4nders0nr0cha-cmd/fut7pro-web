export function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "https://api.fut7pro.com.br";
}
