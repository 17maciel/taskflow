"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Copy,
  Download,
  Upload,
  LayoutTemplate,
  FolderOpen,
  Star,
  Share2,
  Code,
  Save,
  XCircle,
  Info,
  DollarSign,
  Users,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"

// Tipos de dados
interface Template {
  id: string
  nome: string
  descricao: string
  tipo: "projeto" | "tarefa" | "relatorio" | "email" | "documento"
  categoria: string
  criadoPor: string
  dataCriacao: Date
  dataAtualizacao: Date
  favorito: boolean
  publico: boolean
  tags: string[]
  conteudo: any // Pode ser JSON para estrutura, HTML para email, Markdown para documento
  previewUrl?: string
  usoContador: number
}

interface Categoria {
  id: string
  nome: string
  icon: React.ElementType
}

// Dados mockados
const categorias: Categoria[] = [
  { id: "todos", nome: "Todos", icon: FolderOpen },
  { id: "geral", nome: "Geral", icon: LayoutTemplate },
  { id: "desenvolvimento", nome: "Desenvolvimento", icon: Code },
  { id: "marketing", nome: "Marketing", icon: Share2 },
  { id: "vendas", nome: "Vendas", icon: DollarSign },
  { id: "rh", nome: "RH", icon: Users },
]

const templates: Template[] = [
  {
    id: "t1",
    nome: "Projeto de Desenvolvimento Web",
    descricao: "Template completo para projetos de desenvolvimento web, incluindo fases e tarefas padrão.",
    tipo: "projeto",
    categoria: "desenvolvimento",
    criadoPor: "João Silva",
    dataCriacao: new Date("2023-10-01"),
    dataAtualizacao: new Date("2024-01-05"),
    favorito: true,
    publico: true,
    tags: ["web", "frontend", "backend", "fullstack"],
    conteudo: {
      fases: ["Planejamento", "Design", "Desenvolvimento", "Testes", "Deploy"],
      tarefasPadrao: [
        { nome: "Configurar ambiente", duracao: 8 },
        { nome: "Criar banco de dados", duracao: 16 },
      ],
    },
    previewUrl: "/placeholder.svg?height=200&width=300",
    usoContador: 120,
  },
  {
    id: "t2",
    nome: "Relatório Mensal de Progresso",
    descricao: "Template para relatórios mensais de progresso de projetos, com métricas e gráficos.",
    tipo: "relatorio",
    categoria: "geral",
    criadoPor: "Maria Santos",
    dataCriacao: new Date("2023-11-15"),
    dataAtualizacao: new Date("2023-12-20"),
    favorito: false,
    publico: true,
    tags: ["relatorio", "gestao", "metrics"],
    conteudo: "Conteúdo do relatório em Markdown...",
    previewUrl: "/placeholder.svg?height=200&width=300",
    usoContador: 85,
  },
  {
    id: "t3",
    nome: "Email de Boas-Vindas para Cliente",
    descricao: "Template de email para enviar a novos clientes após a contratação de um serviço.",
    tipo: "email",
    categoria: "marketing",
    criadoPor: "Ana Lima",
    dataCriacao: new Date("2023-09-01"),
    dataAtualizacao: new Date("2023-09-01"),
    favorito: true,
    publico: false,
    tags: ["email", "cliente", "onboarding"],
    conteudo: "<html><body><h1>Bem-vindo!</h1>...</body></html>",
    previewUrl: "/placeholder.svg?height=200&width=300",
    usoContador: 210,
  },
  {
    id: "t4",
    nome: "Documento de Requisitos de Software",
    descricao: "Template para documentar requisitos funcionais e não funcionais de software.",
    tipo: "documento",
    categoria: "desenvolvimento",
    criadoPor: "Pedro Costa",
    dataCriacao: new Date("2023-08-10"),
    dataAtualizacao: new Date("2023-10-25"),
    favorito: false,
    publico: true,
    tags: ["documentacao", "requisitos", "software"],
    conteudo: "Conteúdo do documento em Markdown...",
    previewUrl: "/placeholder.svg?height=200&width=300",
    usoContador: 95,
  },
]

export default function TemplatesPage() {
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

  const [filtroCategoria, setFiltroCategoria] = useState("todos")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [busca, setBusca] = useState("")
  const [modoEdicao, setModoEdicao] = useState(false)
  const [templateEmEdicao, setTemplateEmEdicao] = useState<Template | null>(null)

  const templatesFiltrados = templates.filter((template) => {
    const matchCategoria = filtroCategoria === "todos" || template.categoria === filtroCategoria
    const matchTipo = filtroTipo === "todos" || template.tipo === filtroTipo
    const matchBusca =
      busca === "" ||
      template.nome.toLowerCase().includes(busca.toLowerCase()) ||
      template.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(busca.toLowerCase()))

    return matchCategoria && matchTipo && matchBusca
  })

  const handleEditTemplate = (template: Template) => {
    setTemplateEmEdicao({ ...template })
    setModoEdicao(true)
  }

  const handleSaveTemplate = () => {
    if (templateEmEdicao) {
      console.log("Salvando template:", templateEmEdicao)
      // Lógica para salvar o template (API call, etc.)
      setModoEdicao(false)
      setTemplateEmEdicao(null)
    }
  }

  const handleCancelEdit = () => {
    setModoEdicao(false)
    setTemplateEmEdicao(null)
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "projeto":
        return "bg-blue-100 text-blue-800"
      case "tarefa":
        return "bg-green-100 text-green-800"
      case "relatorio":
        return "bg-purple-100 text-purple-800"
      case "email":
        return "bg-orange-100 text-orange-800"
      case "documento":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
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
          <h1 className="text-xl font-semibold">Templates</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Modo de Edição */}
        {modoEdicao && templateEmEdicao && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Editando: {templateEmEdicao.nome}
              </CardTitle>
              <CardDescription>Faça as alterações e salve o template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nome">Nome do Template</Label>
                  <Input
                    id="edit-nome"
                    value={templateEmEdicao.nome}
                    onChange={(e) => setTemplateEmEdicao({ ...templateEmEdicao, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-categoria">Categoria</Label>
                  <Select
                    value={templateEmEdicao.categoria}
                    onValueChange={(value) => setTemplateEmEdicao({ ...templateEmEdicao, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias
                        .filter((c) => c.id !== "todos")
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-descricao">Descrição</Label>
                <Textarea
                  id="edit-descricao"
                  value={templateEmEdicao.descricao}
                  onChange={(e) => setTemplateEmEdicao({ ...templateEmEdicao, descricao: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-conteudo">Conteúdo (JSON/Markdown/HTML)</Label>
                <Textarea
                  id="edit-conteudo"
                  value={JSON.stringify(templateEmEdicao.conteudo, null, 2)}
                  onChange={(e) => {
                    try {
                      setTemplateEmEdicao({ ...templateEmEdicao, conteudo: JSON.parse(e.target.value) })
                    } catch (error) {
                      // Handle invalid JSON
                      console.error("Invalid JSON:", error)
                    }
                  }}
                  rows={10}
                  className="font-mono text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelEdit}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveTemplate}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="biblioteca" className="space-y-4">
          <TabsList>
            <TabsTrigger value="biblioteca">Biblioteca de Templates</TabsTrigger>
            <TabsTrigger value="meus-templates">Meus Templates</TabsTrigger>
            <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="biblioteca" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Filtros:</span>
                  </div>

                  <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar templates..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="projeto">Projeto</SelectItem>
                      <SelectItem value="tarefa">Tarefa</SelectItem>
                      <SelectItem value="relatorio">Relatório</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="documento">Documento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Templates */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templatesFiltrados.map((template) => {
                const CategoriaIcon = categorias.find((cat) => cat.id === template.categoria)?.icon || LayoutTemplate
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <CategoriaIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{template.nome}</CardTitle>
                            <CardDescription className="text-xs">{template.criadoPor}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-xs", getTipoColor(template.tipo))}>{template.tipo}</Badge>
                          {template.favorito && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>Favorito</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">{template.descricao}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>Atualizado: {format(template.dataAtualizacao, "dd/MM/yyyy", { locale: ptBR })}</span>
                        <span>Usos: {template.usoContador}</span>
                      </div>
                    </CardContent>
                    <CardContent className="flex justify-end gap-2 pt-0">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Usar
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                )
              })}

              {templatesFiltrados.length === 0 && (
                <Card className="lg:col-span-3">
                  <CardContent className="p-8 text-center">
                    <LayoutTemplate className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum template encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      Não há templates que correspondam aos filtros selecionados.
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Novo Template
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="meus-templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meus Templates</CardTitle>
                <CardDescription>Templates criados ou personalizados por você</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Em Desenvolvimento</h3>
                  <p className="text-muted-foreground">
                    Esta seção mostrará os templates que você criou ou personalizou.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favoritos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Templates Favoritos</CardTitle>
                <CardDescription>Seus templates marcados como favoritos para acesso rápido</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum favorito ainda</h3>
                  <p className="text-muted-foreground">Marque templates com a estrela para vê-los aqui.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Templates</CardTitle>
                <CardDescription>Gerencie as configurações globais de templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="default-visibility">Visibilidade Padrão de Novos Templates</Label>
                    <Select defaultValue="private">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Público</SelectItem>
                        <SelectItem value="private">Privado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save">Salvar Automaticamente Edições</Label>
                    <Switch id="auto-save" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="version-control">Habilitar Controle de Versão</Label>
                    <Switch id="version-control" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
