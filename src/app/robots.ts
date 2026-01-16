// arquivo: src/app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://patritech.vercel.app/';

  return {
    rules: {
      userAgent: '*', // Aplica a regra para todos os robôs
      allow: '/',      // Permite que eles acessem todas as páginas
      // disallow: '/privado/', // Exemplo: se você tivesse uma área privada
    },
    sitemap: `${baseUrl}/sitemap.xml`, // Aponta para o seu sitemap
  }
}