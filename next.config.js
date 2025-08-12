/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), gyroscope=(), magnetometer=(), payment=(), usb=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://www.google-analytics.com https://api.fut7pro.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none';",
          },
        ],
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
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Configurações de desenvolvimento
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://192.168.0.2:3000",
    "http://192.168.0.3:3000",
    "http://192.168.0.4:3000",
    "http://192.168.0.5:3000",
    "http://192.168.0.6:3000",
    "http://192.168.0.7:3000",
  ],

  // Configurações de performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["react-icons", "lucide-react"],
  },

  // Configurações de build
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
