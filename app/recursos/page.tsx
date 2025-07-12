"use client"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Zap,
  Target,
  RefreshCw,
  Download,
  Filter,
  User,
  Laptop,
  Play,
} from "lucide-react"
import { format, differenceInDays, eachDayOfInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// Tipos de recursos
interface Recurso {
  id: string
  nome: string
  tipo: "pessoa" | "equipamento" | "orcamento"
  capacidadeTotal: number // horas por dia ou valor total
  custoHora?: number
  habilidades?: string[]
  disponibilidade: {
    inicio: Date
    fim: Date
    horasPorDia: number
  }[]
  avatar?: string
}

interface AlocacaoRecurso {
  recursoId: string
  tarefaId: string
  horasAlocadas: number
  dataInicio: Date
  dataFim: Date
  percentualAlocacao: number
}

interface ConflictoRecurso {
  recursoId: string
  data: Date
  horasConflito: number
  tarefasEnvolvidas: string[]
  severidade: "baixa" | "media" | "alta"
}

interface SugestaoOtimizacao {
  tipo: "realocacao" | "nivelamento" | "contratacao"
  descricao: string
  impacto: string
  recursos: string[]
  economia?: number
}

// Dados mockados
const recursos: Recurso[] = [
  {
    id: "r1",
    nome: "João Silva",
    tipo: "pessoa",
    capacidadeTotal: 8,
    custoHora: 50,
    habilidades: ["React", "Node.js", "TypeScript"],
    disponibilidade: [
      {
        inicio: new Date("2024-01-01"),
        fim: new Date("2024-12-31"),
        horasPorDia: 8,
      },
    ],
    avatar: "JS",
  },
  {
    id: "r2",
    nome: "Maria Santos",
    tipo: "pessoa",
    capacidadeTotal: 8,
    custoHora: 45,
    habilidades: ["UI/UX", "Figma", "Design System"],
    disponibilidade: [
      {
        inicio: new Date("2024-01-01"),
        fim: new Date("2024-12-31"),
        horasPorDia: 8,
      },
    ],
    avatar: "MS",
  },
  {
    id: "r3",
    nome: "Pedro Costa",
    tipo: "pessoa",
    capacidadeTotal: 8,
    custoHora: 55,
    habilidades: ["Python", "Django", "PostgreSQL"],
    disponibilidade: [
      {
        inicio: new Date("2024-01-01"),
        fim: new Date("2024-12-31"),
        horasPorDia: 8,
      },
    ],
    avatar: "PC",
  },
  {
    id: "r4",
    nome: "Ana Lima",
    tipo: "pessoa",
    capacidadeTotal: 8,
    custoHora: 48,
    habilidades: ["Vue.js", "CSS", "JavaScript"],
    disponibilidade: [
      {
        inicio: new Date("2024-01-01"),
        fim: new Date("2024-12-31"),
        horasPorDia: 8,
      },
    ],
    avatar: "AL",
  },
  {
    id: "r5",
    nome: "Servidor AWS",
    tipo: "equipamento",
    capacidadeTotal: 24,
    custoHora: 2.5,
    disponibilidade: [
      {
        inicio: new Date("2024-01-01"),
        fim: new Date("2024-12-31"),
        horasPorDia: 24,
      },
    ],
  },
  {
    id: "r6",
    nome: "Licenças Adobe",
    tipo: "equipamento",
    capacidadeTotal: 5,
    custoHora: 8,
    disponibilidade: [
      {
        inicio: new Date("2024-01-01"),
        fim: new Date("2024-12-31"),
        horasPorDia: 8,
      },
    ],
  },
]

const alocacoes: AlocacaoRecurso[] = [
  {
    recursoId: "r1",
    tarefaId: "1-1",
    horasAlocadas: 6,
    dataInicio: new Date("2024-01-15"),
    dataFim: new Date("2024-01-20"),
    percentualAlocacao: 75,
  },
  {
    recursoId: "r1",
    tarefaId: "1-3",
    horasAlocadas: 8,
    dataInicio: new Date("2024-01-25"),
    dataFim: new Date("2024-02-08"),
    percentualAlocacao: 100,
  },
  {
    recursoId: "r2",
    tarefaId: "1-2",
    horasAlocadas: 7,
    dataInicio: new Date("2024-01-21"),
    dataFim: new Date("2024-01-28"),
    percentualAlocacao: 87.5,
  },
  {
    recursoId: "r2",
    tarefaId: "2-1",
    horasAlocadas: 6,
    dataInicio: new Date("2024-01-20"),
    dataFim: new Date("2024-01-27"),
    percentualAlocacao: 75,
  },
  {
    recursoId: "r3",
    tarefaId: "1-3",
    horasAlocadas: 8,
    dataInicio: new Date("2024-01-25"),
    dataFim: new Date("2024-02-08"),
    percentualAlocacao: 100,
  },
  {
    recursoId: "r4",
    tarefaId: "1-4",
    horasAlocadas: 8,
    dataInicio: new Date("2024-01-29"),
    dataFim: new Date("2024-02-10"),
    percentualAlocacao: 100,
  },
]

const tarefas = [
  { id: "1-1", nome: "Análise de Requisitos", projeto: "Sistema E-commerce" },
  { id: "1-2", nome: "Design da Interface", projeto: "Sistema E-commerce" },
  { id: "1-3", nome: "Desenvolvimento Backend", projeto: "Sistema E-commerce" },
  { id: "1-4", nome: "Desenvolvimento Frontend", projeto: "Sistema E-commerce" },
  { id: "2-1", nome: "Prototipagem", projeto: "App Mobile" },
  { id: "2-2", nome: "Desenvolvimento iOS", projeto: "App Mobile" },
]

export default function RecursosPage() {
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
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [periodoAnalise, setPeriodoAnalise] = useState<string>("semana")
  const [conflitos, setConflitos] = useState<ConflictoRecurso[]>([])
  const [sugestoes, setSugestoes] = useState<SugestaoOtimizacao[]>([])
  const [modoOtimizacao, setModoOtimizacao] = useState(false)

  // Calcular métricas de recursos
  const calcularMetricas = () => {
    const totalRecursos = recursos.length
    const recursosAtivos = recursos.filter((r) => alocacoes.some((a) => a.recursoId === r.id)).length

    const utilizacaoMedia =
      recursos.reduce((acc, recurso) => {
        const alocacoesRecurso = alocacoes.filter((a) => a.recursoId === recurso.id)
        const utilizacao =
          alocacoesRecurso.reduce((sum, a) => sum + a.percentualAlocacao, 0) / alocacoesRecurso.length || 0
        return acc + utilizacao
      }, 0) / recursos.length

    const custoTotal = alocacoes.reduce((acc, alocacao) => {
      const recurso = recursos.find((r) => r.id === alocacao.recursoId)
      if (recurso?.custoHora) {
        const dias = differenceInDays(alocacao.dataFim, alocacao.dataInicio) + 1
        return acc + alocacao.horasAlocadas * dias * recurso.custoHora
      }
      return acc
    }, 0)

    return {
      totalRecursos,
      recursosAtivos,
      utilizacaoMedia: Math.round(utilizacaoMedia),
      custoTotal,
    }
  }

  // Detectar conflitos de recursos
  const detectarConflitos = () => {
    const conflitosDetectados: ConflictoRecurso[] = []
    const dataInicio = new Date("2024-01-15")
    const dataFim = new Date("2024-02-15")
    const dias = eachDayOfInterval({ start: dataInicio, end: dataFim })

    recursos.forEach((recurso) => {
      dias.forEach((dia) => {
        const alocacoesDia = alocacoes.filter(
          (a) => a.recursoId === recurso.id && dia >= a.dataInicio && dia <= a.dataFim,
        )

        const horasTotais = alocacoesDia.reduce((sum, a) => sum + a.horasAlocadas, 0)

        if (horasTotais > recurso.capacidadeTotal) {
          const horasConflito = horasTotais - recurso.capacidadeTotal
          const severidade: "baixa" | "media" | "alta" =
            horasConflito <= 2 ? "baixa" : horasConflito <= 4 ? "media" : "alta"

          conflitosDetectados.push({
            recursoId: recurso.id,
            data: dia,
            horasConflito,
            tarefasEnvolvidas: alocacoesDia.map((a) => a.tarefaId),
            severidade,
          })
        }
      })
    })

    setConflitos(conflitosDetectados)
  }

  // Gerar sugestões de otimização
  const gerarSugestoes = () => {
    const sugestoesGeradas: SugestaoOtimizacao[] = []

    // Sugestão de nivelamento para recursos sobrecarregados
    recursos.forEach((recurso) => {
      const alocacoesRecurso = alocacoes.filter((a) => a.recursoId === recurso.id)
      const utilizacaoMedia =
        alocacoesRecurso.reduce((sum, a) => sum + a.percentualAlocacao, 0) / alocacoesRecurso.length

      if (utilizacaoMedia > 90) {
        sugestoesGeradas.push({
          tipo: "nivelamento",
          descricao: `Redistribuir carga de trabalho de ${recurso.nome}`,
          impacto: "Reduzir sobrecarga e melhorar qualidade",
          recursos: [recurso.id],
          economia: utilizacaoMedia * 100,
        })
      }
    })

    // Sugestão de realocação para recursos subutilizados
    recursos.forEach((recurso) => {
      const alocacoesRecurso = alocacoes.filter((a) => a.recursoId === recurso.id)
      const utilizacaoMedia =
        alocacoesRecurso.reduce((sum, a) => sum + a.percentualAlocacao, 0) / alocacoesRecurso.length

      if (utilizacaoMedia < 50 && utilizacaoMedia > 0) {
        sugestoesGeradas.push({
          tipo: "realocacao",
          descricao: `Aumentar alocação de ${recurso.nome}`,
          impacto: "Melhor aproveitamento de recursos disponíveis",
          recursos: [recurso.id],
          economia: (100 - utilizacaoMedia) * 50,
        })
      }
    })

    // Sugestão de contratação se muitos conflitos
    if (conflitos.filter((c) => c.severidade === "alta").length > 5) {
      sugestoesGeradas.push({
        tipo: "contratacao",
        descricao: "Contratar desenvolvedor adicional",
        impacto: "Resolver gargalos críticos de desenvolvimento",
        recursos: [],
        economia: -15000, // Custo de contratação
      })
    }

    setSugestoes(sugestoesGeradas)
  }

  // Calcular utilização por período
  const calcularUtilizacaoPorPeriodo = (recursoId: string) => {
    const dataInicio = new Date("2024-01-15")
    const dataFim = new Date("2024-02-15")
    const dias = eachDayOfInterval({ start: dataInicio, end: dataFim })

    return dias.map((dia) => {
      const alocacoesDia = alocacoes.filter((a) => a.recursoId === recursoId && dia >= a.dataInicio && dia <= a.dataFim)

      const horasTotais = alocacoesDia.reduce((sum, a) => sum + a.horasAlocadas, 0)
      const recurso = recursos.find((r) => r.id === recursoId)
      const percentual = recurso ? (horasTotais / recurso.capacidadeTotal) * 100 : 0

      return {
        data: dia,
        horas: horasTotais,
        percentual: Math.min(percentual, 100),
        sobrecarga: percentual > 100,
      }
    })
  }

  // Executar análises
  useEffect(() => {
    detectarConflitos()
    gerarSugestoes()
  }, [])

  const metricas = calcularMetricas()
  const recursosComConflito = [...new Set(conflitos.map((c) => c.recursoId))].length
  const conflitosAlta = conflitos.filter((c) => c.severidade === "alta").length

  // Filtrar recursos
  const recursosFiltrados = recursos.filter((recurso) => {
    const matchTipo = filtroTipo === "todos" || recurso.tipo === filtroTipo
    const alocacoesRecurso = alocacoes.filter((a) => a.recursoId === recurso.id)
    const temAlocacao = alocacoesRecurso.length > 0
    const matchStatus =
      filtroStatus === "todos" ||
      (filtroStatus === "ativo" && temAlocacao) ||
      (filtroStatus === "inativo" && !temAlocacao)

    return matchTipo && matchStatus
  })

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "pessoa":
        return User
      case "equipamento":
        return Laptop
      case "orcamento":
        return DollarSign
      default:
        return Settings
    }
  }

  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
      case "alta":
        return "destructive"
      case "media":
        return "default"
      case "baixa":
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
    <TooltipProvider>
      <div className="flex flex-col h-screen">
        <header className="flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Gestão de Recursos</h1>
            {modoOtimizacao && (
              <Badge variant="secondary" className="ml-2">
                Modo Otimização
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button
              variant={modoOtimizacao ? "default" : "outline"}
              size="sm"
              onClick={() => setModoOtimizacao(!modoOtimizacao)}
            >
              <Target className="h-4 w-4 mr-2" />
              Otimizar
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Métricas Principais */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{metricas.totalRecursos}</div>
                    <div className="text-sm text-muted-foreground">Total de Recursos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{metricas.recursosAtivos}</div>
                    <div className="text-sm text-muted-foreground">Recursos Ativos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">{metricas.utilizacaoMedia}%</div>
                    <div className="text-sm text-muted-foreground">Utilização Média</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">R$ {metricas.custoTotal.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Custo Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas de Conflitos */}
          {conflitos.length > 0 && (
            <Alert variant={conflitosAlta > 0 ? "destructive" : "default"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Conflitos de Recursos Detectados</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-1">
                  <div>
                    {conflitos.length} conflitos encontrados em {recursosComConflito} recursos
                  </div>
                  {conflitosAlta > 0 && (
                    <div className="text-red-600 font-medium">{conflitosAlta} conflitos de alta severidade</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="visao-geral" className="space-y-4">
            <TabsList>
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="alocacao">Alocação</TabsTrigger>
              <TabsTrigger value="conflitos">Conflitos</TabsTrigger>
              <TabsTrigger value="otimizacao">Otimização</TabsTrigger>
            </TabsList>

            <TabsContent value="visao-geral" className="space-y-4">
              {/* Filtros */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4 items-center flex-wrap">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span className="text-sm font-medium">Filtros:</span>
                    </div>

                    <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os Tipos</SelectItem>
                        <SelectItem value="pessoa">Pessoas</SelectItem>
                        <SelectItem value="equipamento">Equipamentos</SelectItem>
                        <SelectItem value="orcamento">Orçamento</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="ativo">Ativos</SelectItem>
                        <SelectItem value="inativo">Inativos</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={periodoAnalise} onValueChange={setPeriodoAnalise}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semana">Semana</SelectItem>
                        <SelectItem value="mes">Mês</SelectItem>
                        <SelectItem value="trimestre">Trimestre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Recursos */}
              <div className="grid gap-4 md:grid-cols-2">
                {recursosFiltrados.map((recurso) => {
                  const alocacoesRecurso = alocacoes.filter((a) => a.recursoId === recurso.id)
                  const utilizacaoMedia =
                    alocacoesRecurso.length > 0
                      ? alocacoesRecurso.reduce((sum, a) => sum + a.percentualAlocacao, 0) / alocacoesRecurso.length
                      : 0
                  const conflitosRecurso = conflitos.filter((c) => c.recursoId === recurso.id)
                  const TipoIcon = getTipoIcon(recurso.tipo)

                  return (
                    <Card key={recurso.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {recurso.avatar ? (
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{recurso.avatar}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <TipoIcon className="h-5 w-5" />
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-base">{recurso.nome}</CardTitle>
                              <CardDescription className="capitalize">{recurso.tipo}</CardDescription>
                            </div>
                          </div>
                          {conflitosRecurso.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conflitosRecurso.length} conflitos
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Utilização */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Utilização</span>
                            <span>{Math.round(utilizacaoMedia)}%</span>
                          </div>
                          <Progress
                            value={utilizacaoMedia}
                            className={cn(
                              "h-2",
                              utilizacaoMedia > 100 && "bg-red-100",
                              utilizacaoMedia > 90 && utilizacaoMedia <= 100 && "bg-yellow-100",
                            )}
                          />
                        </div>

                        {/* Informações */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Capacidade</div>
                            <div className="font-medium">{recurso.capacidadeTotal}h/dia</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Custo/Hora</div>
                            <div className="font-medium">{recurso.custoHora ? `R$ ${recurso.custoHora}` : "N/A"}</div>
                          </div>
                        </div>

                        {/* Habilidades */}
                        {recurso.habilidades && (
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">Habilidades</div>
                            <div className="flex flex-wrap gap-1">
                              {recurso.habilidades.slice(0, 3).map((habilidade) => (
                                <Badge key={habilidade} variant="outline" className="text-xs">
                                  {habilidade}
                                </Badge>
                              ))}
                              {recurso.habilidades.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{recurso.habilidades.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Tarefas Atuais */}
                        {alocacoesRecurso.length > 0 && (
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">Tarefas Atuais</div>
                            <div className="space-y-1">
                              {alocacoesRecurso.slice(0, 2).map((alocacao) => {
                                const tarefa = tarefas.find((t) => t.id === alocacao.tarefaId)
                                return (
                                  <div key={alocacao.tarefaId} className="text-xs">
                                    <div className="font-medium">{tarefa?.nome}</div>
                                    <div className="text-muted-foreground">
                                      {alocacao.horasAlocadas}h - {alocacao.percentualAlocacao}%
                                    </div>
                                  </div>
                                )
                              })}
                              {alocacoesRecurso.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{alocacoesRecurso.length - 2} tarefas
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="alocacao" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mapa de Alocação de Recursos</CardTitle>
                  <CardDescription>Visualização da utilização de recursos ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {recursosFiltrados.map((recurso) => {
                      const utilizacaoPorDia = calcularUtilizacaoPorPeriodo(recurso.id)
                      const TipoIcon = getTipoIcon(recurso.tipo)

                      return (
                        <div key={recurso.id} className="space-y-2">
                          <div className="flex items-center gap-3">
                            {recurso.avatar ? (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">{recurso.avatar}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <TipoIcon className="h-4 w-4" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-sm">{recurso.nome}</div>
                              <div className="text-xs text-muted-foreground">
                                Capacidade: {recurso.capacidadeTotal}h/dia
                              </div>
                            </div>
                          </div>

                          {/* Timeline de Utilização */}
                          <div className="flex gap-1 overflow-x-auto pb-2">
                            {utilizacaoPorDia.map((dia, index) => (
                              <Tooltip key={index}>
                                <TooltipTrigger>
                                  <div
                                    className={cn(
                                      "w-4 h-8 rounded-sm border",
                                      dia.percentual === 0 && "bg-gray-100",
                                      dia.percentual > 0 && dia.percentual <= 50 && "bg-green-200",
                                      dia.percentual > 50 && dia.percentual <= 80 && "bg-yellow-200",
                                      dia.percentual > 80 && dia.percentual <= 100 && "bg-orange-200",
                                      dia.sobrecarga && "bg-red-200 border-red-400",
                                    )}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs">
                                    <div>{format(dia.data, "dd/MM", { locale: ptBR })}</div>
                                    <div>
                                      {dia.horas}h ({Math.round(dia.percentual)}%)
                                    </div>
                                    {dia.sobrecarga && <div className="text-red-600">Sobrecarga!</div>}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Legenda */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="text-sm font-medium mb-2">Legenda:</div>
                    <div className="flex items-center gap-6 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-100 rounded-sm border"></div>
                        <span>Livre (0%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-200 rounded-sm border"></div>
                        <span>Baixa (1-50%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-200 rounded-sm border"></div>
                        <span>Média (51-80%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-200 rounded-sm border"></div>
                        <span>Alta (81-100%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-200 rounded-sm border border-red-400"></div>
                        <span>Sobrecarga (&gt;100%)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conflitos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Conflitos de Recursos
                  </CardTitle>
                  <CardDescription>Situações onde a demanda excede a capacidade disponível</CardDescription>
                </CardHeader>
                <CardContent>
                  {conflitos.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum conflito detectado</h3>
                      <p className="text-muted-foreground">Todos os recursos estão adequadamente alocados</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {conflitos.map((conflito, index) => {
                        const recurso = recursos.find((r) => r.id === conflito.recursoId)
                        const tarefasNomes = conflito.tarefasEnvolvidas
                          .map((tId) => tarefas.find((t) => t.id === tId)?.nome)
                          .filter(Boolean)

                        return (
                          <Alert key={index} variant={conflito.severidade === "alta" ? "destructive" : "default"}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle className="flex items-center justify-between">
                              <span>{recurso?.nome}</span>
                              <Badge variant={getSeveridadeColor(conflito.severidade)} className="text-xs">
                                {conflito.severidade.toUpperCase()}
                              </Badge>
                            </AlertTitle>
                            <AlertDescription>
                              <div className="space-y-2 mt-2">
                                <div>
                                  <strong>Data:</strong> {format(conflito.data, "dd/MM/yyyy", { locale: ptBR })}
                                </div>
                                <div>
                                  <strong>Sobrecarga:</strong> {conflito.horasConflito} horas
                                </div>
                                <div>
                                  <strong>Tarefas envolvidas:</strong>
                                  <div className="mt-1 space-y-1">
                                    {tarefasNomes.map((nome, idx) => (
                                      <div key={idx} className="text-sm">
                                        • {nome}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="otimizacao" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Sugestões de Otimização
                  </CardTitle>
                  <CardDescription>Recomendações para melhorar a alocação de recursos</CardDescription>
                </CardHeader>
                <CardContent>
                  {sugestoes.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Recursos bem otimizados</h3>
                      <p className="text-muted-foreground">Não há sugestões de otimização no momento</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sugestoes.map((sugestao, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {sugestao.tipo.toUpperCase()}
                                  </Badge>
                                  <h4 className="font-medium">{sugestao.descricao}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">{sugestao.impacto}</p>
                                {sugestao.recursos.length > 0 && (
                                  <div className="text-sm">
                                    <strong>Recursos:</strong>{" "}
                                    {sugestao.recursos
                                      .map((rId) => recursos.find((r) => r.id === rId)?.nome)
                                      .join(", ")}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                {sugestao.economia && (
                                  <div
                                    className={cn(
                                      "text-sm font-medium",
                                      sugestao.economia > 0 ? "text-green-600" : "text-red-600",
                                    )}
                                  >
                                    {sugestao.economia > 0 ? "+" : ""}
                                    R$ {Math.abs(sugestao.economia).toLocaleString()}
                                  </div>
                                )}
                                <Button size="sm" className="mt-2">
                                  Aplicar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Simulador de Cenários */}
              <Card>
                <CardHeader>
                  <CardTitle>Simulador de Cenários</CardTitle>
                  <CardDescription>Teste diferentes configurações de alocação de recursos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Recurso</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar recurso" />
                          </SelectTrigger>
                          <SelectContent>
                            {recursos.map((recurso) => (
                              <SelectItem key={recurso.id} value={recurso.id}>
                                {recurso.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Nova Alocação (%)</Label>
                        <Input type="number" min="0" max="100" placeholder="80" />
                      </div>
                      <div className="space-y-2">
                        <Label>Período</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="semana">Esta semana</SelectItem>
                            <SelectItem value="mes">Este mês</SelectItem>
                            <SelectItem value="trimestre">Este trimestre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button>
                        <Play className="h-4 w-4 mr-2" />
                        Simular
                      </Button>
                      <Button variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  )
}
