"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Loader2 } from "lucide-react"
import { useToastNotification } from "@/hooks/use-toast-notification"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Produto {
  id: number
  nome: string
  descricao: string
  preco: number
  categoria: string
  estoque: number
  fabricado_em: string
  created_at: string
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    nome: "",
    categoria: "",
    precoMin: "",
    precoMax: "",
    fabricadoEm: "",
  })
  const { showSuccess, showError } = useToastNotification()

  useEffect(() => {
    fetchProdutos()
  }, [])

  const fetchProdutos = async () => {
    setIsLoading(true)
    try {
      let url = "/api/produtos"
      const params = new URLSearchParams()

      if (filtros.nome) params.append("nome", filtros.nome)
      if (filtros.categoria) params.append("categoria", filtros.categoria)
      if (filtros.precoMin) params.append("precoMin", filtros.precoMin)
      if (filtros.precoMax) params.append("precoMax", filtros.precoMax)
      if (filtros.fabricadoEm) params.append("fabricadoEm", filtros.fabricadoEm)

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error("Falha ao buscar produtos")

      const data = await response.json()
      setProdutos(data)
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      showError("Não foi possível carregar os produtos. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFiltros((prev) => ({
      ...prev,
      [id === "preco-min" ? "precoMin" : id === "preco-max" ? "precoMax" : id]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleBuscar = () => {
    fetchProdutos()
  }

  const handleExcluirProduto = async (id: number) => {
    try {
      const response = await fetch(`/api/produtos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Falha ao excluir produto")

      showSuccess("Produto excluído com sucesso!")
      fetchProdutos()
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      showError("Não foi possível excluir o produto. Tente novamente.")
    }
  }

  const getStatusBadge = (estoque: number) => {
    if (estoque <= 0) {
      return <Badge className="bg-red-500">Sem Estoque</Badge>
    } else if (estoque < 10) {
      return <Badge className="bg-yellow-500">Baixo Estoque</Badge>
    } else {
      return <Badge className="bg-green-500">Disponível</Badge>
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Produtos</h1>
        <Link href="/produtos/novo">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" placeholder="Buscar por nome" value={filtros.nome} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={filtros.categoria} onValueChange={(value) => handleSelectChange("categoria", value)}>
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="smartphones">Smartphones</SelectItem>
                  <SelectItem value="tablets">Tablets</SelectItem>
                  <SelectItem value="notebooks">Notebooks</SelectItem>
                  <SelectItem value="acessorios">Acessórios</SelectItem>
                  <SelectItem value="smartwatches">Smartwatches</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="preco">Faixa de Preço</Label>
              <div className="flex space-x-2">
                <Input
                  id="preco-min"
                  placeholder="Min"
                  type="number"
                  value={filtros.precoMin}
                  onChange={handleInputChange}
                />
                <Input
                  id="preco-max"
                  placeholder="Max"
                  type="number"
                  value={filtros.precoMax}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fabricado">Fabricado em</Label>
              <Select value={filtros.fabricadoEm} onValueChange={(value) => handleSelectChange("fabricadoEm", value)}>
                <SelectTrigger id="fabricado">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="mari">Mari</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={handleBuscar} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Buscar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Fabricado em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <span className="mt-2 block">Carregando produtos...</span>
                  </TableCell>
                </TableRow>
              ) : produtos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                produtos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell>{produto.id}</TableCell>
                    <TableCell>{produto.nome}</TableCell>
                    <TableCell>{produto.categoria}</TableCell>
                    <TableCell>R$ {Number(produto.preco).toFixed(2)}</TableCell>
                    <TableCell>{produto.estoque}</TableCell>
                    <TableCell>{produto.fabricado_em}</TableCell>
                    <TableCell>{getStatusBadge(produto.estoque)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/produtos/editar/${produto.id}`}>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o produto "{produto.nome}"? Esta ação não pode ser
                                desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleExcluirProduto(produto.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
