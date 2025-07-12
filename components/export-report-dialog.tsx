"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  FileSpreadsheet,
  Download,
  Settings,
  Calendar,
  BarChart3,
  Users,
  Clock,
  Target,
  AlertTriangle,
} from "lucide-react"

interface ExportReportDialogProps {
  trigger: React.ReactNode
  projectName?: string
  onExport?: (format: string, options: ExportOptions) => void
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

export function ExportReportDialog({ trigger, projectName = "Projeto", onExport }: ExportReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [options, setOptions] = useState<ExportOptions>({
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
  })

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    // Simular progresso de exportação
    const steps = [
      { message: "Coletando dados do projeto...", progress: 20 },
      { message: "Analisando caminho crítico...", progress: 40 },
      { message: "Processando recursos...", progress: 60 },
      { message: "Gerando gráficos...", progress: 80 },
      { message: "Finalizando relatório...", progress: 100 },
    ]

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setExportProgress(step.progress)
    }

    // Chamar função de exportação
    onExport?.(options.format, options)

    // Simular download
    const fileName = `relatorio-cpm-${projectName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.${options.format === "pdf" ? "pdf" : "xlsx"}`

    console.log(`Exportando relatório: ${fileName}`, options)

    setIsExporting(false)
    setExportProgress(0)
    setIsOpen(false)
  }

  const updateSection = (section: keyof ExportOptions["sections"], value: boolean) => {
    setOptions((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: value,
      },
    }))
  }

  const sectionsConfig = [
    {
      key: "summary" as const,
      label: "Resumo Executivo",
      description: "Visão geral do projeto e métricas principais",
      icon: BarChart3,
      essential: true,
    },
    {
      key: "criticalPath" as const,
      label: "Análise do Caminho Crítico",
      description: "Caminhos críticos e análise CPM detalhada",
      icon: Target,
      essential: true,
    },
    {
      key: "tasks" as const,
      label: "Detalhamento de Tarefas",
      description: "Lista completa de tarefas com status e dependências",
      icon: Clock,
      essential: false,
    },
    {
      key: "resources" as const,
      label: "Análise de Recursos",
      description: "Utilização e alocação de recursos",
      icon: Users,
      essential: false,
    },
    {
      key: "timeline" as const,
      label: "Cronograma Visual",
      description: "Gráfico de Gantt e linha do tempo",
      icon: Calendar,
      essential: false,
    },
    {
      key: "risks" as const,
      label: "Análise de Riscos",
      description: "Identificação e mitigação de riscos",
      icon: AlertTriangle,
      essential: false,
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Relatório CPM
          </DialogTitle>
          <DialogDescription>
            Configure as opções de exportação para gerar um relatório detalhado da análise CPM
          </DialogDescription>
        </DialogHeader>

        {isExporting ? (
          <div className="space-y-4 py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Download className="h-8 w-8 text-primary animate-bounce" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Gerando Relatório</h3>
              <p className="text-muted-foreground mb-4">Processando dados e criando o relatório...</p>
            </div>
            <Progress value={exportProgress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">{exportProgress}% concluído</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Formato de Exportação */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Formato de Exportação</CardTitle>
                <CardDescription>Escolha o formato do relatório</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-colors ${options.format === "pdf" ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
                    onClick={() => setOptions((prev) => ({ ...prev, format: "pdf" }))}
                  >
                    <CardContent className="p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-red-500" />
                      <h3 className="font-medium">PDF</h3>
                      <p className="text-xs text-muted-foreground mt-1">Relatório formatado para apresentação</p>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-colors ${options.format === "excel" ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
                    onClick={() => setOptions((prev) => ({ ...prev, format: "excel" }))}
                  >
                    <CardContent className="p-4 text-center">
                      <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <h3 className="font-medium">Excel</h3>
                      <p className="text-xs text-muted-foreground mt-1">Dados estruturados para análise</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Seções do Relatório */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Seções do Relatório</CardTitle>
                <CardDescription>Selecione as seções que deseja incluir</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sectionsConfig.map((section) => (
                  <div key={section.key} className="flex items-start space-x-3">
                    <Checkbox
                      id={section.key}
                      checked={options.sections[section.key]}
                      onCheckedChange={(checked) => updateSection(section.key, checked as boolean)}
                      disabled={section.essential}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <section.icon className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor={section.key} className="text-sm font-medium">
                          {section.label}
                        </Label>
                        {section.essential && (
                          <Badge variant="secondary" className="text-xs">
                            Essencial
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Opções Avançadas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Opções Avançadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Período dos Dados</Label>
                    <Select
                      value={options.dateRange}
                      onValueChange={(value: any) => setOptions((prev) => ({ ...prev, dateRange: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os dados</SelectItem>
                        <SelectItem value="current">Período atual</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Idioma</Label>
                    <Select
                      value={options.language}
                      onValueChange={(value: any) => setOptions((prev) => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCharts"
                      checked={options.includeCharts}
                      onCheckedChange={(checked) =>
                        setOptions((prev) => ({ ...prev, includeCharts: checked as boolean }))
                      }
                    />
                    <Label htmlFor="includeCharts" className="text-sm">
                      Incluir gráficos e visualizações
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeComments"
                      checked={options.includeComments}
                      onCheckedChange={(checked) =>
                        setOptions((prev) => ({ ...prev, includeComments: checked as boolean }))
                      }
                    />
                    <Label htmlFor="includeComments" className="text-sm">
                      Incluir comentários e observações
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumo da Exportação */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo da Exportação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Formato:</span>
                    <Badge variant="outline">{options.format.toUpperCase()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seções selecionadas:</span>
                    <span>
                      {Object.values(options.sections).filter(Boolean).length} de {Object.keys(options.sections).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Incluir gráficos:</span>
                    <span>{options.includeCharts ? "Sim" : "Não"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Idioma:</span>
                    <span>{options.language === "pt" ? "Português" : "English"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleExport} className="min-w-[120px]">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
