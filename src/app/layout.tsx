// arquivo: src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. Importe o CSS e o Container do react-toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes do layout base
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
// 1. Título Otimizado
  title: "Patri Tech | Gestão Patrimonial e Rastreio Inteligente",

  // 2. Descrição Otimizada
  description: "Sistema avançado de gestão de ativos e controle patrimonial. Monitoramento via QR Code, rastreio inteligente e mecanismos rigorosos de controle de acesso para sua empresa.",

  // 3. Palavras-chave (Keywords)
  keywords: "gestão patrimonial, controle de ativos, rastreio de ativos, QR Code patrimonial, inventário inteligente, Patri Tech, segurança de ativos, logística corporativa",

  // 4. Autor
  authors: [
    { name: 'Matheus Costa', url: 'https://portfolio-brown-gamma-63.vercel.app/' },
    { name: 'Jackie', url: 'url do seu portifolio ou rede social' },
    { name: 'Cris', url: 'url do seu portifolio ou rede social' },
    { name: 'Evelyn', url: 'url do seu portifolio ou rede social' }
  ],

  // 5. Open Graph (Redes Sociais e Slack/Teams)
  openGraph: {
    title: "Patri Tech - Inteligência em Gestão de Ativos",
    description: "Solução completa para controle de inventário e rastreio de bens com QR Code e tecnologia inteligente.",
    url: 'https://patritech.vercel.app/', // Substitua pela URL real se tiver
    siteName: 'Patri Tech',
    images: [
      {
        url: 'https://patritech.vercel.app/og-image.png', // Recomendado atualizar a imagem para uma do sistema
        width: 1200,
        height: 630,
        alt: 'Dashboard Patri Tech',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },

  // 6. Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Patri Tech | Gestão de Ativos Inteligente',
    description: 'Simplifique o controle de patrimônio da sua empresa com rastreio via QR Code e relatórios detalhados.',
    images: ['https://patritech.vercel.app/og-image.png'],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-800 text-white flex flex-col min-h-screen
        `}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-grow flex items-center">
            {children} {/* O conteúdo de page.tsx será renderizado aqui */}
          </main>
          <Footer />
        </AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark" // Perfeito para o seu design
        />
      </body>

      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5364527701768163"
        crossOrigin="anonymous"></script>
    </html>
  );
}