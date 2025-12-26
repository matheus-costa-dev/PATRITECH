"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Ativos } from "@/types/ativos";
import Loading from "@/components/UI/Loading";
import { useAuth } from "@/context/AuthContext"; // Ajuste o caminho se necessário

export default function AtivoInfo() {
  const params = useParams();
  const router = useRouter();

  // Pegamos o usuário e o estado de autenticação do contexto
  const { user, isAuthenticated } = useAuth();

  const [ativo, setAtivo] = useState<Ativos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Ativos | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function getDetalhesAtivo() {
      try {
        setLoading(true);
        const res = await fetch(`/api/unicoAtivo/${params.id}`);
        if (!res.ok) throw new Error("Ativo não encontrado");
        const data = await res.json();
        setAtivo(data);
        setEditForm(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) getDetalhesAtivo();
  }, [params.id]);

  const handleSave = async () => {
    if (!editForm) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/unicoAtivo/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Erro ao atualizar");
      setAtivo(editForm); 
      setIsEditing(false);
      alert("Ativo atualizado com sucesso!");
    } catch (err) {
      alert("Erro ao salvar as alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- LÓGICA DE EXCLUSÃO COM VALIDAÇÃO DE ROLE ---
  const handleDelete = async () => {
    // 1. Verificação de segurança na função
    if (user?.role !== "ADMIN") {
      alert("Acesso negado: Apenas administradores podem excluir ativos.");
      return;
    }

    const confirmed = window.confirm("Tem certeza que deseja excluir este ativo?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/unicoAtivo/${params.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao excluir");

      alert("Ativo excluído com sucesso!");
      router.push("/"); 
    } catch (err) {
      alert("Não foi possível excluir o ativo.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <Loading />;

  if (error || !ativo) return (
    <div className="flex flex-col justify-center items-center h-screen w-screen bg-[#131416] text-white">
      <h1 className="text-xl font-bold">Ativo não encontrado</h1>
      <button onClick={() => router.back()} className="mt-4 text-indigo-400">← Voltar</button>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-[#131416] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-[#1b1c1f] border border-[#2c2d30] rounded-3xl shadow-2xl overflow-hidden transition-all">
        
        {/* Header do Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-1">
          <div className="bg-[#1b1c1f] p-8 rounded-[calc(1.5rem-1px)]">
            <div className="flex justify-between items-start">
              <button 
                onClick={() => router.back()}
                className="text-gray-400 hover:text-white transition-colors mb-6 flex items-center gap-2 text-sm"
              >
                ← Voltar
              </button>
              
              {/* Botão Editar: Visível para qualquer logado ou roles específicas conforme sua necessidade */}
              <button 
                onClick={() => {
                  console.log(user)
                  console.log(isAuthenticated)
                  setIsEditing(!isEditing);
                  if(isEditing) setEditForm(ativo);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  isEditing 
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
                    : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                }`}
              >
                {isEditing ? "Cancelar" : "Editar Dados"}
              </button>
            </div>

            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
              {isEditing ? "Editando Ativo" : "Detalhes do Ativo"}
            </h1>
          </div>
        </div>

        {/* Conteúdo (Inputs e Textos) */}
        <div className="p-8 space-y-8">
          {/* ... (campos ID, Data e Item permanecem iguais) ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Identificador</span>
              <div className="text-lg font-mono text-gray-500 bg-[#25262b]/50 p-3 rounded-xl border border-[#2c2d30]"># {ativo.id}</div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Data</span>
              {isEditing ? (
                <input 
                  type="date"
                  className="bg-[#25262b] text-white p-3 rounded-xl border border-indigo-500 focus:outline-none"
                  value={editForm?.data ? new Date(editForm.data).toISOString().split('T')[0] : ""}
                  onChange={(e) => setEditForm({...editForm!, data: e.target.value})}
                />
              ) : (
                <div className="text-lg text-gray-200 bg-[#25262b] p-3 rounded-xl border border-[#2c2d30]">{new Date(ativo.data).toLocaleDateString("pt-BR")}</div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 pt-4 border-t border-[#2c2d30]">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Nome do Item</span>
            {isEditing ? (
              <input 
                type="text"
                className="bg-[#25262b] text-2xl font-semibold text-white p-3 rounded-xl border border-indigo-500 w-full"
                value={editForm?.Item || ""}
                onChange={(e) => setEditForm({...editForm!, Item: e.target.value})}
              />
            ) : (
              <div className="text-3xl font-semibold text-white mt-1">{ativo.Item}</div>
            )}
          </div>

          {isEditing && (
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
            >
              {isSaving ? "Salvando..." : "Confirmar e Salvar"}
            </button>
          )}
        </div>

        {/* Rodapé Dinâmico com Verificação de Admin */}
        <div className="bg-[#25262b]/50 p-6 border-t border-[#2c2d30] flex justify-between items-center">
          {isEditing ? (
             <span className="text-xs text-gray-500 uppercase italic">Você está alterando este registro</span>
          ) : (
            <>
              {/* O botão só é renderizado se o usuário for ADMIN */}
              {user?.role === "ADMIN" ? (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-sm font-bold text-red-500 hover:text-red-400 transition-colors flex items-center gap-2 group"
                >
                  <span className="group-hover:rotate-12 transition-transform">🗑️</span>
                  {isDeleting ? "Excluindo..." : "Excluir Ativo"}
                </button>
              ) : (
                <span className="text-xs text-gray-500 italic">Somente leitura (Admin necessário para excluir)</span>
              )}
            </>
          )}
          
          <div className="flex gap-2 items-center">
            <div className={`h-2 w-2 rounded-full ${isEditing ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
            <span className="text-xs text-gray-400 uppercase tracking-tighter">
              {user?.nome ? `Usuário: ${user.nome}` : "Sincronizado"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}