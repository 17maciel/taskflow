"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Users, FolderOpen, HardDrive, Zap } from "lucide-react"
import { PLANS, formatLimit } from "@/types/plans"

interface PlanSelectorProps {
  selectedPlan: string
  onPlanSelect: (planId: string) => void
}

export function PlanSelector({ selectedPlan, onPlanSelect }: PlanSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Escolha seu Plano</h3>
        <p className="text-sm text-gray-600">Selecione o plano que melhor atende suas necessidades</p>
      </div>

      <div className="grid gap-4 max-h-96 overflow-y-auto">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedPlan === plan.id ? "border-blue-500 border-2 bg-blue-50" : plan.popular ? "border-blue-300" : ""
            }`}
            onClick={() => onPlanSelect(plan.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {plan.name}
                    {plan.popular && <Badge className="bg-blue-600 text-xs">Mais Popular</Badge>}
                  </CardTitle>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold">R$ {plan.price}</span>
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  </div>
                </div>
                {selectedPlan === plan.id && <CheckCircle className="w-6 h-6 text-blue-600" />}
              </div>
              <CardDescription className="text-sm">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Limites principais */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-gray-500" />
                    <span>{formatLimit(plan.limits.users)} usuários</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-3 h-3 text-gray-500" />
                    <span>{formatLimit(plan.limits.projects)} projetos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3 h-3 text-gray-500" />
                    <span>{plan.limits.storage} storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-gray-500" />
                    <span>{formatLimit(plan.limits.aiPredictions)} IA/mês</span>
                  </div>
                </div>

                {/* Recursos principais */}
                <div className="space-y-1">
                  {plan.limits.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.limits.features.length > 3 && (
                    <p className="text-xs text-gray-500">+{plan.limits.features.length - 3} recursos adicionais</p>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-600">
                    <strong>Suporte:</strong> {plan.limits.support}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">Você pode alterar seu plano a qualquer momento após o cadastro</p>
      </div>
    </div>
  )
}
