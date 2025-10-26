/* eslint-disable @typescript-eslint/no-var-requires */
const { withSentryConfig } = require("@sentry/nextjs");

const isProd = process.env.NODE_ENV === "production";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.fut7pro.com.br").replace(
  /\/+$/,
  ""
);
const apiOrigin = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return "https://api.fut7pro.com.br";
  }
})();
const apiHostname = (() => {
  try {
    return new URL(API_URL).hostname;
  } catch {
    return "api.fut7pro.com.br";
  }
})();
const imagesCdnHostname = (() => {
  const cdn = process.env.NEXT_PUBLIC_IMAGES_CDN;
  if (!cdn) return null;
  try {
    return new URL(cdn).hostname;
  } catch {
    return null;
  }
})();

// CSP enxuta e compatível (sem 'unsafe-eval' em prod)
const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "img-src 'self' data: https:",
  "media-src 'self'", // vídeos locais
  "font-src 'self' https://fonts.gstatic.com data:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // script-src varia entre dev e prod
  isProd ? "script-src 'self' 'unsafe-inline'" : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  `connect-src 'self' ${apiOrigin} https://*.sentry.io`,
  "frame-ancestors 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests",
];
const CSP = cspDirectives.join("; ");

// Headers de segurança
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Content-Security-Policy", value: CSP },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/robots.txt",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=600, stale-while-revalidate=300" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=600, stale-while-revalidate=300" },
        ],
      },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      {
        source: "/superadmin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/auth/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/estrelas/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/health/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/superadmin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.fut7pro.com.br" }],
        destination: `${APP_URL}/:path*`,
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "fut7pro-web.vercel.app" }],
        destination: `${APP_URL}/:path*`,
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "fut7pro-web-git-main-vanderson-rochas-projects.vercel.app" }],
        destination: `${APP_URL}/:path*`,
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "", pathname: "/**" },
      { protocol: "https", hostname: "127.0.0.1", port: "", pathname: "/**" },
      { protocol: "https", hostname: apiHostname, port: "", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "*.supabase.co", port: "", pathname: "/**" },
      { protocol: "https", hostname: "*.s3.amazonaws.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "fut7pro.s3.amazonaws.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "app.fut7pro.com.br", port: "", pathname: "/**" },
      { protocol: "https", hostname: "www.fut7pro.com.br", port: "", pathname: "/**" },
      // adicione aqui outros hosts se precisar (ex.: CDN própria)
    ],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@prisma/client": require.resolve("./src/server/prisma-shim.js"),
      };
    }
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /require function is used in a way in which dependencies cannot be statically extracted/,
    ];
    return config;
  },
};

module.exports = withSentryConfig(nextConfig, { silent: true }, { hideSourceMaps: true });
