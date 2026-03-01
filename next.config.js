const { withSentryConfig } = require("@sentry/nextjs");

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const defaultRachaSlug = (process.env.NEXT_PUBLIC_DEFAULT_RACHA_SLUG || "vitrine")
  .trim()
  .replace(/^\/+/, "")
  .toLowerCase();
let supabaseHost = null;
try {
  supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null;
} catch {
  supabaseHost = null;
}

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

  async rewrites() {
    return [
      {
        source: "/sitemaps/:slug.xml",
        destination: "/sitemaps/:slug",
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
      {
        source: "/",
        destination: `/${defaultRachaSlug}`,
        permanent: false,
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
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh6.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fonts.gstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
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
