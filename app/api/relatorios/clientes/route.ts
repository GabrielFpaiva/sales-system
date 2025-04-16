import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        c.id,
        c.nome,
        COUNT(v.id) as total_compras,
        COALESCE(SUM(v.valor_total), 0) as valor_total,
        MAX(v.data_venda) as ultima_compra
      FROM 
        clientes c
      LEFT JOIN 
        vendas v ON c.id = v.cliente_id
      GROUP BY 
        c.id, c.nome
      ORDER BY 
        valor_total DESC, total_compras DESC
      LIMIT 20
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Erro ao buscar relatório de clientes:", error)
    return NextResponse.json({ error: "Erro ao buscar relatório" }, { status: 500 })
  }
}
