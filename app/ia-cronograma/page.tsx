"use client"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Lightbulb,
  AlertTriangle,
  FileText,
  Download,
  Settings,
  Info,
  Eye,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { incrementAIPredictionUsage } from "@/actions/ai-usage"
import { usePlanLimits } from "@/hooks/use-plan-limits"
import { useToast } from "@/hooks/use-toast"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Tipos de dados
interface CronogramaGerado {
  id: string
  nomeProjeto: string
  descricao: string
  dataGeracao: Date
  duracaoEstimada: string
  custoEstimado: string
  confiancaIA: number
  fases: {
    nome: string
    tarefas: {
      nome: string
      duracao: string
      responsavel: string
      dependencias: string[]
    }[]
  }[]
  riscosPotenciais: string[]
  recomendacoes: string[]
}

interface HistoricoGeracao {
  id: string
  nomeProjeto: string
  dataGeracao: Date
  status: "sucesso" | "falha"
  duracaoEstimada?: string
  custoEstimado?: string
}

// Dados mockados
const historicoGeracoes: HistoricoGeracao[] = [
  {
    id: "h1",
    nomeProjeto: "Sistema de Gestão de Clientes",
    dataGeracao: new Date("2024-01-01T10:00:00"),
    status: "sucesso",
    duracaoEstimada: "90 dias",
    custoEstimado: "R$ 45.000",
  },
  {
    id: "h2",
    nomeProjeto: "App de Delivery de Comida",
    dataGeracao: new Date("2023-12-25T15:30:00"),
    status: "sucesso",
    duracaoEstimada: "120 dias",
    custoEstimado: "R$ 60.000",
  },
  {
    id: "h3",
    nomeProjeto: "Plataforma E-learning",
    dataGeracao: new Date("2023-12-10T09:00:00"),
    status: "falha",
  },
]

export default function IACronogramaPage() {
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

  const { toast } = useToast()
  const { usage, limits, fetchUsage } = usePlanLimits()

  const [descricaoProjeto, setDescricaoProjeto] = useState("")
  const [cronogramaGerado, setCronogramaGerado] = useState<CronogramaGerado | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateCronograma = async () => {
    if (!descricaoProjeto.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, forneça uma descrição do projeto.",
        variant: "destructive",
      })
      return
    }

    if (usage.aiPredictions >= limits.aiPredictions) {
      toast({
        title: "Limite de Uso Atingido",
        description: "Você atingiu o limite de previsões de IA para o seu plano. Considere fazer upgrade.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setError(null)
    setCronogramaGerado(null)

    try {
      const prompt = `Gere um cronograma de projeto detalhado com fases, tarefas, duração estimada, responsável e dependências, além de riscos potenciais e recomendações, com base na seguinte descrição: "${descricaoProjeto}". O cronograma deve ser retornado em formato JSON, seguindo a interface CronogramaGerado. A duração e o custo devem ser strings formatadas (ex: "90 dias", "R$ 45.000"). A confiança da IA deve ser um número entre 0 e 100.`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: prompt,
      })

      const parsedResponse = JSON.parse(text) as CronogramaGerado

      setCronogramaGerado({
        ...parsedResponse,
        id: `c${Date.now()}`,
        dataGeracao: new Date(),
        nomeProjeto: descricaoProjeto.substring(0, 50) + "...", // Simplificado
      })

      await incrementAIPredictionUsage()
      await fetchUsage() // Atualiza o uso após a geração
      toast({
        title: "Sucesso!",
        description: "Cronograma gerado com sucesso pela IA.",
      })
    } catch (err) {
      console.error("Erro ao gerar cronograma:", err)
      setError("Falha ao gerar cronograma. Tente novamente mais tarde.")
      toast({
        title: "Erro",
        description: "Falha ao gerar cronograma. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
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
      <header className="flex items-center gap-2 border-b px-4 py-2">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">IA de Cronograma</h1>
        <Badge variant="secondary" className="ml-2">
          Beta
        </Badge>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Descrição do Projeto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Gerar Cronograma com IA
            </CardTitle>
            <CardDescription>Descreva seu projeto e deixe a IA criar um cronograma detalhado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descricaoProjeto">Descrição do Projeto</Label>
              <Textarea
                id="descricaoProjeto"
                placeholder="Ex: Desenvolver um sistema de e-commerce para venda de produtos artesanais, com funcionalidades de carrinho, pagamento online e gestão de estoque."
                rows={5}
                value={descricaoProjeto}
                onChange={(e) => setDescricaoProjeto(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleGenerateCronograma} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Gerar Cronograma
                  </>
                )}
              </Button>
            </div>
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {usage && limits && (
              <div className="text-sm text-muted-foreground mt-4">
                Usos de IA: {usage.aiPredictions} / {limits.aiPredictions}
                <Progress value={(usage.aiPredictions / limits.aiPredictions) * 100} className="h-2 mt-1" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cronograma Gerado */}
        {cronogramaGerado && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Cronograma Gerado
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Confiança IA: {cronogramaGerado.confiancaIA}%</Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Importar para Projeto
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>Visualização do cronograma gerado pela inteligência artificial.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Projeto</Label>
                  <Input value={cronogramaGerado.nomeProjeto} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Duração Estimada</Label>
                  <Input value={cronogramaGerado.duracaoEstimada} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Custo Estimado</Label>
                  <Input value={cronogramaGerado.custoEstimado} readOnly />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fases do Projeto</h3>
                {cronogramaGerado.fases.map((fase, index) => (
                  <Card key={index} className="bg-muted/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{fase.nome}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {fase.tarefas.map((tarefa, tIndex) => (
                          <div key={tIndex} className="p-3 border rounded-lg">
                            <div className="font-medium">{tarefa.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              Duração: {tarefa.duracao} • Responsável: {tarefa.responsavel}
                            </div>
                            {tarefa.dependencias.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Dependências: {tarefa.dependencias.join(", ")}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Riscos Potenciais
                  </h3>
                  <div className="space-y-2">
                    {cronogramaGerado.riscosPotenciais.map((risco, index) => (
                      <Alert key={index} className="py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{risco}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-500" />
                    Recomendações da IA
                  </h3>
                  <div className="space-y-2">
                    {cronogramaGerado.recomendacoes.map((recomendacao, index) => (
                      <Alert key={index} className="py-2">
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription className="text-sm">{recomendacao}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico de Gerações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Histórico de Gerações
            </CardTitle>
            <CardDescription>Visualize cronogramas gerados anteriormente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {historicoGeracoes.length === 0 ? (
              <div className="text-center py-8">
                <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum cronograma gerado ainda</h3>
                <p className="text-muted-foreground">
                  Comece descrevendo seu projeto para gerar seu primeiro cronograma com IA.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {historicoGeracoes.map((item) => (
                  <Card key={item.id} className="bg-muted/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{item.nomeProjeto}</h4>
                          <p className="text-sm text-muted-foreground">
                            Gerado em: {item.dataGeracao.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={item.status === "sucesso" ? "default" : "destructive"}>
                          {item.status === "sucesso" ? "Sucesso" : "Falha"}
                        </Badge>
                      </div>
                      {item.status === "sucesso" && (
                        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                          <div>
                            <span className="font-medium">Duração:</span> {item.duracaoEstimada}
                          </div>
                          <div>
                            <span className="font-medium">Custo:</span> {item.custoEstimado}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end gap-2 mt-3">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Exportar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configurações da IA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações da IA
            </CardTitle>
            <CardDescription>Ajuste as configurações para a geração de cronogramas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modeloIA">Modelo de IA</Label>
              <Select defaultValue="gpt-4o">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o (Recomendado)</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nivelDetalhe">Nível de Detalhe</Label>
              <Select defaultValue="medio">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixo">Baixo (Visão Geral)</SelectItem>
                  <SelectItem value="medio">Médio (Padrão)</SelectItem>
                  <SelectItem value="alto">Alto (Detalhado)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="idioma">Idioma do Cronograma</Label>
              <Select defaultValue="pt-br">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                  <SelectItem value="en-us">English (US)</SelectItem>
                  <SelectItem value="es-es">Español (España)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>Salvar Configurações</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
