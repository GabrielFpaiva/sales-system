import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await query(
      `
      SELECT p.id, p.nome, iv.quantidade, iv.preco_unitario, iv.subtotal
      FROM itens_venda iv
      JOIN produtos p ON iv.produto_id = p.id
      WHERE iv.venda_id = $1
    `,
      [id],
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Erro ao buscar produtos da venda:", error)
    return NextResponse.json({ error: "Erro ao buscar produtos da venda" }, { status: 500 })
  }
}
