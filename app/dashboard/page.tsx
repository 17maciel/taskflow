"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckSquare, Users, AlertTriangle, Calendar, FolderOpen, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const dashboardStats = [
  {
    title: "Tarefas Ativas",
    value: "127",
    change: "+12%",
    icon: CheckSquare,
    color: "text-blue-600",
  },
  {
    title: "Projetos em Andamento",
    value: "8",
    change: "+2",
    icon: FolderOpen,
    color: "text-green-600",
  },
  {
    title: "Colaboradores Ativos",
    value: "24",
    change: "+3",
    icon: Users,
    color: "text-purple-600",
  },
  {
    title: "Tarefas Atrasadas",
    value: "5",
    change: "-2",
    icon: AlertTriangle,
    color: "text-red-600",
  },
]

const recentProjects = [
  {
    name: "Sistema E-commerce",
    client: "TechCorp",
    progress: 75,
    status: "Em Andamento",
    deadline: "2024-02-15",
  },
  {
    name: "App Mobile",
    client: "StartupXYZ",
    progress: 45,
    status: "Desenvolvimento",
    deadline: "2024-03-01",
  },
  {
    name: "Website Institucional",
    client: "Empresa ABC",
    progress: 90,
    status: "Finalização",
    deadline: "2024-01-30",
  },
]

const recentTasks = [
  {
    title: "Implementar autenticação",
    project: "Sistema E-commerce",
    assignee: "João Silva",
    priority: "Alta",
    status: "Em Progresso",
  },
  {
    title: "Design da tela de login",
    project: "App Mobile",
    assignee: "Maria Santos",
    priority: "Média",
    status: "Concluída",
  },
  {
    title: "Testes de integração",
    project: "Website Institucional",
    assignee: "Pedro Costa",
    priority: "Alta",
    status: "Pendente",
  },
]

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        console.error("Supabase client not initialized. Redirecting to login.")
        router.push("/login")
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
      } else {
        setLoading(false)
      }
    }

    checkSession()

    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          router.push("/login")
        } else {
          setLoading(false)
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [supabase, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center gap-2 border-b px-4 py-2">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> desde o mês passado
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Projetos Recentes
              </CardTitle>
              <CardDescription>Acompanhe o progresso dos projetos ativos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProjects.map((project, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">{project.client}</p>
                    </div>
                    <Badge variant={project.status === "Em Andamento" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Prazo: {new Date(project.deadline).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/projetos">Ver Todos os Projetos</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Tarefas Recentes
              </CardTitle>
              <CardDescription>Últimas atividades da equipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.project}</p>
                    <p className="text-xs text-muted-foreground">Responsável: {task.assignee}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge
                      variant={
                        task.priority === "Alta" ? "destructive" : task.priority === "Média" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{task.status}</p>
                  </div>
                </div>
              ))}
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/tarefas">Ver Todas as Tarefas</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              <Button asChild>
                <Link href="/tarefas/nova">Nova Tarefa</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/projetos/novo">Novo Projeto</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/kanban">Ver Kanban</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/relatorios">Gerar Relatório</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
