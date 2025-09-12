/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações básicas
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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

module.exports = nextConfig;
