import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { status } = body

    if (status !== "ativo" && status !== "inativo") {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }

    const result = await query("UPDATE vendedores SET status = $1 WHERE id = $2 RETURNING *", [status, id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Vendedor não encontrado" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Erro ao atualizar status do vendedor:", error)
    return NextResponse.json({ error: "Erro ao atualizar status do vendedor" }, { status: 500 })
  }
}
