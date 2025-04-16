import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT v.*, c.nome as cliente_nome, vd.nome as vendedor_nome, fp.nome as forma_pagamento
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      JOIN vendedores vd ON v.vendedor_id = vd.id
      JOIN formas_pagamento fp ON v.forma_pagamento_id = fp.id
      ORDER BY v.data_venda DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Erro ao buscar vendas:", error)
    return NextResponse.json({ error: "Erro ao buscar vendas" }, { status: 500 })
  }
}

// Modificar a função POST para aceitar cliente_id
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cliente, cliente_id, vendedor_id, forma_pagamento_id, valor_total, desconto, itens } = body

    // Iniciar uma transação
    await query("BEGIN")

    // Verificar se o cliente já existe ou criar um novo
    let cliente_id_final

    if (cliente_id) {
      // Usar o ID do cliente existente
      cliente_id_final = cliente_id
    } else {
      // Verificar se o cliente já existe ou criar um novo
      const clienteExistente = await query("SELECT id FROM clientes WHERE email = $1", [cliente.email])

      if (clienteExistente.rows.length > 0) {
        cliente_id_final = clienteExistente.rows[0].id
      } else {
        const novoCliente = await query(
          "INSERT INTO clientes (nome, email, telefone, torce_flamengo, assiste_one_piece, de_sousa) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
          [
            cliente.nome,
            cliente.email,
            cliente.telefone,
            cliente.torceFlamengo,
            cliente.assisteOnePiece,
            cliente.deSousa,
          ],
        )
        cliente_id_final = novoCliente.rows[0].id
      }
    }

    // Criar a venda
    const venda = await query(
      "INSERT INTO vendas (cliente_id, vendedor_id, forma_pagamento_id, valor_total, desconto) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [cliente_id_final, vendedor_id, forma_pagamento_id, valor_total, desconto],
    )

    const venda_id = venda.rows[0].id

    // Inserir os itens da venda
    for (const item of itens) {
      await query(
        "INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)",
        [venda_id, item.produto_id, item.quantidade, item.preco, item.total],
      )

      // Atualizar o estoque
      await query("UPDATE produtos SET estoque = estoque - $1 WHERE id = $2", [item.quantidade, item.produto_id])
    }

    // Finalizar a transação
    await query("COMMIT")

    return NextResponse.json({ id: venda_id }, { status: 201 })
  } catch (error) {
    // Reverter a transação em caso de erro
    await query("ROLLBACK")
    console.error("Erro ao criar venda:", error)
    return NextResponse.json({ error: "Erro ao criar venda" }, { status: 500 })
  }
}
