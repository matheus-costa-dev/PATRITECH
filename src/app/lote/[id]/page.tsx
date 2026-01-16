"use client";

import { useEffect, useState, useCallback } from "react"; // Adicionado useCallback
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { toast } from "react-toastify";
import Loading from "@/components/UI/Loading";
import { FaArrowLeft, FaTrash, FaExclamationTriangle, FaBoxOpen, FaExternalLinkAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import ForbiddenAccess from "@/components/shared/ForbiddenAccess";

// 1. Definição de Interfaces para eliminar o "any"
interface LoteDetalhe {
  id_lote: string;
  fornecedor_lote: string | null;
  data_compra: string;
  quantidade_ativos?: number;
}

interface AtivoVinculado {
  id_ativo: string;
  nome_ativo: string;
  categoria_ativo: { nome_categoria: string } | null;
  localizacao: { nome_localizacao: string } | null;
  condicao_ativo: { nome_condicao: string } | null;
}

export default function DetalheLotePage() {
  const { id } = useParams();
  const router = useRouter();
  const [lote, setLote] = useState<LoteDetalhe | null>(null);
  const [ativos, setAtivos] = useState<AtivoVinculado[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // 2. Uso de useCallback para resolver o erro 'exhaustive-deps' do useEffect
  const carregarDadosLote = useCallback(async () => {
    try {
      setLoading(true);
      const { data: loteData, error: loteError } = await supabase
        .from("lote")
        .select("*")
        .eq("id_lote", id)
        .single();

      if (loteError) throw loteError;
      setLote(loteData);

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
      setAtivos((ativosData as unknown as AtivoVinculado[]) || []);
    } catch {
      toast.error("Erro ao carregar detalhes do lote");
      router.push("/lote");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  async function apagarLoteCompleto() {
    const confirmar = confirm("ATENÇÃO: Isso apagará o lote e TODOS os ativos vinculados a ele permanentemente. Deseja continuar?");
    if (!confirmar) return;

    try {
      const { error: errorAtivos } = await supabase
        .from("ativo")
        .delete()
        .eq("id_lote", id);

      if (errorAtivos) throw errorAtivos;

      const { error: errorLote } = await supabase
        .from("lote")
        .delete()
        .eq("id_lote", id);

      if (errorLote) throw errorLote;

      toast.success("Lote e ativos removidos com sucesso!");
      router.push("/lote");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error("Erro ao apagar: " + error.message);
    }
  }

  async function relatarProblemaEmMassa() {
    const descricao = prompt("Descreva o problema que afeta todos os ativos deste lote:");
    if (!descricao) return;

    try {
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
    } catch {
      toast.error("Erro ao registrar problemas");
    }
  }

  useEffect(() => {
    if (id) carregarDadosLote();
  }, [id, carregarDadosLote]);

  if (loading) return <Loading />;

    if (!isAuthenticated) {
    return (
      <ForbiddenAccess />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] pb-20 font-sans text-[#333]">
      <div className="max-w-5xl mx-auto px-4 pt-12">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-[#00BFFF] transition-colors mb-8 font-bold uppercase text-[10px] tracking-widest group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Voltar para Lotes
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#8b1d22] text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter">
                Carga Identificada
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#333]">
              {lote?.fornecedor_lote || `Lote #${id}`}
            </h1>
            <div className="flex items-center gap-2 mt-4 text-gray-500 font-medium">
              <div className="w-2 h-2 rounded-full bg-[#00BFFF]"></div>
              <span>Comprado em {lote?.data_compra ? new Date(lote.data_compra).toLocaleDateString('pt-BR') : 'Data não disponível'}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={relatarProblemaEmMassa}
              className="flex-1 sm:flex-none bg-[#FFA500] hover:bg-[#E69500] text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <FaExclamationTriangle /> Relatar Problema em Massa
            </button>
            <button
              onClick={apagarLoteCompleto}
              className="flex-1 sm:flex-none bg-white border-2 border-red-100 text-red-500 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <FaTrash /> Apagar Tudo
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-4 border-b border-gray-200 pb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
              Itens no Lote ({ativos.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {ativos.length > 0 ? (
              ativos.map((ativo) => (
                <div
                  key={ativo.id_ativo}
                  // Corrigido: rounded-[2rem] -> rounded-4xl
                  className="bg-white border border-gray-100 p-5 md:p-8 rounded-4xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-6 w-full">
                    <div className="bg-gray-50 p-5 rounded-2xl text-[#00BFFF] shrink-0 border border-gray-100 group-hover:bg-[#00BFFF]/5 transition-colors">
                      <FaBoxOpen size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#333] tracking-tight">{ativo.nome_ativo}</h4>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase text-gray-300">Localização</span>
                          <span className="text-[10px] font-bold text-gray-600">{ativo.localizacao?.nome_localizacao}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase text-gray-300">Condição</span>
                          <span className="text-[10px] font-bold text-[#00BFFF]">{ativo.condicao_ativo?.nome_condicao}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/ativos/${ativo.id_ativo}`}
                    className="w-full md:w-auto bg-[#00BFFF] hover:bg-[#0096C7] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    Visualizar <FaExternalLinkAlt size={10} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="py-24 text-center bg-white rounded-4xl border-2 border-dashed border-gray-200">
                <FaBoxOpen size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Este lote está vazio no momento</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}