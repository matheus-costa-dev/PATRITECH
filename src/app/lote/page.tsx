"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { toast } from "react-toastify";
import Loading from "@/components/UI/Loading";
import { FaBox, FaChevronRight, FaTruck, FaListUl } from "react-icons/fa";
import AddAtivoModal2 from "@/components/UI/AddAtivoModal2";

function LotesPage() {
  const [lotes, setLotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarLotes() {
    try {
      setLoading(true);
      // Alterado: Agora buscamos o nome_ativo dentro da relação
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
      setLotes(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao carregar lotes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarLotes();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen w-full bg-[#0f1012] p-8 text-white flex flex-col items-center">
      <div className="w-full max-w-5xl flex justify-between items-end mb-12">
        <div>
          <span className="text-indigo-500 font-black text-xs uppercase tracking-[0.3em]">Gestão de Carga</span>
          <h1 className="text-5xl font-black tracking-tighter mt-2">Lotes</h1>
        </div>
        <div className="shrink-0">
          <AddAtivoModal2 onSuccess={carregarLotes} />
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {lotes.length > 0 ? (
          lotes.map((lote) => (
            <Link 
              key={lote.id_lote} 
              href={`/lote/${lote.id_lote}`}
              className="group block bg-[#1b1c1f] p-8 rounded-[40px] border border-white/5 hover:border-indigo-500/50 transition-all shadow-2xl min-h-[300px] flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-indigo-500/10 p-4 rounded-2xl text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <FaBox size={24} />
                </div>
                <span className="text-[10px] font-mono text-gray-600 uppercase">ID: #{lote.id_lote}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <FaTruck size={12} className="text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Fornecedor</span>
              </div>
              <h2 className="text-2xl font-black group-hover:text-indigo-400 transition-colors uppercase">
                {lote.fornecedor_lote || "Não informado"}
              </h2>

              {/* LISTA DE ATIVOS NO LOTE */}
              <div className="mt-4 flex-grow">
                <div className="flex items-center gap-2 mb-2 text-gray-500">
                  <FaListUl size={10} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Itens neste lote:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lote.ativo && lote.ativo.length > 0 ? (
                    lote.ativo.slice(0, 3).map((at: any, index: number) => (
                      <span key={index} className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-gray-400 border border-white/5">
                        {at.nome_ativo}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] italic text-gray-600">Nenhum ativo vinculado</span>
                  )}
                  {lote.ativo?.length > 3 && (
                    <span className="text-[10px] text-indigo-500 font-bold">+{lote.ativo.length - 3} itens</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
                <div className="flex gap-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Capacidade</span>
                    <span className="text-xl font-black text-white">{lote.quantidade_ativos}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Real</span>
                    <span className="text-xl font-black text-indigo-500">{lote.ativo?.length || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600 group-hover:text-white transition-all font-black text-[10px] uppercase">
                   Ver Mais <FaChevronRight size={10} />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-[#1b1c1f] rounded-[40px] border border-dashed border-white/10 text-gray-500 font-black uppercase tracking-widest text-sm">
            Nenhum lote encontrado
          </div>
        )}
      </div>
    </div>
  );
}

export default LotesPage;