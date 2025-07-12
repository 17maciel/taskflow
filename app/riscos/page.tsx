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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  Clock,
  DollarSign,
  Users,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Activity,
  FileText,
  Download,
  RefreshCw,
  Zap,
  Brain,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// Tipos de dados
interface Risco {
  id: string
  titulo: string
  descricao: string
  categoria: "tecnico" | "cronograma" | "orcamento" | "recursos" | "qualidade" | "externo"
  probabilidade: number // 1-5
  impacto: number // 1-5
  exposicao: number // probabilidade * impacto
  status: "identificado" | "analisado" | "mitigado" | "aceito" | "transferido" | "evitado"
  prioridade: "baixa" | "media" | "alta" | "critica"
  projeto: string
  responsavel: string
  dataIdentificacao: Date
  dataRevisao?: Date
  prazoMitigacao?: Date
  custoEstimado?: number
  planoMitigacao?: PlanoMitigacao
  historico: HistoricoRisco[]
  tags: string[]
  anexos?: string[]
}

interface PlanoMitigacao {
  estrategia: "mitigar" | "aceitar" | "transferir" | "evitar"
  acoes: AcaoMitigacao[]
  custoImplementacao: number
  prazoImplementacao: number
  responsavel: string
  status: "planejado" | "em_andamento" | "concluido" | "cancelado"
  efetividade?: number // 1-5
}

interface AcaoMitigacao {
  id: string
  descricao: string
  responsavel: string
  prazo: Date
  status: "pendente" | "em_andamento" | "concluida" | "atrasada"
  progresso: number
  custo?: number
}

interface HistoricoRisco {
  id: string
  data: Date
  acao: string
  usuario: string
  detalhes: string
  probabilidadeAnterior?: number
  impactoAnterior?: number
}

interface AnaliseRisco {
  totalRiscos: number
  riscosAtivos: number
  riscosAltos: number
  riscosCriticos: number
  exposicaoTotal: number
  tendencia: "crescente" | "estavel" | "decrescente"
  distribuicaoPorCategoria: Record<string, number>
  distribuicaoPorStatus: Record<string, number>
  efetividadeMitigacao: number
}

interface PrevisaoRisco {
  probabilidadeAtraso: number
  diasAtrasoEstimado: number
  custoAdicionalEstimado: number
  riscosEmergentes: string[]
  recomendacoes: string[]
  confianca: number
}

// Dados mockados
const riscos: Risco[] = [
  {
    id: "r1",
    titulo: "Atraso na Entrega da API Externa",
    descricao: "A API de pagamentos do fornecedor pode atrasar, impactando a integração",
    categoria: "externo",
    probabilidade: 4,
    impacto: 4,
    exposicao: 16,
    status: "analisado",
    prioridade: "alta",
    projeto: "Sistema E-commerce",
    responsavel: "João Silva",
    dataIdentificacao: new Date("2024-01-02"),
    dataRevisao: new Date("2024-01-05"),
    prazoMitigacao: new Date("2024-01-15"),
    custoEstimado: 15000,
    planoMitigacao: {
      estrategia: "mitigar",
      acoes: [
        {
          id: "a1",
          descricao: "Desenvolver API alternativa interna",
          responsavel: "Pedro Costa",
          prazo: new Date("2024-01-12"),
          status: "em_andamento",
          progresso: 60,
          custo: 8000,
        },
        {
          id: "a2",
          descricao: "Negociar com fornecedor backup",
          responsavel: "Maria Santos",
          prazo: new Date("2024-01-10"),
          status: "concluida",
          progresso: 100,
          custo: 2000,
        },
      ],
      custoImplementacao: 10000,
      prazoImplementacao: 10,
      responsavel: "João Silva",
      status: "em_andamento",
      efetividade: 4,
    },
    historico: [
      {
        id: "h1",
        data: new Date("2024-01-02"),
        acao: "Risco identificado",
        usuario: "João Silva",
        detalhes: "Identificado durante reunião com fornecedor",
      },
      {
        id: "h2",
        data: new Date("2024-01-05"),
        acao: "Análise atualizada",
        usuario: "João Silva",
        detalhes: "Probabilidade aumentada de 3 para 4",
        probabilidadeAnterior: 3,
      },
    ],
    tags: ["api", "fornecedor", "pagamento"],
  },
  {
    id: "r2",
    titulo: "Sobrecarga da Equipe de Desenvolvimento",
    descricao: "Equipe pode ficar sobrecarregada com múltiplos projetos simultâneos",
    categoria: "recursos",
    probabilidade: 3,
    impacto: 3,
    exposicao: 9,
    status: "mitigado",
    prioridade: "media",
    projeto: "App Mobile",
    responsavel: "Maria Santos",
    dataIdentificacao: new Date("2024-01-01"),
    dataRevisao: new Date("2024-01-04"),
    custoEstimado: 8000,
    planoMitigacao: {
      estrategia: "mitigar",
      acoes: [
        {
          id: "a3",
          descricao: "Contratar desenvolvedor freelancer",
          responsavel: "RH",
          prazo: new Date("2024-01-08"),
          status: "concluida",
          progresso: 100,
          custo: 5000,
        },
      ],
      custoImplementacao: 5000,
      prazoImplementacao: 7,
      responsavel: "Maria Santos",
      status: "concluido",
      efetividade: 5,
    },
    historico: [
      {
        id: "h3",
        data: new Date("2024-01-01"),
        acao: "Risco identificado",
        usuario: "Maria Santos",
        detalhes: "Identificado durante planejamento de sprint",
      },
    ],
    tags: ["equipe", "recursos", "capacidade"],
  },
  {
    id: "r3",
    titulo: "Mudança de Requisitos pelo Cliente",
    descricao: "Cliente pode solicitar mudanças significativas no escopo",
    categoria: "cronograma",
    probabilidade: 5,
    impacto: 4,
    exposicao: 20,
    status: "identificado",
    prioridade: "critica",
    projeto: "Website Institucional",
    responsavel: "Pedro Costa",
    dataIdentificacao: new Date("2024-01-03"),
    custoEstimado: 20000,
    historico: [
      {
        id: "h4",
        data: new Date("2024-01-03"),
        acao: "Risco identificado",
        usuario: "Pedro Costa",
        detalhes: "Baseado no histórico do cliente",
      },
    ],
    tags: ["cliente", "escopo", "mudanca"],
  },
  {
    id: "r4",
    titulo: "Falha de Segurança na Aplicação",
    descricao: "Vulnerabilidades de segurança podem ser descobertas em produção",
    categoria: "qualidade",
    probabilidade: 2,
    impacto: 5,
    exposicao: 10,
    status: "analisado",
    prioridade: "alta",
    projeto: "Sistema E-commerce",
    responsavel: "Ana Lima",
    dataIdentificacao: new Date("2024-01-04"),
    custoEstimado: 25000,
    planoMitigacao: {
      estrategia: "mitigar",
      acoes: [
        {
          id: "a4",
          descricao: "Implementar testes de segurança automatizados",
          responsavel: "Ana Lima",
          prazo: new Date("2024-01-20"),
          status: "pendente",
          progresso: 0,
          custo: 3000,
        },
        {
          id: "a5",
          descricao: "Contratar auditoria de segurança externa",
          responsavel: "Gerente",
          prazo: new Date("2024-01-25"),
          status: "pendente",
          progresso: 0,
          custo: 8000,
        },
      ],
      custoImplementacao: 11000,
      prazoImplementacao: 21,
      responsavel: "Ana Lima",
      status: "planejado",
    },
    historico: [
      {
        id: "h5",
        data: new Date("2024-01-04"),
        acao: "Risco identificado",
        usuario: "Ana Lima",
        detalhes: "Identificado durante revisão de código",
      },
    ],
    tags: ["seguranca", "vulnerabilidade", "auditoria"],
  },
  {
    id: "r5",
    titulo: "Estouro do Orçamento",
    descricao: "Custos podem exceder o orçamento aprovado em 15%",
    categoria: "orcamento",
    probabilidade: 3,
    impacto: 3,
    exposicao: 9,
    status: "aceito",
    prioridade: "media",
    projeto: "App Mobile",
    responsavel: "Gerente Financeiro",
    dataIdentificacao: new Date("2024-01-05"),
    custoEstimado: 12000,
    historico: [
      {
        id: "h6",
        data: new Date("2024-01-05"),
        acao: "Risco identificado",
        usuario: "Gerente Financeiro",
        detalhes: "Baseado na análise de custos atual",
      },
    ],
    tags: ["orcamento", "custos", "financeiro"],
  },
]

const projetos = [
  { id: "1", nome: "Sistema E-commerce" },
  { id: "2", nome: "App Mobile" },
  { id: "3", nome: "Website Institucional" },
]

const usuarios = [
  { id: "1", nome: "João Silva" },
  { id: "2", nome: "Maria Santos" },
  { id: "3", nome: "Pedro Costa" },
  { id: "4", nome: "Ana Lima" },
]

export default function RiscosPage() {
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

  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("todas")
  const [filtroProjeto, setFiltroProjeto] = useState<string>("todos")
  const [busca, setBusca] = useState("")
  const [novoRisco, setNovoRisco] = useState<Partial<Risco>>({})
  const [analise, setAnalise] = useState<AnaliseRisco | null>(null)
  const [previsao, setPrevisao] = useState<PrevisaoRisco | null>(null)
  const [matrizRiscos, setMatrizRiscos] = useState<Risco[][]>([])

  // Calcular análise de riscos
  useEffect(() => {
    const calcularAnalise = () => {
      const totalRiscos = riscos.length
      const riscosAtivos = riscos.filter((r) => !["aceito", "evitado"].includes(r.status)).length
      const riscosAltos = riscos.filter((r) => r.prioridade === "alta").length
      const riscosCriticos = riscos.filter((r) => r.prioridade === "critica").length
      const exposicaoTotal = riscos.reduce((sum, r) => sum + r.exposicao, 0)

      const distribuicaoPorCategoria = riscos.reduce(
        (acc, r) => {
          acc[r.categoria] = (acc[r.categoria] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const distribuicaoPorStatus = riscos.reduce(
        (acc, r) => {
          acc[r.status] = (acc[r.status] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const riscosComMitigacao = riscos.filter((r) => r.planoMitigacao)
      const efetividadeMitigacao =
        riscosComMitigacao.length > 0
          ? riscosComMitigacao.reduce((sum, r) => sum + (r.planoMitigacao?.efetividade || 0), 0) /
            riscosComMitigacao.length
          : 0

      setAnalise({
        totalRiscos,
        riscosAtivos,
        riscosAltos,
        riscosCriticos,
        exposicaoTotal,
        tendencia: "estavel", // Simulado
        distribuicaoPorCategoria,
        distribuicaoPorStatus,
        efetividadeMitigacao,
      })
    }

    calcularAnalise()
  }, [])

  // Gerar previsão de riscos usando IA simulada
  useEffect(() => {
    const gerarPrevisao = () => {
      const riscosAltos = riscos.filter((r) => r.exposicao >= 15)
      const probabilidadeAtraso = Math.min(riscosAltos.length * 15, 85)
      const diasAtrasoEstimado = Math.floor(riscosAltos.length * 2.5)
      const custoAdicionalEstimado = riscosAltos.reduce((sum, r) => sum + (r.custoEstimado || 0), 0) * 0.3

      const riscosEmergentes = [
        "Possível rotatividade na equipe técnica",
        "Mudanças regulatórias no setor",
        "Instabilidade na infraestrutura de nuvem",
      ]

      const recomendacoes = [
        "Implementar monitoramento contínuo de riscos",
        "Aumentar frequência de reuniões de status",
        "Criar plano de contingência para recursos críticos",
        "Estabelecer comunicação proativa com stakeholders",
      ]

      setPrevisao({
        probabilidadeAtraso,
        diasAtrasoEstimado,
        custoAdicionalEstimado,
        riscosEmergentes,
        recomendacoes,
        confianca: 78,
      })
    }

    gerarPrevisao()
  }, [])

  // Gerar matriz de riscos
  useEffect(() => {
    const gerarMatriz = () => {
      const matriz: Risco[][] = Array(5)
        .fill(null)
        .map(() => Array(5).fill(null))

      riscos.forEach((risco) => {
        const linha = 5 - risco.impacto // Inverter para que impacto alto fique no topo
        const coluna = risco.probabilidade - 1
        if (!matriz[linha][coluna]) {
          matriz[linha][coluna] = []
        }
        matriz[linha][coluna].push(risco)
      })

      setMatrizRiscos(matriz)
    }

    gerarMatriz()
  }, [])

  // Filtrar riscos
  const riscosFiltrados = riscos.filter((risco) => {
    const matchCategoria = filtroCategoria === "todas" || risco.categoria === filtroCategoria
    const matchStatus = filtroStatus === "todos" || risco.status === filtroStatus
    const matchPrioridade = filtroPrioridade === "todas" || risco.prioridade === filtroPrioridade
    const matchProjeto = filtroProjeto === "todos" || risco.projeto === filtroProjeto
    const matchBusca =
      busca === "" ||
      risco.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      risco.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      risco.tags.some((tag) => tag.toLowerCase().includes(busca.toLowerCase()))

    return matchCategoria && matchStatus && matchPrioridade && matchProjeto && matchBusca
  })

  // Funções auxiliares
  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case "tecnico":
        return Zap
      case "cronograma":
        return Clock
      case "orcamento":
        return DollarSign
      case "recursos":
        return Users
      case "qualidade":
        return Shield
      case "externo":
        return AlertTriangle
      default:
        return AlertCircle
    }
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "tecnico":
        return "text-purple-600 bg-purple-100"
      case "cronograma":
        return "text-blue-600 bg-blue-100"
      case "orcamento":
        return "text-green-600 bg-green-100"
      case "recursos":
        return "text-orange-600 bg-orange-100"
      case "qualidade":
        return "text-red-600 bg-red-100"
      case "externo":
        return "text-gray-600 bg-gray-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

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
      case "identificado":
        return "text-yellow-600 bg-yellow-100"
      case "analisado":
        return "text-blue-600 bg-blue-100"
      case "mitigado":
        return "text-green-600 bg-green-100"
      case "aceito":
        return "text-gray-600 bg-gray-100"
      case "transferido":
        return "text-purple-600 bg-purple-100"
      case "evitado":
        return "text-green-600 bg-green-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getMatrizColor = (probabilidade: number, impacto: number) => {
    const exposicao = probabilidade * impacto
    if (exposicao >= 20) return "bg-red-500"
    if (exposicao >= 15) return "bg-red-400"
    if (exposicao >= 10) return "bg-orange-400"
    if (exposicao >= 6) return "bg-yellow-400"
    return "bg-green-400"
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
            <h1 className="text-xl font-semibold">Monitoramento de Riscos</h1>
            {analise && analise.riscosCriticos > 0 && (
              <Badge variant="destructive" className="ml-2">
                {analise.riscosCriticos} Críticos
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Análise
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Risco
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Identificar Novo Risco</DialogTitle>
                  <DialogDescription>Registre um novo risco identificado no projeto</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título do Risco</Label>
                      <Input placeholder="Ex: Atraso na entrega do fornecedor" />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tecnico">Técnico</SelectItem>
                          <SelectItem value="cronograma">Cronograma</SelectItem>
                          <SelectItem value="orcamento">Orçamento</SelectItem>
                          <SelectItem value="recursos">Recursos</SelectItem>
                          <SelectItem value="qualidade">Qualidade</SelectItem>
                          <SelectItem value="externo">Externo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea placeholder="Descreva o risco em detalhes..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Probabilidade (1-5)</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Muito Baixa</SelectItem>
                          <SelectItem value="2">2 - Baixa</SelectItem>
                          <SelectItem value="3">3 - Média</SelectItem>
                          <SelectItem value="4">4 - Alta</SelectItem>
                          <SelectItem value="5">5 - Muito Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Impacto (1-5)</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Muito Baixo</SelectItem>
                          <SelectItem value="2">2 - Baixo</SelectItem>
                          <SelectItem value="3">3 - Médio</SelectItem>
                          <SelectItem value="4">4 - Alto</SelectItem>
                          <SelectItem value="5">5 - Muito Alto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button>Registrar Risco</Button>
                    <Button variant="outline">Cancelar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Métricas Principais */}
          {analise && (
            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold">{analise.totalRiscos}</div>
                      <div className="text-sm text-muted-foreground">Total de Riscos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold">{analise.riscosAtivos}</div>
                      <div className="text-sm text-muted-foreground">Riscos Ativos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <div className="text-2xl font-bold">{analise.riscosCriticos}</div>
                      <div className="text-sm text-muted-foreground">Críticos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold">{analise.exposicaoTotal}</div>
                      <div className="text-sm text-muted-foreground">Exposição Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">{Math.round(analise.efetividadeMitigacao * 20)}%</div>
                      <div className="text-sm text-muted-foreground">Efetividade</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Previsão IA */}
          {previsao && (
            <Alert className="border-l-4 border-l-blue-500">
              <Brain className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                Análise Preditiva de Riscos
                <Badge variant="outline" className="text-xs">
                  {previsao.confianca}% confiança
                </Badge>
              </AlertTitle>
              <AlertDescription>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Probabilidade de Atraso</div>
                    <div className="flex items-center gap-2">
                      <Progress value={previsao.probabilidadeAtraso} className="flex-1" />
                      <span className="text-sm font-medium">{previsao.probabilidadeAtraso}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Atraso Estimado</div>
                    <div className="text-lg font-bold text-orange-600">{previsao.diasAtrasoEstimado} dias</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Custo Adicional</div>
                    <div className="text-lg font-bold text-red-600">
                      R$ {previsao.custoAdicionalEstimado.toLocaleString()}
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="dashboard" className="space-y-4">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="matriz">Matriz de Riscos</TabsTrigger>
              <TabsTrigger value="lista">Lista Detalhada</TabsTrigger>
              <TabsTrigger value="mitigacao">Planos de Mitigação</TabsTrigger>
              <TabsTrigger value="previsao">Análise Preditiva</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Distribuição por Categoria */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Categoria</CardTitle>
                    <CardDescription>Riscos agrupados por tipo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analise && (
                      <div className="space-y-3">
                        {Object.entries(analise.distribuicaoPorCategoria).map(([categoria, quantidade]) => {
                          const IconeCategoria = getCategoriaIcon(categoria)
                          const percentual = (quantidade / analise.totalRiscos) * 100
                          return (
                            <div key={categoria} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center",
                                    getCategoriaColor(categoria),
                                  )}
                                >
                                  <IconeCategoria className="h-4 w-4" />
                                </div>
                                <span className="capitalize">{categoria}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-20">
                                  <Progress value={percentual} className="h-2" />
                                </div>
                                <span className="text-sm font-medium w-8">{quantidade}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Status dos Riscos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status dos Riscos</CardTitle>
                    <CardDescription>Situação atual dos riscos identificados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analise && (
                      <div className="space-y-3">
                        {Object.entries(analise.distribuicaoPorStatus).map(([status, quantidade]) => {
                          const percentual = (quantidade / analise.totalRiscos) * 100
                          return (
                            <div key={status} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={cn("w-3 h-3 rounded-full", getStatusColor(status))} />
                                <span className="capitalize">{status.replace("_", " ")}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-20">
                                  <Progress value={percentual} className="h-2" />
                                </div>
                                <span className="text-sm font-medium w-8">{quantidade}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top 5 Riscos Críticos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Riscos de Maior Exposição</CardTitle>
                    <CardDescription>Top 5 riscos que requerem atenção imediata</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {riscos
                        .sort((a, b) => b.exposicao - a.exposicao)
                        .slice(0, 5)
                        .map((risco) => (
                          <div key={risco.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{risco.titulo}</div>
                              <div className="text-xs text-muted-foreground">{risco.projeto}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getPrioridadeColor(risco.prioridade)} className="text-xs">
                                {risco.prioridade}
                              </Badge>
                              <div className="text-right">
                                <div className="text-sm font-bold">{risco.exposicao}</div>
                                <div className="text-xs text-muted-foreground">exposição</div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tendências */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tendências de Risco</CardTitle>
                    <CardDescription>Evolução dos riscos ao longo do tempo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Novos Riscos (7 dias)</span>
                        </div>
                        <span className="font-bold text-red-500">+3</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Riscos Mitigados (7 dias)</span>
                        </div>
                        <span className="font-bold text-green-500">-2</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">Riscos Escalados</span>
                        </div>
                        <span className="font-bold text-orange-500">1</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="matriz" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Matriz de Probabilidade vs Impacto</CardTitle>
                  <CardDescription>Visualização dos riscos por probabilidade e impacto</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Labels */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Baixa Probabilidade</span>
                      <span>Alta Probabilidade</span>
                    </div>

                    {/* Matriz */}
                    <div className="relative">
                      <div className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-muted-foreground">
                        Alto Impacto
                      </div>
                      <div className="absolute -left-16 bottom-0 -rotate-90 text-sm text-muted-foreground">
                        Baixo Impacto
                      </div>

                      <div className="grid grid-cols-5 gap-1 w-full max-w-2xl mx-auto">
                        {matrizRiscos.map((linha, linhaIndex) =>
                          linha.map((celula, colunaIndex) => {
                            const probabilidade = colunaIndex + 1
                            const impacto = 5 - linhaIndex
                            const corFundo = getMatrizColor(probabilidade, impacto)

                            return (
                              <Tooltip key={`${linhaIndex}-${colunaIndex}`}>
                                <TooltipTrigger>
                                  <div
                                    className={cn(
                                      "aspect-square border border-white/20 rounded-lg flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-105 transition-transform",
                                      corFundo,
                                    )}
                                  >
                                    {celula ? celula.length : 0}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <div className="font-medium">
                                      Probabilidade: {probabilidade} | Impacto: {impacto}
                                    </div>
                                    {celula && celula.length > 0 && (
                                      <div className="space-y-1">
                                        {celula.map((risco) => (
                                          <div key={risco.id} className="text-xs">
                                            • {risco.titulo}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )
                          }),
                        )}
                      </div>
                    </div>

                    {/* Legenda */}
                    <div className="flex items-center justify-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-400 rounded"></div>
                        <span>Baixo (1-5)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                        <span>Médio (6-9)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-400 rounded"></div>
                        <span>Alto (10-14)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-400 rounded"></div>
                        <span>Muito Alto (15-19)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>Crítico (20-25)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lista" className="space-y-4">
              {/* Filtros */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4 items-center flex-wrap">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span className="text-sm font-medium">Filtros:</span>
                    </div>

                    <div className="relative flex-1 min-w-64">
                      <Input
                        placeholder="Buscar riscos..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-3"
                      />
                    </div>

                    <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="tecnico">Técnico</SelectItem>
                        <SelectItem value="cronograma">Cronograma</SelectItem>
                        <SelectItem value="orcamento">Orçamento</SelectItem>
                        <SelectItem value="recursos">Recursos</SelectItem>
                        <SelectItem value="qualidade">Qualidade</SelectItem>
                        <SelectItem value="externo">Externo</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="identificado">Identificado</SelectItem>
                        <SelectItem value="analisado">Analisado</SelectItem>
                        <SelectItem value="mitigado">Mitigado</SelectItem>
                        <SelectItem value="aceito">Aceito</SelectItem>
                        <SelectItem value="transferido">Transferido</SelectItem>
                        <SelectItem value="evitado">Evitado</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Riscos */}
              <div className="space-y-4">
                {riscosFiltrados.map((risco) => {
                  const IconeCategoria = getCategoriaIcon(risco.categoria)
                  return (
                    <Card key={risco.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                getCategoriaColor(risco.categoria),
                              )}
                            >
                              <IconeCategoria className="h-5 w-5" />
                            </div>

                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{risco.titulo}</h3>
                                <Badge variant={getPrioridadeColor(risco.prioridade)} className="text-xs">
                                  {risco.prioridade}
                                </Badge>
                                <div className={cn("px-2 py-1 rounded-full text-xs", getStatusColor(risco.status))}>
                                  {risco.status}
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground">{risco.descricao}</p>

                              <div className="flex items-center gap-4 text-sm">
                                <span>
                                  <strong>Projeto:</strong> {risco.projeto}
                                </span>
                                <span>
                                  <strong>Responsável:</strong> {risco.responsavel}
                                </span>
                                <span>
                                  <strong>Identificado:</strong>{" "}
                                  {format(risco.dataIdentificacao, "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                              </div>

                              <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Probabilidade:</span>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                      <div
                                        key={i}
                                        className={cn(
                                          "w-3 h-3 rounded-full",
                                          i <= risco.probabilidade ? "bg-red-500" : "bg-gray-200",
                                        )}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm">({risco.probabilidade}/5)</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Impacto:</span>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                      <div
                                        key={i}
                                        className={cn(
                                          "w-3 h-3 rounded-full",
                                          i <= risco.impacto ? "bg-orange-500" : "bg-gray-200",
                                        )}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm">({risco.impacto}/5)</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Exposição:</span>
                                  <Badge variant="outline" className="text-sm">
                                    {risco.exposicao}
                                  </Badge>
                                </div>
                              </div>

                              {risco.tags.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {risco.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {risco.custoEstimado && (
                              <div className="text-right">
                                <div className="text-sm font-medium">R$ {risco.custoEstimado.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">custo estimado</div>
                              </div>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Plano de Mitigação
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {riscosFiltrados.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum risco encontrado</h3>
                      <p className="text-muted-foreground">Não há riscos que correspondam aos filtros selecionados.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="mitigacao" className="space-y-4">
              <div className="space-y-4">
                {riscos
                  .filter((r) => r.planoMitigacao)
                  .map((risco) => (
                    <Card key={risco.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{risco.titulo}</CardTitle>
                            <CardDescription>{risco.projeto}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getPrioridadeColor(risco.prioridade)}>{risco.prioridade}</Badge>
                            <Badge variant="outline">{risco.planoMitigacao?.estrategia.replace("_", " ")}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {risco.planoMitigacao && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <div className="text-sm font-medium">Custo de Implementação</div>
                                <div className="text-lg font-bold text-green-600">
                                  R$ {risco.planoMitigacao.custoImplementacao.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">Prazo de Implementação</div>
                                <div className="text-lg font-bold text-blue-600">
                                  {risco.planoMitigacao.prazoImplementacao} dias
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">Efetividade Esperada</div>
                                <div className="flex items-center gap-2">
                                  <Progress value={(risco.planoMitigacao.efetividade || 0) * 20} className="flex-1" />
                                  <span className="text-sm font-medium">{risco.planoMitigacao.efetividade}/5</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-3">Ações de Mitigação</h4>
                              <div className="space-y-3">
                                {risco.planoMitigacao.acoes.map((acao) => (
                                  <div
                                    key={acao.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                  >
                                    <div className="space-y-1">
                                      <div className="font-medium text-sm">{acao.descricao}</div>
                                      <div className="text-xs text-muted-foreground">
                                        Responsável: {acao.responsavel} • Prazo:{" "}
                                        {format(acao.prazo, "dd/MM/yyyy", { locale: ptBR })}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <div className="text-sm font-medium">{acao.progresso}%</div>
                                        <Progress value={acao.progresso} className="w-20 h-2" />
                                      </div>
                                      <Badge
                                        variant={
                                          acao.status === "concluida"
                                            ? "default"
                                            : acao.status === "atrasada"
                                              ? "destructive"
                                              : "secondary"
                                        }
                                        className="text-xs"
                                      >
                                        {acao.status.replace("_", " ")}
                                      </Badge>
                                      {acao.custo && (
                                        <div className="text-sm text-muted-foreground">
                                          R$ {acao.custo.toLocaleString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="previsao" className="space-y-4">
              {previsao && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Análise Preditiva Avançada
                      </CardTitle>
                      <CardDescription>Previsões baseadas em IA e dados históricos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium">Métricas de Risco</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Probabilidade de Atraso</span>
                                <span>{previsao.probabilidadeAtraso}%</span>
                              </div>
                              <Progress value={previsao.probabilidadeAtraso} className="h-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-orange-50 rounded-lg">
                                <div className="text-sm text-muted-foreground">Atraso Estimado</div>
                                <div className="text-xl font-bold text-orange-600">
                                  {previsao.diasAtrasoEstimado} dias
                                </div>
                              </div>
                              <div className="p-3 bg-red-50 rounded-lg">
                                <div className="text-sm text-muted-foreground">Custo Adicional</div>
                                <div className="text-xl font-bold text-red-600">
                                  R$ {Math.round(previsao.custoAdicionalEstimado / 1000)}k
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium">Riscos Emergentes Detectados</h4>
                          <div className="space-y-2">
                            {previsao.riscosEmergentes.map((risco, index) => (
                              <Alert key={index} className="py-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-sm">{risco}</AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Recomendações da IA</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {previsao.recomendacoes.map((recomendacao, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{recomendacao}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Simulação de Cenários</CardTitle>
                      <CardDescription>Teste diferentes cenários de mitigação</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Simulador em Desenvolvimento</h3>
                        <p className="text-muted-foreground">
                          Em breve você poderá simular diferentes cenários de mitigação de riscos.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  )
}
