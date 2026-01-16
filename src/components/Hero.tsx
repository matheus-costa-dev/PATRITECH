"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext"; // 1. Importe o hook
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";

const Hero = () => {
  const { login } = useAuth(); // 2. Pegue a função login do contexto
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading local para o botão

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 3. Chame a função do contexto
      await login(email, password);

      // O redirecionamento para "/" ou "/ativos" já acontece 
      // automaticamente dentro do AuthContext pelo onAuthStateChange
    } catch (error) {
      // Erros já estão com alert no Context, mas você pode tratar algo extra aqui
      console.error(error)
      console.error("Falha na autenticação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    // Pegue o email do seu estado de login (ex: const [email, setEmail] = useState(""))
    if (!email) {
      toast.error("Por favor, digite seu e-mail primeiro.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Esta URL é para onde o usuário será enviado ao clicar no e-mail
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (error) {
      toast.error("Erro ao enviar e-mail: " + error.message);
    } else {
      toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
    }
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 font-sans">

      {/* IMAGEM DE FUNDO */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/imagemDeLogin.jpeg"
          alt="Fundo"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">

        {/* IDENTIDADE VISUAL SUPERIOR */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-black text-[#333] tracking-tighter uppercase">
            Login
          </h1>
          <div className="w-12 h-0.75 bg-[#8b1d22] mt-1"></div>
        </div>

        <div className="relative w-full max-w-md">
          {/* CARD DE LOGIN */}
          <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl border border-gray-100">

            <div className="text-center mb-10">
              <h2 className="text-2xl font-extrabold text-[#333] tracking-tight uppercase">
                Bem vindo de volta!
              </h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
                Gestão de Ativos e Patrimônio
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Campo E-mail */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">
                  E-mail Institucional
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@marica.rj.gov.br"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-5 py-4 rounded-2xl focus:outline-none focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF] transition-all placeholder:text-gray-300 font-medium"
                />
              </div>

              {/* Campo Senha */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    Senha
                  </label>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-5 py-4 rounded-2xl focus:outline-none focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF] transition-all placeholder:text-gray-300 font-medium"
                />
                <button
                  onClick={handleResetPassword}
                  type="button"
                  className="text-[10px] font-bold text-[#00BFFF] hover:underline uppercase">
                  Esqueceu a senha? clique aqui!
                </button>
              </div>

              {/* Botão de Entrar */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#00BFFF] hover:bg-[#0096C7] text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-full shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Autenticando...
                  </span>
                ) : (
                  "Entrar no Sistema"
                )}
              </button>
            </form>

            {/* Footer do Card */}
            <div className="mt-10 text-center border-t border-gray-50 pt-8">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                Dificuldades no acesso?{" "}
                <button className="text-[#8b1d22] font-black hover:underline ml-1">
                  Suporte Técnico
                </button>
              </p>
            </div>
          </div>

          {/* Detalhe decorativo */}
          <div className="flex justify-center gap-2 mt-8 opacity-40">
            <div className="w-8 h-1 bg-[#8cc63f] rounded-full"></div>
            <div className="w-8 h-1 bg-[#00BFFF] rounded-full"></div>
            <div className="w-8 h-1 bg-[#FFA500] rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;