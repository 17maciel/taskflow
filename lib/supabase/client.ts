"use client"

import { createBrowserClient } from "@supabase/ssr"

/**
 * Returns a Supabase **browser** client or `null`
 * if the required ENV variables are missing / empty.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || undefined

  if (!url || !anonKey) {
    console.warn("[Supabase] URL or anon key missing – skipping browser client creation.")
    return null
  }

  try {
    return createBrowserClient(url, anonKey)
  } catch (err) {
    console.error("[Supabase] Failed to create *browser* client:", err)
    return null
  }
}
