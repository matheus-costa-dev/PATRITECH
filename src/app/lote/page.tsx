"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { toast } from "react-toastify";
import Loading from "@/components/UI/Loading";
import { FaBox, FaChevronRight, FaTruck, FaListUl } from "react-icons/fa"; // Removido FaPlus não utilizado
import AddAtivoModal2 from "@/components/UI/AddAtivoModal2";
import { useAuth } from "@/context/AuthContext";
import ForbiddenAccess from "@/components/shared/ForbiddenAccess";

// 1. Definindo interfaces para remover o erro de "any"
interface AtivoSimplificado {
  nome_ativo: string;
}

interface Lote {
  id_lote: string;
  fornecedor_lote: string | null;
  quantidade_ativos: number;
  data_compra: string;
  ativo: AtivoSimplificado[];
}

function LotesPage() {
  // Aplicando os tipos no estado
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth(); 

  async function carregarLotes() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("lote")
        .select(`
          *,
          ativo (
            nome_ativo
          )
        `)
        .order("data_compra", { ascending: false });

      if (error) throw error;
      setLotes((data as unknown as Lote[]) || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar lotes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarLotes();
  }, []);

  // Removido o bloco de código do Navbar que estava aqui (gerava os erros de pathName e setIsMenuOpen)

  if (loading) return <Loading />;

  // Se não estiver autenticado, você pode retornar um aviso ou redirecionar
  if (!isAuthenticated) {
    return (
      <ForbiddenAccess />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] pb-20 font-sans text-[#333]">
      
      <div className="w-full bg-white border-b border-gray-200 mb-12 shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="text-[#00BFFF] font-black text-xs uppercase tracking-[0.3em]">Gestão de Carga</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#333] mt-2 uppercase">Lotes</h1>
            <div className="w-16 h-1 bg-[#8b1d22] mt-3 mx-auto md:mx-0"></div>
          </div>
          <div className="shrink-0">
            <AddAtivoModal2 onSuccess={carregarLotes} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {lotes.length > 0 ? (
          lotes.map((lote) => (
            <Link 
              key={lote.id_lote} 
              href={`/lote/${lote.id_lote}`}
              // Ajustado CSS para remover conflito 'block' e 'flex' e classes canônicas Tailwind
              className="group flex flex-col bg-white p-8 rounded-[2.5rem] border border-gray-200 hover:border-[#00BFFF] transition-all shadow-lg hover:shadow-2xl min-h-80 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-blue-50 p-4 rounded-2xl text-[#00BFFF] group-hover:bg-[#00BFFF] group-hover:text-white transition-all shadow-sm">
                  <FaBox size={24} />
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 uppercase">
                  ID: #{String(lote.id_lote).slice(0, 8)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[#00BFFF] mb-2">
                <FaTruck size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">Fornecedor</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#333] group-hover:text-[#00BFFF] transition-colors uppercase leading-tight">
                {lote.fornecedor_lote || "Não informado"}
              </h2>

              <div className="mt-6 grow">
                <div className="flex items-center gap-2 mb-3 text-gray-400">
                  <FaListUl size={10} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Itens principais:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lote.ativo && lote.ativo.length > 0 ? (
                    lote.ativo.slice(0, 3).map((at, index) => (
                      <span key={index} className="text-[9px] bg-gray-50 px-3 py-1.5 rounded-full text-gray-500 border border-gray-100 font-bold uppercase">
                        {at.nome_ativo}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] italic text-gray-400">Nenhum ativo vinculado</span>
                  )}
                  {lote.ativo?.length > 3 && (
                    <span className="text-[9px] bg-[#00BFFF]/10 px-3 py-1.5 rounded-full text-[#00BFFF] font-black uppercase">
                      +{lote.ativo.length - 3} itens
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-end mt-8 pt-6 border-t border-gray-50">
                <div className="flex gap-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Capacidade</span>
                    <span className="text-xl font-extrabold text-gray-800">{lote.quantidade_ativos}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Total Real</span>
                    <span className="text-xl font-extrabold text-[#00BFFF]">{lote.ativo?.length || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-300 group-hover:text-[#00BFFF] transition-all font-black text-[10px] uppercase tracking-tighter">
                   Detalhes <FaChevronRight size={10} />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 text-gray-400 font-black uppercase tracking-widest text-sm shadow-sm">
            Nenhum lote registrado no sistema
          </div>
        )}
      </div>
    </div>
  );
}

export default LotesPage;