import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const nome = searchParams.get("nome")
  const categoria = searchParams.get("categoria")
  const precoMin = searchParams.get("precoMin")
  const precoMax = searchParams.get("precoMax")
  const fabricadoEm = searchParams.get("fabricadoEm")

  let sql = "SELECT * FROM produtos WHERE 1=1"
  const params: any[] = []

  if (nome) {
    params.push(`%${nome}%`)
    sql += ` AND nome ILIKE $${params.length}`
  }

  if (categoria) {
    params.push(categoria)
    sql += ` AND categoria = $${params.length}`
  }

  if (precoMin) {
    params.push(Number.parseFloat(precoMin))
    sql += ` AND preco >= $${params.length}`
  }

  if (precoMax) {
    params.push(Number.parseFloat(precoMax))
    sql += ` AND preco <= $${params.length}`
  }

  if (fabricadoEm) {
    params.push(fabricadoEm)
    sql += ` AND fabricado_em = $${params.length}`
  }

  sql += " ORDER BY id DESC"

  try {
    const result = await query(sql, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, descricao, preco, categoria, estoque, fabricado_em } = body

    const result = await query(
      "INSERT INTO produtos (nome, descricao, preco, categoria, estoque, fabricado_em) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [nome, descricao, preco, categoria, estoque, fabricado_em],
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
  }
}
