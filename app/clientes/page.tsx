"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Eye, Loader2 } from "lucide-react"
import { useToastNotification } from "@/hooks/use-toast-notification"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface Cliente {
  id: number
  nome: string
  email: string
  telefone: string
  torce_flamengo: boolean
  assiste_one_piece: boolean
  de_sousa: boolean
  total_compras: number
  valor_total: number
  ultima_compra: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [open, setOpen] = useState(false)
  const { showSuccess, showError } = useToastNotification()

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    torce_flamengo: false,
    assiste_one_piece: false,
    de_sousa: false,
  })

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/clientes")
      if (!response.ok) throw new Error("Falha ao buscar clientes")

      const data = await response.json()
      setClientes(data)
    } catch (error) {
      console.error("Erro ao buscar clientes:", error)
      showError("Não foi possível carregar os clientes. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuscar = async () => {
    setIsLoading(true)
    try {
      let url = "/api/clientes"
      if (busca.trim()) {
        url += `?busca=${encodeURIComponent(busca)}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error("Falha ao buscar clientes")

      const data = await response.json()
      setClientes(data)
    } catch (error) {
      console.error("Erro ao buscar clientes:", error)
      showError("Não foi possível buscar os clientes. Tente novamente.")
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

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData({
      ...formData,
      [field]: checked,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Falha ao criar cliente")

      showSuccess("Cliente cadastrado com sucesso!")
      setOpen(false)
      resetForm()
      fetchClientes()
    } catch (error) {
      console.error("Erro ao criar cliente:", error)
      showError("Não foi possível cadastrar o cliente. Tente novamente.")
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      torce_flamengo: false,
      assiste_one_piece: false,
      de_sousa: false,
    })
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Clientes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="mr-2 h-4 w-4" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
              <DialogDescription>Preencha as informações para cadastrar um novo cliente.</DialogDescription>
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
                <div className="space-y-2">
                  <Label>Preferências</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="torce_flamengo"
                        checked={formData.torce_flamengo}
                        onCheckedChange={(checked) => handleCheckboxChange("torce_flamengo", checked === true)}
                      />
                      <Label htmlFor="torce_flamengo">Torce para o Flamengo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assiste_one_piece"
                        checked={formData.assiste_one_piece}
                        onCheckedChange={(checked) => handleCheckboxChange("assiste_one_piece", checked === true)}
                      />
                      <Label htmlFor="assiste_one_piece">Assiste One Piece</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="de_sousa"
                        checked={formData.de_sousa}
                        onCheckedChange={(checked) => handleCheckboxChange("de_sousa", checked === true)}
                      />
                      <Label htmlFor="de_sousa">É de Sousa</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Cadastrar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Buscar Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, email ou telefone"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleBuscar} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Compras</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead>Preferências</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <span className="mt-2 block">Carregando clientes...</span>
                  </TableCell>
                </TableRow>
              ) : clientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                clientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell>{cliente.telefone}</TableCell>
                    <TableCell>{cliente.total_compras || 0}</TableCell>
                    <TableCell>R$ {Number(cliente.valor_total || 0).toFixed(2)}</TableCell>
                    <TableCell>{cliente.ultima_compra || "Sem compras"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {cliente.torce_flamengo && (
                          <Badge variant="outline" className="border-red-500 text-red-500">
                            Flamengo
                          </Badge>
                        )}
                        {cliente.assiste_one_piece && (
                          <Badge variant="outline" className="border-blue-500 text-blue-500">
                            One Piece
                          </Badge>
                        )}
                        {cliente.de_sousa && (
                          <Badge variant="outline" className="border-green-500 text-green-500">
                            Sousa
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/clientes/${cliente.id}`}>
                          <Eye className="h-4 w-4 mr-1" /> Detalhes
                        </a>
                      </Button>
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
