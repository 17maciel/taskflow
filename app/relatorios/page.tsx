"use client"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  BarChart3,
  Download,
  Filter,
  CalendarIcon,
  TrendingUp,
  Clock,
  Users,
  CheckSquare,
  AlertTriangle,
  Target,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const relatoriosDisponiveis = [
  {
    id: "tarefas-status",
    nome: "Tarefas por Status",
    descricao: "Distribuição de tarefas por status atual",
    icon: CheckSquare,
  },
  {
    id: "produtividade-usuario",
    nome: "Produtividade por Usuário",
    descricao: "Análise de produtividade individual",
    icon: Users,
  },
  {
    id: "tempo-projetos",
    nome: "Tempo por Projeto",
    descricao: "Tempo gasto em cada projeto",
    icon: Clock,
  },
  {
    id: "atrasos-sla",
    nome: "Atrasos e SLA",
    descricao: "Análise de cumprimento de prazos",
    icon: AlertTriangle,
  },
  {
    id: "performance-mensal",
    nome: "Performance Mensal",
    descricao: "Comparativo de performance mensal",
    icon: TrendingUp,
  },
  {
    id: "metas-objetivos",
    nome: "Metas e Objetivos",
    descricao: "Acompanhamento de metas estabelecidas",
    icon: Target,
  },
]

const dadosRelatorio = {
  "tarefas-status": {
    dados: [
      { status: "Concluídas", quantidade: 45, percentual: 35 },
      { status: "Em Progresso", quantidade: 32, percentual: 25 },
      { status: "Pendentes", quantidade: 28, percentual: 22 },
      { status: "Em Revisão", quantidade: 15, percentual: 12 },
      { status: "Atrasadas", quantidade: 8, percentual: 6 },
    ],
    total: 128,
  },
  "produtividade-usuario": {
    dados: [
      { usuario: "João Silva", tarefasConcluidas: 12, tempoMedio: "2.5h", eficiencia: 92 },
      { usuario: "Maria Santos", tarefasConcluidas: 15, tempoMedio: "2.1h", eficiencia: 95 },
      { usuario: "Pedro Costa", tarefasConcluidas: 8, tempoMedio: "3.2h", eficiencia: 78 },
      { usuario: "Ana Lima", tarefasConcluidas: 11, tempoMedio: "2.8h", eficiencia: 85 },
    ],
  },
}

export default function RelatoriosPage() {
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

  const [relatorioSelecionado, setRelatorioSelecionado] = useState("")
  const [filtros, setFiltros] = useState({
    dataInicio: undefined as Date | undefined,
    dataFim: undefined as Date | undefined,
    projeto: "all",
    usuario: "all",
    cliente: "all",
  })

  const gerarRelatorio = () => {
    console.log("Gerando relatório:", relatorioSelecionado, filtros)
    // Aqui seria feita a chamada para a API
  }

  const exportarRelatorio = (formato: string) => {
    console.log(`Exportando relatório em ${formato}`)
    // Aqui seria feita a exportação
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
      <header className="flex items-center gap-2 border-b px-4 py-2">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Relatórios</h1>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Seleção de Relatório */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Selecionar Relatório
            </CardTitle>
            <CardDescription>Escolha o tipo de relatório que deseja gerar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relatoriosDisponiveis.map((relatorio) => (
                <Card
                  key={relatorio.id}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/50",
                    relatorioSelecionado === relatorio.id && "ring-2 ring-primary",
                  )}
                  onClick={() => setRelatorioSelecionado(relatorio.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <relatorio.icon className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium text-sm">{relatorio.nome}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{relatorio.descricao}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <CardDescription>Configure os filtros para personalizar o relatório</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Início</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filtros.dataInicio && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filtros.dataInicio ? format(filtros.dataInicio, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filtros.dataInicio}
                      onSelect={(date) => setFiltros({ ...filtros, dataInicio: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data Fim</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filtros.dataFim && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filtros.dataFim ? format(filtros.dataFim, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filtros.dataFim}
                      onSelect={(date) => setFiltros({ ...filtros, dataFim: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Projeto</label>
                <Select value={filtros.projeto} onValueChange={(value) => setFiltros({ ...filtros, projeto: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os projetos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os projetos</SelectItem>
                    <SelectItem value="ecommerce">Sistema E-commerce</SelectItem>
                    <SelectItem value="mobile">App Mobile</SelectItem>
                    <SelectItem value="website">Website Institucional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Usuário</label>
                <Select value={filtros.usuario} onValueChange={(value) => setFiltros({ ...filtros, usuario: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os usuários" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os usuários</SelectItem>
                    <SelectItem value="joao">João Silva</SelectItem>
                    <SelectItem value="maria">Maria Santos</SelectItem>
                    <SelectItem value="pedro">Pedro Costa</SelectItem>
                    <SelectItem value="ana">Ana Lima</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cliente</label>
                <Select value={filtros.cliente} onValueChange={(value) => setFiltros({ ...filtros, cliente: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os clientes</SelectItem>
                    <SelectItem value="techcorp">TechCorp</SelectItem>
                    <SelectItem value="startupxyz">StartupXYZ</SelectItem>
                    <SelectItem value="empresaabc">Empresa ABC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={gerarRelatorio} disabled={!relatorioSelecionado}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setFiltros({
                    dataInicio: undefined,
                    dataFim: undefined,
                    projeto: "all",
                    usuario: "all",
                    cliente: "all",
                  })
                }
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado do Relatório */}
        {relatorioSelecionado && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{relatoriosDisponiveis.find((r) => r.id === relatorioSelecionado)?.nome}</CardTitle>
                  <CardDescription>Dados atualizados em tempo real</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportarRelatorio("pdf")}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportarRelatorio("excel")}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {relatorioSelecionado === "tarefas-status" && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {dadosRelatorio["tarefas-status"].dados.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold">{item.quantidade}</div>
                          <div className="text-sm text-muted-foreground">{item.status}</div>
                          <div className="text-xs text-muted-foreground mt-1">{item.percentual}% do total</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    Total de {dadosRelatorio["tarefas-status"].total} tarefas analisadas
                  </div>
                </div>
              )}

              {relatorioSelecionado === "produtividade-usuario" && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Usuário</th>
                          <th className="text-center p-2">Tarefas Concluídas</th>
                          <th className="text-center p-2">Tempo Médio</th>
                          <th className="text-center p-2">Eficiência</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dadosRelatorio["produtividade-usuario"].dados.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{item.usuario}</td>
                            <td className="p-2 text-center">{item.tarefasConcluidas}</td>
                            <td className="p-2 text-center">{item.tempoMedio}</td>
                            <td className="p-2 text-center">
                              <Badge
                                variant={
                                  item.eficiencia >= 90
                                    ? "default"
                                    : item.eficiencia >= 80
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {item.eficiencia}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {!dadosRelatorio[relatorioSelecionado as keyof typeof dadosRelatorio] && (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Dados do relatório serão exibidos aqui após a geração</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* API Information */}
        <Card>
          <CardHeader>
            <CardTitle>Integração com Power BI</CardTitle>
            <CardDescription>Use nossa API RESTful para integrar com Power BI e outras ferramentas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Endpoints Disponíveis:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• GET /api/clientes</li>
                  <li>• GET /api/projetos</li>
                  <li>• GET /api/tarefas</li>
                  <li>• GET /api/usuarios</li>
                  <li>• GET /api/tempo</li>
                  <li>• GET /api/relatorios/customizados</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Autentica��ão:</h4>
                <div className="bg-muted p-3 rounded-lg text-sm font-mono">Authorization: Bearer {"{token}"}</div>
                <p className="text-xs text-muted-foreground mt-2">Tokens podem ser gerados na seção de configurações</p>
              </div>
            </div>
            <Button variant="outline">Ver Documentação da API</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
