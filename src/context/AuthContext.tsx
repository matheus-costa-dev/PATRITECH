"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Certifique-se de ter configurado o cliente do supabase aqui
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Busca a sessão atual assim que o app carrega
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Erro ao carregar sessão inicial:", error.message);
      }

      if (session) {
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    };

    getInitialSession();

    // 2. Escuta mudanças de estado (Login, Logout, Token renovado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (_event === 'SIGNED_IN' && window.location.pathname === '/') {
        router.push("/ativos");
      }
      if (_event === 'SIGNED_OUT') router.push("/");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) throw error;

      // O onAuthStateChange cuidará do setUser e do redirecionamento
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Ocorreu um erro inesperado ao fazer login";
      console.error("Erro ao logar:", errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // O onAuthStateChange cuidará de limpar o estado e redirecionar
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}