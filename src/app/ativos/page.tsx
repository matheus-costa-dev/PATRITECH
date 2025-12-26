"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Ativos } from "@/types/ativos";
import Loading from "@/components/UI/Loading";

export default function AtivosPage() {
  const [ativos, setAtivos] = useState<Ativos[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // Novo estado para busca
  const [loading, setLoading] = useState<boolean>(true);

  async function getAtivos() {
    try {
      setLoading(true);
      const res = await fetch("/api/ativos");
      const data = await res.json();
      setAtivos(data);
    } catch (error) {
      console.error("Erro ao buscar ativos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAtivos();
  }, []);

  // Lógica de filtragem: filtra a lista original baseada no searchTerm
  const ativosFiltrados = ativos.filter((ativo) =>
    ativo.Item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="h-full w-full py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-2xl font-extrabold text-center text-white mb-8 tracking-tight">
          Ativos
        </h1>

        {/* Barra de Busca */}
        <div className="mb-12 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1b1c1f] border border-[#2c2d30] text-gray-200 px-5 py-3 rounded-xl 
                         focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                         transition-all duration-200 placeholder:text-gray-500"
            />
            {/* Ícone opcional de busca */}
            <span className="absolute right-4 top-3.5 text-gray-500">
              🔍
            </span>
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2 ml-2">
              Resultados para: <span className="text-indigo-400">{searchTerm}</span>
            </p>
          )}
        </div>

        {/* Grid de Cards - Agora usa 'ativosFiltrados' */}
        <div className="grid gap-6 md:grid-cols-2">
          {ativosFiltrados.length > 0 ? (
            ativosFiltrados.map((ativo) => (
              <Link
                key={ativo.id}
                href={`/ativos/${ativo.id}`}
                className="group block p-6 rounded-2xl bg-[#1b1c1f] border border-[#2c2d30]
                        shadow-[0_0_25px_-10px_rgba(0,0,0,0.5)]
                        transition-all duration-300 
                        hover:-translate-y-1 hover:shadow-[0_0_35px_-5px_rgba(80,70,255,0.4)]
                        hover:border-indigo-500"
              >
                <h2 className="text-2xl font-semibold text-gray-200 group-hover:text-indigo-400 transition-colors">
                  {ativo.Item}
                </h2>

                <p className="text-sm text-gray-400 mt-2">
                  {new Date(ativo.data).toLocaleDateString("pt-BR")}
                </p>

                <div className="mt-4 text-indigo-400 font-medium opacity-0 
                              group-hover:opacity-100 transition-opacity">
                  Ler mais →
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center col-span-2 py-10">
              <p className="text-gray-500">Nenhum ativo encontrado com esse nome.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}