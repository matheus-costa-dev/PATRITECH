"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase";
import { Condicao } from "@/types/ativo";

interface AddAtivoModalProps {
  onSuccess: () => void;
}

export default function AddAtivoModal2({ onSuccess }: AddAtivoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados dos campos
  const [nomeBase, setNomeBase] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [fornecedor, setFornecedor] = useState("");
  const [dataCompra, setDataCompra] = useState(new Date().toISOString().split('T')[0]);
  const [categoria, setCategoria] = useState("");
  const [local, setLocal] = useState("");
  const [statusAtivo, setStatusAtivo] = useState("");
  const [defeito, setDefeito] = useState("");

  const [condicoes, setCondicoes] = useState<Condicao[]>([]);

  const condicaoSelecionada = condicoes.find(c => c.nome_condicao === statusAtivo);
  const precisaDeDefeito = condicaoSelecionada?.gera_avaria || false;

  useEffect(() => {
    async function fetchCondicoes() {
      const { data } = await supabase.from("condicao_ativo").select("*");
      if (data) setCondicoes(data);
    }
    if (isOpen) fetchCondicoes();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeBase || !categoria || !local || !statusAtivo || quantidade < 1) {
      return toast.warning("Preencha os campos obrigatórios!");
    }

    if (precisaDeDefeito && !defeito) {
      return toast.warning("Descreva o defeito para ativos nesta condição!");
    }

    setLoading(true);
    try {
      let catId: number;
      let locId: number;

      const { data: catData } = await supabase.from("categoria_ativo").select("id_categoria").eq("nome_categoria", categoria).maybeSingle();
      if (!catData) {
        const { data: newCat, error: errCat } = await supabase.from("categoria_ativo").insert({ nome_categoria: categoria }).select("id_categoria").single();
        if (errCat) throw errCat;
        catId = newCat.id_categoria;
      } else {
        catId = catData.id_categoria;
      }

      const { data: locData } = await supabase.from("localizacao").select("id_localizacao").eq("nome_localizacao", local).maybeSingle();
      if (!locData) {
        const { data: newLoc, error: errLoc } = await supabase.from("localizacao").insert({ nome_localizacao: local }).select("id_localizacao").single();
        if (errLoc) throw errLoc;
        locId = newLoc.id_localizacao;
      } else {
        locId = locData.id_localizacao;
      }

      const { data: loteCriado, error: loteError } = await supabase
        .from("lote")
        .insert([{ 
            quantidade_ativos: quantidade,
            fornecedor_lote: fornecedor,
            data_compra: dataCompra
        }])
        .select("id_lote")
        .single();

      if (loteError || !loteCriado) throw loteError || new Error("Falha ao criar lote");

      const idLoteGerado = loteCriado.id_lote;

      const ativosParaInserir = Array.from({ length: quantidade }).map((_, index) => ({
        nome_ativo: `${nomeBase} ${index + 1}/${quantidade}`,
        id_categoria: catId,
        id_localizacao: locId,
        id_condicao: condicaoSelecionada?.id_condicao,
        id_lote: idLoteGerado,
        data_criacao: dataCompra
      }));

      const { data: ativosCriados, error: ativosError } = await supabase
        .from("ativo")
        .insert(ativosParaInserir)
        .select("id_ativo");

      if (ativosError) throw ativosError;

      if (precisaDeDefeito && ativosCriados) {
        const defeitosParaInserir = ativosCriados.map(ativo => ({
          id_ativo: ativo.id_ativo,
          descricao_defeito: defeito,
          solucionado: false
        }));
        await supabase.from("ativo_defeituoso").insert(defeitosParaInserir);
      }

      toast.success(`Lote de ${quantidade} ativos cadastrado!`);
      resetForm();
      setIsOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast.error(error.message || "Erro ao processar lote.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNomeBase(""); setQuantidade(1); setFornecedor(""); setCategoria(""); setLocal(""); setStatusAtivo(""); setDefeito("");
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="bg-[#7AC143] hover:bg-[#68a637] text-white px-8 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex items-center gap-2 active:scale-95"
      >
        <span className="text-lg">+</span> Novo Lote
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="p-8 border-b border-gray-200 flex justify-between items-center bg-gray-50/80">
              <div>
                <h2 className="text-xl font-black text-[#7AC143] uppercase tracking-tighter">Entrada de Lote</h2>
                <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest mt-1">Gestão de Grande Volume</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-red-600 transition-colors border border-gray-200">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-[#7AC143] uppercase tracking-widest ml-1">Nome Base dos Itens</label>
                  <input type="text" value={nomeBase} onChange={(e) => setNomeBase(e.target.value)} className="w-full bg-white border border-gray-400 rounded-2xl p-4 text-gray-800 outline-none focus:border-[#7AC143] focus:ring-1 focus:ring-[#7AC143] transition-all placeholder:text-gray-400 font-bold" placeholder="Ex: Monitor LG" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#7AC143] uppercase tracking-widest ml-1">Qtd</label>
                  <input type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} className="w-full bg-white border border-gray-400 rounded-2xl p-4 text-gray-800 outline-none focus:border-[#7AC143] focus:ring-1 focus:ring-[#7AC143] transition-all font-bold" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#7AC143] uppercase tracking-widest ml-1">Fornecedor / Origem</label>
                <input type="text" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} className="w-full bg-white border border-gray-400 rounded-2xl p-4 text-gray-800 outline-none focus:border-[#7AC143] focus:ring-1 focus:ring-[#7AC143] transition-all placeholder:text-gray-400 font-bold" placeholder="Ex: Dell Brasil Ltda" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#7AC143] uppercase tracking-widest ml-1">Data da Compra</label>
                  <input type="date" value={dataCompra} onChange={(e) => setDataCompra(e.target.value)} className="w-full bg-white border border-gray-400 rounded-2xl p-4 text-gray-800 outline-none focus:border-[#7AC143] focus:ring-1 focus:ring-[#7AC143] transition-all font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#7AC143] uppercase tracking-widest ml-1">Categoria</label>
                  <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-white border border-gray-400 rounded-2xl p-4 text-gray-800 outline-none focus:border-[#7AC143] focus:ring-1 focus:ring-[#7AC143] transition-all placeholder:text-gray-400 font-bold" placeholder="Ex: Mobiliário" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#7AC143] uppercase tracking-widest ml-1">Localização de Destino</label>
                <input type="text" value={local} onChange={(e) => setLocal(e.target.value)} className="w-full bg-white border border-gray-400 rounded-2xl p-4 text-gray-800 outline-none focus:border-[#7AC143] focus:ring-1 focus:ring-[#7AC143] transition-all placeholder:text-gray-400 font-bold" placeholder="Ex: Almoxarifado Central" />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#7AC143] uppercase tracking-widest ml-1 block">Estado Geral do Lote</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Excelente", "Bom", "Ruim", "Inutilizável"].map((op) => (
                    <label key={op} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${statusAtivo === op ? "bg-[#7AC143] border-[#7AC143] text-white shadow-md" : "bg-white border-gray-300 text-gray-700 hover:border-[#7AC143]"}`}>
                      <input type="radio" name="statusAtivo" value={op} checked={statusAtivo === op} onChange={(e) => setStatusAtivo(e.target.value)} className="hidden" />
                      <span className={`text-xs font-black uppercase tracking-tighter ${statusAtivo === op ? "text-white" : "text-gray-700"}`}>{op}</span>
                    </label>
                  ))}
                </div>
              </div>

              {precisaDeDefeito && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="text-[10px] font-black text-red-700 uppercase tracking-widest ml-1">Defeito Comum Identificado</label>
                  <textarea value={defeito} onChange={(e) => setDefeito(e.target.value)} className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 text-gray-800 outline-none focus:border-red-500 transition-all placeholder:text-red-300 font-bold h-24" placeholder="Descreva a avaria presente nos itens..." />
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-[#7AC143] hover:bg-[#68a637] text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-full shadow-lg shadow-green-100 transition-all active:scale-95 disabled:opacity-50 mt-4">
                {loading ? "Processando Lote..." : `Finalizar Lote (${quantidade} Itens)`}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}