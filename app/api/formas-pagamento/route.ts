import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query("SELECT * FROM formas_pagamento ORDER BY nome")
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Erro ao buscar formas de pagamento:", error)
    return NextResponse.json({ error: "Erro ao buscar formas de pagamento" }, { status: 500 })
  }
}
