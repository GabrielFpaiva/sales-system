"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Minus, Plus, Search, Trash2, Loader2 } from "lucide-react"
import { useToastNotification, toastNotification } from "@/hooks/use-toast-notification"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Produto {
  id: number
  nome: string
  preco: number | string
  categoria: string
  estoque: number
}

interface Vendedor {
  id: number
  nome: string
}

interface FormaPagamento {
  id: number
  nome: string
}

interface ItemVenda {
  id: number
  produto_id: number
  produto: string
  preco: number
  quantidade: number
  total: number
}

// Corrigindo a interface do cliente para incluir todas as propriedades necessárias
interface Cliente {
  id: number
  nome: string
  email: string
  telefone?: string
  torce_flamengo: boolean
  assiste_one_piece: boolean
  de_sousa: boolean
}

export default function NovaVendaPage() {
  const router = useRouter()
  const { showSuccess, showError } = useToastNotification()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [produtosDialog, setProdutosDialog] = useState(false)
  const [produtosBusca, setProdutosBusca] = useState("")
  const [produtosLista, setProdutosLista] = useState<Produto[]>([])
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([])
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([])
  const [loadingError, setLoadingError] = useState<string | null>(null)

  // Adicionar um novo estado para controlar se o cliente já comprou anteriormente
  const [clienteExistente, setClienteExistente] = useState(false)
  const [clientesLista, setClientesLista] = useState<Cliente[]>([])
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState("")

  const [clienteInfo, setClienteInfo] = useState({
    nome: "",
    email: "",
    telefone: "",
    torceFlamengo: false,
    assisteOnePiece: false,
    deSousa: false,
  })

  const [vendaInfo, setVendaInfo] = useState({
    vendedor_id: "",
    forma_pagamento_id: "",
  })

  const [itens, setItens] = useState<ItemVenda[]>([])

  // Usar useCallback para evitar recriação da função em cada renderização
  const fetchDados = useCallback(async () => {
    setIsLoading(true)
    setLoadingError(null)

    try {
      // Buscar produtos
      const produtosResponse = await fetch("/api/produtos")
      if (!produtosResponse.ok) throw new Error("Falha ao buscar produtos")
      const produtosData = await produtosResponse.json()

      // Garantir que os preços sejam números
      const produtosFormatados = produtosData.map((p: any) => ({
        ...p,
        preco: Number(p.preco),
      }))

      setProdutosLista(produtosFormatados)
      setProdutosFiltrados(produtosFormatados)

      // Buscar vendedores
      const vendedoresResponse = await fetch("/api/vendedores")
      if (!vendedoresResponse.ok) throw new Error("Falha ao buscar vendedores")
      const vendedoresData = await vendedoresResponse.json()
      // Filtrar apenas vendedores ativos
      const vendedoresAtivos = vendedoresData.filter((v: any) => v.status === "ativo" || !v.status)
      setVendedores(vendedoresAtivos)

      // Buscar formas de pagamento
      const pagamentosResponse = await fetch("/api/formas-pagamento")
      if (!pagamentosResponse.ok) throw new Error("Falha ao buscar formas de pagamento")
      const pagamentosData = await pagamentosResponse.json()
      setFormasPagamento(pagamentosData)
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error)
      setLoadingError(
        "Não foi possível carregar os dados necessários. Verifique se o banco de dados está inicializado.",
      )
      toastNotification.showError("Não foi possível carregar os dados necessários. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Adicionar esta função para buscar clientes existentes
  const fetchClientes = useCallback(async () => {
    try {
      const response = await fetch("/api/clientes")
      if (!response.ok) throw new Error("Falha ao buscar clientes")

      const data = await response.json()
      setClientesLista(data)
    } catch (error) {
      console.error("Erro ao buscar clientes:", error)
      toastNotification.showError("Não foi possível carregar a lista de clientes.")
    }
  }, [])

  // Modificar o useEffect para também buscar clientes
  useEffect(() => {
    fetchDados()
    fetchClientes()
  }, [fetchDados, fetchClientes])

  const handleAddItem = () => {
    setProdutosDialog(true)
  }

  const handleRemoveItem = (id: number) => {
    setItens(itens.filter((item) => item.id !== id))
  }

  const handleProdutoSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busca = e.target.value.toLowerCase()
    setProdutosBusca(busca)

    if (busca.trim() === "") {
      setProdutosFiltrados(produtosLista)
    } else {
      const filtrados = produtosLista.filter(
        (p) => p.nome.toLowerCase().includes(busca) || p.categoria.toLowerCase().includes(busca),
      )
      setProdutosFiltrados(filtrados)
    }
  }

  const handleSelectProduto = (produto: Produto) => {
    // Garantir que o preço seja um número
    const precoNumerico = Number(produto.preco)

    // Verificar se o produto já está na lista
    const existente = itens.find((item) => item.produto_id === produto.id)

    if (existente) {
      // Incrementar a quantidade se já existir
      const quantidade = existente.quantidade + 1
      const total = precoNumerico * quantidade
      setItens(itens.map((item) => (item.produto_id === produto.id ? { ...item, quantidade, total } : item)))
    } else {
      // Adicionar novo item
      setItens([
        ...itens,
        {
          id: Date.now(),
          produto_id: produto.id,
          produto: produto.nome,
          preco: precoNumerico,
          quantidade: 1,
          total: precoNumerico,
        },
      ])
    }

    setProdutosDialog(false)
  }

  const calcularTotal = () => {
    return itens.reduce((acc, item) => acc + item.total, 0)
  }

  const calcularDesconto = () => {
    let percentualDesconto = 0
    const total = calcularTotal()

    // 25% de desconto para cada característica
    if (clienteInfo.torceFlamengo) percentualDesconto += 0.25
    if (clienteInfo.assisteOnePiece) percentualDesconto += 0.25
    if (clienteInfo.deSousa) percentualDesconto += 0.25

    // Calcular o valor do desconto
    return total * percentualDesconto
  }

  // Adicionar função para lidar com a seleção de cliente existente
  const handleClienteExistenteSelecionado = (clienteId: string) => {
    setClienteSelecionadoId(clienteId)

    // Encontrar o cliente selecionado na lista
    const clienteSelecionado = clientesLista.find((c) => c.id.toString() === clienteId)
    if (clienteSelecionado) {
      // Preencher os dados do cliente no formulário
      setClienteInfo({
        nome: clienteSelecionado.nome || "",
        email: clienteSelecionado.email || "",
        telefone: clienteSelecionado.telefone || "",
        torceFlamengo: clienteSelecionado.torce_flamengo || false,
        assisteOnePiece: clienteSelecionado.assiste_one_piece || false,
        deSousa: clienteSelecionado.de_sousa || false,
      })
    }
  }

  // Modificar a função handleSubmit para usar o ID do cliente existente quando aplicável
  const handleSubmit = async () => {
    // Validações
    if (!vendaInfo.vendedor_id) {
      showError("Selecione um vendedor para continuar.")
      return
    }

    if (!vendaInfo.forma_pagamento_id) {
      showError("Selecione uma forma de pagamento para continuar.")
      return
    }

    if (itens.length === 0) {
      showError("Adicione pelo menos um produto à venda.")
      return
    }

    if (!clienteExistente && !clienteInfo.nome.trim()) {
      showError("Informe o nome do cliente para continuar.")
      return
    }

    if (clienteExistente && !clienteSelecionadoId) {
      showError("Selecione um cliente existente para continuar.")
      return
    }

    setIsSubmitting(true)

    try {
      const vendaData = {
        cliente: clienteInfo,
        cliente_id: clienteExistente ? Number.parseInt(clienteSelecionadoId) : undefined,
        vendedor_id: Number.parseInt(vendaInfo.vendedor_id),
        forma_pagamento_id: Number.parseInt(vendaInfo.forma_pagamento_id),
        valor_total: calcularTotal() - calcularDesconto(),
        desconto: calcularDesconto(),
        itens: itens.map((item) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco: item.preco,
          total: item.total,
        })),
      }

      const response = await fetch("/api/vendas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vendaData),
      })

      if (!response.ok) {
        throw new Error("Falha ao registrar venda")
      }

      const data = await response.json()
      showSuccess("Venda registrada com sucesso!")
      router.push(`/vendas/${data.id}`)
    } catch (error) {
      console.error("Erro ao registrar venda:", error)
      showError("Não foi possível registrar a venda. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Carregando dados necessários...</p>
        </div>
      </div>
    )
  }

  if (loadingError) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Erro ao carregar dados</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{loadingError}</p>
            <p className="mt-4">Verifique se:</p>
            <ul className="list-disc list-inside mt-2">
              <li>O banco de dados está configurado corretamente</li>
              <li>As variáveis de ambiente estão configuradas</li>
              <li>O banco de dados foi inicializado com as tabelas necessárias</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/init-db")} className="bg-blue-600 hover:bg-blue-700">
              Inicializar Banco de Dados
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Nova Venda</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="cliente-existente"
                  checked={clienteExistente}
                  onCheckedChange={(checked) => setClienteExistente(checked === true)}
                />
                <Label htmlFor="cliente-existente">Cliente já comprou anteriormente?</Label>
              </div>

              {clienteExistente ? (
                <div>
                  <Label htmlFor="cliente-select">Selecione o Cliente</Label>
                  <Select value={clienteSelecionadoId} onValueChange={handleClienteExistenteSelecionado}>
                    <SelectTrigger id="cliente-select">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientesLista.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id.toString()}>
                          {cliente.nome} {cliente.email ? `(${cliente.email})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={clienteInfo.nome}
                        onChange={(e) => setClienteInfo({ ...clienteInfo, nome: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={clienteInfo.email}
                        onChange={(e) => setClienteInfo({ ...clienteInfo, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={clienteInfo.telefone}
                        onChange={(e) => setClienteInfo({ ...clienteInfo, telefone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 mt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="torce-flamengo"
                        checked={clienteInfo.torceFlamengo}
                        onCheckedChange={(checked) =>
                          setClienteInfo({ ...clienteInfo, torceFlamengo: checked === true })
                        }
                      />
                      <Label htmlFor="torce-flamengo">Torce para o Flamengo </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assiste-onepiece"
                        checked={clienteInfo.assisteOnePiece}
                        onCheckedChange={(checked) =>
                          setClienteInfo({ ...clienteInfo, assisteOnePiece: checked === true })
                        }
                      />
                      <Label htmlFor="assiste-onepiece">Assiste One Piece </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="de-sousa"
                        checked={clienteInfo.deSousa}
                        onCheckedChange={(checked) => setClienteInfo({ ...clienteInfo, deSousa: checked === true })}
                      />
                      <Label htmlFor="de-sousa">É de Sousa </Label>
                    </div>
                  </div>
                </>
              )}
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
                    <TableHead>Preço</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nenhum produto adicionado. Clique em "Adicionar Item" para começar.
                      </TableCell>
                    </TableRow>
                  ) : (
                    itens.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.produto}</TableCell>
                        <TableCell>R$ {item.preco.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const quantidade = Math.max(1, item.quantidade - 1)
                                const total = item.preco * quantidade
                                setItens(itens.map((i) => (i.id === item.id ? { ...i, quantidade, total } : i)))
                              }}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantidade}
                              onChange={(e) => {
                                const quantidade = Number.parseInt(e.target.value) || 1
                                const total = item.preco * quantidade
                                setItens(itens.map((i) => (i.id === item.id ? { ...i, quantidade, total } : i)))
                              }}
                              className="w-16 text-center"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const quantidade = item.quantidade + 1
                                const total = item.preco * quantidade
                                setItens(itens.map((i) => (i.id === item.id ? { ...i, quantidade, total } : i)))
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>R$ {item.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <Button variant="outline" className="mt-4" onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Item
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Resumo da Venda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vendedor">Vendedor</Label>
                  <Select
                    value={vendaInfo.vendedor_id}
                    onValueChange={(value) => setVendaInfo({ ...vendaInfo, vendedor_id: value })}
                  >
                    <SelectTrigger id="vendedor">
                      <SelectValue placeholder="Selecione o vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendedores.map((vendedor) => (
                        <SelectItem key={vendedor.id} value={vendedor.id.toString()}>
                          {vendedor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="pagamento">Forma de Pagamento</Label>
                  <Select
                    value={vendaInfo.forma_pagamento_id}
                    onValueChange={(value) => setVendaInfo({ ...vendaInfo, forma_pagamento_id: value })}
                  >
                    <SelectTrigger id="pagamento">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {formasPagamento.map((forma) => (
                        <SelectItem key={forma.id} value={forma.id.toString()}>
                          {forma.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between py-1">
                    <span>Subtotal:</span>
                    <span>R$ {calcularTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Desconto:</span>
                    <span>R$ {calcularDesconto().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold">
                    <span>Total:</span>
                    <span>R$ {(calcularTotal() - calcularDesconto()).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Finalizar Venda"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={produtosDialog} onOpenChange={setProdutosDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Selecionar Produto</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2 mb-4">
              <Input
                placeholder="Buscar produto por nome ou categoria"
                value={produtosBusca}
                onChange={handleProdutoSearch}
              />
              <Button variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nenhum produto encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    produtosFiltrados.map((produto) => (
                      <TableRow key={produto.id}>
                        <TableCell>{produto.nome}</TableCell>
                        <TableCell>{produto.categoria}</TableCell>
                        <TableCell>R$ {Number(produto.preco).toFixed(2)}</TableCell>
                        <TableCell>{produto.estoque}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleSelectProduto(produto)}
                            disabled={produto.estoque <= 0}
                          >
                            Selecionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
