"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function RedefinirSenhaPage() {
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error("Erro ao atualizar senha.");
    } else {
      toast.success("Senha atualizada com sucesso!");
      router.push("/ativos");
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center min-h-screen bg-[#f3f4f6]">
      <form onSubmit={handleUpdatePassword} className="bg-white p-8 rounded-4xl shadow-lg">
        <h2 className="text-xl font-bold mb-4 uppercase text-[#333]">Nova Senha</h2>
        <input
          type="password"
          placeholder="Digite sua nova senha"
          className="w-full p-3 border rounded-xl mb-4 text-black"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button className="w-full bg-[#00BFFF] text-white py-3 rounded-xl font-bold uppercase">
          Atualizar Senha
        </button>
      </form>
    </div>
  );
}