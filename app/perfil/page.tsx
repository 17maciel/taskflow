import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import UserProfileForm from "@/components/user-profile-form"
import type { Profile } from "@/types/profile"

export default async function ProfilePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } }

  if (!user) {
    redirect("/login") // Redirect to login if not authenticated
  }

  let profile: Profile | null = null
  if (supabase) {
    try {
      const { data, error, status } = await supabase
        .from("profiles")
        .select("id, username, website, avatar_url")
        .eq("id", user.id)
        .single()

      if (error && status !== 406) {
        // 406 means no data found, which is fine for new users
        throw error
      }

      if (data) {
        profile = data
      }
    } catch (error: any) {
      console.error("Erro ao buscar perfil:", error.message)
      // Optionally, redirect to an error page or show a generic message
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 py-12">
      <UserProfileForm initialProfile={profile} userEmail={user.email || ""} />
    </div>
  )
}
