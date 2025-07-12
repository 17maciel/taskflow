"use client"

import { Download, FileText, FileSpreadsheet, Plus, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const tarefasIniciais = [
  {
    id: 1,
    nome: "Definição do Escopo",
    inicio: new Date("2024-01-15").getTime(),
    fim: new Date("2024-01-20").getTime(),
    duracao: 5,
    progresso: 100,
    responsavel: "João",
    dependencias: [],
    critico: true,
  },
  {
    id: 2,
    nome: "Levantamento de Requisitos",
    inicio: new Date("2024-01-22").getTime(),
    fim: new Date("2024-01-29").getTime(),
    duracao: 7,
    progresso: 80,
    responsavel: "Maria",
    dependencias: [1],
    critico: true,
  },
  {
    id: 3,
    nome: "Design da Solução",
    inicio: new Date("2024-01-30").getTime(),
    fim: new Date("2024-02-07").getTime(),
    duracao: 8,
    progresso: 50,
    responsavel: "Carlos",
    dependencias: [2],
    critico: true,
  },
  {
    id: 4,
    nome: "Desenvolvimento do Back-end",
    inicio: new Date("2024-02-08").getTime(),
    fim: new Date("2024-02-23").getTime(),
    duracao: 15,
    progresso: 20,
    responsavel: "Ana",
    dependencias: [3],
    critico: true,
  },
  {
    id: 5,
    nome: "Desenvolvimento do Front-end",
    inicio: new Date("2024-02-24").getTime(),
    fim: new Date("2024-03-10").getTime(),
    duracao: 15,
    progresso: 10,
    responsavel: "Lucas",
    dependencias: [3],
    critico: true,
  },
  {
    id: 6,
    nome: "Testes e Homologação",
    inicio: new Date("2024-03-11").getTime(),
    fim: new Date("2024-03-18").getTime(),
    duracao: 7,
    progresso: 0,
    responsavel: "Todos",
    dependencias: [4, 5],
    critico: true,
  },
  {
    id: 7,
    nome: "Implantação",
    inicio: new Date("2024-03-19").getTime(),
    fim: new Date("2024-03-22").getTime(),
    duracao: 3,
    progresso: 0,
    responsavel: "João",
    dependencias: [6],
    critico: true,
  },
  {
    id: 8,
    nome: "Treinamento",
    inicio: new Date("2024-03-23").getTime(),
    fim: new Date("2024-03-25").getTime(),
    duracao: 2,
    progresso: 0,
    responsavel: "Maria",
    dependencias: [7],
    critico: false,
  },
  {
    id: 9,
    nome: "Acompanhamento Pós-Implantação",
    inicio: new Date("2024-03-26").getTime(),
    fim: new Date("2024-03-30").getTime(),
    duracao: 4,
    progresso: 0,
    responsavel: "Carlos",
    dependencias: [7],
    critico: false,
  },
]

const recursosIniciais = [
  { id: 1, nome: "João (Analista)", tipo: "Humano", utilizacao: 90, capacidade: 40, custoHora: 80 },
  { id: 2, nome: "Maria (Arquiteta)", tipo: "Humano", utilizacao: 70, capacidade: 40, custoHora: 120 },
  { id: 3, nome: "Carlos (Dev Back-end)", tipo: "Humano", utilizacao: 80, capacidade: 40, custoHora: 100 },
  { id: 4, nome: "Ana (Dev Front-end)", tipo: "Humano", utilizacao: 60, capacidade: 40, custoHora: 100 },
  { id: 5, nome: "Lucas (Tester)", tipo: "Humano", utilizacao: 50, capacidade: 40, custoHora: 90 },
  { id: 6, nome: "Servidor de Testes", tipo: "Infra", utilizacao: 30, capacidade: 100, custoHora: 50 },
  { id: 7, nome: "Ferramentas de Desenvolvimento", tipo: "Software", utilizacao: 40, capacidade: 100, custoHora: 30 },
]

const Page = () => {
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

  const [tarefas, setTarefas] = useState(tarefasIniciais)
  const [recursos, setRecursos] = useState(recursosIniciais)
  const [caminhosCriticos, setCaminhosCriticos] = useState([])
  const [exibirLegenda, setExibirLegenda] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      // Simular geração de PDF
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Criar dados do relatório CPM
      const reportData = {
        projectName: "Sistema E-commerce",
        generatedAt: new Date().toLocaleString("pt-BR"),
        criticalPath: caminhosCriticos,
        tasks: tarefas,
        resources: recursos,
        analysis: {
          totalDuration: Math.max(...tarefas.map((t) => t.fim)),
          criticalTasks: tarefas.filter((t) => t.critico).length,
          totalTasks: tarefas.length,
          resourceUtilization: recursos.reduce((acc, r) => acc + r.utilizacao, 0) / recursos.length,
        },
      }

      console.log("Exportando relatório CPM para PDF:", reportData)
      // Aqui seria feita a chamada real para gerar o PDF

      // Simular download
      const blob = new Blob(["PDF Content"], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `relatorio-cpm-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao exportar PDF:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = async () => {
    setIsExporting(true)
    try {
      // Simular geração de Excel
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Criar dados estruturados para Excel
      const excelData = {
        sheets: {
          "Caminho Crítico": caminhosCriticos.map((caminho) => ({
            Sequência: caminho.sequencia,
            "Duração Total": `${caminho.duracao} dias`,
            Tarefas: caminho.tarefas.join(" → "),
            Folga: `${caminho.folga} dias`,
            Status: caminho.folga === 0 ? "CRÍTICO" : "Normal",
          })),
          "Tarefas Detalhadas": tarefas.map((tarefa) => ({
            ID: tarefa.id,
            Nome: tarefa.nome,
            Início: new Date(tarefa.inicio).toLocaleDateString("pt-BR"),
            Fim: new Date(tarefa.fim).toLocaleDateString("pt-BR"),
            Duração: `${tarefa.duracao} dias`,
            Progresso: `${tarefa.progresso}%`,
            Responsável: tarefa.responsavel,
            Crítico: tarefa.critico ? "SIM" : "NÃO",
            Dependências: tarefa.dependencias?.join(", ") || "Nenhuma",
          })),
          Recursos: recursos.map((recurso) => ({
            Nome: recurso.nome,
            Tipo: recurso.tipo,
            Utilização: `${recurso.utilizacao}%`,
            Capacidade: recurso.capacidade,
            "Custo/Hora": `R$ ${recurso.custoHora}`,
            Status: recurso.utilizacao > 80 ? "Sobrecarregado" : recurso.utilizacao > 60 ? "Alta Utilização" : "Normal",
          })),
          "Análise CPM": [
            {
              Métrica: "Duração Total do Projeto",
              Valor: `${Math.max(...tarefas.map((t) => t.fim))} dias`,
            },
            {
              Métrica: "Número de Caminhos Críticos",
              Valor: caminhosCriticos.filter((c) => c.folga === 0).length,
            },
            {
              Métrica: "Total de Tarefas",
              Valor: tarefas.length,
            },
            {
              Métrica: "Tarefas Críticas",
              Valor: tarefas.filter((t) => t.critico).length,
            },
            {
              Métrica: "Utilização Média de Recursos",
              Valor: `${(recursos.reduce((acc, r) => acc + r.utilizacao, 0) / recursos.length).toFixed(1)}%`,
            },
          ],
        },
      }

      console.log("Exportando relatório CPM para Excel:", excelData)
      // Aqui seria feita a chamada real para gerar o Excel

      // Simular download
      const blob = new Blob(["Excel Content"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `relatorio-cpm-${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao exportar Excel:", error)
    } finally {
      setIsExporting(false)
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
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Gerenciamento de Projetos com CPM/PERT</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de Tarefas */}
        <Card>
          <CardHeader>
            <CardTitle>Tarefas</CardTitle>
            <CardDescription>Gerencie as tarefas do seu projeto.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Progresso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tarefas.map((tarefa) => (
                  <TableRow key={tarefa.id}>
                    <TableCell>{tarefa.nome}</TableCell>
                    <TableCell>{new Date(tarefa.inicio).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(tarefa.fim).toLocaleDateString()}</TableCell>
                    <TableCell>{tarefa.progresso}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Tarefa
            </Button>
          </CardFooter>
        </Card>

        {/* Card de Recursos */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos</CardTitle>
            <CardDescription>Gerencie os recursos alocados ao seu projeto.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Utilização</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recursos.map((recurso) => (
                  <TableRow key={recurso.id}>
                    <TableCell>{recurso.nome}</TableCell>
                    <TableCell>{recurso.tipo}</TableCell>
                    <TableCell>{recurso.utilizacao}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Recurso
            </Button>
          </CardFooter>
        </Card>

        {/* Card de Análise do Caminho Crítico */}
        <Card>
          <CardHeader>
            <CardTitle>Análise do Caminho Crítico</CardTitle>
            <CardDescription>Visualize o caminho crítico do seu projeto.</CardDescription>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToPDF} disabled={isExporting}>
                <FileText className="h-4 w-4 mr-2" />
                {isExporting ? "Gerando..." : "PDF"}
              </Button>
              <Button variant="outline" size="sm" onClick={exportToExcel} disabled={isExporting}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {isExporting ? "Gerando..." : "Excel"}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Gantt
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {caminhosCriticos.length > 0 ? (
              <ul>
                {caminhosCriticos.map((caminho, index) => (
                  <li key={index}>
                    Caminho {index + 1}: {caminho.join(" → ")}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum caminho crítico encontrado.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => setCaminhosCriticos([["Tarefa 1", "Tarefa 2", "Tarefa 3"]])}>
              <Rocket className="h-4 w-4 mr-2" />
              Analisar Caminho Crítico
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Separator className="my-6" />

      {/* Legenda e Opções de Visualização */}
      <div className="flex items-center justify-between mb-4">
        <Label htmlFor="exibirLegenda" className="mr-2">
          Exibir Legenda:
        </Label>
        <Switch id="exibirLegenda" checked={exibirLegenda} onCheckedChange={setExibirLegenda} />
      </div>

      {/* Gráfico de Gantt (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Gantt</CardTitle>
          <CardDescription>Visualização gráfica das tarefas e seus prazos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
            Gráfico de Gantt aqui (implementação futura)
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Page
