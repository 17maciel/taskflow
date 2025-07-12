import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Returns a Supabase **server** client or `null`
 * if the required ENV variables are missing / empty.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined
  const key =
    // Prefer the service-role key (if you need RLS-bypass) …
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    // … otherwise fall back to the public anon key.
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    undefined

  if (!url || !key) {
    console.warn("[Supabase] URL or Key missing – skipping server client creation.")
    return null
  }

  const cookieStore = cookies()

  try {
    return createServerClient(url, key, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (err) {
            console.warn("[Supabase] Could not set cookie:", err)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (err) {
            console.warn("[Supabase] Could not remove cookie:", err)
          }
        },
      },
    })
  } catch (err) {
    console.error("[Supabase] Failed to create *server* client:", err)
    return null
  }
}
