"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Ativo } from "@/types/ativo";
import Loading from "@/components/UI/Loading";
import AddAtivoModal from "@/components/UI/AddAtivoModal";
import AddAtivoModal2 from "@/components/UI/AddAtivoModal2";
import { supabase } from "@/lib/supabase";

export default function AtivosPage() {
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

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
    <div className="h-full w-full py-20 bg-[#131416]">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-extrabold text-center text-white mb-12 tracking-tight">
          Painel de Ativos
        </h1>

        {/* Barra de Ações */}
        <div className="mb-12 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-grow w-full">
            <input
              type="text"
              placeholder="Buscar por nome do ativo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1b1c1f] border border-[#2c2d30] text-gray-200 px-5 py-3 rounded-xl 
                         focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                         transition-all duration-200 placeholder:text-gray-500 shadow-lg"
            />
            <span className="absolute right-4 top-3.5 text-gray-500">🔍</span>
          </div>

          <div className="flex shrink-0 gap-3 w-full md:w-auto">
            <AddAtivoModal onSuccess={refreshData} />
            <AddAtivoModal2 onSuccess={refreshData} />
          </div>
        </div>

        {/* Lista de Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {ativosFiltrados.length > 0 ? (
            ativosFiltrados.map((ativo) => (
              <Link
                key={ativo.id_ativo}
                href={`/ativos/${ativo.id_ativo}`}
                className="group block p-6 rounded-3xl bg-[#1b1c1f] border border-[#2c2d30]
                           shadow-xl transition-all duration-300 
                           hover:-translate-y-1 hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.3)]
                           hover:border-indigo-500/50"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-100 group-hover:text-indigo-400 transition-colors">
                    {ativo.nome_ativo}
                  </h2>
                  <span className="text-[10px] text-gray-500 font-mono bg-[#25262b] px-2 py-1 rounded-md">
                    #{ativo.id_ativo.slice(0,6)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {ativo.categoria_ativo && (
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {ativo.categoria_ativo.nome_categoria}
                    </span>
                  )}
                  {ativo.localizacao && (
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {ativo.localizacao.nome_localizacao}
                    </span>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#2c2d30] flex justify-between items-center text-xs">
                   <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    {new Date(ativo.data_criacao).toLocaleDateString("pt-BR")}
                   </div>
                   <span className="text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    Gerenciar →
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center col-span-full py-20 bg-[#1b1c1f] rounded-3xl border border-dashed border-[#2c2d30]">
              <p className="text-gray-500 font-medium italic">Nenhum ativo encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}