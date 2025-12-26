import { NextResponse } from "next/server";
import ativosMock from "@/app/constant/ativosMock";

// Handler para o método GET
export async function GET() {
  try {
    // Aqui você faria a chamada ao seu banco de dados real (Prisma, Supabase, etc.)
    // const ativos = await db.ativos.findMany();

    return NextResponse.json(ativosMock, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao buscar ativos", error },
      { status: 500 }
    );
  }
}

