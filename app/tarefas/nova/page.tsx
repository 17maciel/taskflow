"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, X, Upload, Users } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const projetos = [
  { id: "1", name: "Sistema E-commerce", client: "TechCorp" },
  { id: "2", name: "App Mobile", client: "StartupXYZ" },
  { id: "3", name: "Website Institucional", client: "Empresa ABC" },
]

const usuarios = [
  { id: "1", name: "João Silva", email: "joao@empresa.com" },
  { id: "2", name: "Maria Santos", email: "maria@empresa.com" },
  { id: "3", name: "Pedro Costa", email: "pedro@empresa.com" },
  { id: "4", name: "Ana Lima", email: "ana@empresa.com" },
]

const tiposTarefa = ["Reunião", "Execução", "Validação", "Análise", "Documentação", "Teste", "Deploy"]

const quadros = ["Colaboradores - DEPÓSITO", "Desenvolvimento", "Design", "QA", "DevOps"]

const fases = ["Planejamento", "Em Desenvolvimento", "Em Teste", "Em Revisão", "Concluído"]

export default function NovaTarefaPage() {
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

  const { toast } = useToast()
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    projeto: "",
    tipo: "",
    quadro: "",
    fase: "",
    prioridade: "Média",
    tempoEstimado: "",
    dataInicio: undefined as Date | undefined,
    dataFim: undefined as Date | undefined,
  })

  const [alocados, setAlocados] = useState<string[]>([])
  const [seguidores, setSeguidores] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [novaTag, setNovaTag] = useState("")
  const [checklist, setChecklist] = useState<{ id: string; texto: string; concluido: boolean }[]>([])
  const [novoItemChecklist, setNovoItemChecklist] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.titulo.trim()) {
      toast({
        title: "Erro",
        description: "O título da tarefa é obrigatório",
        variant: "destructive",
      })
      return
    }

    // Simular salvamento
    toast({
      title: "Sucesso!",
      description: "Tarefa criada com sucesso",
    })

    console.log("Dados da tarefa:", {
      ...formData,
      alocados,
      seguidores,
      tags,
      checklist,
    })
  }

  const adicionarTag = () => {
    if (novaTag.trim() && !tags.includes(novaTag.trim())) {
      setTags([...tags, novaTag.trim()])
      setNovaTag("")
    }
  }

  const removerTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const adicionarItemChecklist = () => {
    if (novoItemChecklist.trim()) {
      setChecklist([
        ...checklist,
        {
          id: Date.now().toString(),
          texto: novoItemChecklist.trim(),
          concluido: false,
        },
      ])
      setNovoItemChecklist("")
    }
  }

  const toggleItemChecklist = (id: string) => {
    setChecklist(checklist.map((item) => (item.id === id ? { ...item, concluido: !item.concluido } : item)))
  }

  const removerItemChecklist = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id))
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
      <header className="flex items-center gap-2 border-b px-4 py-2">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Nova Tarefa</h1>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Defina as informações principais da tarefa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título da Tarefa *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Digite o título da tarefa"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projeto">Projeto</Label>
                  <Select
                    value={formData.projeto}
                    onValueChange={(value) => setFormData({ ...formData, projeto: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projetos.map((projeto) => (
                        <SelectItem key={projeto.id} value={projeto.id}>
                          {projeto.name} - {projeto.client}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo da Tarefa</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposTarefa.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quadro">Quadro/Grupo</Label>
                  <Select
                    value={formData.quadro}
                    onValueChange={(value) => setFormData({ ...formData, quadro: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o quadro" />
                    </SelectTrigger>
                    <SelectContent>
                      {quadros.map((quadro) => (
                        <SelectItem key={quadro} value={quadro}>
                          {quadro}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fase">Fase</Label>
                  <Select value={formData.fase} onValueChange={(value) => setFormData({ ...formData, fase: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fase" />
                    </SelectTrigger>
                    <SelectContent>
                      {fases.map((fase) => (
                        <SelectItem key={fase} value={fase}>
                          {fase}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select
                    value={formData.prioridade}
                    onValueChange={(value) => setFormData({ ...formData, prioridade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Crítica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva os detalhes da tarefa"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Datas e Tempo */}
          <Card>
            <CardHeader>
              <CardTitle>Cronograma</CardTitle>
              <CardDescription>Defina as datas e tempo estimado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dataInicio && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dataInicio
                          ? format(formData.dataInicio, "PPP", { locale: ptBR })
                          : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dataInicio}
                        onSelect={(date) => setFormData({ ...formData, dataInicio: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Data de Fim</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dataFim && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dataFim ? format(formData.dataFim, "PPP", { locale: ptBR }) : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dataFim}
                        onSelect={(date) => setFormData({ ...formData, dataFim: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempoEstimado">Tempo Estimado (horas)</Label>
                  <Input
                    id="tempoEstimado"
                    type="number"
                    value={formData.tempoEstimado}
                    onChange={(e) => setFormData({ ...formData, tempoEstimado: e.target.value })}
                    placeholder="Ex: 8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pessoas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Pessoas Envolvidas
              </CardTitle>
              <CardDescription>Defina responsáveis e seguidores da tarefa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Alocados (Responsáveis)</Label>
                <div className="space-y-2">
                  {usuarios.map((usuario) => (
                    <div key={usuario.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`alocado-${usuario.id}`}
                        checked={alocados.includes(usuario.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAlocados([...alocados, usuario.id])
                          } else {
                            setAlocados(alocados.filter((id) => id !== usuario.id))
                          }
                        }}
                      />
                      <Label htmlFor={`alocado-${usuario.id}`} className="text-sm">
                        {usuario.name} ({usuario.email})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Seguidores</Label>
                <div className="space-y-2">
                  {usuarios.map((usuario) => (
                    <div key={usuario.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`seguidor-${usuario.id}`}
                        checked={seguidores.includes(usuario.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSeguidores([...seguidores, usuario.id])
                          } else {
                            setSeguidores(seguidores.filter((id) => id !== usuario.id))
                          }
                        }}
                      />
                      <Label htmlFor={`seguidor-${usuario.id}`} className="text-sm">
                        {usuario.name} ({usuario.email})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags e Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Adicione tags para categorizar a tarefa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={novaTag}
                    onChange={(e) => setNovaTag(e.target.value)}
                    placeholder="Digite uma tag"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), adicionarTag())}
                  />
                  <Button type="button" onClick={adicionarTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removerTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Checklist</CardTitle>
                <CardDescription>Crie uma lista de itens para acompanhar o progresso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={novoItemChecklist}
                    onChange={(e) => setNovoItemChecklist(e.target.value)}
                    placeholder="Digite um item"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), adicionarItemChecklist())}
                  />
                  <Button type="button" onClick={adicionarItemChecklist} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox checked={item.concluido} onCheckedChange={() => toggleItemChecklist(item.id)} />
                      <span className={cn("flex-1 text-sm", item.concluido && "line-through text-muted-foreground")}>
                        {item.texto}
                      </span>
                      <X
                        className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                        onClick={() => removerItemChecklist(item.id)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Anexos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Anexos
              </CardTitle>
              <CardDescription>Adicione arquivos relacionados à tarefa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">Arraste arquivos aqui ou clique para selecionar</p>
                <Button variant="outline" size="sm">
                  Selecionar Arquivos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit">Criar Tarefa</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
