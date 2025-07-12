"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client" // USE THIS
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)

  const supabase = createClient() // Use the new client creation
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!supabase) {
      // Check if supabase client is null
      toast({
        title: "Erro de configuração",
        description: "O cliente Supabase não foi inicializado. Verifique suas variáveis de ambiente.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!supabase) {
      // Check if supabase client is null
      toast({
        title: "Erro de configuração",
        description: "O cliente Supabase não foi inicializado. Verifique suas variáveis de ambiente.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      })
      setIsResetMode(false)
      setEmail("")
    } catch (error: any) {
      toast({
        title: "Erro ao enviar e-mail",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-2xl font-bold">{isResetMode ? "Redefinir senha" : "Entrar na sua conta"}</h1>
            <p className="text-gray-600">
              {isResetMode
                ? "Digite seu e-mail para receber as instruções"
                : "Entre com suas credenciais para acessar o dashboard"}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="p-8 shadow-xl">
          <form onSubmit={isResetMode ? handleResetPassword : handleLogin} className="space-y-6">
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

            {!isResetMode && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-700">
              {loading ? (isResetMode ? "Enviando..." : "Entrando...") : isResetMode ? "Enviar Instruções" : "Entrar"}
            </Button>

            <div className="text-center space-y-2">
              {!isResetMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsResetMode(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Esqueceu sua senha?
                  </button>
                  <div className="text-sm text-gray-600">
                    Não tem uma conta?{" "}
                    <Link href="/cadastro" className="text-blue-600 hover:underline font-medium">
                      Criar conta gratuita
                    </Link>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsResetMode(false)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Voltar para o login
                </button>
              )}
            </div>
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
