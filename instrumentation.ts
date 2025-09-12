export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side Sentry initialization
    const { init } = await import("@sentry/nextjs");
    init({
      dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
      tracesSampleRate: 0.1,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime Sentry initialization
    const { init } = await import("@sentry/nextjs");
    init({
      dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
      tracesSampleRate: 0.1,
    });
  }
}
