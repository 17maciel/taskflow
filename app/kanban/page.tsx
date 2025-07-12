"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  ClipboardList,
  ArrowRight,
  Clock,
  FolderOpen,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// Tipos de dados
interface Tarefa {
  id: string
  titulo: string
  descricao: string
  projeto: string
  responsavel: string
  status: "pendente" | "em_progresso" | "em_revisao" | "concluido" | "bloqueado"
  prioridade: "baixa" | "media" | "alta" | "critica"
  dataInicio: Date
  dataFim: Date
  tags: string[]
  comentarios: { id: string; autor: string; texto: string; data: Date }[]
  anexos: string[]
}

interface Projeto {
  id: string
  nome: string
}

interface Usuario {
  id: string
  nome: string
  avatar: string
}

// Dados mockados
const projetos: Projeto[] = [
  { id: "p1", nome: "Sistema E-commerce" },
  { id: "p2", nome: "App Mobile" },
  { id: "p3", nome: "Website Institucional" },
]

const usuarios: Usuario[] = [
  { id: "u1", nome: "João Silva", avatar: "JS" },
  { id: "u2", nome: "Maria Santos", avatar: "MS" },
  { id: "u3", nome: "Pedro Costa", avatar: "PC" },
  { id: "u4", nome: "Ana Lima", avatar: "AL" },
]

const tarefasIniciais: Tarefa[] = [
  {
    id: "t1",
    titulo: "Implementar Autenticação",
    descricao: "Desenvolver o módulo de autenticação de usuários com login, registro e recuperação de senha.",
    projeto: "p1",
    responsavel: "u1",
    status: "em_progresso",
    prioridade: "alta",
    dataInicio: new Date("2024-01-01"),
    dataFim: new Date("2024-01-10"),
    tags: ["backend", "segurança"],
    comentarios: [],
    anexos: [],
  },
  {
    id: "t2",
    titulo: "Design da Tela de Produtos",
    descricao: "Criar o layout e a interface de usuário para a página de listagem de produtos.",
    projeto: "p1",
    responsavel: "u2",
    status: "pendente",
    prioridade: "media",
    dataInicio: new Date("2024-01-05"),
    dataFim: new Date("2024-01-15"),
    tags: ["frontend", "ui/ux"],
    comentarios: [],
    anexos: [],
  },
  {
    id: "t3",
    titulo: "Configurar Banco de Dados",
    descricao: "Configurar o esquema do banco de dados para o projeto mobile.",
    projeto: "p2",
    responsavel: "u3",
    status: "concluido",
    prioridade: "baixa",
    dataInicio: new Date("2023-12-20"),
    dataFim: new Date("2023-12-28"),
    tags: ["database", "infra"],
    comentarios: [],
    anexos: [],
  },
  {
    id: "t4",
    titulo: "Revisar Conteúdo do Site",
    descricao: "Revisar todo o conteúdo textual do website institucional antes do lançamento.",
    projeto: "p3",
    responsavel: "u4",
    status: "em_revisao",
    prioridade: "critica",
    dataInicio: new Date("2024-01-08"),
    dataFim: new Date("2024-01-12"),
    tags: ["conteúdo", "revisão"],
    comentarios: [],
    anexos: [],
  },
  {
    id: "t5",
    titulo: "Integrar Gateway de Pagamento",
    descricao: "Conectar o sistema de e-commerce com o gateway de pagamento Stripe.",
    projeto: "p1",
    responsavel: "u1",
    status: "bloqueado",
    prioridade: "alta",
    dataInicio: new Date("2024-01-11"),
    dataFim: new Date("2024-01-20"),
    tags: ["backend", "pagamento"],
    comentarios: [],
    anexos: [],
  },
]

export default function KanbanPage() {
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

  const [tarefas, setTarefas] = useState<Tarefa[]>(tarefasIniciais)
  const [filtroProjeto, setFiltroProjeto] = useState("todos")
  const [filtroResponsavel, setFiltroResponsavel] = useState("todos")
  const [busca, setBusca] = useState("")
  const [novaTarefa, setNovaTarefa] = useState<Partial<Tarefa>>({
    status: "pendente",
    prioridade: "media",
    dataInicio: new Date(),
    dataFim: new Date(),
  })

  const colunasKanban = [
    { id: "pendente", titulo: "Pendente", icon: Clock },
    { id: "em_progresso", titulo: "Em Progresso", icon: ArrowRight },
    { id: "em_revisao", titulo: "Em Revisão", icon: Eye },
    { id: "concluido", titulo: "Concluído", icon: ClipboardList },
    { id: "bloqueado", titulo: "Bloqueado", icon: MoreHorizontal },
  ]

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "critica":
        return "destructive"
      case "alta":
        return "default"
      case "media":
        return "secondary"
      case "baixa":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-gray-100 text-gray-800"
      case "em_progresso":
        return "bg-blue-100 text-blue-800"
      case "em_revisao":
        return "bg-yellow-100 text-yellow-800"
      case "concluido":
        return "bg-green-100 text-green-800"
      case "bloqueado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    const matchProjeto = filtroProjeto === "todos" || tarefa.projeto === filtroProjeto
    const matchResponsavel = filtroResponsavel === "todos" || tarefa.responsavel === filtroResponsavel
    const matchBusca =
      busca === "" ||
      tarefa.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      tarefa.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      tarefa.tags.some((tag) => tag.toLowerCase().includes(busca.toLowerCase()))

    return matchProjeto && matchResponsavel && matchBusca
  })

  const handleAddTask = () => {
    if (novaTarefa.titulo && novaTarefa.projeto && novaTarefa.responsavel) {
      setTarefas([
        ...tarefas,
        {
          ...novaTarefa,
          id: `t${tarefas.length + 1}`,
          dataInicio: novaTarefa.dataInicio || new Date(),
          dataFim: novaTarefa.dataFim || new Date(),
          tags: novaTarefa.tags || [],
          comentarios: [],
          anexos: [],
        } as Tarefa,
      ])
      setNovaTarefa({
        status: "pendente",
        prioridade: "media",
        dataInicio: new Date(),
        dataFim: new Date(),
      })
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
          <h1 className="text-xl font-semibold">Kanban</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
              <DialogDescription>Adicione uma nova tarefa ao seu quadro Kanban</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título da Tarefa</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Implementar feature X"
                  value={novaTarefa.titulo || ""}
                  onChange={(e) => setNovaTarefa({ ...novaTarefa, titulo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Detalhes da tarefa..."
                  value={novaTarefa.descricao || ""}
                  onChange={(e) => setNovaTarefa({ ...novaTarefa, descricao: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projeto">Projeto</Label>
                  <Select
                    value={novaTarefa.projeto || ""}
                    onValueChange={(value) => setNovaTarefa({ ...novaTarefa, projeto: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projetos.map((projeto) => (
                        <SelectItem key={projeto.id} value={projeto.id}>
                          {projeto.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Select
                    value={novaTarefa.responsavel || ""}
                    onValueChange={(value) => setNovaTarefa({ ...novaTarefa, responsavel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.id}>
                          {usuario.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select
                    value={novaTarefa.prioridade || "media"}
                    onValueChange={(value) =>
                      setNovaTarefa({ ...novaTarefa, prioridade: value as Tarefa["prioridade"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status Inicial</Label>
                  <Select
                    value={novaTarefa.status || "pendente"}
                    onValueChange={(value) => setNovaTarefa({ ...novaTarefa, status: value as Tarefa["status"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colunasKanban.map((coluna) => (
                        <SelectItem key={coluna.id} value={coluna.id}>
                          {coluna.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !novaTarefa.dataInicio && "text-muted-foreground",
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {novaTarefa.dataInicio
                          ? format(novaTarefa.dataInicio, "PPP", { locale: ptBR })
                          : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={novaTarefa.dataInicio}
                        onSelect={(date) => setNovaTarefa({ ...novaTarefa, dataInicio: date || undefined })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFim">Data Fim</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !novaTarefa.dataFim && "text-muted-foreground",
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {novaTarefa.dataFim ? format(novaTarefa.dataFim, "PPP", { locale: ptBR }) : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={novaTarefa.dataFim}
                        onSelect={(date) => setNovaTarefa({ ...novaTarefa, dataFim: date || undefined })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={handleAddTask}>Criar Tarefa</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>

              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filtroProjeto} onValueChange={setFiltroProjeto}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Projetos</SelectItem>
                  {projetos.map((projeto) => (
                    <SelectItem key={projeto.id} value={projeto.id}>
                      {projeto.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtroResponsavel} onValueChange={setFiltroResponsavel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Responsáveis</SelectItem>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id}>
                      {usuario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {colunasKanban.map((coluna) => (
            <Card key={coluna.id} className="flex flex-col h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <coluna.icon className="h-4 w-4 text-muted-foreground" />
                  {coluna.titulo}
                  <Badge variant="secondary" className="ml-auto">
                    {tarefasFiltradas.filter((t) => t.status === coluna.id).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-3">
                {tarefasFiltradas
                  .filter((tarefa) => tarefa.status === coluna.id)
                  .map((tarefa) => {
                    const responsavel = usuarios.find((u) => u.id === tarefa.responsavel)
                    const projeto = projetos.find((p) => p.id === tarefa.projeto)
                    return (
                      <Card key={tarefa.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm">{tarefa.titulo}</h3>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{tarefa.descricao}</p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant={getPrioridadeColor(tarefa.prioridade)} className="text-xs">
                              {tarefa.prioridade}
                            </Badge>
                            <Badge className={cn("text-xs", getStatusColor(tarefa.status))}>
                              {colunasKanban.find((c) => c.id === tarefa.status)?.titulo}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(tarefa.dataFim, "dd/MM", { locale: ptBR })}</span>
                            </div>
                            {responsavel && (
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">{responsavel.avatar}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                          {projeto && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <FolderOpen className="h-3 w-3" />
                              <span>{projeto.nome}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                {tarefasFiltradas.filter((t) => t.status === coluna.id).length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-4">Nenhuma tarefa</div>
                )}
              </CardContent>
              <CardFooter className="pt-3">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Tarefa
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
