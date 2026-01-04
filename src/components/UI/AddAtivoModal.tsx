"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase";
import { Categoria, Condicao } from "@/types/ativo";

interface AddAtivoModalProps {
  onSuccess: () => void;
}

export default function AddAtivoModal({ onSuccess }: AddAtivoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados com os nomes originais que você usava
  const [nome, setNome] = useState("");
  const [dataAtivo, setDataAtivo] = useState("");
  const [categoria, setCategoria] = useState(""); // Texto livre
  const [local, setLocal] = useState(""); // Texto livre (como solicitado)
  const [statusAtivo, setStatusAtivo] = useState(""); // Nome da condição
  const [defeito, setDefeito] = useState("");

  const [condicoes, setCondicoes] = useState<Condicao[]>([]);

  // Carrega apenas as condições para saber qual gera avaria
  useEffect(() => {
    async function fetchCondicoes() {
      const { data } = await supabase.from("condicao_ativo").select("*");
      if (data) setCondicoes(data);
    }
    if (isOpen) fetchCondicoes();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const condicaoSelecionada = condicoes.find(c => c.nome_condicao === statusAtivo);
    const precisaDeDefeito = condicaoSelecionada?.gera_avaria;

    if (!nome || !dataAtivo || !categoria || !local || !statusAtivo) {
      return toast.warning("Preencha todos os campos principais!");
    }

    if (precisaDeDefeito && !defeito) {
      return toast.warning("Por favor, descreva o defeito detectado!");
    }

    setLoading(true);
    try {
      // 1. Lógica para Categoria (Busca ou Cria)
      let { data: catData } = await supabase.from("categoria_ativo").select("id_categoria").eq("nome_categoria", categoria).maybeSingle();
      if (!catData) {
        const { data: newCat } = await supabase.from("categoria_ativo").insert({ nome_categoria: categoria }).select().single();
        catData = newCat;
      }

      // 2. Lógica para Localização (Busca ou Cria)
      let { data: locData } = await supabase.from("localizacao").select("id_localizacao").eq("nome_localizacao", local).maybeSingle();
      if (!locData) {
        const { data: newLoc } = await supabase.from("localizacao").insert({ nome_localizacao: local }).select().single();
        locData = newLoc;
      }

      // 3. CHAMADA DA RPC (Substitui os inserts manuais de Ativo e Defeito)
      // Isso garante que o texto do defeito e a origem da localização nasçam juntos
      const { data: idGerado, error: rpcError } = await supabase.rpc('cadastrar_ativo_com_defeito', {
        p_nome_ativo: nome,
        p_id_categoria: catData?.id_categoria,
        p_id_condicao: condicaoSelecionada?.id_condicao,
        p_id_localizacao: locData?.id_localizacao,
        p_descricao_defeito: defeito // Aqui o seu texto (ex: "teste 3") entra no banco
      });

      if (rpcError) throw rpcError;

      // Opcional: Se você quiser atualizar a data_criacao para a data de aquisição 
      // (Já que a RPC usa o NOW() por padrão no banco)
      if (dataAtivo) {
        await supabase.from("ativo").update({ data_criacao: dataAtivo }).eq("id_ativo", idGerado);
      }

      toast.success("Ativo adicionado com sucesso!");
      resetForm();
      setIsOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao adicionar ativo.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNome(""); setDataAtivo(""); setCategoria(""); setLocal(""); setStatusAtivo(""); setDefeito("");
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2">
        <span>+</span> Novo Ativo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1b1c1f] border border-[#2c2d30] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#2c2d30] flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Adicionar Novo Ativo</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Nome do Item</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-[#25262b] border border-[#2c2d30] rounded-xl p-3 mt-1 text-white outline-none" placeholder="Ex: Notebook Dell" />
              </div>

              <div>
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Data de Aquisição</label>
                <input type="date" value={dataAtivo} onChange={(e) => setDataAtivo(e.target.value)} className="w-full bg-[#25262b] border border-[#2c2d30] rounded-xl p-3 mt-1 text-white outline-none" />
              </div>

              <div>
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Categoria</label>
                <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-[#25262b] border border-[#2c2d30] rounded-xl p-3 mt-1 text-white outline-none" placeholder="Ex: Informática" />
              </div>

              <div>
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Diga a localização atual do ativo</label>
                <input type="text" value={local} onChange={(e) => setLocal(e.target.value)} className="w-full bg-[#25262b] border border-[#2c2d30] rounded-xl p-3 mt-1 text-white outline-none" placeholder="Ex: Sala 402" />
              </div>

              <div>
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-3">Estado de conservação</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Excelente", "Bom", "Ruim", "Inutilizável"].map((opcao) => (
                    <label key={opcao} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${statusAtivo === opcao ? "bg-indigo-600/20 border-indigo-500 text-white" : "bg-[#25262b] border-[#2c2d30] text-gray-400"}`}>
                      <input type="radio" name="statusAtivo" value={opcao} checked={statusAtivo === opcao} onChange={(e) => setStatusAtivo(e.target.value)} className="w-4 h-4 accent-indigo-500" />
                      <span className="text-sm font-medium">{opcao}</span>
                    </label>
                  ))}
                </div>
              </div>

              {(statusAtivo === "Ruim" || statusAtivo === "Inutilizável") && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Descreva o Defeito</label>
                  <input type="text" value={defeito} onChange={(e) => setDefeito(e.target.value)} className="w-full bg-[#25262b] border border-[#2c2d30] rounded-xl p-3 text-white outline-none" placeholder="Ex: tela trincada" />
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                {loading ? "Salvando..." : "Salvar Ativo"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}