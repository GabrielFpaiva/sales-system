"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Loader2, User, Calendar, CreditCard } from "lucide-react"
import { toastNotification } from "@/hooks/use-toast-notification"

interface VendaDetalhes {
  id: number
  data_venda: string
  valor_total: number
  desconto: number
  cliente_nome: string
  cliente_email: string
  vendedor_nome: string
  forma_pagamento: string
  itens: {
    id: number
    produto_nome: string
    quantidade: number
    preco_unitario: number
    subtotal: number
  }[]
}

export default function VendaDetalhesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [venda, setVenda] = useState<VendaDetalhes | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Usar useCallback para evitar recriação da função em cada renderização
  const fetchVendaDetalhes = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/vendas/${params.id}/detalhes`)
      if (!response.ok) throw new Error("Falha ao buscar detalhes da venda")

      const data = await response.json()
      setVenda(data)
    } catch (error) {
      console.error("Erro ao buscar detalhes da venda:", error)
      toastNotification.showError("Não foi possível carregar os detalhes da venda. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchVendaDetalhes()
  }, [fetchVendaDetalhes])

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Carregando detalhes da venda...</p>
        </div>
      </div>
    )
  }

  if (!venda) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Venda não encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p>A venda solicitada não foi encontrada ou não existe.</p>
            <Button className="mt-4" onClick={() => router.push("/vendas")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para lista de vendas
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A"
    return new Date(dataString).toLocaleDateString() + " " + new Date(dataString).toLocaleTimeString()
  }

  return (
    <div className="container mx-auto py-10">
      <Button variant="outline" className="mb-6" onClick={() => router.push("/vendas")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para lista de vendas
      </Button>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Venda #{venda.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-semibold">Informações da Venda</h3>
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Data:</span> {formatarData(venda.data_venda)}
                  </p>
                  <p>
                    <span className="font-semibold">Forma de Pagamento:</span> {venda.forma_pagamento}
                  </p>
                  <p>
                    <span className="font-semibold">Vendedor:</span> {venda.vendedor_nome}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-semibold">Informações do Cliente</h3>
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Nome:</span> {venda.cliente_nome || "Cliente não identificado"}
                  </p>
                  {venda.cliente_email && (
                    <p>
                      <span className="font-semibold">Email:</span> {venda.cliente_email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center mb-4">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="text-lg font-semibold">Resumo Financeiro</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Subtotal</p>
                  <p className="text-xl font-bold">
                    R$ {(Number(venda.valor_total) + Number(venda.desconto)).toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Desconto</p>
                  <p className="text-xl font-bold">R$ {Number(venda.desconto).toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Total</p>
                  <p className="text-xl font-bold text-blue-600">R$ {Number(venda.valor_total).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Itens da Venda</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Preço Unitário</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venda.itens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.produto_nome}</TableCell>
                    <TableCell>{item.quantidade}</TableCell>
                    <TableCell>R$ {Number(item.preco_unitario).toFixed(2)}</TableCell>
                    <TableCell>R$ {Number(item.subtotal).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
