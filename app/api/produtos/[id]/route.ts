import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await query("SELECT * FROM produtos WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { nome, descricao, preco, categoria, estoque, fabricado_em } = body

    const result = await query(
      "UPDATE produtos SET nome = $1, descricao = $2, preco = $3, categoria = $4, estoque = $5, fabricado_em = $6 WHERE id = $7 RETURNING *",
      [nome, descricao, preco, categoria, estoque, fabricado_em, id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Verificar se o produto está em alguma venda
    const vendasResult = await query("SELECT COUNT(*) FROM itens_venda WHERE produto_id = $1", [id])
    const vendasCount = Number.parseInt(vendasResult.rows[0].count)

    if (vendasCount > 0) {
      return NextResponse.json({ error: "Não é possível excluir um produto que já foi vendido" }, { status: 400 })
    }

    const result = await query("DELETE FROM produtos WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Produto excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir produto:", error)
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 })
  }
}
