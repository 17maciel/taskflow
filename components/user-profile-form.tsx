"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/types/profile"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface UserProfileFormProps {
  initialProfile: Profile | null
  userEmail: string
}

export default function UserProfileForm({ initialProfile, userEmail }: UserProfileFormProps) {
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState(initialProfile?.username || "")
  const [website, setWebsite] = useState(initialProfile?.website || "")

  useEffect(() => {
    if (initialProfile) {
      setUsername(initialProfile.username || "")
      setWebsite(initialProfile.website || "")
    }
    setLoading(false) // Set loading to false once initial profile is processed
  }, [initialProfile])

  async function updateProfile({ username, website }: { username: string | null; website: string | null }) {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado.")
      }

      const updates = {
        id: user.id,
        username,
        website,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("profiles").upsert(updates, {
        onConflict: "id", // Specify conflict target for upsert
      })

      if (error) {
        throw error
      }

      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Meu Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="text" value={userEmail} disabled className="bg-gray-100" />
        </div>
        <div>
          <Label htmlFor="username">Nome de Usuário</Label>
          <Input
            id="username"
            type="text"
            value={username || ""}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={website || ""}
            onChange={(e) => setWebsite(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button onClick={() => updateProfile({ username, website })} disabled={loading} className="w-full">
          {loading ? "Salvando..." : "Atualizar Perfil"}
        </Button>
      </CardContent>
    </Card>
  )
}
