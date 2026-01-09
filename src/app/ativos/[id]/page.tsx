"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import Loading from "@/components/UI/Loading";
import {QRCodeCanvas} from 'qrcode.react';


export default function AtivoPage() {
  const params = useParams();
  const router = useRouter();

  const [ativo, setAtivo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados para expansão de seções
  const [mostrarMaisInfo, setMostrarMaisInfo] = useState(false);
  const [verTodasAvarias, setVerTodasAvarias] = useState(false);
  const [verTodasMovs, setVerTodasMovs] = useState(false);

  const [showSolucaoModal, setShowSolucaoModal] = useState(false);
  const [showDefeitoModal, setShowDefeitoModal] = useState(false);
  const [avariaParaResolver, setAvariaParaResolver] = useState<any>(null);

  const [inputSolucao, setInputSolucao] = useState("");
  const [dataSolucaoManual, setDataSolucaoManual] = useState(new Date().toISOString().split('T')[0]);
  const [inputNovoDefeito, setInputNovoDefeito] = useState("");

  const [editForm, setEditForm] = useState({
    nome_ativo: "",
    categoria: "",
    local: "",
    id_condicao: 0,
  });

  const condicoes = [
    { id: 1, nome: "Excelente", cor: "bg-green-500" },
    { id: 2, nome: "Bom", cor: "bg-blue-500" },
    { id: 3, nome: "Ruim", cor: "bg-yellow-600" },
    { id: 4, nome: "Inutilizável", cor: "bg-red-600" },
  ];

  async function carregarDados() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ativo")
        .select(`
          *, 
          categoria_ativo (nome_categoria), 
          localizacao (nome_localizacao), 
          condicao_ativo (nome_condicao),
          movimentacao (*, localizacao:id_localizacao_nova(nome_localizacao)),
          ativo_defeituoso (*)
        `)
        .eq("id_ativo", params.id)
        .single();

      if (data) {
        const movs = data.movimentacao?.sort((a: any, b: any) => new Date(b.data_movimentacao).getTime() - new Date(a.data_movimentacao).getTime());
        const avarias = data.ativo_defeituoso?.sort((a: any, b: any) => new Date(b.data_registro_defeito).getTime() - new Date(a.data_registro_defeito).getTime());

        setAtivo({ ...data, movimentacao: movs, ativo_defeituoso: avarias });
        setEditForm({
          nome_ativo: data.nome_ativo || "",
          categoria: data.categoria_ativo?.nome_categoria || "",
          local: data.localizacao?.nome_localizacao || "",
          id_condicao: data.id_condicao || 0,
        });
      }
    } catch (err) { toast.error("Erro ao carregar"); } 
    finally { setLoading(false); }
  }

  useEffect(() => { if (params.id) carregarDados(); }, [params.id]);

  async function handleSalvarGeral() {
    if ([3, 4].includes(editForm.id_condicao) && ativo.id_condicao !== editForm.id_condicao) {
      setShowDefeitoModal(true);
      return;
    }
    executarUpdateAtivo();
  }

  async function executarUpdateAtivo(defeitoTexto?: string) {
    if (defeitoTexto !== undefined && !defeitoTexto.trim()) {
      return toast.error("Por favor, descreva o defeito.");
    }
    
    setIsSaving(true);
    try {
      const agora = new Date().toISOString();
      
      let { data: cat } = await supabase.from("categoria_ativo").select("id_categoria").eq("nome_categoria", editForm.categoria).maybeSingle();
      if (!cat) { 
        const { data: nCat } = await supabase.from("categoria_ativo").insert({ nome_categoria: editForm.categoria }).select().single(); 
        cat = nCat; 
      }
      
      let { data: loc } = await supabase.from("localizacao").select("id_localizacao").eq("nome_localizacao", editForm.local).maybeSingle();
      if (!loc) { 
        const { data: nLoc } = await supabase.from("localizacao").insert({ nome_localizacao: editForm.local }).select().single(); 
        loc = nLoc; 
      }

      if (loc?.id_localizacao && loc.id_localizacao !== ativo.id_localizacao) {
        await supabase.from("movimentacao").insert({
          id_ativo: params.id,
          id_localizacao_anterior: ativo.id_localizacao,
          id_localizacao_nova: loc.id_localizacao,
          data_movimentacao: agora
        });
      }

      if (defeitoTexto) {
        await supabase.from("ativo_defeituoso").insert({
          id_ativo: params.id,
          descricao_defeito: defeitoTexto,
          solucionado: false,
          data_registro_defeito: agora
        });
      }

      const { error } = await supabase.from("ativo").update({
        nome_ativo: editForm.nome_ativo,
        id_categoria: cat?.id_categoria,
        id_localizacao: loc?.id_localizacao,
        id_condicao: editForm.id_condicao,
        data_ultima_verificacao: agora 
      }).eq("id_ativo", params.id);

      if (error) throw error;

      toast.success("Ativo atualizado!");
      setIsEditing(false);
      setShowDefeitoModal(false);
      setInputNovoDefeito("");
      carregarDados();
      
    } catch (e) { 
      toast.error("Erro ao salvar."); 
    } finally { 
      setIsSaving(false); 
    }
  }

  async function handleSalvarSolucao() {
    if (!inputSolucao.trim()) return toast.warning("Descreva a solução!");
    const { error } = await supabase.from("ativo_defeituoso")
      .update({
        solucionado: true,
        data_solucao: new Date(dataSolucaoManual).toISOString(),
        descricao_solucao: inputSolucao
      })
      .eq("id_avaria", avariaParaResolver.id_avaria);

    if (!error) {
      toast.success("Resolvido!");
      setShowSolucaoModal(false);
      carregarDados();
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen w-full bg-[#0f1012] p-8 text-white flex flex-col items-center font-sans overflow-x-hidden">
      
      {/* CARD PRINCIPAL */}
      <div className="w-full max-w-3xl bg-[#1b1c1f] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden mb-6">
        <div className="p-12 border-b border-white/5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <span className="text-indigo-500 font-black text-xs uppercase tracking-widest">ID: #{ativo?.id_ativo}</span>
              {isEditing ? (
                <input 
                  className="text-5xl font-black bg-black/40 border-b-2 border-indigo-500 outline-none w-full mt-4 py-2 px-4 rounded-xl shadow-inner"
                  value={editForm.nome_ativo}
                  onChange={(e) => setEditForm({...editForm, nome_ativo: e.target.value})}
                />
              ) : (
                <h1 className="text-5xl font-black tracking-tighter mt-4">{ativo?.nome_ativo}</h1>
              )}
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-6">
                Última Verificação: {ativo?.data_ultima_verificacao ? new Date(ativo.data_ultima_verificacao).toLocaleString('pt-BR') : "Sem registro"}
              </p>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="flex flex-col gap-3 ml-6 min-w-[280px]">
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  className="flex-1 bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all"
                >
                  {isEditing ? "Cancelar" : "Editar"}
                </button>

                {!isEditing && (
                  <button 
                    onClick={() => {
                      if(confirm("Excluir ativo?")) 
                        supabase.from("ativo").delete().eq("id_ativo", params.id).then(()=>router.push("/ativos"))
                    }} 
                    className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                  >
                    Excluir
                  </button>
                )}
              </div>
              <div className="p-4 bg-white rounded-lg shadow-md inline-block">
        <QRCodeCanvas
          value={document.location.href}
          size={256}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"H"} // Nível de correção de erro (L, M, Q, H)
          includeMargin={false}
          imageSettings={{
            src: "https://nextjs.org/favicon.ico", // Opcional: Logo no centro
            x: undefined,
            y: undefined,
            height: 40,
            width: 40,
            excavate: true, // Garante que o QR code não fique atrás do logo
          }}
        />
      
              </div>

              {!isEditing && (
                <button 
                  onClick={() => {
                    setInputNovoDefeito(""); 
                    setShowDefeitoModal(true); 
                  }} 
                  className="w-full bg-orange-500/10 text-orange-500 border border-orange-500/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 hover:text-white transition-all shadow-lg"
                >
                  Relatar Defeito no Ativo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-12 space-y-12">
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[11px] text-gray-400 font-black uppercase tracking-widest ml-2">Categoria</label>
              <input disabled={!isEditing} className="w-full bg-black/40 p-7 rounded-[30px] border border-white/10 outline-none text-gray-100 font-bold" value={editForm.categoria} onChange={(e)=>setEditForm({...editForm, categoria:e.target.value})} />
            </div>
            <div className="space-y-4">
              <label className="text-[11px] text-gray-400 font-black uppercase tracking-widest ml-2">Localização</label>
              <input disabled={!isEditing} className="w-full bg-black/40 p-7 rounded-[30px] border border-white/10 outline-none text-gray-100 font-bold" value={editForm.local} onChange={(e)=>setEditForm({...editForm, local:e.target.value})} />
            </div>
          </div>

          <div className="space-y-6">
             <label className="text-[11px] text-gray-400 font-black uppercase ml-2 tracking-widest">Condição Atual</label>
             <div className="grid grid-cols-4 gap-4">
                {condicoes.map(c => (
                  <button key={c.id} disabled={!isEditing} onClick={() => setEditForm({...editForm, id_condicao: c.id})} className={`py-7 rounded-[25px] text-[10px] font-black uppercase transition-all border ${editForm.id_condicao === c.id ? `${c.cor} border-transparent text-white shadow-2xl scale-105` : 'bg-black/40 border-white/5 text-gray-600 hover:border-white/20'}`}>
                    {c.nome}
                  </button>
                ))}
             </div>
          </div>

          {isEditing && (
            <button onClick={handleSalvarGeral} disabled={isSaving} className="w-full py-8 bg-indigo-600 rounded-[35px] font-black uppercase text-sm tracking-[0.4em] hover:bg-indigo-500 shadow-2xl transition-all">
              {isSaving ? "A gravar..." : "Confirmar Alterações"}
            </button>
          )}
        </div>
      </div>

      {/* GATILHO PARA MAIS INFORMAÇÕES */}
      <button 
        onClick={() => setMostrarMaisInfo(!mostrarMaisInfo)}
        className="group flex items-center gap-3 text-gray-500 hover:text-indigo-400 transition-all font-black uppercase text-[10px] tracking-[0.3em] mb-12 py-4"
      >
        <span>{mostrarMaisInfo ? "Ocultar detalhes" : "Mais informações"}</span>
        <span className={`text-lg transition-transform duration-300 ${mostrarMaisInfo ? "-rotate-90" : "rotate-0"}`}>→</span>
      </button>

      {/* SEÇÃO EXPANSÍVEL (HISTÓRICOS) */}
      {mostrarMaisInfo && (
        <div className="w-full max-w-3xl space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
          
          {/* HISTÓRICO TÉCNICO */}
          <section className="bg-[#1b1c1f] p-10 rounded-[50px] border border-white/10 shadow-2xl">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] mb-10 text-center">Histórico Técnico</h3>
            <div className="space-y-6">
              {ativo?.ativo_defeituoso?.slice(0, verTodasAvarias ? undefined : 3).map((a: any) => (
                <div key={a.id_avaria} className={`p-10 rounded-[40px] border ${a.solucionado ? 'border-green-500/10 bg-green-500/[0.02]' : 'border-red-500/10 bg-red-500/[0.04]'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <span className={`text-[10px] px-6 py-2 rounded-full font-black uppercase tracking-widest ${a.solucionado ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                      {a.solucionado ? "✓ Resolvido" : "⚠ Pendente"}
                    </span>
                    {!a.solucionado && (
                      <button onClick={() => {setAvariaParaResolver(a); setShowSolucaoModal(true)}} className="bg-white text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase">Resolver</button>
                    )}
                  </div>
                  <p className="text-xl text-gray-200 font-bold mb-2">{a.descricao_defeito}</p>
                  <p className="text-[10px] text-gray-600 font-bold uppercase">Registrado: {new Date(a.data_registro_defeito).toLocaleDateString('pt-BR')}</p>
                  {a.solucionado && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                      <p className="text-sm text-gray-400 italic">"{a.descricao_solucao}"</p>
                      <p className="text-[10px] text-green-900 font-black uppercase mt-3">Finalizado: {new Date(a.data_solucao).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                </div>
              ))}
              
              {ativo?.ativo_defeituoso?.length > 3 && (
                <button onClick={() => setVerTodasAvarias(!verTodasAvarias)} className="w-full text-xs text-indigo-400 font-black uppercase py-4 tracking-widest">
                  {verTodasAvarias ? "Recolher Histórico ↑" : `Ver todas as avarias (${ativo.ativo_defeituoso.length}) ↓`}
                </button>
              )}

              {(!ativo?.ativo_defeituoso || ativo.ativo_defeituoso.length === 0) && (
                <p className="text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest py-10">Sem ocorrências técnicas</p>
              )}
            </div>
          </section>

          {/* TRAJETO DE LOCALIZAÇÃO */}
          <section className="bg-[#1b1c1f] p-10 rounded-[50px] border border-white/10 shadow-2xl">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] mb-10 text-center">Trajeto de Localização</h3>
            <div className="space-y-4">
              {ativo?.movimentacao?.slice(0, verTodasMovs ? undefined : 5).map((m: any) => (
                <div key={m.id_movimentacao} className="flex justify-between items-center p-8 bg-black/30 rounded-[30px] border border-white/5">
                  <span className="text-base font-bold text-gray-300">{m.localizacao?.nome_localizacao}</span>
                  <span className="text-[11px] font-mono text-gray-600">{new Date(m.data_movimentacao).toLocaleDateString('pt-BR')}</span>
                </div>
              ))}
              {ativo?.movimentacao?.length > 5 && (
                <button onClick={() => setVerTodasMovs(!verTodasMovs)} className="w-full text-xs text-indigo-400 font-black uppercase py-4 tracking-widest">
                  {verTodasMovs ? "Recolher Trajeto ↑" : `Ver trajeto completo ↓`}
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {/* MODAL DEFEITO */}
      {showDefeitoModal && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl flex items-center justify-center p-6 z-[100]">
          <div className="bg-[#1b1c1f] p-12 rounded-[60px] border border-red-500/20 max-w-lg w-full">
            <h3 className="text-4xl font-black mb-4 text-red-500 uppercase tracking-tighter">Relatar Defeito</h3>
            <p className="text-gray-400 text-sm mb-10 font-bold">Descreva o problema identificado para registro técnico:</p>
            <textarea className="w-full bg-black/60 p-8 rounded-[40px] border border-white/10 text-white h-56 outline-none focus:border-red-500 text-lg" placeholder="O que aconteceu?" value={inputNovoDefeito} onChange={(e) => setInputNovoDefeito(e.target.value)} />
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowDefeitoModal(false)} className="flex-1 py-7 bg-white/5 rounded-[30px] font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all text-gray-400">Voltar</button>
              <button onClick={() => executarUpdateAtivo(inputNovoDefeito)} className="flex-[2] py-7 bg-red-600 rounded-[30px] font-black uppercase text-xs tracking-[0.3em] hover:bg-red-500 shadow-2xl shadow-red-600/40 transition-all">Gravar Avaria</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SOLUÇÃO */}
      {showSolucaoModal && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl flex items-center justify-center p-6 z-[100]">
          <div className="bg-[#1b1c1f] p-12 rounded-[60px] border border-green-500/20 max-w-lg w-full">
            <h3 className="text-4xl font-black mb-4 text-green-500 uppercase tracking-tighter">Finalizar Reparo</h3>
            <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block ml-4">Data da Solução</label>
            <input type="date" className="w-full bg-black/60 p-6 rounded-[25px] border border-white/10 text-white mb-8 outline-none font-bold" value={dataSolucaoManual} onChange={(e) => setDataSolucaoManual(e.target.value)} />
            <textarea className="w-full bg-black/60 p-8 rounded-[40px] border border-white/10 text-white h-48 outline-none focus:border-green-500 text-lg" placeholder="O que foi feito?" value={inputSolucao} onChange={(e) => setInputSolucao(e.target.value)} />
            <button onClick={handleSalvarSolucao} className="w-full py-7 bg-green-600 rounded-[30px] font-black uppercase text-xs tracking-[0.3em] mt-8 hover:bg-green-500 shadow-2xl transition-all">Confirmar Conclusão</button>
          </div>
        </div>
      )}
    </div>
  );
}