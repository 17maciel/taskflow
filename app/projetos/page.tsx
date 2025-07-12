"use client"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { FolderOpen, Plus, Search, Calendar, Users, CheckSquare, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const projetos = [
  {
    id: "1",
    nome: "Sistema E-commerce",
    cliente: "TechCorp",
    descricao: "Desenvolvimento de plataforma completa de e-commerce com integração de pagamentos",
    status: "Em Andamento",
    progresso: 75,
    dataInicio: "2024-01-15",
    dataFim: "2024-02-15",
    responsavel: { nome: "João Silva", avatar: "JS" },
    equipe: 5,
    tarefasTotal: 24,
    tarefasConcluidas: 18,
    prioridade: "Alta",
    orcamento: "R$ 50.000",
  },
  {
    id: "2",
    nome: "App Mobile",
    cliente: "StartupXYZ",
    descricao: "Aplicativo mobile para gestão de delivery com GPS e pagamentos",
    status: "Desenvolvimento",
    progresso: 45,
    dataInicio: "2024-01-20",
    dataFim: "2024-03-01",
    responsavel: { nome: "Maria Santos", avatar: "MS" },
    equipe: 4,
    tarefasTotal: 32,
    tarefasConcluidas: 14,
    prioridade: "Média",
    orcamento: "R$ 35.000",
  },
  {
    id: "3",
    nome: "Website Institucional",
    cliente: "Empresa ABC",
    descricao: "Site institucional responsivo com CMS e área administrativa",
    status: "Finalização",
    progresso: 90,
    dataInicio: "2024-01-10",
    dataFim: "2024-01-30",
    responsavel: { nome: "Pedro Costa", avatar: "PC" },
    equipe: 3,
    tarefasTotal: 16,
    tarefasConcluidas: 15,
    prioridade: "Baixa",
    orcamento: "R$ 20.000",
  },
  {
    id: "4",
    nome: "Sistema CRM",
    cliente: "Vendas Pro",
    descricao: "Sistema de gestão de relacionamento com clientes e automação de vendas",
    status: "Planejamento",
    progresso: 15,
    dataInicio: "2024-02-01",
    dataFim: "2024-04-15",
    responsavel: { nome: "Ana Lima", avatar: "AL" },
    equipe: 6,
    tarefasTotal: 45,
    tarefasConcluidas: 3,
    prioridade: "Alta",
    orcamento: "R$ 80.000",
  },
]

export default function ProjetosPage() {
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        console.error("Supabase client not initialized. Redirecting to login.")
        router.push("/login")
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
      } else {
        setLoading(false)
      }
    }

    checkSession()

    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          router.push("/login")
        } else {
          setLoading(false)
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [supabase, router])

  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")

  const projetosFiltrados = projetos.filter((projeto) => {
    const matchBusca =
      projeto.nome.toLowerCase().includes(busca.toLowerCase()) ||
      projeto.cliente.toLowerCase().includes(busca.toLowerCase())
    const matchStatus = filtroStatus === "todos" || projeto.status === filtroStatus
    return matchBusca && matchStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em Andamento":
        return "default"
      case "Desenvolvimento":
        return "secondary"
      case "Finalização":
        return "outline"
      case "Planejamento":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "Alta":
        return "destructive"
      case "Média":
        return "default"
      case "Baixa":
        return "secondary"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">Projetos</h1>
        </div>
        <Button asChild>
          <Link href="/projetos/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Link>
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Filtros e Busca */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar projetos..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filtroStatus === "todos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroStatus("todos")}
                >
                  Todos
                </Button>
                <Button
                  variant={filtroStatus === "Em Andamento" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroStatus("Em Andamento")}
                >
                  Em Andamento
                </Button>
                <Button
                  variant={filtroStatus === "Desenvolvimento" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroStatus("Desenvolvimento")}
                >
                  Desenvolvimento
                </Button>
                <Button
                  variant={filtroStatus === "Finalização" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroStatus("Finalização")}
                >
                  Finalização
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Projetos */}
        <div className="grid gap-6 md:grid-cols-2">
          {projetosFiltrados.map((projeto) => (
            <Card key={projeto.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{projeto.nome}</CardTitle>
                    <CardDescription>{projeto.cliente}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{projeto.descricao}</p>

                <div className="flex items-center gap-4">
                  <Badge variant={getStatusColor(projeto.status)}>{projeto.status}</Badge>
                  <Badge variant={getPrioridadeColor(projeto.prioridade)}>{projeto.prioridade}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{projeto.progresso}%</span>
                  </div>
                  <Progress value={projeto.progresso} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Início: {new Date(projeto.dataInicio).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Fim: {new Date(projeto.dataFim).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckSquare className="h-4 w-4" />
                      <span>
                        {projeto.tarefasConcluidas}/{projeto.tarefasTotal} tarefas
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{projeto.equipe} membros</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{projeto.responsavel.avatar}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{projeto.responsavel.nome}</span>
                  </div>
                  <span className="text-sm font-medium">{projeto.orcamento}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projetosFiltrados.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Não encontramos projetos que correspondam aos seus critérios de busca.
              </p>
              <Button asChild>
                <Link href="/projetos/novo">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Projeto
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
