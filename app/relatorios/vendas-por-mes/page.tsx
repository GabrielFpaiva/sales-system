"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import { useToastNotification } from "@/hooks/use-toast-notification"
import { useRouter } from "next/navigation"

interface VendaPorMes {
  vendedor_id: number
  vendedor_nome: string
  ano: number
  mes: number
  mes_ano: string
  total_vendas: number
  valor_total: number
  ticket_medio: number
}

export default function VendasPorMesPage() {
  const [vendasPorMes, setVendasPorMes] = useState<VendaPorMes[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showError } = useToastNotification()
  const router = useRouter()

  useEffect(() => {
    const fetchVendasPorMes = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/relatorios/vendas-por-mes")
        if (!response.ok) throw new Error("Falha ao buscar relatório de vendas por mês")

        const data = await response.json()
        setVendasPorMes(data)
      } catch (error) {
        console.error("Erro ao buscar vendas por mês:", error)
        showError("Não foi possível carregar o relatório de vendas por mês.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVendasPorMes()
  }, [showError])

  // Agrupar vendas por vendedor para facilitar a exibição
  const vendasPorVendedor = vendasPorMes.reduce(
    (acc, venda) => {
      if (!acc[venda.vendedor_id]) {
        acc[venda.vendedor_id] = {
          vendedor_nome: venda.vendedor_nome,
          meses: [],
        }
      }

      acc[venda.vendedor_id].meses.push({
        mes_ano: venda.mes_ano,
        total_vendas: venda.total_vendas,
        valor_total: venda.valor_total,
        ticket_medio: venda.ticket_medio,
      })

      return acc
    },
    {} as Record<number, { vendedor_nome: string; meses: any[] }>,
  )

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Vendas por Vendedor por Mês</h1>
        <Button variant="outline" onClick={() => router.push("/relatorios")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Relatórios
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Carregando dados...</p>
          </div>
        </div>
      ) : vendasPorMes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Nenhum dado disponível para o relatório.</p>
          </CardContent>
        </Card>
      ) : (
        Object.values(vendasPorVendedor).map((vendedor, index) => (
          <Card key={index} className="mb-6">
            <CardHeader>
              <CardTitle>{vendedor.vendedor_nome}</CardTitle>
              <CardDescription>Desempenho de vendas mensais</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês/Ano</TableHead>
                    <TableHead>Total de Vendas</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Ticket Médio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendedor.meses.map((mes, mesIndex) => (
                    <TableRow key={mesIndex}>
                      <TableCell>{mes.mes_ano}</TableCell>
                      <TableCell>{mes.total_vendas}</TableCell>
                      <TableCell>R$ {Number(mes.valor_total).toFixed(2)}</TableCell>
                      <TableCell>R$ {Number(mes.ticket_medio).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
