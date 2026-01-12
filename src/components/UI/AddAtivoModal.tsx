"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase";
import { Condicao } from "@/types/ativo";
import { QRCodeCanvas } from 'qrcode.react';

interface AddAtivoModalProps {
  onSuccess: () => void;
}

export default function AddAtivoModal({ onSuccess }: AddAtivoModalProps) {
  // --- ESTADOS DE CONTROLE ---
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [idGeradoParaQR, setIdGeradoParaQR] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- ESTADOS DO FORMULÁRIO ---
  const [nome, setNome] = useState("");
  const [dataAtivo, setDataAtivo] = useState("");
  const [categoria, setCategoria] = useState(""); 
  const [local, setLocal] = useState(""); 
  const [statusAtivo, setStatusAtivo] = useState(""); 
  const [defeito, setDefeito] = useState("");
  const [condicoes, setCondicoes] = useState<Condicao[]>([]);

  // Lógica de Condição/Defeito
  const condicaoSelecionada = condicoes.find(c => c.nome_condicao === statusAtivo);
  const precisaDeDefeito = condicaoSelecionada?.gera_avaria || statusAtivo === "Ruim" || statusAtivo === "Inutilizável";

  useEffect(() => {
    async function fetchCondicoes() {
      const { data } = await supabase.from("condicao_ativo").select("*");
      if (data) setCondicoes(data);
    }
    if (isOpen) fetchCondicoes();
  }, [isOpen]);

  // --- FUNÇÃO DE DOWNLOAD (IGUAL À SUA ATIVOPAGE) ---
  function downloadQRCode() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `etiqueta-${nome.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  }

  const closeAndReset = () => {
    setIsOpen(false);
    setShowSuccess(false);
    setIdGeradoParaQR(null);
    resetForm();
    onSuccess();
  };

  const resetForm = () => {
    setNome(""); setDataAtivo(""); setCategoria(""); setLocal(""); setStatusAtivo(""); setDefeito("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !dataAtivo || !categoria || !local || !statusAtivo) {
      return toast.warning("Preencha todos os campos obrigatórios!");
    }

    setLoading(true);
    try {
      // 1. Categoria
      let { data: catData } = await supabase.from("categoria_ativo").select("id_categoria").eq("nome_categoria", categoria).maybeSingle();
      if (!catData) {
        const { data: newCat } = await supabase.from("categoria_ativo").insert({ nome_categoria: categoria }).select().single();
        catData = newCat;
      }

      // 2. Localização
      let { data: locData } = await supabase.from("localizacao").select("id_localizacao").eq("nome_localizacao", local).maybeSingle();
      if (!locData) {
        const { data: newLoc } = await supabase.from("localizacao").insert({ nome_localizacao: local }).select().single();
        locData = newLoc;
      }

      // 3. RPC Procedure (Original)
      const { data: idGerado, error: rpcError } = await supabase.rpc('cadastrar_ativo_com_defeito', {
        p_nome_ativo: nome,
        p_id_categoria: catData?.id_categoria,
        p_id_condicao: condicaoSelecionada?.id_condicao,
        p_id_localizacao: locData?.id_localizacao,
        p_descricao_defeito: precisaDeDefeito ? defeito : null 
      });

      if (rpcError) throw rpcError;

      setIdGeradoParaQR(idGerado);
      setShowSuccess(true);
      toast.success("Ativo registrado!");
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao processar cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="bg-[#FFA500] hover:bg-[#E69500] text-white px-8 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
      >
        <span className="text-lg">+</span> Novo Ativo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {!showSuccess ? (
              <>
                {/* HEADER */}
                <div className="p-8 border-b border-gray-200 flex justify-between items-center bg-gray-50/80">
                  <div>
                    <h2 className="text-xl font-black text-[#FFA500] uppercase tracking-tighter leading-none">Novo Registro</h2>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Patrimônio Individual</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-red-600 border border-gray-200 transition-colors">✕</button>
                </div>

                {/* FORMULÁRIO */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#FFA500] uppercase tracking-widest ml-1">Nome do Item</label>
                      <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-white border border-gray-400 rounded-2xl p-4 text-gray-800 font-bold outline-none focus:border-[#FFA500]" placeholder="Notebook" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#FFA500] uppercase tracking-widest ml-1">Data</label>
                      <input type="date" value={dataAtivo} onChange={(e) => setDataAtivo(e.target.value)} className="w-full bg-white border border-gray-400 rounded-2xl p-4 text-gray-800 font-bold outline-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#FFA500] uppercase tracking-widest ml-1">Categoria</label>
                    <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-white border border-gray-400 rounded-2xl p-4 text-gray-800 font-bold outline-none focus:border-[#FFA500]" placeholder="informática, mecânico"/>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#FFA500] uppercase tracking-widest ml-1">Localização</label>
                    <input type="text" value={local} onChange={(e) => setLocal(e.target.value)} className="w-full bg-white border border-gray-400 rounded-2xl p-4 text-gray-800 font-bold outline-none focus:border-[#FFA500]" placeholder="Nome da unidade e bairro "/>
                  </div>

                  {/* CONDIÇÃO */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#FFA500] uppercase tracking-widest ml-1 block">Conservação</label>
                    <div className="grid grid-cols-2 gap-3">
                      {["Excelente", "Bom", "Ruim", "Inutilizável"].map((op) => (
                        <label key={op} className={`flex items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${statusAtivo === op ? "bg-[#FFA500] border-[#FFA500] text-white shadow-md" : "bg-white border-gray-300 text-gray-600 hover:border-[#FFA500]"}`}>
                          <input type="radio" name="status" value={op} onChange={(e) => setStatusAtivo(e.target.value)} className="hidden" />
                          <span className="text-[10px] font-black uppercase tracking-tighter">{op}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {precisaDeDefeito && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-1">Relatar Defeito</label>
                      <textarea value={defeito} onChange={(e) => setDefeito(e.target.value)} className="w-full bg-red-50 border border-red-100 rounded-2xl p-4 text-gray-800 font-bold h-20 outline-none focus:border-red-500" />
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="w-full bg-[#FFA500] hover:bg-[#E69500] text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-50">
                    {loading ? "Processando..." : "Salvar e Gerar QR"}
                  </button>
                </form>
              </>
            ) : (
              /* TELA DE SUCESSO COM QR */
              <div className="p-12 flex flex-col items-center text-center space-y-8 animate-in zoom-in-50 duration-300">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl shadow-inner border border-green-200">✓</div>
                <div>
                  <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter leading-none">Cadastrado!</h2>
                  <p className="text-gray-400 font-bold mt-2 text-[10px] uppercase tracking-[0.2em]">ID: {idGeradoParaQR}</p>
                </div>

                {/* ÁREA DO QR CODE */}
                <div ref={canvasRef} className="bg-white p-4 rounded-[2rem] shadow-inner border border-gray-100 flex items-center justify-center">
                  <QRCodeCanvas
                    value={idGeradoParaQR || ""}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <div className="w-full space-y-4">
                  <button onClick={downloadQRCode} className="w-full bg-[#8cc63f] hover:bg-[#7ab035] text-white font-black uppercase text-xs tracking-[0.15em] py-5 rounded-full shadow-lg transition-all flex items-center justify-center gap-3">
                    📥 Baixar Etiqueta
                  </button>
                  <button onClick={closeAndReset} className="w-full bg-white text-gray-400 font-black uppercase text-[10px] tracking-widest py-4 border border-gray-200 rounded-full hover:bg-gray-50 transition-all">
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}