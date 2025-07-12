"use client"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Shield, Users, Settings, Eye, Edit, Trash2, Plus, Search, UserCheck, Lock, Crown, UserCog } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const permissoes = [
  {
    id: "dashboard",
    nome: "Dashboard",
    descricao: "Visualizar dashboard principal",
    categoria: "Visualização",
    icon: Eye,
  },
  {
    id: "projetos_criar",
    nome: "Criar Projetos",
    descricao: "Criar novos projetos",
    categoria: "Projetos",
    icon: Plus,
  },
  {
    id: "projetos_editar",
    nome: "Editar Projetos",
    descricao: "Editar projetos existentes",
    categoria: "Projetos",
    icon: Edit,
  },
  {
    id: "projetos_excluir",
    nome: "Excluir Projetos",
    descricao: "Excluir projetos",
    categoria: "Projetos",
    icon: Trash2,
  },
  {
    id: "tarefas_criar",
    nome: "Criar Tarefas",
    descricao: "Criar novas tarefas",
    categoria: "Tarefas",
    icon: Plus,
  },
  {
    id: "tarefas_editar",
    nome: "Editar Tarefas",
    descricao: "Editar tarefas existentes",
    categoria: "Tarefas",
    icon: Edit,
  },
  {
    id: "usuarios_gerenciar",
    nome: "Gerenciar Usuários",
    descricao: "Criar, editar e excluir usuários",
    categoria: "Administração",
    icon: Users,
  },
  {
    id: "permissoes_gerenciar",
    nome: "Gerenciar Permissões",
    descricao: "Definir permissões de usuários",
    categoria: "Administração",
    icon: Shield,
  },
  {
    id: "relatorios_avancados",
    nome: "Relatórios Avançados",
    descricao: "Gerar relatórios detalhados",
    categoria: "Relatórios",
    icon: Settings,
  },
]

const perfis = [
  {
    id: "admin",
    nome: "Administrador",
    descricao: "Acesso total ao sistema",
    cor: "destructive",
    icon: Crown,
    usuarios: 2,
    permissoes: permissoes.map((p) => p.id),
  },
  {
    id: "gestor",
    nome: "Gestor",
    descricao: "Gerenciar projetos e equipes",
    cor: "default",
    icon: UserCog,
    usuarios: 3,
    permissoes: [
      "dashboard",
      "projetos_criar",
      "projetos_editar",
      "tarefas_criar",
      "tarefas_editar",
      "relatorios_avancados",
    ],
  },
  {
    id: "colaborador",
    nome: "Colaborador",
    descricao: "Visualizar e editar tarefas",
    cor: "secondary",
    icon: UserCheck,
    usuarios: 18,
    permissoes: ["dashboard", "tarefas_editar"],
  },
  {
    id: "visualizador",
    nome: "Visualizador",
    descricao: "Apenas visualização",
    cor: "outline",
    icon: Eye,
    usuarios: 5,
    permissoes: ["dashboard"],
  },
]

const usuarios = [
  {
    id: "1",
    nome: "Roberto Silva",
    email: "roberto.silva@empresa.com",
    perfil: "admin",
    avatar: "RS",
    status: "Ativo",
  },
  {
    id: "2",
    nome: "Pedro Costa",
    email: "pedro.costa@empresa.com",
    perfil: "gestor",
    avatar: "PC",
    status: "Ativo",
  },
  {
    id: "3",
    nome: "João Silva",
    email: "joao.silva@empresa.com",
    perfil: "colaborador",
    avatar: "JS",
    status: "Ativo",
  },
  {
    id: "4",
    nome: "Maria Santos",
    email: "maria.santos@empresa.com",
    perfil: "colaborador",
    avatar: "MS",
    status: "Ativo",
  },
  {
    id: "5",
    nome: "Ana Lima",
    email: "ana.lima@empresa.com",
    perfil: "visualizador",
    avatar: "AL",
    status: "Ativo",
  },
]

export default function PermissoesPage() {
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

  const [busca, setBusca] = useState("")
  const [perfilSelecionado, setPerfilSelecionado] = useState("admin")

  const perfilAtual = perfis.find((p) => p.id === perfilSelecionado)
  const usuariosFiltrados = usuarios.filter(
    (u) => u.nome.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase()),
  )

  const getPerfilInfo = (perfilId: string) => {
    return perfis.find((p) => p.id === perfilId) || perfis[0]
  }

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case "Visualização":
        return Eye
      case "Projetos":
        return Settings
      case "Tarefas":
        return UserCheck
      case "Administração":
        return Shield
      case "Relatórios":
        return Settings
      default:
        return Settings
    }
  }

  const permissoesPorCategoria = permissoes.reduce(
    (acc, permissao) => {
      if (!acc[permissao.categoria]) {
        acc[permissao.categoria] = []
      }
      acc[permissao.categoria].push(permissao)
      return acc
    },
    {} as Record<string, typeof permissoes>,
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">Permissões</h1>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Perfil
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{perfis.length}</div>
                  <div className="text-sm text-muted-foreground">Perfis de Acesso</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{usuarios.length}</div>
                  <div className="text-sm text-muted-foreground">Usuários Ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{permissoes.length}</div>
                  <div className="text-sm text-muted-foreground">Permissões Disponíveis</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {perfis.filter((p) => p.id === "admin").reduce((acc, p) => acc + p.usuarios, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Administradores</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="perfis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="perfis">Perfis de Acesso</TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          </TabsList>

          {/* Aba Perfis */}
          <TabsContent value="perfis" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Lista de Perfis */}
              <Card>
                <CardHeader>
                  <CardTitle>Perfis Disponíveis</CardTitle>
                  <CardDescription>Selecione um perfil para configurar suas permissões</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {perfis.map((perfil) => {
                    const PerfilIcon = perfil.icon
                    return (
                      <div
                        key={perfil.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          perfilSelecionado === perfil.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                        onClick={() => setPerfilSelecionado(perfil.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <PerfilIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{perfil.nome}</div>
                              <div className="text-sm text-muted-foreground">{perfil.descricao}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={perfil.cor as any}>{perfil.usuarios} usuários</Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Configuração de Permissões */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {perfilAtual && <perfilAtual.icon className="h-5 w-5" />}
                    Permissões - {perfilAtual?.nome}
                  </CardTitle>
                  <CardDescription>Configure as permissões para este perfil</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(permissoesPorCategoria).map(([categoria, permissoesCategoria]) => {
                    const CategoriaIcon = getCategoriaIcon(categoria)
                    return (
                      <div key={categoria} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CategoriaIcon className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium">{categoria}</h4>
                        </div>
                        <div className="space-y-2 pl-6">
                          {permissoesCategoria.map((permissao) => (
                            <div key={permissao.id} className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium">{permissao.nome}</div>
                                <div className="text-xs text-muted-foreground">{permissao.descricao}</div>
                              </div>
                              <Switch
                                checked={perfilAtual?.permissoes.includes(permissao.id)}
                                disabled={perfilAtual?.id === "admin"}
                              />
                            </div>
                          ))}
                        </div>
                        <Separator />
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Usuários */}
          <TabsContent value="usuarios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usuários e Perfis</CardTitle>
                <CardDescription>Gerencie os perfis de acesso dos usuários</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuários..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Perfil Atual</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuariosFiltrados.map((usuario) => {
                        const perfilInfo = getPerfilInfo(usuario.perfil)
                        const PerfilIcon = perfilInfo.icon
                        return (
                          <TableRow key={usuario.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{usuario.avatar}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{usuario.nome}</div>
                                  <div className="text-sm text-muted-foreground">{usuario.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={perfilInfo.cor as any} className="flex items-center gap-1 w-fit">
                                <PerfilIcon className="h-3 w-3" />
                                {perfilInfo.nome}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={usuario.status === "Ativo" ? "default" : "secondary"}>
                                {usuario.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Shield className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Permissões */}
          <TabsContent value="permissoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Permissões</CardTitle>
                <CardDescription>Visualize todas as permissões disponíveis no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(permissoesPorCategoria).map(([categoria, permissoesCategoria]) => {
                    const CategoriaIcon = getCategoriaIcon(categoria)
                    return (
                      <div key={categoria} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <CategoriaIcon className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">{categoria}</h3>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {permissoesCategoria.map((permissao) => {
                            const PermissaoIcon = permissao.icon
                            return (
                              <Card key={permissao.id}>
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                      <PermissaoIcon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <div className="font-medium">{permissao.nome}</div>
                                      <div className="text-sm text-muted-foreground">{permissao.descricao}</div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                        <Separator />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
