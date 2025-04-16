"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Pencil, Trash2, UserCheck, UserX, Loader2 } from "lucide-react"
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

interface Vendedor {
  id: number
  nome: string
  email: string
  telefone: string
  data_contratacao: string
  status: string
  total_vendas: number
  valor_vendas: number
}

export default function VendedoresPage() {
  const [open, setOpen] = useState(false)
  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null)
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showSuccess, showError } = useToastNotification()

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
  })

  useEffect(() => {
    fetchVendedores()
  }, [])

  const fetchVendedores = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/vendedores")
      if (!response.ok) throw new Error("Falha ao buscar vendedores")

      const data = await response.json()

      // Formatar os dados para o formato esperado pelo componente
      const vendedoresFormatados = data.map((v: any) => ({
        ...v,
        data_contratacao: new Date(v.data_contratacao).toLocaleDateString(),
        status: v.status || "ativo", // Caso o status não venha do banco
        total_vendas: Number.parseInt(v.total_vendas || "0"),
        valor_vendas: Number.parseFloat(v.valor_vendas || "0"),
      }))

      setVendedores(vendedoresFormatados)
    } catch (error) {
      console.error("Erro ao buscar vendedores:", error)
      showError("Não foi possível carregar os vendedores. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingVendedor) {
        // Atualizar vendedor existente
        const response = await fetch(`/api/vendedores/${editingVendedor.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) throw new Error("Falha ao atualizar vendedor")

        showSuccess("Vendedor atualizado com sucesso!")
      } else {
        // Adicionar novo vendedor
        const response = await fetch("/api/vendedores", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) throw new Error("Falha ao criar vendedor")

        showSuccess("Vendedor cadastrado com sucesso!")
      }

      resetForm()
      fetchVendedores()
    } catch (error) {
      console.error("Erro ao salvar vendedor:", error)
      showError("Não foi possível salvar o vendedor. Tente novamente.")
    }
  }

  const handleEdit = (vendedor: Vendedor) => {
    setEditingVendedor(vendedor)
    setFormData({
      nome: vendedor.nome,
      email: vendedor.email,
      telefone: vendedor.telefone,
    })
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/vendedores/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao excluir vendedor")
      }

      showSuccess("Vendedor excluído com sucesso!")
      fetchVendedores()
    } catch (error: any) {
      console.error("Erro ao excluir vendedor:", error)
      showError(error.message || "Não foi possível excluir o vendedor. Tente novamente.")
    }
  }

  const toggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ativo" ? "inativo" : "ativo"

      const response = await fetch(`/api/vendedores/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Falha ao atualizar status do vendedor")

      showSuccess(`Vendedor ${newStatus === "ativo" ? "ativado" : "desativado"} com sucesso!`)
      fetchVendedores()
    } catch (error) {
      console.error("Erro ao atualizar status do vendedor:", error)
      showError("Não foi possível atualizar o status do vendedor. Tente novamente.")
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
    })
    setEditingVendedor(null)
    setOpen(false)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Vendedores</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="mr-2 h-4 w-4" /> Novo Vendedor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVendedor ? "Editar Vendedor" : "Novo Vendedor"}</DialogTitle>
              <DialogDescription>
                {editingVendedor
                  ? "Atualize as informações do vendedor abaixo."
                  : "Preencha as informações para cadastrar um novo vendedor."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" name="nome" value={formData.nome} onChange={handleInputChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingVendedor ? "Atualizar" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipe de Vendas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Data de Contratação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total de Vendas</TableHead>
                <TableHead>Valor em Vendas</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <span className="mt-2 block">Carregando vendedores...</span>
                  </TableCell>
                </TableRow>
              ) : vendedores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Nenhum vendedor encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                vendedores.map((vendedor) => (
                  <TableRow key={vendedor.id}>
                    <TableCell className="font-medium">{vendedor.nome}</TableCell>
                    <TableCell>{vendedor.email}</TableCell>
                    <TableCell>{vendedor.telefone}</TableCell>
                    <TableCell>{vendedor.data_contratacao}</TableCell>
                    <TableCell>
                      <Badge className={vendedor.status === "ativo" ? "bg-green-500" : "bg-red-500"}>
                        {vendedor.status === "ativo" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>{vendedor.total_vendas}</TableCell>
                    <TableCell>R$ {vendedor.valor_vendas.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(vendedor)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleStatus(vendedor.id, vendedor.status)}
                          className={vendedor.status === "ativo" ? "text-red-500" : "text-green-500"}
                        >
                          {vendedor.status === "ativo" ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o vendedor "{vendedor.nome}"? Esta ação não pode ser
                                desfeita.
                                {vendedor.total_vendas > 0 && (
                                  <p className="mt-2 text-red-500 font-semibold">
                                    Atenção: Este vendedor possui {vendedor.total_vendas} vendas registradas. A exclusão
                                    pode não ser possível.
                                  </p>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(vendedor.id)}>Excluir</AlertDialogAction>
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
