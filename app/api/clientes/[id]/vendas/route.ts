import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const clienteId = params.id

    // Verificar se o cliente existe
    const clienteResult = await query("SELECT id FROM clientes WHERE id = $1", [clienteId])
    if (clienteResult.rows.length === 0) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Buscar as vendas do cliente
    const vendasResult = await query(
      `
      SELECT 
        v.id, 
        v.data_venda, 
        v.valor_total, 
        v.desconto,
        fp.nome as forma_pagamento,
        vd.nome as vendedor_nome
      FROM 
        vendas v
      JOIN 
        formas_pagamento fp ON v.forma_pagamento_id = fp.id
      JOIN 
        vendedores vd ON v.vendedor_id = vd.id
      WHERE 
        v.cliente_id = $1
      ORDER BY 
        v.data_venda DESC
    `,
      [clienteId],
    )

    // Para cada venda, buscar os produtos
    const vendasComProdutos = await Promise.all(
      vendasResult.rows.map(async (venda: any) => {
        const produtosResult = await query(
          `
          SELECT 
            p.nome
          FROM 
            itens_venda iv
          JOIN 
            produtos p ON iv.produto_id = p.id
          WHERE 
            iv.venda_id = $1
        `,
          [venda.id],
        )

        const produtos = produtosResult.rows.map((p: any) => p.nome)

        return {
          ...venda,
          produtos,
        }
      }),
    )

    return NextResponse.json(vendasComProdutos)
  } catch (error) {
    console.error("Erro ao buscar vendas do cliente:", error)
    return NextResponse.json({ error: "Erro ao buscar vendas do cliente" }, { status: 500 })
  }
}
