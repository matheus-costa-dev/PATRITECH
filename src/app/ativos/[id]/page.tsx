"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from "react-toastify";
import Loading from "@/components/UI/Loading";

export default function AtivoPage() {
  const params = useParams();
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [ativo, setAtivo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados de expansão
  const [mostrarMaisInfo, setMostrarMaisInfo] = useState(false);
  const [verTodasAvarias, setVerTodasAvarias] = useState(false);
  const [verTodasMovs, setVerTodasMovs] = useState(false);

  // Modais
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
    { id: 3, nome: "Ruim", cor: "bg-orange-500" },
    { id: 4, nome: "Inutilizável", cor: "bg-red-600" },
  ];

  function downloadQRCode() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qrcode-${ativo?.nome_ativo}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  }

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

      // Lógica de Categoria (Recuperada)
      let { data: cat } = await supabase.from("categoria_ativo").select("id_categoria").eq("nome_categoria", editForm.categoria).maybeSingle();
      if (!cat) {
        const { data: nCat } = await supabase.from("categoria_ativo").insert({ nome_categoria: editForm.categoria }).select().single();
        cat = nCat;
      }

      // Lógica de Localização (Recuperada)
      let { data: loc } = await supabase.from("localizacao").select("id_localizacao").eq("nome_localizacao", editForm.local).maybeSingle();
      if (!loc) {
        const { data: nLoc } = await supabase.from("localizacao").insert({ nome_localizacao: editForm.local }).select().single();
        loc = nLoc;
      }

      // Registro de Movimentação (Recuperada)
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

    } catch (e) { toast.error("Erro ao salvar."); }
    finally { setIsSaving(false); }
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
      toast.success("Reparo finalizado!");
      setShowSolucaoModal(false);
      carregarDados();
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] pb-20 font-sans text-[#333]">
      
      {/* TÍTULO PÁGINA */}
      <div className="flex flex-col items-center pt-16 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-[#333] tracking-tight uppercase text-center px-4">
          Gerenciar
        </h1>
        <div className="w-16 h-[3px] bg-[#8b1d22] mt-2"></div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* CARD PRINCIPAL */}
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-200">
          
          <div className="p-8 md:p-12 bg-white flex flex-col md:flex-row justify-between items-start border-b border-gray-100 gap-8">
            <div className="flex-1 w-full">
              <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
                ID: #{String(ativo?.id_ativo).slice(0, 8)}
              </span>
              
              {isEditing ? (
                <input
                  className="text-3xl md:text-4xl font-extrabold border-b-2 border-[#00BFFF] outline-none w-full mt-4 py-1 text-gray-800 bg-blue-50/30"
                  value={editForm.nome_ativo}
                  onChange={(e) => setEditForm({ ...editForm, nome_ativo: e.target.value })}
                />
              ) : (
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#333] mt-4 tracking-tight leading-tight">
                  {ativo?.nome_ativo}
                </h2>
              )}
              
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00BFFF]"></span>
                Última Verificação: {ativo?.data_ultima_verificacao ? new Date(ativo.data_ultima_verificacao).toLocaleString('pt-BR') : "Sem registro"}
              </p>
            </div>

            {/* AÇÕES LADO DIREITO */}
            <div className="flex flex-col gap-3 w-full md:w-auto min-w-[240px]">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase transition-all shadow-md active:scale-95 ${isEditing ? 'bg-gray-200 text-gray-600' : 'bg-[#00BFFF] text-white hover:bg-[#0096C7]'}`}
                >
                  {isEditing ? "Cancelar" : "⚙ Editar"}
                </button>

                {!isEditing && (
                  <button
                    onClick={() => {
                      if (confirm("Deseja realmente excluir este ativo?"))
                        supabase.from("ativo").delete().eq("id_ativo", params.id).then(() => router.push("/ativos"))
                    }}
                    className="px-6 bg-red-50 text-red-500 border border-red-100 py-3 rounded-full text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    Excluir
                  </button>
                )}
              </div>
              
              {!isEditing && (
                <button
                  onClick={() => { setInputNovoDefeito(""); setShowDefeitoModal(true); }}
                  className="w-full bg-[#FFA500] hover:bg-[#E69500] text-white py-3 rounded-full text-[10px] font-black uppercase transition-all shadow-md active:scale-95"
                >
                  ⚠ Relatar Defeito
                </button>
              )}
            </div>
          </div>

          {/* GRID DE CAMPOS */}
          <div className="p-8 md:p-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Categoria</label>
                <input 
                  disabled={!isEditing} 
                  className="w-full bg-gray-50 p-5 rounded-2xl border border-gray-100 outline-none text-gray-700 font-bold focus:border-[#00BFFF] disabled:opacity-80" 
                  value={editForm.categoria} 
                  onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Localização</label>
                <input 
                  disabled={!isEditing} 
                  className="w-full bg-gray-50 p-5 rounded-2xl border border-gray-100 outline-none text-gray-700 font-bold focus:border-[#00BFFF] disabled:opacity-80" 
                  value={editForm.local} 
                  onChange={(e) => setEditForm({ ...editForm, local: e.target.value })} 
                />
              </div>
            </div>

            {/* STATUS DE CONDIÇÃO */}
            <div className="space-y-4">
              <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Condição de Conservação</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {condicoes.map(c => (
                  <button 
                    key={c.id} 
                    disabled={!isEditing} 
                    onClick={() => setEditForm({ ...editForm, id_condicao: c.id })} 
                    className={`py-4 rounded-xl text-[10px] font-black uppercase transition-all border-2 
                      ${editForm.id_condicao === c.id 
                        ? `${c.cor} border-transparent text-white shadow-lg scale-105` 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                  >
                    {c.nome}
                  </button>
                ))}
              </div>
            </div>

            {/* ETIQUETA QR */}
            <div className="flex flex-col items-center bg-gray-50 rounded-[2rem] p-8 border border-dashed border-gray-300">
              <div ref={canvasRef} className="bg-white p-4 rounded-xl shadow-inner mb-6">
                <QRCodeCanvas
                  value={typeof window !== "undefined" ? window.location.href : ""}
                  size={160}
                  level="H"
                />
              </div>
              <button
                onClick={downloadQRCode}
                className="bg-[#8cc63f] hover:bg-[#7ab035] text-white px-10 py-3 rounded-full text-[10px] font-black uppercase shadow-lg transition-all active:scale-95"
              >
                ↓ Baixar Etiqueta QR
              </button>
            </div>

            {isEditing && (
              <button 
                onClick={handleSalvarGeral} 
                disabled={isSaving} 
                className="w-full py-5 bg-[#00BFFF] text-white rounded-full font-black uppercase text-sm tracking-[0.2em] hover:bg-[#0096C7] shadow-xl transition-all"
              >
                {isSaving ? "Gravando alterações..." : "Confirmar Alterações"}
              </button>
            )}
          </div>
        </div>

        {/* SEÇÕES DE HISTÓRICO EXPANSÍVEIS */}
        <div className="mt-8 flex flex-col items-center">
          <button
            onClick={() => setMostrarMaisInfo(!mostrarMaisInfo)}
            className="flex items-center gap-3 text-gray-400 hover:text-[#00BFFF] transition-all font-black uppercase text-[10px] tracking-widest py-6"
          >
            <span>{mostrarMaisInfo ? "Ocultar Histórico" : "Ver Históricos e Detalhes Técnicos"}</span>
            <span className={`transition-transform duration-300 ${mostrarMaisInfo ? "rotate-180" : ""}`}>▼</span>
          </button>

          {mostrarMaisInfo && (
            <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* HISTÓRICO TÉCNICO */}
              <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-gray-100">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8 text-center">Registro de Avarias</h3>
                <div className="space-y-4">
                  {ativo?.ativo_defeituoso?.slice(0, verTodasAvarias ? undefined : 3).map((a: any) => (
                    <div key={a.id_avaria} className={`p-6 rounded-3xl border-2 ${a.solucionado ? 'border-green-50 bg-green-50/20' : 'border-red-50 bg-red-50/30'}`}>
                      <div className="flex justify-between items-center mb-4">
                        <span className={`text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest ${a.solucionado ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {a.solucionado ? "✓ Resolvido" : "⚠ Pendente"}
                        </span>
                        {!a.solucionado && (
                          <button onClick={() => { setAvariaParaResolver(a); setShowSolucaoModal(true) }} className="bg-white border border-gray-200 text-gray-700 px-4 py-1.5 rounded-full text-[9px] font-black uppercase hover:bg-gray-50 shadow-sm">Resolver</button>
                        )}
                      </div>
                      <p className="text-lg text-gray-700 font-bold mb-1">{a.descricao_defeito}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Registrado em: {new Date(a.data_registro_defeito).toLocaleDateString('pt-BR')}</p>
                      
                      {a.solucionado && (
                        <div className="mt-4 pt-4 border-t border-green-100">
                          <p className="text-xs text-green-700 italic font-medium">"{a.descricao_solucao}"</p>
                          <p className="text-[9px] text-green-400 font-black uppercase mt-2">Concluído em: {new Date(a.data_solucao).toLocaleDateString('pt-BR')}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {ativo?.ativo_defeituoso?.length > 3 && (
                    <button onClick={() => setVerTodasAvarias(!verTodasAvarias)} className="w-full text-[10px] text-[#00BFFF] font-black uppercase py-2">
                      {verTodasAvarias ? "Ver menos ↑" : `Ver todas as avarias (${ativo.ativo_defeituoso.length}) ↓`}
                    </button>
                  )}

                  {(!ativo?.ativo_defeituoso || ativo.ativo_defeituoso.length === 0) && (
                    <p className="text-center text-gray-300 text-[10px] font-bold uppercase py-6">Nenhuma avaria registrada</p>
                  )}
                </div>
              </section>

              {/* TRAJETO */}
              <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-gray-100">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8 text-center">Log de Movimentações</h3>
                <div className="space-y-3">
                  {ativo?.movimentacao?.slice(0, verTodasMovs ? undefined : 5).map((m: any) => (
                    <div key={m.id_movimentacao} className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                        <span className="text-sm font-bold text-gray-600">{m.localizacao?.nome_localizacao}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">{new Date(m.data_movimentacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                  ))}
                  {ativo?.movimentacao?.length > 5 && (
                    <button onClick={() => setVerTodasMovs(!verTodasMovs)} className="w-full text-[10px] text-[#00BFFF] font-black uppercase py-2">
                      {verTodasMovs ? "Ver menos ↑" : `Ver trajeto completo ↓`}
                    </button>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DEFEITO */}
      {showDefeitoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
          <div className="bg-white p-10 rounded-[2.5rem] max-w-lg w-full shadow-2xl border border-red-50">
            <h3 className="text-2xl font-black mb-2 text-[#8b1d22] uppercase tracking-tighter">Relatar Avaria</h3>
            <p className="text-gray-400 text-[10px] mb-8 font-bold uppercase tracking-widest">Registre os detalhes do problema identificado:</p>
            <textarea 
              className="w-full bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-700 h-44 outline-none focus:border-[#8b1d22] text-sm transition-all" 
              placeholder="Descreva o que está acontecendo..." 
              value={inputNovoDefeito} 
              onChange={(e) => setInputNovoDefeito(e.target.value)} 
            />
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowDefeitoModal(false)} className="flex-1 py-4 bg-gray-100 rounded-full font-black uppercase text-[10px] text-gray-500 hover:bg-gray-200">Voltar</button>
              <button onClick={() => executarUpdateAtivo(inputNovoDefeito)} className="flex-[2] py-4 bg-[#8b1d22] rounded-full font-black uppercase text-[10px] text-white hover:bg-black shadow-lg transition-all">Gravar Ocorrência</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SOLUÇÃO */}
      {showSolucaoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
          <div className="bg-white p-10 rounded-[2.5rem] max-w-lg w-full shadow-2xl border border-green-50">
            <h3 className="text-2xl font-black mb-2 text-green-600 uppercase tracking-tighter">Finalizar Reparo</h3>
            <div className="mt-4 mb-6">
              <label className="text-[9px] font-black text-gray-400 uppercase mb-2 block ml-1">Data da Solução</label>
              <input type="date" className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 outline-none font-bold text-sm" value={dataSolucaoManual} onChange={(e) => setDataSolucaoManual(e.target.value)} />
            </div>
            <textarea 
              className="w-full bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-700 h-40 outline-none focus:border-green-500 text-sm transition-all" 
              placeholder="O que foi feito para resolver?" 
              value={inputSolucao} 
              onChange={(e) => setInputSolucao(e.target.value)} 
            />
            <button onClick={handleSalvarSolucao} className="w-full py-4 bg-green-600 rounded-full font-black uppercase text-[10px] text-white mt-8 hover:bg-green-700 shadow-lg transition-all">Confirmar Conclusão</button>
            <button onClick={() => setShowSolucaoModal(false)} className="w-full mt-2 text-[9px] font-black text-gray-400 uppercase py-2">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}