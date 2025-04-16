import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        v.vendedor_id,
        vd.nome as vendedor_nome,
        COUNT(v.id) as total_vendas,
        SUM(v.valor_total) as valor_total,
        AVG(v.valor_total) as ticket_medio,
        SUM(v.valor_total) * 0.1 as comissao
      FROM vendas v
      JOIN vendedores vd ON v.vendedor_id = vd.id
      GROUP BY v.vendedor_id, vd.nome
      ORDER BY valor_total DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Erro ao buscar relatório de vendedores:", error)
    return NextResponse.json({ error: "Erro ao buscar relatório" }, { status: 500 })
  }
}
