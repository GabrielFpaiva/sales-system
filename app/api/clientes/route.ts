import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const busca = searchParams.get("busca")

  try {
    let sql = `
      SELECT 
        c.*,
        COUNT(v.id) as total_compras,
        COALESCE(SUM(v.valor_total), 0) as valor_total,
        MAX(v.data_venda) as ultima_compra
      FROM 
        clientes c
      LEFT JOIN 
        vendas v ON c.id = v.cliente_id
    `

    const params: any[] = []

    if (busca) {
      sql += ` WHERE c.nome ILIKE $1 OR c.email ILIKE $1 OR c.telefone ILIKE $1`
      params.push(`%${busca}%`)
    }

    sql += ` GROUP BY c.id ORDER BY c.nome`

    const result = await query(sql, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Erro ao buscar clientes:", error)
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, email, telefone, torce_flamengo, assiste_one_piece, de_sousa } = body

    const result = await query(
      `INSERT INTO clientes (nome, email, telefone, torce_flamengo, assiste_one_piece, de_sousa) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [nome, email, telefone, torce_flamengo, assiste_one_piece, de_sousa],
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Erro ao criar cliente:", error)
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 })
  }
}
