"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { toast } from "react-toastify";
import Loading from "@/components/UI/Loading";
import { FaArrowLeft, FaTrash, FaExclamationTriangle, FaBoxOpen, FaExternalLinkAlt } from "react-icons/fa";

export default function DetalheLotePage() {
  const { id } = useParams();
  const router = useRouter();
  const [lote, setLote] = useState<any>(null);
  const [ativos, setAtivos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarDadosLote() {
    try {
      setLoading(true);
      // 1. Busca dados do lote
      const { data: loteData, error: loteError } = await supabase
        .from("lote")
        .select("*")
        .eq("id_lote", id)
        .single();

      if (loteError) throw loteError;
      setLote(loteData);

      // 2. Busca ativos vinculados a este lote
      const { data: ativosData, error: ativosError } = await supabase
        .from("ativo")
        .select(`
          id_ativo,
          nome_ativo,
          categoria_ativo (nome_categoria),
          localizacao (nome_localizacao),
          condicao_ativo (nome_condicao)
        `)
        .eq("id_lote", id);

      if (ativosError) throw ativosError;
      setAtivos(ativosData || []);
    } catch (err: any) {
      toast.error("Erro ao carregar detalhes do lote");
      router.push("/lote");
    } finally {
      setLoading(false);
    }
  }

  // FUNÇÃO PARA APAGAR LOTE E ATIVOS (Cascata manual)
  async function apagarLoteCompleto() {
    const confirmar = confirm("ATENÇÃO: Isso apagará o lote e TODOS os ativos vinculados a ele permanentemente. Deseja continuar?");
    if (!confirmar) return;

    try {
      // 1. Apaga os ativos primeiro (devido às constraints de FK)
      const { error: errorAtivos } = await supabase
        .from("ativo")
        .delete()
        .eq("id_lote", id);
      
      if (errorAtivos) throw errorAtivos;

      // 2. Apaga o lote
      const { error: errorLote } = await supabase
        .from("lote")
        .delete()
        .eq("id_lote", id);

      if (errorLote) throw errorLote;

      toast.success("Lote e ativos removidos com sucesso!");
      router.push("/lote");
    } catch (err: any) {
      toast.error("Erro ao apagar: " + err.message);
    }
  }

  // FUNÇÃO PARA RELATAR PROBLEMA EM MASSA
  async function relatarProblemaEmMassa() {
    const descricao = prompt("Descreva o problema que afeta todos os ativos deste lote:");
    if (!descricao) return;

    try {
      // Cria um registro de defeito para cada ativo do lote
      const registrosDefeito = ativos.map(ativo => ({
        id_ativo: ativo.id_ativo,
        descricao_defeito: `[PROBLEMA EM LOTE] ${descricao}`,
        solucionado: false
      }));

      const { error } = await supabase
        .from("ativo_defeituoso")
        .insert(registrosDefeito);

      if (error) throw error;
      toast.success("Problema registrado para todos os ativos!");
    } catch (err: any) {
      toast.error("Erro ao registrar problemas");
    }
  }

  useEffect(() => {
    if (id) carregarDadosLote();
  }, [id]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen w-full bg-[#0f1012] p-4 md:p-12 text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* VOLTAR */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 font-black uppercase text-[10px] tracking-widest">
          <FaArrowLeft /> Voltar para Lotes
        </button>

        {/* CABEÇALHO DE AÇÕES */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="text-indigo-500 font-black text-xs uppercase tracking-[0.3em]">Detalhes da Carga</span>
            <h1 className="text-5xl font-black tracking-tighter mt-2">{lote?.fornecedor_lote || `Lote #${id}`}</h1>
            <p className="text-gray-500 mt-2 font-medium">Comprado em {new Date(lote?.data_compra).toLocaleDateString('pt-BR')}</p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={relatarProblemaEmMassa}
              className="flex-1 md:flex-none bg-amber-500/10 text-amber-500 border border-amber-500/20 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all flex items-center justify-center gap-2"
            >
              <FaExclamationTriangle /> Relatar Problema em Massa
            </button>
            <button 
              onClick={apagarLoteCompleto}
              className="flex-1 md:flex-none bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <FaTrash /> Apagar Tudo
            </button>
          </div>
        </div>

        {/* LISTAGEM DE ATIVOS */}
        <div className="grid grid-cols-1 gap-4">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600 mb-2">Ativos Vinculados ({ativos.length})</h3>
          {ativos.length > 0 ? (
            ativos.map((ativo) => (
              <div 
                key={ativo.id_ativo}
                className="bg-[#1b1c1f] border border-white/5 p-6 rounded-[30px] flex flex-col md:flex-row justify-between items-center gap-4 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-center gap-6 w-full">
                  <div className="bg-indigo-500/10 p-4 rounded-2xl text-indigo-500 shrink-0">
                    <FaBoxOpen size={20} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black">{ativo.nome_ativo}</h4>
                    <div className="flex flex-wrap gap-3 mt-1">
                      <span className="text-[9px] font-bold uppercase text-gray-500">Local: {ativo.localizacao?.nome_localizacao}</span>
                      <span className="text-[9px] font-bold uppercase text-indigo-400">Condição: {ativo.condicao_ativo?.nome_condicao}</span>
                    </div>
                  </div>
                </div>

                <Link 
                  href={`/ativos/${ativo.id_ativo}`}
                  className="w-full md:w-auto bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all"
                >
                  Abrir Ativo <FaExternalLinkAlt size={10} />
                </Link>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-[#1b1c1f] rounded-[40px] border border-dashed border-white/5">
              <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">Este lote não possui ativos cadastrados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}