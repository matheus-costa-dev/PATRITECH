"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import User from "@/types/users";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Ao carregar a página, verifica se há um usuário salvo no LocalStorage ou Cookies
  useEffect(() => {
    const savedUser = localStorage.getItem("@Ativos:User");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      // Aqui você faria a chamada para sua API de Login
      // Simulação de resposta da API:
      const response = {
        id: "1",
        nome: "Admin Root",
        email: "admin@test.com",
        role: "ADMIN",
      };

      setUser(response);
      localStorage.setItem("@Ativos:User", JSON.stringify(response));
      router.push("/"); // Redireciona após login
    } catch (error) {
      console.error("Erro ao logar", error);
      alert("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("@Ativos:User");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}