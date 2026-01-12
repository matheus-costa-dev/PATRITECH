"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBars, FaTimes } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

interface linksType {
  title: string,
  href: string,
}

const links: linksType[] = [
  { title: "Login", href: "/" },
  { title: "Ativos", href: "/ativos" },
  { title: "Lotes", href: "/lote" }
]

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathName = usePathname();

  const NavLinks = () => (
    <>
      {links.map((item) => {
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
              absolute left-0 bottom-0 h-[4px] bg-[#8b1d22] transition-all duration-300
              ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}
            `}></span>
          </Link>
        )
      })}
    </>
  );

  return (
    <nav className="bg-[#00BFFF] shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-32">
          
          <div className="shrink-0">
            <Link href="/" className="flex items-center gap-5 group transition-transform active:scale-95">
              
              <div className="relative w-28 h-28 sm:w-40 sm:h-40 flex-shrink-0">
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

          <div className="hidden md:flex md:items-center md:gap-10 h-full">
            <NavLinks />
          </div>

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

      <div className={`${isMenuOpen ? 'block animate-in slide-in-from-top duration-300' : 'hidden'} md:hidden bg-[#0096C7] border-t border-white/10`}>
        <div className="flex flex-col items-center gap-8 py-12">
          <NavLinks />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;