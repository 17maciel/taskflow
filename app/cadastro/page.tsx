"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client" // USE THIS
import { useRouter, useSearchParams } from "next/navigation"
import { PLANS } from "@/types/plans"
import { createStripeCheckoutSession } from "@/actions/stripe"
import { toast } from "@/components/ui/use-toast"

export default function CadastroPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("free")

  const supabase = createClient() // Use the new client creation
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pegar plano da URL se fornecido
  useState(() => {
    const planFromUrl = searchParams.get("plan")
    if (planFromUrl && PLANS.find((p) => p.id === planFromUrl)) {
      setSelectedPlan(planFromUrl)
    }
  }, [searchParams])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supabase) {
      // Check if supabase client is null
      toast({
        title: "Erro de configuração",
        description: "O cliente Supabase não foi inicializado. Verifique suas variáveis de ambiente.",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Erro no cadastro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            plan_id: selectedPlan,
            trial_ends_at:
              selectedPlan !== "free" ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() : null,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description:
            selectedPlan === "free" ? "Redirecionando para o dashboard..." : "Redirecionando para o pagamento...",
        })

        if (selectedPlan !== "free") {
          await handleStripeCheckout(data.user.id, selectedPlan, email)
        } else {
          router.push("/dashboard")
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStripeCheckout = async (userId: string, planId: string, userEmail: string) => {
    try {
      const { url, error } = await createStripeCheckoutSession(planId, userId, userEmail)

      if (error) {
        toast({
          title: "Erro no pagamento",
          description: error,
          variant: "destructive",
        })
      } else if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Erro no checkout:", error)
      toast({
        title: "Erro inesperado",
        description: "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan) || PLANS[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/home" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">TaskFlow</span>
          </Link>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Já tem uma conta?</span>
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-2 ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  1
                </div>
                <span className="font-medium">Escolher Plano</span>
              </div>
              <div className={`w-16 h-0.5 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
              <div className={`flex items-center space-x-2 ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  2
                </div>
                <span className="font-medium">Criar Conta</span>
              </div>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-3xl lg:text-4xl font-bold">Escolha seu plano</h1>
                <p className="text-xl text-gray-600">Comece grátis e escale conforme sua equipe cresce</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {PLANS.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedPlan === plan.id
                        ? "border-2 border-blue-500 shadow-xl bg-gradient-to-b from-blue-50 to-white"
                        : "border shadow-lg hover:shadow-xl"
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.id === "professional" && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                        Mais Popular
                      </Badge>
                    )}

                    {selectedPlan === plan.id && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <p className="text-gray-600">{plan.description}</p>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">{plan.price === 0 ? "Grátis" : `R$${plan.price}`}</span>
                        {plan.price !== 0 && <span className="text-gray-500">/mês</span>}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {plan.limits.features.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center">
                <Button onClick={() => setStep(2)} size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
                  Continuar com {selectedPlanData.name}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-3xl lg:text-4xl font-bold">Criar sua conta</h1>
                <p className="text-xl text-gray-600">
                  Plano selecionado: <span className="font-semibold text-blue-600">{selectedPlanData.name}</span>
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Formulário */}
                <Card className="p-8">
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirme sua senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                      </Button>
                      <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        {loading ? "Criando conta..." : "Criar Conta"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-xs text-center text-gray-500">
                      Ao criar uma conta, você concorda com nossos{" "}
                      <Link href="#" className="text-blue-600 hover:underline">
                        Termos de Uso
                      </Link>{" "}
                      e{" "}
                      <Link href="#" className="text-blue-600 hover:underline">
                        Política de Privacidade
                      </Link>
                    </p>
                  </form>
                </Card>

                {/* Resumo do Plano */}
                <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-bold text-blue-900">Resumo do Plano</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold">{selectedPlanData.name}</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-blue-600">
                          {selectedPlanData.price === 0 ? "Grátis" : `R$${selectedPlanData.price}`}
                        </span>
                        {selectedPlanData.price !== 0 && <span className="text-gray-600">/mês</span>}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Incluído no plano:</h4>
                      <ul className="space-y-2">
                        {selectedPlanData.limits.features.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start space-x-3">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedPlanData.price !== 0 && (
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center space-x-2 text-green-600 mb-2">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-semibold">Teste grátis por 15 dias</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Você pode cancelar a qualquer momento durante o período de teste sem cobrança.
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Alterar plano
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
