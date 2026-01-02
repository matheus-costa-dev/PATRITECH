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

  // Lógica Reativa: calculada a cada renderização baseada no statusAtivo selecionado
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
      // 1. Categoria e Localização (Busca ou Cria)
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

      // 2. Criar o Lote
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

      // 3. Criar os Ativos vinculados
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

      // 4. Registrar Defeitos se necessário
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
      <button onClick={() => setIsOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2">
        <span>+</span> Novo lote de ativos
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1b1c1f] border border-[#2c2d30] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#2c2d30] bg-emerald-600/5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Cadastrar Lote</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Nome dos Itens</label>
                  <input type="text" value={nomeBase} onChange={(e) => setNomeBase(e.target.value)} className="w-full bg-[#25262b] border border-[#2c2d30] rounded-xl p-3 mt-1 text-white outline-none focus:border-emerald-500" placeholder="Ex: Monitor LG" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Qtd</label>
                  <input type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} className="w-full bg-[#25262b] border border-[#2c2d30] rounded-xl p-3 mt-1 text-white outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Fornecedor</label>
                <input type="text" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} className="w-full bg-[#25262b] border border-[#2c2d30] rounded-xl p-3 mt-1 text-white outline-none focus:border-emerald-500" placeholder="Ex: Distribuidora X" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Data Compra</label>
                  <input type="date" value={dataCompra} onChange={(e) => setDataCompra(e.target.value)} className="w-full bg-[#25262b] border border-[#2c2d30] rounded-xl p-3 mt-1 text-white outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Categoria</label>
                  <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-[#25262b] border border-[#2c2d30] rounded-xl p-3 mt-1 text-white outline-none" placeholder="Informática" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Destino (Localização)</label>
                <input type="text" value={local} onChange={(e) => setLocal(e.target.value)} className="w-full bg-[#25262b] border border-[#2c2d30] rounded-xl p-3 mt-1 text-white outline-none" placeholder="Ex: Sala de Reunião" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-2">Estado dos Ativos</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Excelente", "Bom", "Ruim", "Inutilizável"].map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setStatusAtivo(op)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${statusAtivo === op ? "bg-emerald-600 border-emerald-500 text-white" : "bg-[#25262b] border-[#2c2d30] text-gray-400"}`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              {precisaDeDefeito && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Avaria Identificada</label>
                  <textarea value={defeito} onChange={(e) => setDefeito(e.target.value)} className="w-full bg-[#25262b] border border-red-900/50 rounded-xl p-3 mt-1 text-white outline-none" rows={2} placeholder="Descreva o problema comum em todos os itens..." />
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-4">
                {loading ? "Processando..." : `Finalizar Lote com ${quantidade} itens`}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}