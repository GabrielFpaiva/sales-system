"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react"
import { toastNotification } from "@/hooks/use-toast-notification"

interface Cliente {
  id: number
  nome: string
  email: string
  telefone: string
  torce_flamengo: boolean
  assiste_one_piece: boolean
  de_sousa: boolean
  created_at: string
}

interface Venda {
  id: number
  data_venda: string
  valor_total: number
  desconto: number
  forma_pagamento: string
  vendedor_nome: string
  produtos: string[]
}

export default function ClienteDetalhesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [vendas, setVendas] = useState<Venda[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Usar useCallback para evitar recriação da função em cada renderização
  const fetchClienteDetalhes = useCallback(async () => {
    setIsLoading(true)
    try {
      // Buscar dados do cliente
      const clienteResponse = await fetch(`/api/clientes/${params.id}`)
      if (!clienteResponse.ok) throw new Error("Falha ao buscar dados do cliente")
      const clienteData = await clienteResponse.json()
      setCliente(clienteData)

      // Buscar vendas do cliente
      const vendasResponse = await fetch(`/api/clientes/${params.id}/vendas`)
      if (!vendasResponse.ok) throw new Error("Falha ao buscar vendas do cliente")
      const vendasData = await vendasResponse.json()
      setVendas(vendasData)
    } catch (error) {
      console.error("Erro ao buscar detalhes do cliente:", error)
      toastNotification.showError("Não foi possível carregar os detalhes do cliente. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchClienteDetalhes()
  }, [fetchClienteDetalhes])

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Carregando detalhes do cliente...</p>
        </div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Cliente não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>O cliente solicitado não foi encontrado ou não existe.</p>
            <Button className="mt-4" onClick={() => router.push("/clientes")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para lista de clientes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A"
    return new Date(dataString).toLocaleDateString()
  }

  const calcularTotalCompras = () => {
    return vendas.reduce((acc, venda) => acc + Number(venda.valor_total), 0)
  }

  return (
    <div className="container mx-auto py-10">
      <Button variant="outline" className="mb-6" onClick={() => router.push("/clientes")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para lista de clientes
      </Button>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold mb-4">{cliente.nome}</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Email:</span> {cliente.email || "Não informado"}
                  </p>
                  <p>
                    <span className="font-semibold">Telefone:</span> {cliente.telefone || "Não informado"}
                  </p>
                  <p>
                    <span className="font-semibold">Cliente desde:</span> {formatarData(cliente.created_at)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Preferências</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {cliente.torce_flamengo && (
                    <Badge variant="outline" className="border-red-500 text-red-500">
                      Torce para o Flamengo
                    </Badge>
                  )}
                  {cliente.assiste_one_piece && (
                    <Badge variant="outline" className="border-blue-500 text-blue-500">
                      Assiste One Piece
                    </Badge>
                  )}
                  {cliente.de_sousa && (
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      É de Sousa
                    </Badge>
                  )}
                  {!cliente.torce_flamengo && !cliente.assiste_one_piece && !cliente.de_sousa && (
                    <span className="text-gray-500">Nenhuma preferência registrada</span>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Resumo de Compras</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Total de Compras</p>
                      <p className="text-2xl font-bold">{vendas.length}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Valor Total</p>
                      <p className="text-2xl font-bold">R$ {calcularTotalCompras().toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            {vendas.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <h3 className="text-lg font-medium">Nenhuma compra registrada</h3>
                <p className="text-gray-500">Este cliente ainda não realizou nenhuma compra.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Produtos</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell>{venda.id}</TableCell>
                      <TableCell>{formatarData(venda.data_venda)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={venda.produtos.join(", ")}>
                          {venda.produtos.join(", ")}
                        </div>
                      </TableCell>
                      <TableCell>{venda.vendedor_nome}</TableCell>
                      <TableCell>{venda.forma_pagamento}</TableCell>
                      <TableCell>R$ {Number(venda.valor_total).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/vendas/${venda.id}`)}>
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
