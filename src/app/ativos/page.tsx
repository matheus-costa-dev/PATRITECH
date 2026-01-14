"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Ativo } from "@/types/ativo";
import Loading from "@/components/UI/Loading";
import AddAtivoModal from "@/components/UI/AddAtivoModal";
import AddAtivoModal2 from "@/components/UI/AddAtivoModal2";
import { supabase } from "@/lib/supabase";
import QrScanner from "@/components/UI/QrScanner";

export default function AtivosPage() {
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState(false);

  async function refreshData() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ativo')
        .select(`
          *,
          categoria_ativo ( nome_categoria ),
          localizacao ( nome_localizacao ),
          condicao_ativo ( nome_condicao )
        `)
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      setAtivos(data || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  const ativosFiltrados = ativos.filter((ativo) =>
    ativo.nome_ativo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen w-full py-12 md:py-20 bg-[#f3f4f6]">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* TÍTULO PAINEL - RESPONSIVO */}
        <div className="flex flex-col items-center mb-10 md:mb-16 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#333] tracking-wider uppercase">
            Painel de Ativos
          </h1>
          <div className="w-16 md:w-24 lg:w-32 h-[3px] bg-[#8b1d22] mt-3"></div>
        </div>

        {/* Barra de Ações - Flexível para mobile */}
        <div className="mb-8 md:mb-12 flex flex-col lg:flex-row items-center gap-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar por nome do ativo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-700 px-5 py-3.5 rounded-2xl 
                         focus:outline-none focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF]
                         transition-all duration-200 placeholder:text-gray-400 shadow-sm"
            />
            <span className="absolute right-4 top-4 text-gray-400">🔍</span>
          </div>

          {/* Grupo de Botões - Quebra em colunas no mobile */}
          <div className="flex flex-col sm:flex-row shrink-0 gap-3 w-full lg:w-auto items-center">
            <button
              onClick={() => setOpen(true)} 
              className="w-full sm:w-auto bg-[#00BFFF] hover:bg-[#0096C7] text-white px-6 md:px-8 py-3 rounded-full font-bold transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
            >
              <span>📷</span> Ler QR Code
            </button>

            {/* Mantendo seus componentes de modal exatamente como estavam */}
            <div className="flex gap-2 w-full sm:w-auto">
                <AddAtivoModal onSuccess={refreshData} />
                <AddAtivoModal2 onSuccess={refreshData} />
            </div>
          </div>
        </div>

        {/* Scanner Overlay */}
        {open && <QrScanner onClose={() => setOpen(false)} />}

        {/* Lista de Cards - 1 coluna no mobile, 2 no tablet/desktop */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          {ativosFiltrados.length > 0 ? (
            ativosFiltrados.map((ativo) => (
              <Link
                key={ativo.id_ativo}
                href={`/ativos/${ativo.id_ativo}`}
                className="group block p-5 md:p-6 rounded-[2rem] bg-white border border-gray-200
                           shadow-md transition-all duration-300 
                           hover:-translate-y-1 hover:shadow-xl
                           hover:bg-[#00BFFF] hover:border-[#00BFFF]"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-[#333333] group-hover:text-white transition-colors leading-tight">
                    {ativo.nome_ativo}
                  </h2>
                  <span className="shrink-0 text-[9px] text-gray-500 font-mono bg-gray-100 group-hover:bg-white/20 group-hover:text-white px-2 py-1 rounded-md ml-2">
                    #{ativo.id_ativo.slice(0, 6)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {ativo.categoria_ativo && (
                    <span className="text-[9px] md:text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30">
                      {ativo.categoria_ativo.nome_categoria}
                    </span>
                  )}
                  {ativo.localizacao && (
                    <span className="text-[9px] md:text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30">
                      {ativo.localizacao.nome_localizacao}
                    </span>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 group-hover:border-white/20 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[#777] group-hover:text-white font-bold text-[10px] uppercase tracking-tighter">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00BFFF] group-hover:bg-white animate-pulse"></div>
                    {new Date(ativo.data_criacao).toLocaleDateString("pt-BR")}
                  </div>
                  <span className="text-[10px] font-black uppercase text-[#00BFFF] group-hover:text-white opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 tracking-widest">
                    Gerenciar →
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center col-span-full py-16 bg-white rounded-[2rem] border border-dashed border-gray-300">
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Nenhum ativo encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}