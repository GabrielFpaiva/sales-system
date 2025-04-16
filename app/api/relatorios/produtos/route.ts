import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        p.id,
        p.nome,
        p.categoria,
        COALESCE(SUM(iv.quantidade), 0) as quantidade_vendida,
        COALESCE(SUM(iv.subtotal), 0) as valor_total,
        p.estoque as estoque_atual
      FROM 
        produtos p
      LEFT JOIN 
        itens_venda iv ON p.id = iv.produto_id
      GROUP BY 
        p.id, p.nome, p.categoria, p.estoque
      ORDER BY 
        quantidade_vendida DESC, valor_total DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Erro ao buscar relatório de produtos:", error)
    return NextResponse.json({ error: "Erro ao buscar relatório" }, { status: 500 })
  }
}
