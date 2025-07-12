"use client"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Briefcase,
  Calendar,
  MoreHorizontal,
  Eye,
  Lock,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// Tipos de dados
interface Usuario {
  id: string
  nome: string
  email: string
  avatarUrl?: string
  cargo: string
  departamento: string
  status: "ativo" | "inativo" | "pendente" | "bloqueado"
  perfilAcesso: string // Ex: "Administrador", "Gestor", "Colaborador"
  dataCadastro: Date
  ultimoLogin: Date
  projetosAtivos: number
  tarefasConcluidas: number
  habilidades: string[]
  contatoSecundario?: string
  telefone?: string
}

interface PerfilAcesso {
  id: string
  nome: string
  descricao: string
  permissoes: string[]
}

// Dados mockados
const usuarios: Usuario[] = [
  {
    id: "u1",
    nome: "João Silva",
    email: "joao.silva@empresa.com",
    avatarUrl: "/placeholder-user.jpg",
    cargo: "Desenvolvedor Sênior",
    departamento: "Engenharia",
    status: "ativo",
    perfilAcesso: "Colaborador",
    dataCadastro: new Date("2023-01-10"),
    ultimoLogin: new Date("2024-01-08T10:30:00"),
    projetosAtivos: 3,
    tarefasConcluidas: 45,
    habilidades: ["React", "Node.js", "AWS"],
    telefone: "+55 11 98765-4321",
  },
  {
    id: "u2",
    nome: "Maria Santos",
    email: "maria.santos@empresa.com",
    avatarUrl: "/placeholder-user.jpg",
    cargo: "Gerente de Projetos",
    departamento: "Gestão",
    status: "ativo",
    perfilAcesso: "Gestor",
    dataCadastro: new Date("2022-05-20"),
    ultimoLogin: new Date("2024-01-08T09:00:00"),
    projetosAtivos: 5,
    tarefasConcluidas: 12,
    habilidades: ["Scrum", "Kanban", "Liderança"],
  },
  {
    id: "u3",
    nome: "Pedro Costa",
    email: "pedro.costa@empresa.com",
    avatarUrl: "/placeholder-user.jpg",
    cargo: "Analista de QA",
    departamento: "Qualidade",
    status: "inativo",
    perfilAcesso: "Colaborador",
    dataCadastro: new Date("2023-03-01"),
    ultimoLogin: new Date("2023-12-15T14:00:00"),
    projetosAtivos: 1,
    tarefasConcluidas: 28,
    habilidades: ["Testes Manuais", "Automação", "Jira"],
  },
  {
    id: "u4",
    nome: "Ana Lima",
    email: "ana.lima@empresa.com",
    avatarUrl: "/placeholder-user.jpg",
    cargo: "Designer UX/UI",
    departamento: "Design",
    status: "ativo",
    perfilAcesso: "Colaborador",
    dataCadastro: new Date("2023-07-01"),
    ultimoLogin: new Date("2024-01-07T16:45:00"),
    projetosAtivos: 2,
    tarefasConcluidas: 30,
    habilidades: ["Figma", "Sketch", "Design System"],
  },
  {
    id: "u5",
    nome: "Carlos Mendes",
    email: "carlos.mendes@empresa.com",
    avatarUrl: "/placeholder-user.jpg",
    cargo: "Administrador de Sistemas",
    departamento: "TI",
    status: "ativo",
    perfilAcesso: "Administrador",
    dataCadastro: new Date("2022-01-01"),
    ultimoLogin: new Date("2024-01-08T11:00:00"),
    projetosAtivos: 0,
    tarefasConcluidas: 5,
    habilidades: ["Linux", "Redes", "Segurança"],
  },
]

const perfisAcesso: PerfilAcesso[] = [
  {
    id: "admin",
    nome: "Administrador",
    descricao: "Acesso total ao sistema e gerenciamento de usuários",
    permissoes: ["gerenciar_usuarios", "gerenciar_permissoes", "acesso_total"],
  },
  {
    id: "gestor",
    nome: "Gestor",
    descricao: "Gerencia projetos, equipes e visualiza relatórios",
    permissoes: ["criar_projetos", "editar_projetos", "gerenciar_equipes", "ver_relatorios"],
  },
  {
    id: "colaborador",
    nome: "Colaborador",
    descricao: "Cria, edita e visualiza suas próprias tarefas e projetos atribuídos",
    permissoes: ["criar_tarefas", "editar_tarefas_proprias", "ver_projetos_atribuidos"],
  },
  {
    id: "visualizador",
    nome: "Visualizador",
    descricao: "Apenas visualiza informações de projetos e tarefas",
    permissoes: ["ver_projetos", "ver_tarefas"],
  },
]

export default function UsuariosPage() {
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

  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroPerfil, setFiltroPerfil] = useState("todos")
  const [busca, setBusca] = useState("")
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    cargo: "",
    departamento: "",
    perfilAcesso: "",
  })

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchStatus = filtroStatus === "todos" || usuario.status === filtroStatus
    const matchPerfil = filtroPerfil === "todos" || usuario.perfilAcesso === filtroPerfil
    const matchBusca =
      busca === "" ||
      usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busca.toLowerCase()) ||
      usuario.cargo.toLowerCase().includes(busca.toLowerCase()) ||
      usuario.departamento.toLowerCase().includes(busca.toLowerCase())

    return matchStatus && matchPerfil && matchBusca
  })

  const handleAddUser = () => {
    if (novoUsuario.nome && novoUsuario.email && novoUsuario.perfilAcesso) {
      console.log("Adicionar novo usuário:", novoUsuario)
      // Lógica para adicionar usuário (API call, etc.)
      setNovoUsuario({
        nome: "",
        email: "",
        cargo: "",
        departamento: "",
        perfilAcesso: "",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "default"
      case "inativo":
        return "secondary"
      case "pendente":
        return "outline"
      case "bloqueado":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case "Administrador":
        return "destructive"
      case "Gestor":
        return "default"
      case "Colaborador":
        return "secondary"
      case "Visualizador":
        return "outline"
      default:
        return "secondary"
    }
  }

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
          <h1 className="text-xl font-semibold">Usuários</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Usuário</DialogTitle>
              <DialogDescription>Preencha os dados para convidar um novo membro para a equipe</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    placeholder="João Silva"
                    value={novoUsuario.nome}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao.silva@empresa.com"
                    value={novoUsuario.email}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    placeholder="Desenvolvedor"
                    value={novoUsuario.cargo}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, cargo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input
                    id="departamento"
                    placeholder="Engenharia"
                    value={novoUsuario.departamento}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, departamento: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="perfilAcesso">Perfil de Acesso</Label>
                <Select
                  value={novoUsuario.perfilAcesso}
                  onValueChange={(value) => setNovoUsuario({ ...novoUsuario, perfilAcesso: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {perfisAcesso.map((perfil) => (
                      <SelectItem key={perfil.id} value={perfil.nome}>
                        {perfil.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={handleAddUser}>Adicionar Usuário</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{usuarios.length}</div>
                  <div className="text-sm text-muted-foreground">Total de Usuários</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{usuarios.filter((u) => u.status === "ativo").length}</div>
                  <div className="text-sm text-muted-foreground">Usuários Ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-red-600" />
                <div>
                  <div className="text-2xl font-bold">{usuarios.filter((u) => u.status === "inativo").length}</div>
                  <div className="text-sm text-muted-foreground">Usuários Inativos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{new Set(usuarios.map((u) => u.cargo)).size}</div>
                  <div className="text-sm text-muted-foreground">Cargos Diferentes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="lista" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lista">Lista de Usuários</TabsTrigger>
            <TabsTrigger value="perfis">Perfis de Acesso</TabsTrigger>
            <TabsTrigger value="atividades">Atividades Recentes</TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-4">
            {/* Filtros e Busca */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center flex-wrap">
                  <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuários..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="bloqueado">Bloqueado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filtroPerfil} onValueChange={setFiltroPerfil}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Perfil de Acesso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Perfis</SelectItem>
                      {perfisAcesso.map((perfil) => (
                        <SelectItem key={perfil.id} value={perfil.nome}>
                          {perfil.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Usuários */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Perfil de Acesso</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuariosFiltrados.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={usuario.avatarUrl || "/placeholder.svg"} alt={usuario.nome} />
                              <AvatarFallback>{usuario.nome.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{usuario.nome}</div>
                              <div className="text-sm text-muted-foreground">{usuario.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{usuario.cargo}</TableCell>
                        <TableCell>{usuario.departamento}</TableCell>
                        <TableCell>
                          <Badge variant={getPerfilColor(usuario.perfilAcesso)}>{usuario.perfilAcesso}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(usuario.status)} className="capitalize">
                            {usuario.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Lock className="h-4 w-4 mr-2" />
                                Alterar Perfil
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {usuariosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhum usuário encontrado com os filtros aplicados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perfis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Perfis de Acesso</CardTitle>
                <CardDescription>Gerencie os diferentes níveis de acesso no sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {perfisAcesso.map((perfil) => (
                  <Card key={perfil.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-medium">{perfil.nome}</h4>
                          <p className="text-sm text-muted-foreground">{perfil.descricao}</p>
                          <div className="flex flex-wrap gap-1">
                            {perfil.permissoes.map((p) => (
                              <Badge key={p} variant="secondary" className="text-xs">
                                {p.replace(/_/g, " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="atividades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
                <CardDescription>Visualize as últimas ações dos usuários no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Histórico de Atividades em Desenvolvimento</h3>
                  <p className="text-muted-foreground">
                    Esta funcionalidade estará disponível em breve para auditoria e monitoramento.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
