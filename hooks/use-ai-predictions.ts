"use client"

import { useState } from "react"
import { incrementAIPredictionUsage } from "@/actions/ai-usage" // Importar o Server Action

interface Prediction {
  id: string
  projectName: string
  delayProbability: number
  estimatedDelay: number
  riskLevel: "low" | "medium" | "high"
  riskFactors: string[]
  recommendations: string[]
}

interface Optimization {
  id: string
  title: string
  description: string
  impact: {
    timeSaving: string
    riskReduction: string
    efficiencyGain: string
  }
  affectedProjects: string[]
  status: "ready" | "analyzing"
  confidence: number
}

interface Metrics {
  accuracy: number
  optimizationRate: number
  timeSaved: number
  projectsAtRisk: number
}

interface Insights {
  trends: Array<{
    title: string
    description: string
  }>
  strategicRecommendations: Array<{
    title: string
    description: string
  }>
}

export function useAIPredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([
    {
      id: "1",
      projectName: "Sistema E-commerce",
      delayProbability: 78,
      estimatedDelay: 8,
      riskLevel: "high",
      riskFactors: [
        "Integração com API de pagamento complexa",
        "Complexidade subestimada do carrinho",
        "Recursos da equipe sobrecarregados",
      ],
      recommendations: [
        "Realocar 2 desenvolvedores sênior",
        "Paralelizar desenvolvimento do checkout",
        "Implementar reuniões diárias de acompanhamento",
      ],
    },
    {
      id: "2",
      projectName: "App Mobile",
      delayProbability: 45,
      estimatedDelay: 3,
      riskLevel: "medium",
      riskFactors: [
        "Testes em dispositivos iOS demorados",
        "Processo de aprovação na App Store",
        "Dependência de API externa",
      ],
      recommendations: [
        "Submeter para review antecipadamente",
        "Implementar testes automatizados",
        "Configurar ambiente de desenvolvimento iOS",
      ],
    },
    {
      id: "3",
      projectName: "Website Institucional",
      delayProbability: 15,
      estimatedDelay: 0,
      riskLevel: "low",
      riskFactors: ["Escopo bem definido", "Equipe experiente", "Tecnologias conhecidas"],
      recommendations: [
        "Manter ritmo atual de desenvolvimento",
        "Focar na qualidade do código",
        "Considerar entrega antecipada",
      ],
    },
  ])

  const [optimizations, setOptimizations] = useState<Optimization[]>([
    {
      id: "1",
      title: "Redistribuição de Recursos",
      description: "Realocação automática de desenvolvedores baseada na carga de trabalho atual",
      impact: {
        timeSaving: "12 dias",
        riskReduction: "35%",
        efficiencyGain: "28%",
      },
      affectedProjects: ["Sistema E-commerce", "App Mobile"],
      status: "ready",
      confidence: 87,
    },
    {
      id: "2",
      title: "Paralelização de Tarefas",
      description: "Identificação de tarefas que podem ser executadas simultaneamente",
      impact: {
        timeSaving: "8 dias",
        riskReduction: "22%",
        efficiencyGain: "31%",
      },
      affectedProjects: ["Sistema E-commerce"],
      status: "ready",
      confidence: 92,
    },
    {
      id: "3",
      title: "Priorização de Features",
      description: "Mover funcionalidades não-críticas para próximas sprints",
      impact: {
        timeSaving: "5 dias",
        riskReduction: "18%",
        efficiencyGain: "15%",
      },
      affectedProjects: ["App Mobile", "Website Institucional"],
      status: "analyzing",
      confidence: 74,
    },
  ])

  const [metrics, setMetrics] = useState<Metrics>({
    accuracy: 87,
    optimizationRate: 73,
    timeSaved: 92,
    projectsAtRisk: 2,
  })

  const [insights, setInsights] = useState<Insights>({
    trends: [
      {
        title: "Equipes menores são mais eficientes",
        description: "Projetos com 3-5 membros têm 23% menos atrasos que equipes maiores",
      },
      {
        title: "Reuniões diárias reduzem riscos",
        description: "Daily standups diminuem a probabilidade de atrasos em 31%",
      },
      {
        title: "Paralelização economiza tempo",
        description: "Tarefas paralelas resultam em 15% menos tempo total de projeto",
      },
      {
        title: "Mudanças de escopo são o maior risco",
        description: "68% dos atrasos são causados por alterações não planejadas",
      },
    ],
    strategicRecommendations: [
      {
        title: "Implementar Buffer de Tempo",
        description: "Adicione 15-20% de buffer em cronogramas para absorver imprevistos",
      },
      {
        title: "Automatizar Testes",
        description: "Testes automatizados reduzem tempo de QA em até 40%",
      },
      {
        title: "Melhorar Comunicação",
        description: "Canais de comunicação claros previnem 60% dos mal-entendidos",
      },
    ],
  })

  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    // Simular análise da IA
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsAnalyzing(false)

    // Atualizar métricas após análise
    setMetrics((prev) => ({
      ...prev,
      accuracy: Math.min(prev.accuracy + Math.random() * 2, 95),
    }))

    // Incrementar o contador de uso de IA
    try {
      const result = await incrementAIPredictionUsage()
      if (!result.success) {
        console.error("Failed to increment AI usage:", result.message)
        // Você pode adicionar uma notificação para o usuário aqui
      } else {
        console.log("AI usage incremented to:", result.newUsage)
      }
    } catch (error) {
      console.error("Error calling incrementAIPredictionUsage:", error)
    }
  }

  const applyOptimization = async (optimizationId: string) => {
    setOptimizations((prev) =>
      prev.map((opt) => (opt.id === optimizationId ? { ...opt, status: "analyzing" as const } : opt)),
    )

    // Simular aplicação da otimização
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setOptimizations((prev) => prev.filter((opt) => opt.id !== optimizationId))

    // Atualizar previsões baseado na otimização aplicada
    setPredictions((prev) =>
      prev.map((pred) => ({
        ...pred,
        delayProbability: Math.max(pred.delayProbability - 15, 5),
        estimatedDelay: Math.max(pred.estimatedDelay - 2, 0),
      })),
    )
  }

  return {
    predictions,
    optimizations,
    metrics,
    insights,
    isAnalyzing,
    runAnalysis,
    applyOptimization,
  }
}
