"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, FileDown, Loader2, Eye } from "lucide-react"
import { useToastNotification } from "@/hooks/use-toast-notification"

interface Venda {
  id: number
  cliente_nome: string
  vendedor_nome: string
  data_venda: string
  produtos: string
  valor_total: number
  forma_pagamento: string
  status: string
}

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showError } = useToastNotification()

  useEffect(() => {
    fetchVendas()
  }, [])

  const fetchVendas = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/vendas")
      if (!response.ok) throw new Error("Falha ao buscar vendas")

      const data = await response.json()

      // Buscar os produtos de cada venda
      const vendasComProdutos = await Promise.all(
        data.map(async (venda: any) => {
          const produtosResponse = await fetch(`/api/vendas/${venda.id}/produtos`)
          if (!produtosResponse.ok) throw new Error(`Falha ao buscar produtos da venda ${venda.id}`)

          const produtosData = await produtosResponse.json()
          const produtosNomes = produtosData.map((p: any) => p.nome).join(", ")

          return {
            ...venda,
            data_venda: new Date(venda.data_venda).toLocaleDateString(),
            produtos: produtosNomes,
            valor_total: Number.parseFloat(venda.valor_total),
            status: venda.status || "concluída",
          }
        }),
      )

      setVendas(vendasComProdutos)
    } catch (error) {
      console.error("Erro ao buscar vendas:", error)
      showError("Não foi possível carregar as vendas. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "concluída":
        return <Badge className="bg-green-500">Concluída</Badge>
      case "em processamento":
        return <Badge className="bg-yellow-500">Em processamento</Badge>
      case "cancelada":
        return <Badge className="bg-red-500">Cancelada</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const exportarVendas = () => {
    // Implementação da exportação de vendas (CSV, Excel, etc.)
    alert("Funcionalidade de exportação será implementada em breve!")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Vendas</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarVendas}>
            <FileDown className="mr-2 h-4 w-4" /> Exportar
          </Button>
          <Link href="/vendas/nova">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Nova Venda
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <span className="mt-2 block">Carregando vendas...</span>
                  </TableCell>
                </TableRow>
              ) : vendas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    Nenhuma venda encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                vendas.map((venda) => (
                  <TableRow key={venda.id}>
                    <TableCell>{venda.id}</TableCell>
                    <TableCell>{venda.cliente_nome || "Cliente não identificado"}</TableCell>
                    <TableCell>{venda.vendedor_nome}</TableCell>
                    <TableCell>{venda.data_venda}</TableCell>
                    <TableCell className="max-w-xs truncate" title={venda.produtos}>
                      {venda.produtos}
                    </TableCell>
                    <TableCell>R$ {venda.valor_total.toFixed(2)}</TableCell>
                    <TableCell>{venda.forma_pagamento}</TableCell>
                    <TableCell>{getStatusBadge(venda.status)}</TableCell>
                    <TableCell>
                      <Link href={`/vendas/${venda.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" /> Detalhes
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
