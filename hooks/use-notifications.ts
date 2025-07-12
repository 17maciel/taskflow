"use client"

import { useState, useEffect, useCallback } from "react"

interface NotificationRule {
  id: string
  name: string
  type: "delay" | "milestone" | "critical" | "resource" | "deadline"
  conditions: {
    field: string
    operator: ">" | "<" | "=" | ">=" | "<=" | "!="
    value: string | number
  }[]
  channels: ("email" | "push" | "sms" | "slack")[]
  recipients: string[]
  active: boolean
  frequency: "immediate" | "daily" | "weekly"
}

interface NotificationEvent {
  id: string
  type: string
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  projectId: string
  taskId?: string
  userId: string
  metadata?: Record<string, any>
  timestamp: Date
}

interface UseNotificationsReturn {
  notifications: NotificationEvent[]
  rules: NotificationRule[]
  unreadCount: number
  addNotification: (notification: Omit<NotificationEvent, "id" | "timestamp">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  createRule: (rule: Omit<NotificationRule, "id">) => void
  updateRule: (id: string, rule: Partial<NotificationRule>) => void
  deleteRule: (id: string) => void
  checkConditions: (data: any) => void
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationEvent[]>([])
  const [rules, setRules] = useState<NotificationRule[]>([])
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set())

  // Carregar dados iniciais
  useEffect(() => {
    // Aqui você carregaria as notificações e regras do backend
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    // Simular carregamento de dados
    const initialRules: NotificationRule[] = [
      {
        id: "rule-1",
        name: "Atrasos Críticos",
        type: "delay",
        conditions: [
          { field: "daysLate", operator: ">=", value: 1 },
          { field: "isCritical", operator: "=", value: true },
        ],
        channels: ["email", "push"],
        recipients: ["manager@company.com"],
        active: true,
        frequency: "immediate",
      },
      {
        id: "rule-2",
        name: "Marcos Próximos",
        type: "milestone",
        conditions: [{ field: "daysUntilMilestone", operator: "<=", value: 2 }],
        channels: ["email"],
        recipients: ["team@company.com"],
        active: true,
        frequency: "daily",
      },
    ]

    setRules(initialRules)
  }

  // Adicionar nova notificação
  const addNotification = useCallback((notification: Omit<NotificationEvent, "id" | "timestamp">) => {
    const newNotification: NotificationEvent = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    setNotifications((prev) => [newNotification, ...prev])

    // Enviar notificação através dos canais configurados
    sendNotification(newNotification)
  }, [])

  // Marcar como lida
  const markAsRead = useCallback((id: string) => {
    setReadNotifications((prev) => new Set([...prev, id]))
  }, [])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id)
    setReadNotifications(new Set(allIds))
  }, [notifications])

  // Deletar notificação
  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setReadNotifications((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }, [])

  // Criar nova regra
  const createRule = useCallback((rule: Omit<NotificationRule, "id">) => {
    const newRule: NotificationRule = {
      ...rule,
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    setRules((prev) => [...prev, newRule])
  }, [])

  // Atualizar regra
  const updateRule = useCallback((id: string, updates: Partial<NotificationRule>) => {
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule)))
  }, [])

  // Deletar regra
  const deleteRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id))
  }, [])

  // Verificar condições e disparar notificações
  const checkConditions = useCallback(
    (data: any) => {
      rules
        .filter((rule) => rule.active)
        .forEach((rule) => {
          const conditionsMet = rule.conditions.every((condition) => {
            const fieldValue = data[condition.field]
            switch (condition.operator) {
              case ">":
                return fieldValue > condition.value
              case "<":
                return fieldValue < condition.value
              case ">=":
                return fieldValue >= condition.value
              case "<=":
                return fieldValue <= condition.value
              case "=":
                return fieldValue === condition.value
              case "!=":
                return fieldValue !== condition.value
              default:
                return false
            }
          })

          if (conditionsMet) {
            // Criar notificação baseada na regra
            const notification: Omit<NotificationEvent, "id" | "timestamp"> = {
              type: rule.type,
              title: generateNotificationTitle(rule.type, data),
              description: generateNotificationDescription(rule.type, data),
              severity: determineSeverity(rule.type, data),
              projectId: data.projectId || "",
              taskId: data.taskId,
              userId: data.userId || "",
              metadata: data,
            }

            addNotification(notification)
          }
        })
    },
    [rules, addNotification],
  )

  // Enviar notificação através dos canais
  const sendNotification = async (notification: NotificationEvent) => {
    const applicableRules = rules.filter((rule) => rule.active && rule.type === notification.type)

    for (const rule of applicableRules) {
      for (const channel of rule.channels) {
        try {
          switch (channel) {
            case "email":
              await sendEmailNotification(notification, rule.recipients)
              break
            case "push":
              await sendPushNotification(notification, rule.recipients)
              break
            case "sms":
              await sendSMSNotification(notification, rule.recipients)
              break
            case "slack":
              await sendSlackNotification(notification, rule.recipients)
              break
          }
        } catch (error) {
          console.error(`Failed to send ${channel} notification:`, error)
        }
      }
    }
  }

  // Funções auxiliares para gerar conteúdo das notificações
  const generateNotificationTitle = (type: string, data: any): string => {
    switch (type) {
      case "delay":
        return `Tarefa em Atraso: ${data.taskName || "Tarefa"}`
      case "milestone":
        return `Marco Próximo: ${data.milestoneName || "Marco"}`
      case "critical":
        return `Tarefa Crítica: ${data.taskName || "Tarefa"}`
      case "resource":
        return `Conflito de Recursos: ${data.resourceName || "Recurso"}`
      case "deadline":
        return `Prazo em Risco: ${data.projectName || "Projeto"}`
      default:
        return "Notificação do Sistema"
    }
  }

  const generateNotificationDescription = (type: string, data: any): string => {
    switch (type) {
      case "delay":
        return `A tarefa está ${data.daysLate || 0} dias atrasada e pode impactar o cronograma`
      case "milestone":
        return `O marco está previsto para ${data.daysUntilMilestone || 0} dias e requer atenção`
      case "critical":
        return `A tarefa se tornou crítica e qualquer atraso impactará o projeto`
      case "resource":
        return `O recurso está ${data.utilizationPercent || 0}% utilizado, acima da capacidade`
      case "deadline":
        return `O projeto pode atrasar ${data.estimatedDelay || 0} dias baseado no progresso atual`
      default:
        return "Verifique os detalhes no sistema"
    }
  }

  const determineSeverity = (type: string, data: any): "low" | "medium" | "high" | "critical" => {
    switch (type) {
      case "delay":
        if (data.isCritical && data.daysLate >= 3) return "critical"
        if (data.daysLate >= 2) return "high"
        if (data.daysLate >= 1) return "medium"
        return "low"
      case "milestone":
        if (data.daysUntilMilestone <= 1) return "high"
        if (data.daysUntilMilestone <= 2) return "medium"
        return "low"
      case "critical":
        return "critical"
      case "resource":
        if (data.utilizationPercent >= 120) return "critical"
        if (data.utilizationPercent >= 100) return "high"
        return "medium"
      case "deadline":
        if (data.estimatedDelay >= 5) return "critical"
        if (data.estimatedDelay >= 3) return "high"
        if (data.estimatedDelay >= 1) return "medium"
        return "low"
      default:
        return "medium"
    }
  }

  // Funções de envio por canal (simuladas)
  const sendEmailNotification = async (notification: NotificationEvent, recipients: string[]) => {
    console.log("Sending email notification:", notification.title, "to:", recipients)
    // Implementar integração com serviço de email
  }

  const sendPushNotification = async (notification: NotificationEvent, recipients: string[]) => {
    console.log("Sending push notification:", notification.title, "to:", recipients)
    // Implementar integração com serviço de push
  }

  const sendSMSNotification = async (notification: NotificationEvent, recipients: string[]) => {
    console.log("Sending SMS notification:", notification.title, "to:", recipients)
    // Implementar integração com serviço de SMS
  }

  const sendSlackNotification = async (notification: NotificationEvent, recipients: string[]) => {
    console.log("Sending Slack notification:", notification.title, "to:", recipients)
    // Implementar integração com Slack
  }

  // Calcular contagem de não lidas
  const unreadCount = notifications.filter((n) => !readNotifications.has(n.id)).length

  return {
    notifications,
    rules,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createRule,
    updateRule,
    deleteRule,
    checkConditions,
  }
}
