"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { useToastNotification } from "@/hooks/use-toast-notification"

interface VendedorRelatorio {
  vendedor_id: number
  vendedor_nome: string
  total_vendas: number
  valor_total: number
  ticket_medio: number
  comissao: number
}

interface ProdutoRelatorio {
  id: number
  nome: string
  categoria: string
  quantidade_vendida: number
  valor_total: number
  estoque_atual: number
}

interface ClienteRelatorio {
  id: number
  nome: string
  total_compras: number
  valor_total: number
  ultima_compra: string
}

interface RelacionamentoVendedorCliente {
  vendedor_id: number
  vendedor_nome: string
  total_clientes: number
  clientes_recorrentes: number
  taxa_fidelizacao: number
  ticket_medio_por_cliente: number
}

interface TopRelacionamento {
  vendedor_nome: string
  cliente_nome: string
  total_interacoes: number
  valor_total: number
  ultima_interacao: string
}

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

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState("vendedores")
  const [isLoading, setIsLoading] = useState(true)
  const { showError } = useToastNotification()

  const [vendedores, setVendedores] = useState<VendedorRelatorio[]>([])
  const [produtos, setProdutos] = useState<ProdutoRelatorio[]>([])
  const [clientes, setClientes] = useState<ClienteRelatorio[]>([])
  const [relacionamentos, setRelacionamentos] = useState<{
    vendedorCliente: RelacionamentoVendedorCliente[]
    topRelacionamentos: TopRelacionamento[]
  }>({
    vendedorCliente: [],
    topRelacionamentos: [],
  })
  const [vendasPorMes, setVendasPorMes] = useState<VendaPorMes[]>([])

  useEffect(() => {
    fetchData(activeTab)
  }, [activeTab])

  const fetchData = async (tab: string) => {
    setIsLoading(true)
    try {
      switch (tab) {
        case "vendedores":
          const vendedoresResponse = await fetch("/api/relatorios/vendedores")
          if (!vendedoresResponse.ok) throw new Error("Falha ao buscar relatório de vendedores")
          const vendedoresData = await vendedoresResponse.json()
          setVendedores(vendedoresData)
          break

        case "produtos":
          const produtosResponse = await fetch("/api/relatorios/produtos")
          if (!produtosResponse.ok) throw new Error("Falha ao buscar relatório de produtos")
          const produtosData = await produtosResponse.json()
          setProdutos(produtosData)
          break

        case "clientes":
          const clientesResponse = await fetch("/api/relatorios/clientes")
          if (!clientesResponse.ok) throw new Error("Falha ao buscar relatório de clientes")
          const clientesData = await clientesResponse.json()
          setClientes(clientesData)
          break

        case "relacionamentos":
          const relacionamentosResponse = await fetch("/api/relatorios/relacionamentos")
          if (!relacionamentosResponse.ok) throw new Error("Falha ao buscar relatório de relacionamentos")
          const relacionamentosData = await relacionamentosResponse.json()
          setRelacionamentos(relacionamentosData)
          break

        case "vendas-por-mes":
          const vendasPorMesResponse = await fetch("/api/relatorios/vendas-por-mes")
          if (!vendasPorMesResponse.ok) throw new Error("Falha ao buscar relatório de vendas por mês")
          const vendasPorMesData = await vendasPorMesResponse.json()
          setVendasPorMes(vendasPorMesData)
          break
      }
    } catch (error) {
      console.error(`Erro ao buscar dados para a aba ${tab}:`, error)
      showError(`Não foi possível carregar os dados do relatório de ${tab}.`)
    } finally {
      setIsLoading(false)
    }
  }

  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A"
    return new Date(dataString).toLocaleDateString()
  }

  const renderLoading = () => (
    <div className="flex justify-center items-center h-40">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2">Carregando dados...</p>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Relatórios</h1>

      <Tabs defaultValue="vendedores" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="vendedores">Vendedores</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="relacionamentos">Relacionamentos</TabsTrigger>
          <TabsTrigger value="vendas-por-mes">Vendas por Mês</TabsTrigger>
        </TabsList>

        <TabsContent value="vendedores">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Vendas por Vendedor</CardTitle>
              <CardDescription>Desempenho de vendas e comissões</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                renderLoading()
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Total de Vendas</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Ticket Médio</TableHead>
                      <TableHead>Comissão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendedores.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Nenhum dado disponível.
                        </TableCell>
                      </TableRow>
                    ) : (
                      vendedores.map((vendedor) => (
                        <TableRow key={vendedor.vendedor_id}>
                          <TableCell>{vendedor.vendedor_nome}</TableCell>
                          <TableCell>{vendedor.total_vendas}</TableCell>
                          <TableCell>R$ {Number(vendedor.valor_total).toFixed(2)}</TableCell>
                          <TableCell>R$ {Number(vendedor.ticket_medio).toFixed(2)}</TableCell>
                          <TableCell>R$ {Number(vendedor.comissao).toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
              <CardDescription>Análise de vendas por produto</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                renderLoading()
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Quantidade Vendida</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Estoque Atual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Nenhum dado disponível.
                        </TableCell>
                      </TableRow>
                    ) : (
                      produtos.map((produto) => (
                        <TableRow key={produto.id}>
                          <TableCell>{produto.nome}</TableCell>
                          <TableCell>{produto.categoria}</TableCell>
                          <TableCell>{produto.quantidade_vendida}</TableCell>
                          <TableCell>R$ {Number(produto.valor_total).toFixed(2)}</TableCell>
                          <TableCell>{produto.estoque_atual}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Mais Ativos</CardTitle>
              <CardDescription>Análise de compras por cliente</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                renderLoading()
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total de Compras</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Última Compra</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          Nenhum dado disponível.
                        </TableCell>
                      </TableRow>
                    ) : (
                      clientes.map((cliente) => (
                        <TableRow key={cliente.id}>
                          <TableCell>{cliente.nome}</TableCell>
                          <TableCell>{cliente.total_compras}</TableCell>
                          <TableCell>R$ {Number(cliente.valor_total).toFixed(2)}</TableCell>
                          <TableCell>{formatarData(cliente.ultima_compra)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relacionamentos">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Relacionamento Vendedor-Cliente</CardTitle>
              <CardDescription>Análise de clientes atendidos por cada vendedor</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                renderLoading()
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Total de Clientes</TableHead>
                      <TableHead>Clientes Recorrentes</TableHead>
                      <TableHead>Taxa de Fidelização</TableHead>
                      <TableHead>Ticket Médio por Cliente</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relacionamentos.vendedorCliente.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Nenhum dado disponível.
                        </TableCell>
                      </TableRow>
                    ) : (
                      relacionamentos.vendedorCliente.map((rel, index) => (
                        <TableRow key={index}>
                          <TableCell>{rel.vendedor_nome}</TableCell>
                          <TableCell>{rel.total_clientes}</TableCell>
                          <TableCell>{rel.clientes_recorrentes}</TableCell>
                          <TableCell>
                            {rel.total_clientes > 0
                              ? ((rel.clientes_recorrentes / rel.total_clientes) * 100).toFixed(1) + "%"
                              : "0%"}
                          </TableCell>
                          <TableCell>R$ {Number(rel.ticket_medio_por_cliente).toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Relacionamentos</CardTitle>
              <CardDescription>Melhores combinações vendedor-cliente por valor de venda</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                renderLoading()
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total de Interações</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Última Interação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relacionamentos.topRelacionamentos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Nenhum dado disponível.
                        </TableCell>
                      </TableRow>
                    ) : (
                      relacionamentos.topRelacionamentos.map((rel, index) => (
                        <TableRow key={index}>
                          <TableCell>{rel.vendedor_nome}</TableCell>
                          <TableCell>{rel.cliente_nome}</TableCell>
                          <TableCell>{rel.total_interacoes}</TableCell>
                          <TableCell>R$ {Number(rel.valor_total).toFixed(2)}</TableCell>
                          <TableCell>{formatarData(rel.ultima_interacao)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vendas-por-mes">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Mês</CardTitle>
              <CardDescription>Análise de desempenho mensal dos vendedores</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                renderLoading()
              ) : vendasPorMes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum dado disponível para o relatório.</p>
                </div>
              ) : (
                <div>
                  {(() => {
                    // Agrupar vendas por mês
                    const meses: Record<string, any> = {}

                    vendasPorMes.forEach((venda) => {
                      const mesAno = venda.mes_ano
                      if (!meses[mesAno]) {
                        meses[mesAno] = {
                          nome: mesAno,
                          vendedores: [],
                        }
                      }

                      meses[mesAno].vendedores.push({
                        nome: venda.vendedor_nome,
                        total_vendas: venda.total_vendas,
                        valor_total: venda.valor_total,
                      })
                    })

                    return Object.values(meses).map((mes: any, index) => (
                      <div key={index} className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">{mes.nome}</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Vendedor</TableHead>
                              <TableHead>Total de Vendas</TableHead>
                              <TableHead>Valor Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mes.vendedores.map((vendedor: any, vendedorIndex: number) => (
                              <TableRow key={vendedorIndex}>
                                <TableCell>{vendedor.nome}</TableCell>
                                <TableCell>{vendedor.total_vendas}</TableCell>
                                <TableCell>R$ {Number(vendedor.valor_total).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
