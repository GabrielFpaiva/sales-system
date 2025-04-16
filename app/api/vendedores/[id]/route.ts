import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await query("SELECT * FROM vendedores WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Vendedor não encontrado" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Erro ao buscar vendedor:", error)
    return NextResponse.json({ error: "Erro ao buscar vendedor" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { nome, email, telefone } = body

    const result = await query("UPDATE vendedores SET nome = $1, email = $2, telefone = $3 WHERE id = $4 RETURNING *", [
      nome,
      email,
      telefone,
      id,
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Vendedor não encontrado" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Erro ao atualizar vendedor:", error)
    return NextResponse.json({ error: "Erro ao atualizar vendedor" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Verificar se o vendedor tem vendas associadas
    const vendasResult = await query("SELECT COUNT(*) FROM vendas WHERE vendedor_id = $1", [id])
    const vendasCount = Number.parseInt(vendasResult.rows[0].count)

    if (vendasCount > 0) {
      return NextResponse.json({ error: "Não é possível excluir um vendedor com vendas associadas" }, { status: 400 })
    }

    const result = await query("DELETE FROM vendedores WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Vendedor não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Vendedor excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir vendedor:", error)
    return NextResponse.json({ error: "Erro ao excluir vendedor" }, { status: 500 })
  }
}
