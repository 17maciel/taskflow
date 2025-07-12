"use client"

import { useState, useEffect } from "react"
import { getPlanById, type Plan, type PlanLimits } from "@/types/plans"
import { createClient } from "@/lib/supabase/client" // Importar o cliente Supabase do cliente

interface UsePlanLimitsReturn {
  currentPlan: Plan | null
  limits: PlanLimits | null
  isTrialActive: boolean
  canCreateProject: boolean
  canAddUser: boolean
  canUseAI: boolean
  canUseIntegrations: boolean
  canUseAdvancedReports: boolean
  canUseWhatsApp: boolean
  remainingProjects: number
  remainingUsers: number
  remainingAIPredictions: number
  checkLimit: (feature: keyof PlanLimits) => boolean
  upgradeRequired: (feature: keyof PlanLimits) => boolean
}

export function usePlanLimits(): UsePlanLimitsReturn {
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)
  const [limits, setLimits] = useState<PlanLimits | null>(null)
  const [isTrialActive, setIsTrialActive] = useState(false)
  const supabase = createClient()

  // Estado para armazenar o uso real do usuário
  const [currentUsage, setCurrentUsage] = useState({
    users: 0,
    projects: 0,
    aiPredictionsThisMonth: 0,
    storageUsed: 0, // em MB
  })

  useEffect(() => {
    const fetchUserPlanAndUsage = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Fetch user profile data from 'profiles' table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("plan_id, trial_ends_at, ai_predictions_this_month, current_projects, current_users, storage_used_mb") // Adicione as colunas de uso real
          .eq("id", user.id)
          .single()

        if (profileError || !profile) {
          console.error("Error fetching user profile:", profileError?.message)
          // Fallback to free plan if profile not found
          setCurrentPlan(getPlanById("free")!)
          setLimits(getPlanById("free")!.limits)
          setIsTrialActive(false)
          return
        }

        const userPlanId = profile.plan_id || "free"
        const trialEndsAtString = profile.trial_ends_at as string | undefined
        const trialEndsAt = trialEndsAtString ? new Date(trialEndsAtString) : null

        const activePlan = getPlanById(userPlanId) || getPlanById("free")!

        const trialIsCurrentlyActive = trialEndsAt ? new Date() < trialEndsAt : false
        setIsTrialActive(trialIsCurrentlyActive)

        if (trialIsCurrentlyActive) {
          setCurrentPlan(activePlan)
          setLimits(activePlan.limits)
        } else {
          setCurrentPlan(activePlan) // Usa o plano do perfil (pago ou free)
          setLimits(activePlan.limits)
        }

        // Atualiza o estado de uso com os dados reais do perfil
        setCurrentUsage({
          users: profile.current_users || 0,
          projects: profile.current_projects || 0,
          aiPredictionsThisMonth: profile.ai_predictions_this_month || 0,
          storageUsed: profile.storage_used_mb || 0,
        })
      } else {
        // Usuário não logado, usa limites do plano gratuito
        setCurrentPlan(getPlanById("free")!)
        setLimits(getPlanById("free")!.limits)
        setIsTrialActive(false)
        setCurrentUsage({ users: 0, projects: 0, aiPredictionsThisMonth: 0, storageUsed: 0 })
      }
    }

    fetchUserPlanAndUsage()

    // Opcional: Adicionar um listener para mudanças no auth ou no perfil do usuário
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserPlanAndUsage() // Re-fetch when auth state changes
      }
    })

    return () => {
      authListener?.unsubscribe()
    }
  }, [supabase])

  const checkLimit = (feature: keyof PlanLimits): boolean => {
    if (!limits) return false

    switch (feature) {
      case "users":
        return limits.users === -1 || currentUsage.users < limits.users
      case "projects":
        return limits.projects === -1 || currentUsage.projects < limits.projects
      case "aiPredictions":
        return limits.aiPredictions === -1 || currentUsage.aiPredictionsThisMonth < limits.aiPredictions
      case "integrations":
        return limits.integrations
      case "advancedReports":
        return limits.advancedReports
      case "whatsappIntegration":
        return limits.whatsappIntegration
      case "customTemplates":
        return limits.customTemplates
      default:
        return true
    }
  }

  const upgradeRequired = (feature: keyof PlanLimits): boolean => {
    return !checkLimit(feature)
  }

  const canCreateProject = checkLimit("projects")
  const canAddUser = checkLimit("users")
  const canUseAI = checkLimit("aiPredictions")
  const canUseIntegrations = checkLimit("integrations")
  const canUseAdvancedReports = checkLimit("advancedReports")
  const canUseWhatsApp = checkLimit("whatsappIntegration")

  const remainingProjects = limits?.projects === -1 ? -1 : Math.max(0, (limits?.projects || 0) - currentUsage.projects)

  const remainingUsers = limits?.users === -1 ? -1 : Math.max(0, (limits?.users || 0) - currentUsage.users)

  const remainingAIPredictions =
    limits?.aiPredictions === -1 ? -1 : Math.max(0, (limits?.aiPredictions || 0) - currentUsage.aiPredictionsThisMonth)

  return {
    currentPlan,
    limits,
    isTrialActive,
    canCreateProject,
    canAddUser,
    canUseAI,
    canUseIntegrations,
    canUseAdvancedReports,
    canUseWhatsApp,
    remainingProjects,
    remainingUsers,
    remainingAIPredictions,
    checkLimit,
    upgradeRequired,
  }
}
