import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/site-config';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'Yeti',
        allow: '/',
      },
    ],
    sitemap: `${SITE_CONFIG.canonicalBase}/sitemap.xml`,
  };
}
