"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Database, Loader2 } from "lucide-react"
import Link from "next/link"

export default function InitDbPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string }>({})

  const handleInitDb = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/init-db")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Erro ao inicializar banco de dados:", error)
      setResult({ success: false, message: "Erro ao inicializar banco de dados" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" /> Inicialização do Banco de Dados
          </CardTitle>
          <CardDescription>
            Este processo irá criar as tabelas necessárias e inserir dados iniciais no banco de dados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.success === true && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Sucesso!</AlertTitle>
              <AlertDescription className="text-green-600">
                {result.message || "Banco de dados inicializado com sucesso!"}
              </AlertDescription>
            </Alert>
          )}

          {result.success === false && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Erro</AlertTitle>
              <AlertDescription className="text-red-600">
                {result.message || "Ocorreu um erro ao inicializar o banco de dados."}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <p className="text-sm">Este processo irá:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Criar tabelas para clientes, vendedores, produtos, vendas e formas de pagamento</li>
              <li>Inserir formas de pagamento padrão (Dinheiro, Cartão de Crédito, Cartão de Débito, PIX)</li>
              <li>Inserir alguns vendedores e produtos de exemplo</li>
            </ul>
            <p className="text-sm font-medium">Atenção: Se as tabelas já existirem, elas não serão recriadas.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/">Voltar para o início</Link>
          </Button>
          <Button
            onClick={handleInitDb}
            disabled={isLoading || result.success === true}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inicializando...
              </>
            ) : result.success === true ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Concluído
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Inicializar Banco de Dados
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
