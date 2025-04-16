import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Em vez de usar a view, vamos usar diretamente a consulta SQL
    const result = await query(`
      SELECT 
        v.vendedor_id,
        vd.nome as vendedor_nome,
        COUNT(v.id) as total_vendas,
        SUM(v.valor_total) as valor_total,
        AVG(v.valor_total) as ticket_medio,
        EXTRACT(YEAR FROM v.data_venda) as ano,
        EXTRACT(MONTH FROM v.data_venda) as mes,
        CONCAT(
          CASE 
            WHEN EXTRACT(MONTH FROM v.data_venda) = 1 THEN 'Janeiro'
            WHEN EXTRACT(MONTH FROM v.data_venda) = 2 THEN 'Fevereiro'
            WHEN EXTRACT(MONTH FROM v.data_venda) = 3 THEN 'Março'
            WHEN EXTRACT(MONTH FROM v.data_venda) = 4 THEN 'Abril'
            WHEN EXTRACT(MONTH FROM v.data_venda) = 5 THEN 'Maio'
            WHEN EXTRACT(MONTH FROM v.data_venda) = 6 THEN 'Junho'
            WHEN EXTRACT(MONTH FROM v.data_venda) = 7 THEN 'Julho'
            WHEN EXTRACT(MONTH FROM v.data_venda) = 8 THEN 'Agosto'
            WHEN EXTRACT(MONTH FROM v.data_venda) = 9 THEN 'Setembro'
            WHEN EXTRACT(MONTH FROM v.data_venda) = 10 THEN 'Outubro'
            WHEN EXTRACT(MONTH FROM v.data_venda) = 11 THEN 'Novembro'
            WHEN EXTRACT(MONTH FROM v.data_venda) = 12 THEN 'Dezembro'
          END, ' ', EXTRACT(YEAR FROM v.data_venda)::text
        ) as mes_ano
      FROM 
        vendas v
      JOIN 
        vendedores vd ON v.vendedor_id = vd.id
      GROUP BY 
        v.vendedor_id, vd.nome, ano, mes
      ORDER BY 
        vendedor_nome, ano, mes
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Erro ao buscar relatório de vendas por mês:", error)
    return NextResponse.json({ error: "Erro ao buscar relatório" }, { status: 500 })
  }
}
