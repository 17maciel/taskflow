"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Legacy helper – kept for backward-compatibility with existing components.
 * It increments the `ai_predictions_this_month` column on the `profiles` table.
 */
export async function incrementAIPredictionUsage() {
  const supabase = createClient()
  if (!supabase) {
    console.error("Supabase client not initialized – check env vars.")
    return { success: false, message: "Supabase not configured." }
  }

  // Get current user
  const { data: user, error: userError } = await supabase.auth.getUser()
  if (userError || !user.user) {
    console.error("Error fetching user for AI usage increment:", userError?.message)
    return { success: false, message: "User not authenticated." }
  }

  const userId = user.user.id

  // Fetch current usage
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("ai_predictions_this_month")
    .eq("id", userId)
    .single()

  if (fetchError || !profile) {
    console.error("Error fetching profile for AI usage:", fetchError?.message)
    return { success: false, message: "Profile not found." }
  }

  const currentUsage = profile.ai_predictions_this_month ?? 0
  const newUsage = currentUsage + 1

  // Update usage
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ ai_predictions_this_month: newUsage })
    .eq("id", userId)

  if (updateError) {
    console.error("Error updating AI usage:", updateError.message)
    return { success: false, message: "Failed to update usage." }
  }

  return { success: true, newUsage }
}

/* New helpers added previously ------------------------------------------ */

export async function incrementAiUsage(userId: string) {
  const supabase = createClient() // Use server client
  if (!supabase) {
    console.error("Supabase client not initialized for AI usage increment.")
    return { error: "Supabase not configured." }
  }

  try {
    const { data, error } = await supabase.rpc("increment_ai_usage", { p_user_id: userId })

    if (error) {
      return { error: error.message }
    }

    return { success: true, current_usage: data }
  } catch (err: any) {
    return { error: err.message || "Unexpected error." }
  }
}

export async function getAiUsage(userId: string) {
  const supabase = createClient() // Use server client
  if (!supabase) {
    console.error("Supabase client not initialized for AI usage fetch.")
    return { error: "Supabase not configured." }
  }

  try {
    const { data, error } = await supabase.from("user_ai_usage").select("usage_count").eq("user_id", userId).single()

    if (error && error.code !== "PGRST116") {
      return { error: error.message }
    }

    return { success: true, usage_count: data?.usage_count ?? 0 }
  } catch (err: any) {
    return { error: err.message || "Unexpected error." }
  }
}
