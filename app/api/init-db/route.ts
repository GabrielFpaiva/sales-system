import { NextResponse } from "next/server"
import { createTables, seedInitialData } from "@/lib/db"

export async function GET() {
  try {
    // Criar as tabelas no banco de dados
    await createTables()

    // Inserir dados iniciais
    await seedInitialData()

    return NextResponse.json({
      success: true,
      message: "Banco de dados inicializado com sucesso!",
    })
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao inicializar banco de dados",
      },
      { status: 500 },
    )
  }
}
