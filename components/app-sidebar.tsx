import Link from "next/link"
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  BarChart,
  Bell,
  Settings,
  GanttChart,
  Kanban,
  Shield,
  FileText,
  Bot,
  UserCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail, // Added for the rail to toggle sidebar
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PlanUsageIndicator } from "./plan-usage-indicator" // Assuming this is a client component

export async function AppSidebar() {
  const supabase = createClient() // This can return null

  let user = null
  let planId = "free"
  let trialEndsAt = null

  if (supabase) {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser()
    user = fetchedUser
    if (user?.user_metadata?.plan_id) {
      planId = user.user_metadata.plan_id
    }
    if (user?.user_metadata?.trial_ends_at) {
      trialEndsAt = user.user_metadata.trial_ends_at
    }
  }

  const handleSignOut = async () => {
    "use server"
    const supabaseServer = createClient()
    if (supabaseServer) {
      await supabaseServer.auth.signOut()
    }
    redirect("/home")
  }

  // If no user or supabase client, render a minimal sidebar or nothing
  if (!user) {
    return null // Or a very basic sidebar without user-specific info
  }

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar">
      {" "}
      {/* Use Sidebar component */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">TaskFlow</span>
                    <span className="text-xs text-gray-400">Gestão de Projetos</span>
                  </div>
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]" align="start">
                <DropdownMenuItem>
                  <span>Meu Workspace</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Configurações do Workspace</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/projetos">
                    <FolderOpen className="h-5 w-5" />
                    <span>Projetos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/tarefas">
                    <CheckSquare className="h-5 w-5" />
                    <span>Tarefas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/gantt">
                    <GanttChart className="h-5 w-5" />
                    <span>Gantt</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/kanban">
                    <Kanban className="h-5 w-5" />
                    <span>Kanban</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/recursos">
                    <Users className="h-5 w-5" />
                    <span>Recursos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/relatorios">
                    <BarChart className="h-5 w-5" />
                    <span>Relatórios</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/riscos">
                    <Shield className="h-5 w-5" />
                    <span>Riscos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/notificacoes">
                    <Bell className="h-5 w-5" />
                    <span>Notificações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/permissoes">
                    <FileText className="h-5 w-5" />
                    <span>Permissões</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/templates">
                    <FileText className="h-5 w-5" />
                    <span>Templates</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/ia-cronograma">
                    <Bot className="h-5 w-5" />
                    <span>IA Cronograma</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <PlanUsageIndicator planId={planId} trialEndsAt={trialEndsAt} />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <UserCircle className="h-5 w-5" />
                  <span>{user?.email}</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/perfil">
                      <UserCircle className="h-5 w-5" />
                      <span>Minha Conta</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <DropdownMenuItem>
                  <span>Assinatura</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <form action={handleSignOut} className="w-full">
                    <button type="submit" className="w-full text-left">
                      Sair
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/configuracoes">
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail /> {/* Add SidebarRail for desktop resizing */}
    </Sidebar>
  )
}
