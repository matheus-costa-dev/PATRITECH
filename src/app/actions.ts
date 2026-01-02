'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function criarAtivo(formData: FormData) {
  const item = formData.get("item");

  await supabase.from('ativos').insert([{ Item: item }]);
  
  // Isso avisa o Next para atualizar a lista na tela
  revalidatePath('/ativos'); 
}