const { withSentryConfig } = require("@sentry/nextjs");

// Headers de segurança
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.fut7pro.com.br;",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações básicas
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
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
