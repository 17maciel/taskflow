"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Zap, ArrowRight } from "lucide-react"
import { PLANS } from "@/types/plans"

interface UpgradeDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  currentPlanId: string
  feature: string
  featureDescription: string
}

export function UpgradeDialog({
  isOpen,
  onOpenChange,
  currentPlanId,
  feature,
  featureDescription,
}: UpgradeDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("")

  const currentPlan = PLANS.find((p) => p.id === currentPlanId)
  const availableUpgrades = PLANS.filter((p) => {
    const currentIndex = PLANS.findIndex((plan) => plan.id === currentPlanId)
    const planIndex = PLANS.findIndex((plan) => plan.id === p.id)
    return planIndex > currentIndex
  })

  const handleUpgrade = () => {
    if (selectedPlan) {
      // Aqui você implementaria a lógica de upgrade
      console.log(`Upgrading to plan: ${selectedPlan}`)
      alert(`Upgrade para ${PLANS.find((p) => p.id === selectedPlan)?.name} iniciado!`)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Upgrade Necessário
          </DialogTitle>
          <DialogDescription>
            Para usar <strong>{feature}</strong>, você precisa fazer upgrade do seu plano atual.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Plan */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Seu Plano Atual</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{currentPlan?.name}</p>
                <p className="text-sm text-gray-600">{featureDescription}</p>
              </div>
              <Badge variant="outline">Atual</Badge>
            </div>
          </div>

          {/* Available Upgrades */}
          <div>
            <h4 className="font-semibold mb-4">Planos Disponíveis</h4>
            <div className="grid gap-4">
              {availableUpgrades.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPlan === plan.id
                      ? "border-blue-500 border-2 bg-blue-50"
                      : plan.popular
                        ? "border-blue-300"
                        : ""
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {plan.name}
                          {plan.popular && <Badge className="bg-blue-600 text-xs">Recomendado</Badge>}
                        </CardTitle>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-bold">R$ {plan.price}</span>
                          <span className="text-gray-500 text-sm">{plan.period}</span>
                        </div>
                      </div>
                      {selectedPlan === plan.id && <CheckCircle className="w-6 h-6 text-blue-600" />}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {plan.limits.features.slice(0, 4).map((planFeature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>{planFeature}</span>
                        </div>
                      ))}
                      {plan.limits.features.length > 4 && (
                        <p className="text-xs text-gray-500">+{plan.limits.features.length - 4} recursos adicionais</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleUpgrade} disabled={!selectedPlan} className="flex-1">
              Fazer Upgrade
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">Você pode cancelar ou alterar seu plano a qualquer momento</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
