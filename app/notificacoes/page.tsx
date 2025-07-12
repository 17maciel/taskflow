"use client"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Mail,
  MessageSquare,
  Smartphone,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  Archive,
  Trash2,
  Plus,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// Tipos de notificações
interface Notificacao {
  id: string
  tipo: "atraso" | "marco" | "critica" | "recurso" | "prazo" | "aprovacao"
  titulo: string
  descricao: string
  severidade: "baixa" | "media" | "alta" | "critica"
  dataCreated: Date
  dataLida?: Date
  lida: boolean
  projeto: string
  tarefa?: string
  responsavel: string
  acoes?: {
    label: string
    action: string
    variant?: "default" | "destructive" | "outline"
  }[]
  metadata?: {
    diasAtraso?: number
    dataOriginal?: Date
    dataAtual?: Date
    impacto?: string
    recursos?: string[]
  }
}

interface ConfiguracaoNotificacao {
  id: string
  nome: string
  descricao: string
  ativo: boolean
  canais: ("email" | "push" | "sms" | "slack")[]
  condicoes: {
    tipo: string
    valor: string | number
    operador: "=" | ">" | "<" | ">=" | "<=" | "!="
  }[]
  destinatarios: string[]
  template?: string
  frequencia: "imediata" | "diaria" | "semanal"
}

interface EstatisticasNotificacao {
  total: number
  naoLidas: number
  porTipo: Record<string, number>
  porSeveridade: Record<string, number>
  tendencia: "crescente" | "estavel" | "decrescente"
}

// Dados mockados
const notificacoes: Notificacao[] = [
  {
    id: "n1",
    tipo: "atraso",
    titulo: "Tarefa em Atraso Crítico",
    descricao: "A tarefa 'Desenvolvimento Backend' está 3 dias atrasada e impacta o caminho crítico",
    severidade: "critica",
    dataCreated: new Date("2024-01-05T14:30:00"),
    lida: false,
    projeto: "Sistema E-commerce",
    tarefa: "Desenvolvimento Backend",
    responsavel: "Pedro Costa",
    acoes: [
      { label: "Ver Tarefa", action: "view", variant: "default" },
      { label: "Realocar Recursos", action: "reallocate", variant: "outline" },
    ],
    metadata: {
      diasAtraso: 3,
      dataOriginal: new Date("2024-01-02"),
      dataAtual: new Date("2024-01-05"),
      impacto: "Atraso de 3 dias no projeto",
    },
  },
  {
    id: "n2",
    tipo: "marco",
    titulo: "Marco Crítico Aproximando",
    descricao: "O marco 'Entrega MVP' está previsto para amanhã e ainda há tarefas pendentes",
    severidade: "alta",
    dataCreated: new Date("2024-01-05T09:15:00"),
    lida: false,
    projeto: "App Mobile",
    responsavel: "Maria Santos",
    acoes: [
      { label: "Ver Marco", action: "view", variant: "default" },
      { label: "Acelerar Tarefas", action: "accelerate", variant: "outline" },
    ],
    metadata: {
      dataOriginal: new Date("2024-01-06"),
      impacto: "Risco de não cumprir prazo do cliente",
    },
  },
  {
    id: "n3",
    tipo: "recurso",
    titulo: "Conflito de Recursos Detectado",
    descricao: "João Silva está alocado em 120% da capacidade na próxima semana",
    severidade: "media",
    dataCreated: new Date("2024-01-05T11:45:00"),
    lida: true,
    dataLida: new Date("2024-01-05T12:00:00"),
    projeto: "Sistema E-commerce",
    responsavel: "João Silva",
    acoes: [
      { label: "Ver Alocação", action: "view", variant: "default" },
      { label: "Redistribuir", action: "redistribute", variant: "outline" },
    ],
    metadata: {
      recursos: ["João Silva"],
      impacto: "Sobrecarga pode afetar qualidade",
    },
  },
  {
    id: "n4",
    tipo: "critica",
    titulo: "Nova Tarefa no Caminho Crítico",
    descricao: "A tarefa 'Integração APIs' se tornou crítica após atraso em dependência",
    severidade: "alta",
    dataCreated: new Date("2024-01-04T16:20:00"),
    lida: true,
    dataLida: new Date("2024-01-04T16:25:00"),
    projeto: "Sistema E-commerce",
    tarefa: "Integração APIs",
    responsavel: "João Silva",
    acoes: [
      { label: "Ver Análise", action: "view", variant: "default" },
      { label: "Priorizar", action: "prioritize", variant: "outline" },
    ],
  },
  {
    id: "n5",
    tipo: "prazo",
    titulo: "Prazo de Entrega em Risco",
    descricao: "O projeto 'Website Institucional' pode atrasar 2 dias baseado no progresso atual",
    severidade: "media",
    dataCreated: new Date("2024-01-04T10:30:00"),
    lida: false,
    projeto: "Website Institucional",
    responsavel: "Pedro Costa",
    acoes: [
      { label: "Ver Projeção", action: "view", variant: "default" },
      { label: "Ajustar Cronograma", action: "adjust", variant: "outline" },
    ],
    metadata: {
      diasAtraso: 2,
      impacto: "Possível multa contratual",
    },
  },
  {
    id: "n6",
    tipo: "aprovacao",
    titulo: "Aprovação Pendente",
    descricao: "O design da interface precisa de aprovação do cliente há 2 dias",
    severidade: "baixa",
    dataCreated: new Date("2024-01-03T14:15:00"),
    lida: true,
    dataLida: new Date("2024-01-03T15:00:00"),
    projeto: "Sistema E-commerce",
    tarefa: "Design da Interface",
    responsavel: "Maria Santos",
    acoes: [
      { label: "Contatar Cliente", action: "contact", variant: "default" },
      { label: "Escalar", action: "escalate", variant: "outline" },
    ],
  },
]

const configuracoes: ConfiguracaoNotificacao[] = [
  {
    id: "c1",
    nome: "Atrasos Críticos",
    descricao: "Notificar quando tarefas críticas atrasam",
    ativo: true,
    canais: ["email", "push"],
    condicoes: [
      { tipo: "atraso", valor: 1, operador: ">=" },
      { tipo: "critica", valor: "true", operador: "=" },
    ],
    destinatarios: ["gerente@empresa.com", "diretor@empresa.com"],
    frequencia: "imediata",
  },
  {
    id: "c2",
    nome: "Marcos Importantes",
    descricao: "Alertar sobre marcos próximos",
    ativo: true,
    canais: ["email", "slack"],
    condicoes: [{ tipo: "marco", valor: 2, operador: "<=" }],
    destinatarios: ["equipe@empresa.com"],
    frequencia: "diaria",
  },
  {
    id: "c3",
    nome: "Conflitos de Recursos",
    descricao: "Detectar sobrecarga de recursos",
    ativo: false,
    canais: ["push"],
    condicoes: [{ tipo: "utilizacao", valor: 100, operador: ">" }],
    destinatarios: ["rh@empresa.com"],
    frequencia: "imediata",
  },
]

const usuarios = [
  { id: "u1", nome: "João Silva", email: "joao@empresa.com", avatar: "JS" },
  { id: "u2", nome: "Maria Santos", email: "maria@empresa.com", avatar: "MS" },
  { id: "u3", nome: "Pedro Costa", email: "pedro@empresa.com", avatar: "PC" },
  { id: "u4", nome: "Ana Lima", email: "ana@empresa.com", avatar: "AL" },
]

export default function NotificacoesPage() {
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

  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>("todos")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [busca, setBusca] = useState("")
  const [notificacoesSelecionadas, setNotificacoesSelecionadas] = useState<string[]>([])
  const [novaConfiguracao, setNovaConfiguracao] = useState<Partial<ConfiguracaoNotificacao>>({
    nome: "",
    descricao: "",
    ativo: true,
    canais: [],
    condicoes: [],
    destinatarios: [],
    frequencia: "imediata",
  })

  // Calcular estatísticas
  const calcularEstatisticas = (): EstatisticasNotificacao => {
    const total = notificacoes.length
    const naoLidas = notificacoes.filter((n) => !n.lida).length

    const porTipo = notificacoes.reduce(
      (acc, n) => {
        acc[n.tipo] = (acc[n.tipo] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const porSeveridade = notificacoes.reduce(
      (acc, n) => {
        acc[n.severidade] = (acc[n.severidade] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total,
      naoLidas,
      porTipo,
      porSeveridade,
      tendencia: "crescente", // Simulado
    }
  }

  // Filtrar notificações
  const notificacoesFiltradas = notificacoes.filter((notificacao) => {
    const matchTipo = filtroTipo === "todos" || notificacao.tipo === filtroTipo
    const matchSeveridade = filtroSeveridade === "todos" || notificacao.severidade === filtroSeveridade
    const matchStatus =
      filtroStatus === "todos" ||
      (filtroStatus === "lidas" && notificacao.lida) ||
      (filtroStatus === "nao-lidas" && !notificacao.lida)
    const matchBusca =
      busca === "" ||
      notificacao.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      notificacao.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      notificacao.projeto.toLowerCase().includes(busca.toLowerCase())

    return matchTipo && matchSeveridade && matchStatus && matchBusca
  })

  const estatisticas = calcularEstatisticas()

  // Funções de ação
  const marcarComoLida = (id: string) => {
    // Implementar lógica para marcar como lida
    console.log("Marcar como lida:", id)
  }

  const marcarTodasComoLidas = () => {
    // Implementar lógica para marcar todas como lidas
    console.log("Marcar todas como lidas")
  }

  const arquivarNotificacao = (id: string) => {
    // Implementar lógica para arquivar
    console.log("Arquivar:", id)
  }

  const excluirNotificacao = (id: string) => {
    // Implementar lógica para excluir
    console.log("Excluir:", id)
  }

  const executarAcao = (notificacaoId: string, acao: string) => {
    // Implementar lógica para executar ações específicas
    console.log("Executar ação:", acao, "para notificação:", notificacaoId)
  }

  const toggleSelecao = (id: string) => {
    setNotificacoesSelecionadas((prev) => (prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]))
  }

  const selecionarTodas = () => {
    setNotificacoesSelecionadas(
      notificacoesSelecionadas.length === notificacoesFiltradas.length ? [] : notificacoesFiltradas.map((n) => n.id),
    )
  }

  // Obter ícone por tipo
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "atraso":
        return Clock
      case "marco":
        return Target
      case "critica":
        return AlertTriangle
      case "recurso":
        return Users
      case "prazo":
        return Calendar
      case "aprovacao":
        return CheckCircle
      default:
        return Bell
    }
  }

  // Obter cor por severidade
  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
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

  // Obter cor de fundo por severidade
  const getSeveridadeBg = (severidade: string) => {
    switch (severidade) {
      case "critica":
        return "bg-red-50 border-l-red-500"
      case "alta":
        return "bg-orange-50 border-l-orange-500"
      case "media":
        return "bg-yellow-50 border-l-yellow-500"
      case "baixa":
        return "bg-blue-50 border-l-blue-500"
      default:
        return "bg-gray-50 border-l-gray-500"
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
          <h1 className="text-xl font-semibold">Notificações</h1>
          {estatisticas.naoLidas > 0 && (
            <Badge variant="destructive" className="ml-2">
              {estatisticas.naoLidas} não lidas
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={marcarTodasComoLidas}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar Todas como Lidas
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Regra de Notificação</DialogTitle>
                <DialogDescription>Configure quando e como receber notificações automáticas</DialogDescription>
              </DialogHeader>
              {/* Formulário de nova configuração seria implementado aqui */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Regra</Label>
                  <Input placeholder="Ex: Atrasos em Tarefas Críticas" />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea placeholder="Descreva quando esta regra deve ser ativada" />
                </div>
                <div className="flex gap-4">
                  <Button>Criar Regra</Button>
                  <Button variant="outline">Cancelar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{estatisticas.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <div className="text-2xl font-bold">{estatisticas.naoLidas}</div>
                  <div className="text-sm text-muted-foreground">Não Lidas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{estatisticas.porSeveridade.critica || 0}</div>
                  <div className="text-sm text-muted-foreground">Críticas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold capitalize">{estatisticas.tendencia}</div>
                  <div className="text-sm text-muted-foreground">Tendência</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="notificacoes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="canais">Canais</TabsTrigger>
          </TabsList>

          <TabsContent value="notificacoes" className="space-y-4">
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
                      placeholder="Buscar notificações..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Tipos</SelectItem>
                      <SelectItem value="atraso">Atrasos</SelectItem>
                      <SelectItem value="marco">Marcos</SelectItem>
                      <SelectItem value="critica">Críticas</SelectItem>
                      <SelectItem value="recurso">Recursos</SelectItem>
                      <SelectItem value="prazo">Prazos</SelectItem>
                      <SelectItem value="aprovacao">Aprovações</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filtroSeveridade} onValueChange={setFiltroSeveridade}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Severidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="nao-lidas">Não Lidas</SelectItem>
                      <SelectItem value="lidas">Lidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ações em lote */}
                {notificacoesSelecionadas.length > 0 && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      {notificacoesSelecionadas.length} selecionadas
                    </span>
                    <Button variant="outline" size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Lidas
                    </Button>
                    <Button variant="outline" size="sm">
                      <Archive className="h-4 w-4 mr-2" />
                      Arquivar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lista de Notificações */}
            <div className="space-y-2">
              {/* Header da lista */}
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg">
                <Checkbox
                  checked={notificacoesSelecionadas.length === notificacoesFiltradas.length}
                  onCheckedChange={selecionarTodas}
                />
                <span className="text-sm font-medium">Selecionar todas</span>
              </div>

              {notificacoesFiltradas.map((notificacao) => {
                const TipoIcon = getTipoIcon(notificacao.tipo)
                const isSelected = notificacoesSelecionadas.includes(notificacao.id)

                return (
                  <Card
                    key={notificacao.id}
                    className={cn(
                      "transition-all hover:shadow-md border-l-4",
                      getSeveridadeBg(notificacao.severidade),
                      !notificacao.lida && "bg-blue-50/50",
                      isSelected && "ring-2 ring-primary",
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleSelecao(notificacao.id)} />

                        <div className="flex-shrink-0">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              notificacao.severidade === "critica" && "bg-red-100 text-red-600",
                              notificacao.severidade === "alta" && "bg-orange-100 text-orange-600",
                              notificacao.severidade === "media" && "bg-yellow-100 text-yellow-600",
                              notificacao.severidade === "baixa" && "bg-blue-100 text-blue-600",
                            )}
                          >
                            <TipoIcon className="h-5 w-5" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className={cn("font-medium", !notificacao.lida && "font-semibold")}>
                                  {notificacao.titulo}
                                </h3>
                                {!notificacao.lida && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                              </div>
                              <p className="text-sm text-muted-foreground">{notificacao.descricao}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{notificacao.projeto}</span>
                                {notificacao.tarefa && <span>• {notificacao.tarefa}</span>}
                                <span>• {format(notificacao.dataCreated, "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                                <span>• {notificacao.responsavel}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant={getSeveridadeColor(notificacao.severidade)} className="text-xs">
                                {notificacao.severidade.toUpperCase()}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!notificacao.lida && (
                                    <DropdownMenuItem onClick={() => marcarComoLida(notificacao.id)}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Marcar como Lida
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Detalhes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => arquivarNotificacao(notificacao.id)}>
                                    <Archive className="h-4 w-4 mr-2" />
                                    Arquivar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => excluirNotificacao(notificacao.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Metadados */}
                          {notificacao.metadata && (
                            <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                {notificacao.metadata.diasAtraso && (
                                  <div>
                                    <span className="font-medium">Dias de atraso:</span>{" "}
                                    {notificacao.metadata.diasAtraso}
                                  </div>
                                )}
                                {notificacao.metadata.impacto && (
                                  <div>
                                    <span className="font-medium">Impacto:</span> {notificacao.metadata.impacto}
                                  </div>
                                )}
                                {notificacao.metadata.recursos && (
                                  <div>
                                    <span className="font-medium">Recursos:</span>{" "}
                                    {notificacao.metadata.recursos.join(", ")}
                                  </div>
                                )}
                                {notificacao.metadata.dataOriginal && (
                                  <div>
                                    <span className="font-medium">Data original:</span>{" "}
                                    {format(notificacao.metadata.dataOriginal, "dd/MM/yyyy", { locale: ptBR })}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Ações */}
                          {notificacao.acoes && (
                            <div className="flex gap-2 mt-3">
                              {notificacao.acoes.map((acao, index) => (
                                <Button
                                  key={index}
                                  variant={acao.variant || "outline"}
                                  size="sm"
                                  onClick={() => executarAcao(notificacao.id, acao.action)}
                                >
                                  {acao.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {notificacoesFiltradas.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma notificação encontrada</h3>
                    <p className="text-muted-foreground">
                      Não há notificações que correspondam aos filtros selecionados.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Regras de Notificação</CardTitle>
                <CardDescription>Configure quando e como receber notificações automáticas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {configuracoes.map((config) => (
                  <Card key={config.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Switch checked={config.ativo} />
                            <h4 className="font-medium">{config.nome}</h4>
                            <Badge variant="outline" className="text-xs">
                              {config.frequencia}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{config.descricao}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Canais:</span>
                              {config.canais.map((canal) => (
                                <Badge key={canal} variant="secondary" className="text-xs">
                                  {canal}
                                </Badge>
                              ))}
                            </div>
                            <div>
                              <span className="font-medium">Destinatários:</span> {config.destinatarios.length}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Notificações</CardTitle>
                <CardDescription>Visualize o histórico completo de notificações enviadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Histórico em Desenvolvimento</h3>
                  <p className="text-muted-foreground">
                    Esta funcionalidade estará disponível em breve para análise detalhada do histórico.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="canais" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email
                  </CardTitle>
                  <CardDescription>Configurações de notificações por email</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Ativo</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>Servidor SMTP</Label>
                    <Input placeholder="smtp.empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Remetente</Label>
                    <Input placeholder="notificacoes@empresa.com" />
                  </div>
                  <Button size="sm">Testar Configuração</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Push Notifications
                  </CardTitle>
                  <CardDescription>Notificações push para dispositivos móveis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Ativo</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>Chave da API</Label>
                    <Input placeholder="FCM Server Key" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label>Dispositivos Registrados</Label>
                    <div className="text-sm text-muted-foreground">24 dispositivos ativos</div>
                  </div>
                  <Button size="sm">Enviar Teste</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Slack
                  </CardTitle>
                  <CardDescription>Integração com Slack para notificações</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Ativo</span>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <Input placeholder="https://hooks.slack.com/..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Canal Padrão</Label>
                    <Input placeholder="#projetos" />
                  </div>
                  <Button size="sm">Conectar Slack</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    SMS
                  </CardTitle>
                  <CardDescription>Notificações por SMS para alertas críticos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Ativo</span>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label>Provedor SMS</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar provedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="aws-sns">AWS SNS</SelectItem>
                        <SelectItem value="zenvia">Zenvia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Chave da API</Label>
                    <Input placeholder="API Key" type="password" />
                  </div>
                  <Button size="sm">Configurar SMS</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
