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
  title: "Consulta CPNU - Classificação no Cadastro de Reserva",

  // 2. Descrição Otimizada
  description: "Consulte de forma rápida e clara sua classificação detalhada no Cadastro de Reserva do CPNU. Ferramenta não oficial para verificar sua posição por cargo, bloco e cotas.",

  // 3. Palavras-chave (Keywords)
  keywords: "CPNU, Concurso Nacional Unificado, Consulta CPNU, Classificação CPNU, Resultado CPNU, Cadastro de Reserva, Concurso Público, consultar classificação cpnu, ver minha posição concurso unificado, lista de espera cpnu dashboard",

  // 4. Autor
  authors: [{ name: 'Matheus Costa', url: 'https://portfolio-brown-gamma-63.vercel.app/' }],

  // 5. Open Graph (para compartilhamento em redes sociais)
  openGraph: {
    title: "Consulta CPNU - Classificação no Cadastro de Reserva",
    description: "Ferramenta para verificar sua posição por cargo, bloco e obter insights com dashboard dinâmico.",
    url: 'https://www.consultacpnu.com.br/',
    siteName: 'Consulta CPNU',
    images: [
      {
        url: 'https://www.consultacpnu.com.br/preview_consultaCPNU.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consulta CPNU | Cadastro de Reserva e Dashboards',
    description: 'Consulte sua situação no CR do CPNU e explore os novos dashboards interativos.',
    images: ['https://www.consultacpnu.com.br/preview_consultaCPNU.png'],
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