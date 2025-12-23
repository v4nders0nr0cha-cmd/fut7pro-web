const { withSentryConfig } = require("@sentry/nextjs");

const isProd = process.env.NODE_ENV === "production";
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseHost = null;
try {
  supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null;
} catch {
  supabaseHost = null;
}

// CSP enxuta e compatível (sem 'unsafe-eval' em prod)
const cspBase = [
  "default-src 'self'",
  "base-uri 'self'",
  "img-src 'self' data: https: https://www.google-analytics.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "connect-src 'self' https://api.fut7pro.com.br https://www.google-analytics.com https://www.googletagmanager.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

// Em dev permitimos 'unsafe-eval' para toolings
const CSP = isProd ? cspBase : `${cspBase}; script-src 'self' 'unsafe-inline' 'unsafe-eval'`;

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
  // Configurações básicas
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Headers de segurança
  async headers() {
    return [
      // Headers de segurança para TUDO
      { source: "/:path*", headers: securityHeaders },

      // Noindex apenas nas áreas privadas (não em APIs públicas)
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      {
        source: "/superadmin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // APIs privadas (não públicas) - usar múltiplas rotas específicas
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

  // Redirects canônicos
  async redirects() {
    return [
      // Redirect www para non-www
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.fut7pro.com.br",
          },
        ],
        destination: "https://app.fut7pro.com.br/:path*",
        permanent: true,
      },
      // Redirect fut7pro-web.vercel.app para domínio principal
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "fut7pro-web.vercel.app",
          },
        ],
        destination: "https://app.fut7pro.com.br/:path*",
        permanent: true,
      },
      // Redirect fut7pro-web-git-main para domínio principal
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "fut7pro-web-git-main-vanderson-rochas-projects.vercel.app",
          },
        ],
        destination: "https://app.fut7pro.com.br/:path*",
        permanent: true,
      },
    ];
  },

  // Configurações de imagens
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.fut7pro.com.br",
        port: "",
        pathname: "/**",
      },
      ...(supabaseHost
        ? [
            {
              protocol: "https",
              hostname: supabaseHost,
              port: "",
              pathname: "/**",
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "fonts.gstatic.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // Webpack configuration para resolver problemas de Prisma
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // No lado do cliente, substituir @prisma/client por um shim vazio
      config.resolve.alias = {
        ...config.resolve.alias,
        "@prisma/client": require.resolve("./src/server/prisma-shim.js"),
      };
    }

    // Ignorar warnings de dependências críticas durante build
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /require function is used in a way in which dependencies cannot be statically extracted/,
    ];

    return config;
  },
};

module.exports = withSentryConfig(
  nextConfig,
  { silent: true }, // opções do plugin
  { hideSourceMaps: true } // opções do build (não expõe sourcemaps)
);
