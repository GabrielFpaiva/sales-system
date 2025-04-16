import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await query("SELECT * FROM clientes WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Erro ao buscar cliente:", error)
    return NextResponse.json({ error: "Erro ao buscar cliente" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { nome, email, telefone, torce_flamengo, assiste_one_piece, de_sousa } = body

    const result = await query(
      "UPDATE clientes SET nome = $1, email = $2, telefone = $3, torce_flamengo = $4, assiste_one_piece = $5, de_sousa = $6 WHERE id = $7 RETURNING *",
      [nome, email, telefone, torce_flamengo, assiste_one_piece, de_sousa, id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error)
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Verificar se o cliente tem vendas associadas
    const vendasResult = await query("SELECT COUNT(*) FROM vendas WHERE cliente_id = $1", [id])
    const vendasCount = Number.parseInt(vendasResult.rows[0].count)

    if (vendasCount > 0) {
      return NextResponse.json({ error: "Não é possível excluir um cliente com vendas associadas" }, { status: 400 })
    }

    const result = await query("DELETE FROM clientes WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Cliente excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir cliente:", error)
    return NextResponse.json({ error: "Erro ao excluir cliente" }, { status: 500 })
  }
}
