"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, AlertCircle } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const supabase = createClientComponentClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Erro ao verificar sessão:", error)
          setIsValidSession(false)
        } else if (session) {
          setIsValidSession(true)
        } else {
          setIsValidSession(false)
        }
      } catch (error) {
        console.error("Erro inesperado:", error)
        setIsValidSession(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkSession()
  }, [supabase.auth])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      toast({
        title: "Senha redefinida com sucesso!",
        description: "Você será redirecionado para o dashboard.",
      })

      // Redirecionar para o dashboard após sucesso
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      toast({
        title: "Erro ao redefinir senha",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sessão...</p>
        </Card>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <Link href="/home" className="inline-flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">TaskFlow</span>
            </Link>
          </div>

          <Card className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">Link Inválido</h1>
            <p className="text-gray-600">
              Este link de redefinição de senha é inválido ou expirou. Solicite um novo link de redefinição.
            </p>
            <div className="space-y-2">
              <Link href="/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Solicitar Nova Redefinição</Button>
              </Link>
              <Link href="/home">
                <Button variant="outline" className="w-full bg-transparent">
                  Voltar para Home
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link href="/home" className="inline-flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">TaskFlow</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Redefinir Senha</h1>
            <p className="text-gray-600">Digite sua nova senha</p>
          </div>
        </div>

        {/* Form */}
        <Card className="p-8 shadow-xl">
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
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
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-700">
              {loading ? "Redefinindo..." : "Redefinir Senha"}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <Link href="/home" className="hover:text-blue-600">
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}
