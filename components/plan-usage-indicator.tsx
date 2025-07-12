"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, FolderOpen, Zap, HardDrive, TrendingUp } from "lucide-react"
import { usePlanLimits } from "@/hooks/use-plan-limits"
import { formatLimit } from "@/types/plans"
import { useState, useEffect } from "react"
import { getAiUsage } from "@/actions/ai-usage"
import { createClient } from "@/lib/supabase/client" // Use this
import { useRouter } from "next/navigation"
import { UpgradeDialog } from "./upgrade-dialog"

interface PlanUsageIndicatorProps {
  planId: string
  trialEndsAt: string | null
}

export function PlanUsageIndicator({ planId, trialEndsAt }: PlanUsageIndicatorProps) {
  const { currentPlan, limits, remainingProjects, remainingUsers, remainingAIPredictions, upgradeRequired } =
    usePlanLimits()

  const [aiUsage, setAiUsage] = useState(0)
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const supabase = createClient() // Use the new client creation
  const router = useRouter()

  const aiLimit = currentPlan?.limits.ai_predictions || 0

  const isTrial = planId !== "free" && trialEndsAt && new Date(trialEndsAt) > new Date()
  const daysLeft = isTrial
    ? Math.ceil((new Date(trialEndsAt!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  useEffect(() => {
    const fetchUsage = async () => {
      if (!supabase) {
        // Check if supabase client is null
        console.error("Supabase client not initialized for usage indicator.")
        return
      }
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { usage_count, error } = await getAiUsage(user.id)
        if (!error) {
          setAiUsage(usage_count)
        } else {
          console.error("Failed to fetch AI usage:", error)
        }
      }
    }

    fetchUsage()

    // Set up real-time listener for AI usage if needed
    // This part would require more complex setup with Supabase real-time
    // For now, we'll just fetch on mount.
  }, [supabase]) // Add supabase to dependency array

  const usageData = [
    {
      icon: Users,
      label: "Usuários",
      current: limits?.users || 0, // Vem do mockUserData
      limit: limits?.users || 0,
      remaining: remainingUsers,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: FolderOpen,
      label: "Projetos",
      current: limits?.projects || 0, // Vem do mockUserData
      limit: limits?.projects || 0,
      remaining: remainingProjects,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Zap,
      label: "IA/Mês",
      current: aiUsage,
      limit: aiLimit,
      remaining: remainingAIPredictions,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  const getProgressValue = (current: number, limit: number) => {
    if (limit === -1) return 0 // Ilimitado
    return (current / limit) * 100
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 75) return "bg-yellow-500"
    return "bg-blue-500"
  }

  const handleUpgradeClick = (feature: string, description: string) => {
    setIsUpgradeDialogOpen(true)
  }

  return (
    <>
      <Card className="w-full bg-gray-800 text-white border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Uso do Plano
              </CardTitle>
              <CardDescription>
                Plano atual: <strong>{currentPlan?.name}</strong>
              </CardDescription>
            </div>
            <Badge variant={currentPlan?.popular ? "default" : "secondary"}>{currentPlan?.name}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {usageData.map((item, index) => {
            const percentage = getProgressValue(item.current, item.limit)
            const isNearLimit = percentage >= 75 && item.limit !== -1
            const isOverLimit = percentage >= 100

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {item.current} / {formatLimit(item.limit)}
                    </span>
                    {item.remaining !== -1 && <p className="text-xs text-gray-500">{item.remaining} restantes</p>}
                  </div>
                </div>

                {item.limit !== -1 && (
                  <div className="space-y-1">
                    <Progress value={percentage} className="h-2 bg-gray-700 [&>*]:bg-blue-500" />
                    {isNearLimit && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-orange-600">
                          {isOverLimit ? "Limite excedido" : "Próximo do limite"}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs bg-transparent"
                          onClick={() =>
                            handleUpgradeClick(
                              item.label,
                              `Você está usando ${item.current} de ${item.limit} ${item.label.toLowerCase()}`,
                            )
                          }
                        >
                          Upgrade
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Storage Usage */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <HardDrive className="w-4 h-4 text-gray-600" />
                </div>
                <span className="font-medium">Armazenamento</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">15GB / {limits?.storage}</span>
                <p className="text-xs text-gray-500">30% usado</p>
              </div>
            </div>
            <Progress value={30} className="h-2 bg-gray-700 [&>*]:bg-blue-500" />
          </div>

          {/* Upgrade CTA */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Precisa de mais recursos?</p>
                <p className="text-sm text-gray-600">Faça upgrade para desbloquear mais funcionalidades</p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsUpgradeDialogOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
              >
                Ver Planos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <UpgradeDialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen} currentPlanId={planId} />
    </>
  )
}
