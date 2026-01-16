// arquivo: src/app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://patritech.vercel.app/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://patritech.vercel.app/ativos',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://www.consultacpnu.com.br/lote',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }    
  ]
}