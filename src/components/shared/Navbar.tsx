"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; 

const links = [
  { title: "Ativos", href: "/ativos" },
  { title: "Lotes", href: "/lote" }
]

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathName = usePathname();
  const { isAuthenticated, logout, loading } = useAuth(); 

  // Se estiver carregando o status da sessão, podemos retornar um estado neutro
  // para evitar que os botões "saltem" na tela
  if (loading) return <nav className="bg-[#00BFFF] h-32 shadow-xl sticky top-0 z-50" />;

  const NavLinks = () => (
    <>
      {/* Se NÃO está logado e NÃO está na home, mostra link para voltar ao Login.
         Se já está na home (/), não precisa mostrar o link "Login".
      */}
      {!isAuthenticated && pathName !== '/' && (
        <Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          className="group relative text-white px-4 py-2 text-base font-bold uppercase tracking-widest transition-colors duration-300"
        >
          Login
          <span className="absolute left-0 bottom-0 h-1 bg-[#8b1d22] w-0 group-hover:w-full transition-all duration-300"></span>
        </Link>
      )}

      {/* Links Protegidos: Só aparecem se o usuário estiver logado */}
      {isAuthenticated && links.map((item) => {
        const isActive = pathName === item.href;
        return (
          <Link
            key={item.title}
            href={item.href}
            onClick={() => setIsMenuOpen(false)}
            className="group relative text-white px-4 py-2 text-base font-bold uppercase tracking-widest transition-colors duration-300"
          >
            {item.title}
            <span className={`
              absolute left-0 bottom-0 h-1 bg-[#8b1d22] transition-all duration-300
              ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}
            `}></span>
          </Link>
        )
      })}

      {/* Botão de Sair: Só aparece se estiver logado */}
      {isAuthenticated && (
        <button
          onClick={() => {
            logout();
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-2 bg-[#8b1d22] hover:bg-red-700 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 md:ml-4 shadow-lg"
        >
          <FaSignOutAlt />
          Sair
        </button>
      )}
    </>
  );

  return (
    <nav className="bg-[#00BFFF] shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-32">
          
          <div className="shrink-0">
            {/* O Logo agora sempre leva para a home (Login se deslogado, ou Dashboard se logado pelo middleware) */}
            <Link href={isAuthenticated? "/ativos" : "/"}  className="flex items-center gap-5 group transition-transform active:scale-95">
              <div className="relative w-28 h-28 sm:w-40 sm:h-40 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo PatriTech"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
              
              <div className="flex flex-col">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase drop-shadow-md leading-none">
                  PatriTech
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-white/80 uppercase tracking-[0.3em] mt-1">
                  Gestão Patrimonial
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:gap-4 h-full">
            <NavLinks />
          </div>

          {/* Mobile Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-xl text-white hover:bg-white/20 transition-all border-2 border-white/30"
            >
              {isMenuOpen ? <FaTimes size={35} /> : <FaBars size={35} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`${isMenuOpen ? 'block animate-in slide-in-from-top duration-300' : 'hidden'} md:hidden bg-[#0096C7] border-t border-white/10 shadow-2xl`}>
        <div className="flex flex-col items-center gap-8 py-12">
          <NavLinks />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;