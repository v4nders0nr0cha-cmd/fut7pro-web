import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const urls = ['/', '/atletas', '/partidas', '/rankings', '/sobre'];
  return urls.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}


