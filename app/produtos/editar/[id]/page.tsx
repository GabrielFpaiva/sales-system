"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useToastNotification, toastNotification } from "@/hooks/use-toast-notification"

interface Produto {
  id: number
  nome: string
  descricao: string
  preco: number
  categoria: string
  estoque: number
  fabricado_em: string
}

export default function EditarProdutoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { showSuccess, showError } = useToastNotification()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Produto>({
    id: 0,
    nome: "",
    descricao: "",
    preco: 0,
    categoria: "",
    estoque: 0,
    fabricado_em: "",
  })

  // Usar useCallback para evitar recriação da função em cada renderização
  const fetchProduto = useCallback(async () => {
    try {
      const response = await fetch(`/api/produtos/${params.id}`)
      if (!response.ok) throw new Error("Falha ao buscar produto")

      const data = await response.json()
      setFormData(data)
    } catch (error) {
      console.error("Erro ao buscar produto:", error)
      toastNotification.showError("Não foi possível carregar os dados do produto.")
      router.push("/produtos")
    } finally {
      setIsLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    fetchProduto()
  }, [fetchProduto])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const produtoData = {
        ...formData,
        preco: Number.parseFloat(formData.preco.toString()),
        estoque: Number.parseInt(formData.estoque.toString()),
      }

      const response = await fetch(`/api/produtos/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(produtoData),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar produto")
      }

      showSuccess("Produto atualizado com sucesso!")
      router.push("/produtos")
      router.refresh()
    } catch (error) {
      console.error("Erro ao atualizar produto:", error)
      showError("Não foi possível atualizar o produto. Verifique os dados e tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Carregando dados do produto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Editar Produto</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto</Label>
                <Input id="nome" name="nome" value={formData.nome} onChange={handleInputChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => handleSelectChange("categoria", value)}
                  required
                >
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smartphones">Smartphones</SelectItem>
                    <SelectItem value="tablets">Tablets</SelectItem>
                    <SelectItem value="notebooks">Notebooks</SelectItem>
                    <SelectItem value="acessorios">Acessórios</SelectItem>
                    <SelectItem value="smartwatches">Smartwatches</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$)</Label>
                <Input
                  id="preco"
                  name="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estoque">Quantidade em Estoque</Label>
                <Input
                  id="estoque"
                  name="estoque"
                  type="number"
                  min="0"
                  value={formData.estoque}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fabricado_em">Fabricado em</Label>
                <Select
                  value={formData.fabricado_em}
                  onValueChange={(value) => handleSelectChange("fabricado_em", value)}
                  required
                >
                  <SelectTrigger id="fabricado_em">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mari">Mari</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                rows={4}
                value={formData.descricao || ""}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Atualizar Produto"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
