"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de autenticação
    setTimeout(() => {
      console.log("Login realizado com:", { email, password });
      setLoading(false);
      router.push("/ativos"); // Redireciona para sua página principal de ativos
    }, 1500);
  };

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-[#131416] px-4">
      {/* Background Decorativo - Brilho sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card de Login */}
        <div className="bg-[#1b1c1f] border border-[#2c2d30] rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Bem-vindo de volta
            </h1>
            <p className="text-gray-400 mt-2">Acesse sua conta para gerenciar ativos</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Campo E-mail */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full bg-[#25262b] border border-[#2c2d30] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
              />
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-medium text-gray-300">Senha</label>
                <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300">
                  Esqueceu a senha?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#25262b] border border-[#2c2d30] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
              />
            </div>

            {/* Botão de Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Footer do Card */}
          <div className="mt-8 text-center border-t border-[#2c2d30] pt-6">
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{" "}
              <button className="text-indigo-400 font-semibold hover:underline">
                Crie agora
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;