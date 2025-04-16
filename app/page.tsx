import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4 text-blue-600">TechStore</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sistema completo de gerenciamento para sua loja de celulares e eletrônicos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>Gerenciar catálogo de produtos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Cadastre e gerencie smartphones, tablets, notebooks e acessórios em seu estoque.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/produtos" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Acessar</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Vendas</CardTitle>
            <CardDescription>Realizar e gerenciar vendas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Registre vendas, aplique descontos e gerencie o histórico de transações de forma simples e eficiente.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/vendas" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Acessar</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>Gerenciar cadastro de clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Mantenha um registro completo dos seus clientes e acompanhe seu histórico de compras.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/clientes" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Acessar</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Vendedores</CardTitle>
            <CardDescription>Gerenciar equipe de vendas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Cadastre vendedores, acompanhe desempenho e gerencie comissões de forma eficiente.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/vendedores" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Acessar</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-10">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Relatórios e Análises</CardTitle>
            <CardDescription>Visualize dados importantes para sua loja</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Acesse relatórios detalhados sobre vendas, desempenho de vendedores, produtos mais vendidos e muito mais.
              Tome decisões baseadas em dados para impulsionar seu negócio.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/relatorios" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Ver Relatórios</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
