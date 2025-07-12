"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell, X, AlertTriangle, CheckCircle, Clock, Target, Users, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NotificacaoToast {
  id: string
  tipo: "atraso" | "marco" | "critica" | "recurso" | "prazo" | "aprovacao"
  titulo: string
  descricao: string
  severidade: "baixa" | "media" | "alta" | "critica"
  dataCreated: Date
  autoClose?: boolean
  duration?: number
}

interface NotificationSystemProps {
  className?: string
}

// Simulação de notificações em tempo real
const notificacoesSimuladas: NotificacaoToast[] = [
  {
    id: "toast-1",
    tipo: "atraso",
    titulo: "Tarefa Atrasada",
    descricao: "Desenvolvimento Backend está 2 dias atrasado",
    severidade: "alta",
    dataCreated: new Date(),
    autoClose: false,
  },
  {
    id: "toast-2",
    tipo: "marco",
    titulo: "Marco Próximo",
    descricao: "Entrega MVP em 1 dia",
    severidade: "media",
    dataCreated: new Date(),
    autoClose: true,
    duration: 5000,
  },
]

export function NotificationSystem({ className }: NotificationSystemProps) {
  const [notificacoes, setNotificacoes] = useState<NotificacaoToast[]>([])
  const [notificacoesRecentes, setNotificacoesRecentes] = useState<NotificacaoToast[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Simular chegada de novas notificações
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular nova notificação aleatoriamente
      if (Math.random() > 0.95) {
        const novaNotificacao: NotificacaoToast = {
          id: `toast-${Date.now()}`,
          tipo: ["atraso", "marco", "critica", "recurso"][Math.floor(Math.random() * 4)] as any,
          titulo: "Nova Notificação",
          descricao: "Descrição da notificação simulada",
          severidade: ["baixa", "media", "alta", "critica"][Math.floor(Math.random() * 4)] as any,
          dataCreated: new Date(),
          autoClose: true,
          duration: 5000,
        }
        adicionarNotificacao(novaNotificacao)
      }
    }, 10000) // Verificar a cada 10 segundos

    return () => clearInterval(interval)
  }, [])

  // Adicionar notificação
  const adicionarNotificacao = (notificacao: NotificacaoToast) => {
    setNotificacoes((prev) => [notificacao, ...prev])
    setNotificacoesRecentes((prev) => [notificacao, ...prev.slice(0, 9)]) // Manter apenas 10 recentes

    // Auto-close se configurado
    if (notificacao.autoClose && notificacao.duration) {
      setTimeout(() => {
        removerNotificacao(notificacao.id)
      }, notificacao.duration)
    }

    // Reproduzir som de notificação (opcional)
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notificacao.titulo, {
        body: notificacao.descricao,
        icon: "/favicon.ico",
      })
    }
  }

  // Remover notificação
  const removerNotificacao = (id: string) => {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id))
  }

  // Limpar todas as notificações
  const limparTodas = () => {
    setNotificacoes([])
  }

  // Marcar todas como lidas
  const marcarTodasComoLidas = () => {
    setNotificacoesRecentes([])
  }

  // Obter ícone por tipo
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "atraso":
        return Clock
      case "marco":
        return Target
      case "critica":
        return AlertTriangle
      case "recurso":
        return Users
      case "prazo":
        return Calendar
      case "aprovacao":
        return CheckCircle
      default:
        return Bell
    }
  }

  // Obter cor por severidade
  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
      case "critica":
        return "text-red-600 bg-red-50 border-red-200"
      case "alta":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "media":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "baixa":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const totalNaoLidas = notificacoesRecentes.length

  return (
    <div className={cn("relative", className)}>
      {/* Notificações Toast */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notificacoes.slice(0, 3).map((notificacao) => {
          const TipoIcon = getTipoIcon(notificacao.tipo)
          return (
            <Alert
              key={notificacao.id}
              className={cn(
                "shadow-lg border-l-4 animate-in slide-in-from-right duration-300",
                getSeveridadeColor(notificacao.severidade),
              )}
            >
              <TipoIcon className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                <span>{notificacao.titulo}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => removerNotificacao(notificacao.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </AlertTitle>
              <AlertDescription>{notificacao.descricao}</AlertDescription>
            </Alert>
          )
        })}
      </div>

      {/* Botão de Notificações */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {totalNaoLidas > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {totalNaoLidas > 9 ? "9+" : totalNaoLidas}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Notificações</h3>
              {totalNaoLidas > 0 && (
                <Button variant="ghost" size="sm" onClick={marcarTodasComoLidas}>
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="h-96">
            {notificacoesRecentes.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma notificação recente</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notificacoesRecentes.map((notificacao) => {
                  const TipoIcon = getTipoIcon(notificacao.tipo)
                  return (
                    <div key={notificacao.id} className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            getSeveridadeColor(notificacao.severidade),
                          )}
                        >
                          <TipoIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{notificacao.titulo}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{notificacao.descricao}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(notificacao.dataCreated, "HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          {notificacoesRecentes.length > 0 && (
            <div className="p-3 border-t">
              <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={() => setIsOpen(false)}>
                Ver todas as notificações
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
