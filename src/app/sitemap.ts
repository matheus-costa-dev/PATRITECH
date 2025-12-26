// arquivo: src/app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.consultacpnu.com.br',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://www.consultacpnu.com.br/dashboard',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://www.consultacpnu.com.br/faq',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://www.consultacpnu.com.br/contribuir',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },    
  ]
}