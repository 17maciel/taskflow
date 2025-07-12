import "@/app/globals.css"
import type React from "react"
import { Suspense } from "react"
import { Inter } from "next/font/google"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar" // Import SidebarInset
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { NotificationProvider } from "@/components/notification-provider"

import { createClient } from "@/lib/supabase/server"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Sistema de Gestão de Projetos",
  description: "Plataforma completa para planejamento e execução",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { session },
  } = supabase ? await supabase.auth.getSession() : { data: { session: null } }

  const isLoggedIn = !!session

  return (
    <html lang="pt-BR" className={inter.className}>
      <body suppressHydrationWarning={true}>
        <NotificationProvider>
          <SidebarProvider>
            {isLoggedIn && <AppSidebar />}
            {/* Use SidebarInset for the main content */}
            <SidebarInset className="flex-1 overflow-hidden">
              <Suspense fallback={null}>{children}</Suspense>
            </SidebarInset>
            <Toaster />
          </SidebarProvider>
        </NotificationProvider>
      </body>
    </html>
  )
}
