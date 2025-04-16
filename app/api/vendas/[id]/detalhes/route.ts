import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Buscar informações da venda
    const vendaResult = await query(
      `
      SELECT 
        v.id,
        v.data_venda,
        v.valor_total,
        v.desconto,
        c.nome as cliente_nome,
        c.email as cliente_email,
        vd.nome as vendedor_nome,
        fp.nome as forma_pagamento
      FROM 
        vendas v
      LEFT JOIN 
        clientes c ON v.cliente_id = c.id
      JOIN 
        vendedores vd ON v.vendedor_id = vd.id
      JOIN 
        formas_pagamento fp ON v.forma_pagamento_id = fp.id
      WHERE 
        v.id = $1
    `,
      [id],
    )

    if (vendaResult.rows.length === 0) {
      return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })
    }

    const venda = vendaResult.rows[0]

    // Buscar itens da venda
    const itensResult = await query(
      `
      SELECT 
        iv.id,
        p.nome as produto_nome,
        iv.quantidade,
        iv.preco_unitario,
        iv.subtotal
      FROM 
        itens_venda iv
      JOIN 
        produtos p ON iv.produto_id = p.id
      WHERE 
        iv.venda_id = $1
    `,
      [id],
    )

    // Montar o objeto de resposta
    const vendaDetalhes = {
      ...venda,
      itens: itensResult.rows,
    }

    return NextResponse.json(vendaDetalhes)
  } catch (error) {
    console.error("Erro ao buscar detalhes da venda:", error)
    return NextResponse.json({ error: "Erro ao buscar detalhes da venda" }, { status: 500 })
  }
}
