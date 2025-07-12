"use client"

import { useState, useCallback } from "react"

interface CPMData {
  projectName: string
  criticalPaths: any[]
  tasks: any[]
  resources: any[]
  timeline: any[]
  risks: any[]
}

interface ExportOptions {
  format: "pdf" | "excel"
  sections: {
    summary: boolean
    criticalPath: boolean
    tasks: boolean
    resources: boolean
    timeline: boolean
    risks: boolean
  }
  dateRange: "all" | "current" | "custom"
  includeCharts: boolean
  includeComments: boolean
  language: "pt" | "en"
}

interface UseExportCPMReturn {
  isExporting: boolean
  exportProgress: number
  exportToPDF: (data: CPMData, options?: Partial<ExportOptions>) => Promise<void>
  exportToExcel: (data: CPMData, options?: Partial<ExportOptions>) => Promise<void>
  generateReport: (data: CPMData, options: ExportOptions) => Promise<void>
}

export function useExportCPM(): UseExportCPMReturn {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const simulateProgress = useCallback(async (steps: { message: string; progress: number }[]) => {
    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setExportProgress(step.progress)
      console.log(step.message)
    }
  }, [])

  const generatePDFContent = useCallback((data: CPMData, options: ExportOptions) => {
    const content = {
      metadata: {
        title: `Relatório CPM - ${data.projectName}`,
        author: "TaskFlow Pro",
        subject: "Análise do Caminho Crítico",
        keywords: "CPM, Caminho Crítico, Gestão de Projetos",
        createdAt: new Date().toISOString(),
        language: options.language,
      },
      sections: [],
    }

    // Resumo Executivo
    if (options.sections.summary) {
      content.sections.push({
        title: options.language === "pt" ? "Resumo Executivo" : "Executive Summary",
        type: "summary",
        data: {
          projectName: data.projectName,
          totalTasks: data.tasks.length,
          criticalTasks: data.tasks.filter((t: any) => t.critico).length,
          totalDuration: Math.max(...data.tasks.map((t: any) => t.fim)),
          resourceUtilization:
            data.resources.reduce((acc: number, r: any) => acc + r.utilizacao, 0) / data.resources.length,
          completionPercentage: data.tasks.reduce((acc: number, t: any) => acc + t.progresso, 0) / data.tasks.length,
        },
      })
    }

    // Análise do Caminho Crítico
    if (options.sections.criticalPath) {
      content.sections.push({
        title: options.language === "pt" ? "Análise do Caminho Crítico" : "Critical Path Analysis",
        type: "criticalPath",
        data: {
          paths: data.criticalPaths,
          analysis: {
            longestPath: data.criticalPaths.reduce(
              (max: any, path: any) => (path.duracao > max.duracao ? path : max),
              data.criticalPaths[0],
            ),
            totalCriticalPaths: data.criticalPaths.filter((p: any) => p.folga === 0).length,
            averageSlack:
              data.criticalPaths.reduce((acc: number, p: any) => acc + p.folga, 0) / data.criticalPaths.length,
          },
        },
      })
    }

    // Detalhamento de Tarefas
    if (options.sections.tasks) {
      content.sections.push({
        title: options.language === "pt" ? "Detalhamento de Tarefas" : "Task Details",
        type: "tasks",
        data: {
          tasks: data.tasks.map((task: any) => ({
            id: task.id,
            name: task.nome,
            startDate: new Date(task.inicio).toLocaleDateString(options.language === "pt" ? "pt-BR" : "en-US"),
            endDate: new Date(task.fim).toLocaleDateString(options.language === "pt" ? "pt-BR" : "en-US"),
            duration: task.duracao,
            progress: task.progresso,
            responsible: task.responsavel,
            isCritical: task.critico,
            dependencies: task.dependencias || [],
          })),
          statistics: {
            completed: data.tasks.filter((t: any) => t.progresso === 100).length,
            inProgress: data.tasks.filter((t: any) => t.progresso > 0 && t.progresso < 100).length,
            notStarted: data.tasks.filter((t: any) => t.progresso === 0).length,
            overdue: data.tasks.filter((t: any) => new Date(t.fim) < new Date() && t.progresso < 100).length,
          },
        },
      })
    }

    // Análise de Recursos
    if (options.sections.resources) {
      content.sections.push({
        title: options.language === "pt" ? "Análise de Recursos" : "Resource Analysis",
        type: "resources",
        data: {
          resources: data.resources.map((resource: any) => ({
            name: resource.nome,
            type: resource.tipo,
            utilization: resource.utilizacao,
            capacity: resource.capacidade,
            costPerHour: resource.custoHora,
            status: resource.utilizacao > 80 ? "overloaded" : resource.utilizacao > 60 ? "high" : "normal",
          })),
          summary: {
            totalResources: data.resources.length,
            averageUtilization:
              data.resources.reduce((acc: number, r: any) => acc + r.utilizacao, 0) / data.resources.length,
            overloadedResources: data.resources.filter((r: any) => r.utilizacao > 80).length,
            totalCost: data.resources.reduce((acc: number, r: any) => acc + r.custoHora * r.utilizacao * 8, 0),
          },
        },
      })
    }

    return content
  }, [])

  const generateExcelContent = useCallback((data: CPMData, options: ExportOptions) => {
    const workbook = {
      metadata: {
        title: `Relatório CPM - ${data.projectName}`,
        author: "TaskFlow Pro",
        createdAt: new Date().toISOString(),
      },
      sheets: {},
    }

    // Resumo Executivo
    if (options.sections.summary) {
      workbook.sheets["Resumo"] = {
        data: [
          ["Métrica", "Valor"],
          ["Nome do Projeto", data.projectName],
          ["Total de Tarefas", data.tasks.length],
          ["Tarefas Críticas", data.tasks.filter((t: any) => t.critico).length],
          ["Duração Total (dias)", Math.max(...data.tasks.map((t: any) => t.fim))],
          [
            "Utilização Média de Recursos (%)",
            (data.resources.reduce((acc: number, r: any) => acc + r.utilizacao, 0) / data.resources.length).toFixed(1),
          ],
          [
            "Progresso Médio (%)",
            (data.tasks.reduce((acc: number, t: any) => acc + t.progresso, 0) / data.tasks.length).toFixed(1),
          ],
          ["Data de Geração", new Date().toLocaleDateString("pt-BR")],
        ],
      }
    }

    // Caminho Crítico
    if (options.sections.criticalPath) {
      workbook.sheets["Caminho Crítico"] = {
        data: [
          ["Sequência", "Duração (dias)", "Tarefas", "Folga (dias)", "Status"],
          ...data.criticalPaths.map((path: any) => [
            path.sequencia,
            path.duracao,
            path.tarefas.join(" → "),
            path.folga,
            path.folga === 0 ? "CRÍTICO" : "Normal",
          ]),
        ],
      }
    }

    // Tarefas Detalhadas
    if (options.sections.tasks) {
      workbook.sheets["Tarefas"] = {
        data: [
          ["ID", "Nome", "Início", "Fim", "Duração", "Progresso", "Responsável", "Crítico", "Dependências"],
          ...data.tasks.map((task: any) => [
            task.id,
            task.nome,
            new Date(task.inicio).toLocaleDateString("pt-BR"),
            new Date(task.fim).toLocaleDateString("pt-BR"),
            task.duracao,
            `${task.progresso}%`,
            task.responsavel,
            task.critico ? "SIM" : "NÃO",
            task.dependencias?.join(", ") || "Nenhuma",
          ]),
        ],
      }
    }

    // Recursos
    if (options.sections.resources) {
      workbook.sheets["Recursos"] = {
        data: [
          ["Nome", "Tipo", "Utilização (%)", "Capacidade", "Custo/Hora (R$)", "Status"],
          ...data.resources.map((resource: any) => [
            resource.nome,
            resource.tipo,
            resource.utilizacao,
            resource.capacidade,
            resource.custoHora,
            resource.utilizacao > 80 ? "Sobrecarregado" : resource.utilizacao > 60 ? "Alta Utilização" : "Normal",
          ]),
        ],
      }
    }

    return workbook
  }, [])

  const exportToPDF = useCallback(
    async (data: CPMData, options: Partial<ExportOptions> = {}) => {
      const defaultOptions: ExportOptions = {
        format: "pdf",
        sections: {
          summary: true,
          criticalPath: true,
          tasks: true,
          resources: true,
          timeline: false,
          risks: false,
        },
        dateRange: "all",
        includeCharts: true,
        includeComments: false,
        language: "pt",
      }

      const finalOptions = { ...defaultOptions, ...options }

      setIsExporting(true)
      setExportProgress(0)

      try {
        const steps = [
          { message: "Coletando dados do projeto...", progress: 20 },
          { message: "Analisando caminho crítico...", progress: 40 },
          { message: "Gerando conteúdo PDF...", progress: 60 },
          { message: "Processando gráficos...", progress: 80 },
          { message: "Finalizando documento...", progress: 100 },
        ]

        await simulateProgress(steps)

        const pdfContent = generatePDFContent(data, finalOptions)
        console.log("Conteúdo PDF gerado:", pdfContent)

        // Simular geração e download do PDF
        const blob = new Blob(["PDF Content"], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `relatorio-cpm-${data.projectName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Erro ao exportar PDF:", error)
        throw error
      } finally {
        setIsExporting(false)
        setExportProgress(0)
      }
    },
    [simulateProgress, generatePDFContent],
  )

  const exportToExcel = useCallback(
    async (data: CPMData, options: Partial<ExportOptions> = {}) => {
      const defaultOptions: ExportOptions = {
        format: "excel",
        sections: {
          summary: true,
          criticalPath: true,
          tasks: true,
          resources: true,
          timeline: false,
          risks: false,
        },
        dateRange: "all",
        includeCharts: false,
        includeComments: false,
        language: "pt",
      }

      const finalOptions = { ...defaultOptions, ...options }

      setIsExporting(true)
      setExportProgress(0)

      try {
        const steps = [
          { message: "Coletando dados do projeto...", progress: 25 },
          { message: "Estruturando planilhas...", progress: 50 },
          { message: "Formatando dados...", progress: 75 },
          { message: "Gerando arquivo Excel...", progress: 100 },
        ]

        await simulateProgress(steps)

        const excelContent = generateExcelContent(data, finalOptions)
        console.log("Conteúdo Excel gerado:", excelContent)

        // Simular geração e download do Excel
        const blob = new Blob(["Excel Content"], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `relatorio-cpm-${data.projectName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Erro ao exportar Excel:", error)
        throw error
      } finally {
        setIsExporting(false)
        setExportProgress(0)
      }
    },
    [simulateProgress, generateExcelContent],
  )

  const generateReport = useCallback(
    async (data: CPMData, options: ExportOptions) => {
      if (options.format === "pdf") {
        await exportToPDF(data, options)
      } else {
        await exportToExcel(data, options)
      }
    },
    [exportToPDF, exportToExcel],
  )

  return {
    isExporting,
    exportProgress,
    exportToPDF,
    exportToExcel,
    generateReport,
  }
}
