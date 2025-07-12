"use client"

import type React from "react"

import { createContext, useContext, useEffect } from "react"
import { useNotifications } from "@/hooks/use-notifications"

const NotificationContext = createContext<ReturnType<typeof useNotifications> | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const notifications = useNotifications()

  // Simular verificação periódica de condições
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular dados de projeto para verificação
      const mockProjectData = {
        projectId: "proj-1",
        taskId: "task-1",
        taskName: "Desenvolvimento Backend",
        userId: "user-1",
        daysLate: Math.floor(Math.random() * 5),
        isCritical: Math.random() > 0.7,
        daysUntilMilestone: Math.floor(Math.random() * 5),
        milestoneName: "Entrega MVP",
        utilizationPercent: 80 + Math.random() * 40,
        resourceName: "João Silva",
        estimatedDelay: Math.floor(Math.random() * 7),
        projectName: "Sistema E-commerce",
      }

      // Verificar condições apenas ocasionalmente para não spam
      if (Math.random() > 0.9) {
        notifications.checkConditions(mockProjectData)
      }
    }, 30000) // Verificar a cada 30 segundos

    return () => clearInterval(interval)
  }, [notifications])

  return <NotificationContext.Provider value={notifications}>{children}</NotificationContext.Provider>
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider")
  }
  return context
}
