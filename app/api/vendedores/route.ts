import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        v.id, 
        v.nome, 
        v.email, 
        v.telefone, 
        v.created_at as data_contratacao,
        COUNT(vd.id) as total_vendas,
        COALESCE(SUM(vd.valor_total), 0) as valor_vendas
      FROM 
        vendedores v
      LEFT JOIN 
        vendas vd ON v.id = vd.vendedor_id
      GROUP BY 
        v.id, v.nome, v.email, v.telefone, v.created_at
      ORDER BY 
        v.nome
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Erro ao buscar vendedores:", error)
    return NextResponse.json({ error: "Erro ao buscar vendedores" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, email, telefone } = body

    const result = await query("INSERT INTO vendedores (nome, email, telefone) VALUES ($1, $2, $3) RETURNING *", [
      nome,
      email,
      telefone,
    ])

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Erro ao criar vendedor:", error)
    return NextResponse.json({ error: "Erro ao criar vendedor" }, { status: 500 })
  }
}
