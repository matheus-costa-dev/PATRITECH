"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Ativo } from "@/types/ativo";
import Loading from "@/components/UI/Loading";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";

export default function AtivoPage() {
  const params = useParams();
  const router = useRouter();

  const [ativo, setAtivo] = useState<Ativo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function getDetalhesAtivo() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ativo")
        .select(`
          *,
          categoria_ativo (id_categoria, nome_categoria),
          localizacao (id_localizacao, nome_localizacao),
          condicao_ativo (id_condicao, nome_condicao)
        `)
        .eq("id_ativo", params.id)
        .single();

      if (error || !data) throw new Error();

      setAtivo(data);
      setEditForm({
        nome_ativo: data.nome_ativo,
        categoria: data.categoria_ativo?.nome_categoria,
        local: data.localizacao?.nome_localizacao,
        id_condicao: data.id_condicao
      });
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.id) getDetalhesAtivo();
  }, [params.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let { data: catData } = await supabase.from("categoria_ativo").select("id_categoria").eq("nome_categoria", editForm.categoria).single();
      if (!catData) {
        const { data: newCat } = await supabase.from("categoria_ativo").insert({ nome_categoria: editForm.categoria }).select().single();
        catData = newCat;
      }

      let { data: locData } = await supabase.from("localizacao").select("id_localizacao").eq("nome_localizacao", editForm.local).single();
      if (!locData) {
        const { data: newLoc } = await supabase.from("localizacao").insert({ nome_localizacao: editForm.local }).select().single();
        locData = newLoc;
      }

      const { error } = await supabase
        .from("ativo")
        .update({
          nome_ativo: editForm.nome_ativo,
          id_categoria: catData?.id_categoria,
          id_localizacao: locData?.id_localizacao,
          id_condicao: editForm.id_condicao,
          data_ultima_verificacao: new Date().toISOString()
        })
        .eq("id_ativo", params.id);

      if (error) throw error;

      toast.success("Ativo atualizado!");
      setIsEditing(false);
      getDetalhesAtivo();
    } catch (err) {
      toast.error("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este ativo?")) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("ativo").delete().eq("id_ativo", params.id);
      if (error) throw error;
      toast.success("Ativo excluído!");
      router.push("/ativos");
    } catch (err) {
      toast.error("Erro ao excluir.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <Loading />;
  if (error || !ativo) return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#131416] text-white">
      <button onClick={() => router.back()} className="text-indigo-400">← Ativo não encontrado. Voltar</button>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-[#131416] flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-2xl bg-[#1b1c1f] border border-[#2c2d30] rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
        
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-1">
          <div className="bg-[#1b1c1f] p-8 rounded-[calc(1.5rem-4px)]">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                ← Voltar
              </button>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isEditing ? "bg-gray-500/10 text-gray-400" : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                  }`}
                >
                  {isEditing ? "Cancelar" : "Editar Dados"}
                </button>

                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20 disabled:opacity-50"
                >
                  {isDeleting ? "Excluindo..." : "Excluir Ativo"}
                </button>
              </div>
            </div>

            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              {isEditing ? "Editando Ativo" : "Detalhes do Ativo"}
            </h1>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Identificador</span>
              <div className="text-lg font-mono text-gray-500 bg-[#25262b] p-3 rounded-2xl border border-[#2c2d30]">
                # {ativo.id_ativo.slice(0, 8)}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Data de Registro</span>
              <div className="text-lg text-gray-200 bg-[#25262b] p-3 rounded-2xl border border-[#2c2d30]">
                {new Date(ativo.data_criacao).toLocaleDateString("pt-BR")}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-[#2c2d30]">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Nome do Item</span>
            {isEditing ? (
              <input 
                type="text"
                className="bg-[#25262b] text-2xl font-semibold text-white p-4 rounded-2xl border border-indigo-500/50 focus:border-indigo-500 w-full outline-none transition-all"
                value={editForm.nome_ativo}
                onChange={(e) => setEditForm({...editForm, nome_ativo: e.target.value})}
              />
            ) : (
              <div className="text-3xl font-semibold text-white mt-1 px-1">{ativo.nome_ativo}</div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#2c2d30]">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Categoria</span>
              {isEditing ? (
                <input 
                  type="text"
                  className="bg-[#25262b] text-white p-4 rounded-2xl border border-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                  value={editForm.categoria}
                  onChange={(e) => setEditForm({...editForm, categoria: e.target.value})}
                />
              ) : (
                <div className="text-lg text-gray-200 bg-[#25262b] p-3 rounded-2xl border border-[#2c2d30]">
                  {ativo.categoria_ativo?.nome_categoria}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Localização</span>
              {isEditing ? (
                <input 
                  type="text"
                  className="bg-[#25262b] text-white p-4 rounded-2xl border border-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                  value={editForm.local}
                  onChange={(e) => setEditForm({...editForm, local: e.target.value})}
                />
              ) : (
                <div className="text-lg text-gray-200 bg-[#25262b] p-3 rounded-2xl border border-[#2c2d30]">
                  {ativo.localizacao?.nome_localizacao}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98]"
            >
              {isSaving ? "Salvando..." : "Confirmar e Salvar Alterações"}
            </button>
          )}
        </div>

        <div className="bg-[#25262b]/50 p-6 border-t border-[#2c2d30] flex justify-end items-center">
          <div className="flex gap-2 items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Sincronizado</span>
          </div>
        </div>

      </div>
    </div>
  );
}