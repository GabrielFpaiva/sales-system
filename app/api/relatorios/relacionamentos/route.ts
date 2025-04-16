import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Relacionamento vendedor-cliente
    const vendedorClienteResult = await query(`
      SELECT 
        v.id as vendedor_id,
        v.nome as vendedor_nome,
        COUNT(DISTINCT c.id) as total_clientes,
        COUNT(DISTINCT CASE WHEN (
          SELECT COUNT(*) FROM vendas v2 
          WHERE v2.vendedor_id = v.id AND v2.cliente_id = c.id
        ) > 1 THEN c.id END) as clientes_recorrentes,
        ROUND(AVG(vd.valor_total), 2) as ticket_medio_por_cliente
      FROM 
        vendedores v
      JOIN 
        vendas vd ON v.id = vd.vendedor_id
      JOIN 
        clientes c ON vd.cliente_id = c.id
      GROUP BY 
        v.id, v.nome
      ORDER BY 
        total_clientes DESC
    `)

    // Top relacionamentos vendedor-cliente
    const topRelacionamentosResult = await query(`
      SELECT 
        v.nome as vendedor_nome,
        c.nome as cliente_nome,
        COUNT(vd.id) as total_interacoes,
        SUM(vd.valor_total) as valor_total,
        MAX(vd.data_venda) as ultima_interacao
      FROM 
        vendas vd
      JOIN 
        vendedores v ON vd.vendedor_id = v.id
      JOIN 
        clientes c ON vd.cliente_id = c.id
      GROUP BY 
        v.nome, c.nome
      ORDER BY 
        valor_total DESC
      LIMIT 10
    `)

    return NextResponse.json({
      vendedorCliente: vendedorClienteResult.rows,
      topRelacionamentos: topRelacionamentosResult.rows,
    })
  } catch (error) {
    console.error("Erro ao buscar relatório de relacionamentos:", error)
    return NextResponse.json({ error: "Erro ao buscar relatório" }, { status: 500 })
  }
}
