export interface PlanLimits {
  users: number
  projects: number
  storage: string // em GB
  features: string[]
  support: string
  aiPredictions: number // por mês
  integrations: boolean
  customTemplates: boolean
  advancedReports: boolean
  whatsappIntegration: boolean
}

export interface Plan {
  id: string
  name: string
  price: number
  period?: string
  description: string
  popular?: boolean
  limits: PlanLimits
  stripePriceId?: string // Adicionado para integração com Stripe
}

export const PLANS: readonly Plan[] = [
  {
    id: "free",
    name: "Grátis",
    price: 0,
    description: "Experimente o básico para começar",
    limits: {
      users: 1,
      projects: 1,
      storage: "200MB",
      features: ["Kanban básico", "Relatórios simples", "1 usuário", "1 projeto"],
      support: "Comunidade",
      aiPredictions: 5,
      integrations: false,
      customTemplates: false,
      advancedReports: false,
      whatsappIntegration: false,
    },
    // Não há stripePriceId para o plano gratuito, pois não há pagamento
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    period: "/mês",
    description: "Perfeito para pequenas equipes",
    popular: false,
    limits: {
      users: 5,
      projects: 3,
      storage: "5GB",
      features: ["Kanban básico", "Relatórios simples", "Suporte por email", "Templates básicos"],
      support: "Email (48h)",
      aiPredictions: 10,
      integrations: false,
      customTemplates: false,
      advancedReports: false,
      whatsappIntegration: false,
    },
    stripePriceId: "price_1RbKMxDHQEwVfpSeuphpEeKA", // <<< SUBSTITUA PELO SEU ID REAL DO STRIPE
  },
  {
    id: "professional",
    name: "Professional",
    price: 79,
    period: "/mês",
    description: "Ideal para empresas em crescimento",
    popular: true,
    limits: {
      users: 25,
      projects: -1, // ilimitado
      storage: "50GB",
      features: ["Gantt avançado", "IA para previsões", "Relatórios avançados", "25 usuários", "Projetos ilimitados"],
      support: "Chat e Email (24h)",
      aiPredictions: 50,
      integrations: true,
      customTemplates: true,
      advancedReports: true,
      whatsappIntegration: false,
    },
    stripePriceId: "price_1RjkLaDHQEwVfpSePKcx5veS", // <<< SUBSTITUA PELO SEU ID REAL DO STRIPE
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    period: "/mês",
    description: "Para grandes organizações",
    limits: {
      users: -1, // ilimitado
      projects: -1, // ilimitado
      storage: "500GB",
      features: ["Recursos completos", "IA completa", "Suporte 24/7", "Usuários ilimitados", "API personalizada"],
      support: "Telefone, Chat e Email (2h)",
      aiPredictions: 500,
      integrations: true,
      customTemplates: true,
      advancedReports: true,
      whatsappIntegration: true,
    },
    stripePriceId: "price_1RjkNaDHQEwVfpSeIhL50Vof", // <<< SUBSTITUA PELO SEU ID REAL DO STRIPE
  },
]

export function getPlanById(planId: string): Plan | undefined {
  return PLANS.find((plan) => plan.id === planId)
}

export function formatLimit(limit: number): string {
  return limit === -1 ? "Ilimitado" : limit.toString()
}
