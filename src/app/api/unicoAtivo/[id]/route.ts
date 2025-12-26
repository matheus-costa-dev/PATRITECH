import { NextRequest, NextResponse } from "next/server";
import ativosMock from "@/app/constant/ativosMock";

export async function GET(
  req: NextRequest, 
  { params }: { params: { id: string } } 
) {


  try {
    const { id } = await params;
    // Buscando o objeto específico pelo ID
    const ativo = ativosMock.find((obj) => obj.id === id);

    if (!ativo) {
      return NextResponse.json(
        { message: "Item não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(ativo, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro interno no servidor", error },
      { status: 500 }
    );
  }
}


// PUT: Atualiza um ativo específico
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await req.json(); // Recebe os dados enviados pelo front-end

    // 1. Validar se o item existe
    const index = ativosMock.findIndex((obj) => obj.id === id);

    if (index === -1) {
      return NextResponse.json({ message: "Item não encontrado para atualização" }, { status: 404 });
    }

    // 2. Atualizar o mock (substituindo os dados antigos pelos novos)
    // Mantemos o ID original para segurança e espalhamos o resto (Item e data)
    ativosMock[index] = { 
      ...ativosMock[index], 
      Item: body.Item, 
      data: body.data 
    };

    console.log(`Ativo ${id} atualizado com sucesso:`, ativosMock[index]);

    return NextResponse.json(ativosMock[index], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao atualizar o ativo", error },
      { status: 500 }
    );
  }
}

// ... (mantenha os imports e o let ativosMock)

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Verifica se o item existe
    const index = ativosMock.findIndex((obj) => obj.id === id);
    if (index === -1) {
      return NextResponse.json({ message: "Item não encontrado" }, { status: 404 });
    }

    // Remove do array (simulando banco de dados)
    ativosMock.splice(index, 1);
    
    console.log(`Ativo ${id} excluído.`);

    return NextResponse.json({ message: "Excluído com sucesso" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao excluir", error }, { status: 500 });
  }
}